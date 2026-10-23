import mongoose from "mongoose";
import Inventory from "../models/Inventory.model.js";
import Product from "../models/Product.model.js";
import StockRequest from "../models/StockSupply/StockRequest.model.js";
import StockTransfer from "../models/StockSupply/StockTransfer.model.js";
import ApiError from "../utils/ApiError.js";
import { addProductInventory } from "./inventory.service.js";
import generateBatchNumber from "../utils/generateBatchNumber.js";

export const getProductSuggestionService = async (req) => {
  const pipeline = [];

  pipeline.push({
    $lookup: {
      from: "users",
      localField: "holder",
      foreignField: "_id",
      as: "user",
    },
  });

  pipeline.push({
    $unwind: "$user",
  });

  pipeline.push({
    $match: {
      "user.role": "supplier",
    },
  });

  pipeline.push({
    $group: {
      _id: "$_id",

      name: {
        $first: "$name",
      },

      category: {
        $first: "$category",
      },

      holderId: {
        $first: "$user._id",
      },

      holderName: {
        $first: "$user.name",
      },
    },
  });

  pipeline.push({
    $sort: {
      name: 1,
    },
  });

  return await Product.aggregate(pipeline);
};

export const getRequestProductService = async (req) => {
  const { id, role } = req.user;

  const filter = {
    ...(role === "supplier" && {
      to: id,
      status: { $in: ["PENDING", "APPROVED"] },
    }),
    ...(role === "employee" && {
      from: id,
      status: { $in: ["PENDING", "APPROVED", "PACKED", "ONDELIVERY"] },
    }),
  };

  if (!["supplier", "employee"].includes(role)) {
    throw new ApiError(403, "Access denied");
  }

  const requests = await StockRequest.find(filter)
    .populate("productId", "name")
    .populate("from", "name")
    .populate("to", "name")
    .select("productId from to quantity status requestType createdAt")
    .sort({ createdAt: -1 })
    .lean();

  if (role == "employee") return requests;

  const grouped = new Map();

  for (const request of requests) {
    // Group by sender's ID.
    const groupId = request.from?._id?.toString() ?? request.from?.toString();

    if (!groupId) continue;

    if (!grouped.has(groupId)) {
      grouped.set(groupId, {
        _id: groupId,
        from: request.from,
        to: request.to,
        status: request.status,
        createdAt: request.createdAt,
        allRequestStock: [],
      });
    }

    grouped.get(groupId).allRequestStock.push({
      requestId: request,
    });
  }

  return [...grouped.values()];
};

export const createRequestProductService = async (req, requestType) => {
  const { productName, productId, holderName, holderId, quantity } = req.body;

  const product = await Product.findOne({
    _id: productId,
    name: productName,
  });

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  let stockRequest = await StockRequest.findOne({
    productId,
    from: req.user.id,
    to: holderId,
    status: "PENDING",
  });

  if (stockRequest) {
    stockRequest.quantity += Number(quantity);
    stockRequest.requestType = requestType;

    await stockRequest.save();
  } else {
    stockRequest = await StockRequest.create({
      productName: product.name,
      productId,
      from: req.user.id,
      to: holderId,
      quantity: Number(quantity),
      requestType,
    });
  }
  await stockRequest.populate("productId", "name");

  return stockRequest;
};

export const updateRequestProductService = async (req) => {
  const { id } = req.params;
  const { requestId, quantity } = req.body;

  const stockRequest = await StockRequest.findById(id);

  if (!stockRequest) {
    throw new ApiError(404, "This Stock Request is not found");
  }

  if (["PACKED", "ONDELIVERY", "DELIVERED"].includes(stockRequest.status)) {
    throw new ApiError(404, `This Stock Request can't be Updated`);
  }

  stockRequest.quantity = Number(quantity) || Number(stockRequest.quantity);

  await stockRequest.save();

  return stockRequest.populate("productId", "name");
};

export const deleteRequestProductService = async (req) => {
  const { id } = req.params;

  const stockRequest = await StockRequest.findById(id);

  if (!stockRequest) {
    throw new ApiError(404, "This Stock Request is not found");
  }

  if (["PACKED", "ONDELIVERY", "DELIVERED"].includes(stockRequest.status)) {
    throw new ApiError(404, `This Stock Request can't be Deleted`);
  }

  return await StockRequest.findByIdAndDelete(id);
};

export const addProductToPackagingService = async (req) => {
  const { id } = req.params;

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // 1. Find stock request
    const stockRequest = await StockRequest.findById(id)
      .populate("productId", "name")
      .session(session);

    if (!stockRequest) {
      throw new ApiError(404, "Product Request not found.");
    }

    if (["PACKED", "ONDELIVERY", "DELIVERED"].includes(stockRequest.status)) {
      throw new ApiError(
        400,
        "This Product Request is already being processed.",
      );
    }

    // 2. Find supplier's available inventory
    const supplierInventory = await Inventory.find({
      product: stockRequest.productId,
      holder: req.user.id,
      transferStatus: "ONSTOCK",
      status: {
        $nin: ["EXPIRED", "USED"],
      },
      quantity: { $gt: 0 },
    })
      .populate("product", "name category unit")
      .sort({ expiryDate: -1 }) // Use earliest expiry first
      .session(session);

    // 3. Calculate total available quantity
    const totalQuantity = supplierInventory.reduce(
      (total, inventory) => total + inventory.quantity,
      0,
    );

    if (totalQuantity === 0) {
      throw new ApiError(
        400,
        `You don't have enough ${stockRequest.productId.name} in your inventory.`,
      );
    }

    if (totalQuantity < stockRequest.quantity) {
      throw new ApiError(
        400,
        `Insufficient stock. Available: ${totalQuantity}, Requested: ${stockRequest.quantity}.`,
      );
    }

    // 4. Move required quantity from supplier → employee
    let remainingQuantity = stockRequest.quantity;

    const allRequestInventory = [];

    for (const inventory of supplierInventory) {
      if (remainingQuantity <= 0) break;

      const quantityToTransfer = Math.min(
        inventory.quantity,
        remainingQuantity,
      );

      // Entire inventory batch is transferred
      if (quantityToTransfer === inventory.quantity) {
        await Inventory.findByIdAndDelete({ _id: inventory._id }, { session });

        const newInventory = await addProductInventory(
          {
            name: inventory.product.name,
            product: inventory.product._id,
            expiryDate: inventory.expiryDate,
            buyingPrice: inventory.buyingPrice,
            manufactureDate: inventory.manufactureDate,
            category: inventory.product.category,
            unit: inventory.product.unit,
            transferStatus: "ONPACKING",
            quantity: quantityToTransfer,
          },
          stockRequest.from,
          session,
        );

        allRequestInventory.push({ inventoryId: newInventory._id });
      }

      // Only part of the batch is transferred
      else {
        // Reduce supplier inventory
        await Inventory.updateOne(
          { _id: inventory._id },
          {
            $inc: {
              quantity: -quantityToTransfer,
            },
          },
          { session },
        );

        // Create employee inventory for transferred quantity

        const newInventory = await addProductInventory(
          {
            name: inventory.product.name,
            product: inventory.product._id,
            expiryDate: inventory.expiryDate,
            buyingPrice: inventory.buyingPrice,
            manufactureDate: inventory.manufactureDate,
            category: inventory.product.category,
            unit: inventory.product.unit,
            transferStatus: "ONPACKING",
            quantity: quantityToTransfer,
          },
          stockRequest.from,
          session,
        );

        allRequestInventory.push({ inventoryId: newInventory._id });
      }

      remainingQuantity -= quantityToTransfer;
    }

    // Safety check
    if (remainingQuantity > 0) {
      throw new ApiError(400, "Unable to transfer the requested quantity.");
    }

    // 5. Find existing packing transfer
    let stockTransfer = await StockTransfer.findOne({
      from: req.user.id,
      to: stockRequest.from,
      status: "ONPACKING",
    }).session(session);

    // 6. Create transfer if necessary
    if (!stockTransfer) {
      stockTransfer = new StockTransfer({
        from: req.user.id,
        to: stockRequest.from,
        allRequestStock: [],
        status: "ONPACKING",
      });
    }

    stockTransfer.allRequestStock.push({
      requestId: stockRequest._id,
    });

    await stockTransfer.save({ session });

    // 8. Update request
    stockRequest.allRequestInventory = allRequestInventory;
    stockRequest.status = "PACKED";

    await stockRequest.save({ session });

    // 9. Commit everything together
    await session.commitTransaction();

    return { stockRequest, stockTransfer };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};

export const approveRequestProductService = async (req) => {
  const { id } = req.params;
  const request = req.body;

  if (request.to._id != req.user.id) {
    throw new ApiError(403, "This request is belong to another supplier");
  }

  if (request.status != "PENDING" || request.status == "APPROVED") {
    throw new ApiError(500, "Only PENDING status can be approved");
  }

  const data = await StockRequest.findOneAndUpdate(
    {
      to: req.user.id,
      _id: id,
      status: "PENDING",
    },
    {
      $set: {
        status: "APPROVED",
      },
    },
    {
      returnDocument: "after",
    },
  )
    .populate("productId", "name")
    .populate("to", "name")
    .populate("from", "name")
    .lean();

  if (!data) {
    throw new ApiError(404, "Product request not found");
  }

  return data;
};

export const getPackedProductsService = async (req) => {
  const role = req.user.role;
  let data = await StockTransfer.find({
    ...((req.user.role == "supplier" || req.user.role == "admin") && {
      status: {
        $nin: ["ALLDELIVERED"],
      },
    }),

    ...(req.user.role == "supplier" && {
      from: req.user.id,
    }),

    ...(req.user.role === "employee" && {
      to: req.user.id,
      status: {
        $ne: "ALLDELIVERED",
      },
    }),
  })
    .populate("from", "name")
    .populate("to", "name")
    .populate({
      path: "allRequestStock.requestId",
      populate: [
        {
          path: "productId",
          select: "name",
        },
        {
          path: "from",
          select: "name",
        },
        {
          path: "to",
          select: "name",
        },
      ],
    })
    .select("from to allRequestStock status createdAt")
    .lean();

  if (!data) {
    throw new ApiError(404, "No packed products found");
  }

  return data;
};

export const transferPackedProductService = async (req) => {
  const { id } = req.params;
  const requestData = req.body;

  if (requestData.from._id != req.user.id) {
    throw new ApiError(403, "This request is belong to another supplier");
  }

  if (requestData.status != "ONPACKING") {
    throw new ApiError(500, "Only ONPACKING status Stock can be transferred");
  }

  const stockTransfer = await StockTransfer.findByIdAndUpdate(
    id,
    {
      $set: {
        status: "ONDELIVERY",
        editHistory: {
          $push: {
            editor: req.user.id,
            editedAt: Date.now(),
            status: "ONDELIVERY",
          },
        },
      },
    },
    { returnDocument: "after" },
  )
    .populate("from", "name")
    .populate("to", "name")
    .populate({
      path: "allRequestStock.requestId",
      populate: {
        path: "productId",
        select: "name",
      },
    })
    .select("from to allRequestStock status createdAt")
    .lean();

  stockTransfer.allRequestStock.map(async (stockRequest) => {
    await StockRequest.findByIdAndUpdate(
      stockRequest.requestId._id,
      {
        $set: {
          status: "ONDELIVERY",
        },
      },
      { returnDocument: "after" },
    );
  });

  return stockTransfer;
};

export const approveProductsDeliveryService = async (req) => {
  const { id } = req.params;
  const requestData = req.body;

  if (requestData.to._id != req.user.id) {
    throw new ApiError(403, "This Stock is belong to another employee");
  }

  if (requestData.status != "ONDELIVERY") {
    throw new ApiError(500, "Only ONDELIVERY status Stock can be approved");
  }

  const stockTransfer = await StockTransfer.findByIdAndUpdate(
    id,
    {
      $set: {
        status: "DELIVERED",
        deliveryAt: Date.now(),
        editHistory: {
          $push: {
            editor: req.user.id,
            editedAt: Date.now(),
            status: "DELIVERED",
          },
        },
      },
    },
    { returnDocument: "after" },
  )
    .populate("from", "name")
    .populate("to", "name")
    .populate({
      path: "allRequestStock.requestId",
      populate: [
        {
          path: "productId",
          select: "name",
        },
        {
          path: "from",
          select: "name",
        },
        {
          path: "to",
          select: "name",
        },
      ],
    })
    .select("from to allRequestStock status createdAt")
    .lean();

  if (!stockTransfer) {
    throw new ApiError(404, "Stock not found");
  }

  return stockTransfer;
};

export const approveProductDeliveredService = async (req) => {
  const { id } = req.params;
  const request = req.body;

  if (request.from._id != req.user.id) {
    throw new ApiError(403, "This request is belong to another employee");
  }

  if (request.status != "ONDELIVERY" && request.status == "DELIVERED") {
    throw new ApiError(500, "Only ONDELIVERY status can be approved");
  }

  const data = await StockRequest.findOneAndUpdate(
    {
      from: req.user.id,
      _id: id,
      status: "ONDELIVERY",
    },
    {
      $set: {
        status: "DELIVERED",
      },
    },
    {
      returnDocument: "after",
    },
  )
    .populate("productId", "name")
    .populate("to", "name")
    .populate("from", "name")
    .lean();

  if (!data) {
    throw new ApiError(404, "Product request not found");
  }

  data.allRequestInventory.map(async (inventory) => {
    await Inventory.findByIdAndUpdate(inventory.inventoryId, {
      $set: {
        transferStatus: "DELIVERED",
      },
    });
  });

  return data;
};

export const markAllDeliveredService = async (req) => {
  const { id } = req.params;
  const stock = await StockTransfer.findById(id);

  if (stock.to._id != req.user.id) {
    throw new ApiError(403, "This Stock is belong to another employee");
  }

  if (stock.status != "DELIVERED") {
    throw new ApiError(500, "Only DELIVERED status Stock can be ALLDELIVERED");
  }

  const stockTransfer = await StockTransfer.findByIdAndUpdate(
    id,
    {
      $set: {
        status: "ALLDELIVERED",
        editHistory: {
          $push: {
            editor: req.user.id,
            editedAt: Date.now(),
            status: "ALLDELIVERED",
          },
        },
      },
    },
    { returnDocument: "after" },
  )
    .select("status")
    .lean();

  if (!stockTransfer) {
    throw new ApiError(404, "Stock not found");
  }

  return stockTransfer;
};
