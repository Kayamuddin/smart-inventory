import Product from "../models/Product.model.js";
import Inventory from "../models/Inventory.model.js";
import sendEmail from "../utils/sendEmail.js";
import ApiError from "../utils/ApiError.js";
import dayjs from "dayjs";
import generateBatchNumber from "../utils/generateBatchNumber.js";
import mongoose from "mongoose";

export const sendExpiryMail = async (email, product, batch, expiryDate) => {
  await sendEmail(
    email,
    "⚠ Product Expiry Alert",
    `
            <h2>Inventory Expiry Alert</h2>

            <p>Your product will expire in 7 days.</p>

            <table border="1" cellpadding="8">

                <tr>
                    <th>Product</th>
                    <td>${product}</td>
                </tr>

                <tr>
                    <th>Batch</th>
                    <td>${batch}</td>
                </tr>

                <tr>
                    <th>Expiry Date</th>
                    <td>${expiryDate}</td>
                </tr>

            </table>

            <br>

            <b>Please supply or replace this stock.</b>
        `,
  );
};

export const addProductInventory = async (data, holderId, session) => {
  const productName = data.name.trim();

  let status = "ACTIVE";

  const expiry = dayjs(data.expiryDate);
  const daysLeft = expiry.diff(dayjs(), "day");

  if (daysLeft <= 0) {
    status = "EXPIRED";
  } else if (daysLeft <= 7) {
    status = "EXPIRING";
  }

  let batchNumber = generateBatchNumber();

  let batchExists = await Inventory.findOne({
    batchNumber,
  }).session(session);

  while (batchExists) {
    batchNumber = generateBatchNumber();

    batchExists = await Inventory.findOne({
      batchNumber,
    }).session(session);
  }

  let product = await Product.findOne({
    holder: holderId,
    name: new RegExp(`^${productName}$`, "i"),
  }).session(session);

  if (!product) {
    product = await Product.create(
      [
        {
          name: productName,
          category: data.category,
          holder: holderId,
          unit: data.unit,
        },
      ],
      { session },
    );

    product = product[0];
  }

  const [inventory] = await Inventory.create(
    [
      {
        product: product._id,
        batchNumber,
        quantity: data.quantity,
        buyingPrice: data.buyingPrice,
        manufactureDate: data.manufactureDate,
        expiryDate: data.expiryDate,
        status,
        holder: holderId,
        transferStatus: data.transferStatus || "ONSTOCK",
        createdAt: data.createdAt || new Date(),
      },
    ],
    { session },
  );

  return inventory;
};

export const getInventoryService = async (req) => {
  const page = Number(req.query.page) || 1;

  const limit = Number(req.query.limit) || 10;

  const skip = (page - 1) * limit;

  const search = req.query.search || "";

  const category = req.query.category || "";

  const pipeline = [];

  pipeline.push({
    $lookup: {
      from: "products",
      localField: "product",
      foreignField: "_id",
      as: "product",
    },
  });

  pipeline.push({
    $unwind: "$product",
  });

  pipeline.push({
    $match: {
      ...((req.user.role == "supplier" || req.user.role == "employee") && {
        "product.holder": req.user._id,
      }),

      ...(search && {
        "product.name": {
          $regex: search,

          $options: "i",
        },
      }),

      ...(category && {
        "product.category": category,
      }),
    },
  });

  pipeline.push({
    $group: {
      _id: "$product._id",

      name: {
        $first: "$product.name",
      },

      category: {
        $first: "$product.category",
      },

      unit: {
        $first: "$product.unit",
      },

      totalQuantity: {
        $sum: {
          $cond: [{ $ne: ["$status", "EXPIRED"] }, "$quantity", 0],
        },
      },

      batches: {
        $push: {
          _id: "$_id",
          batchNumber: "$batchNumber",
          quantity: "$quantity",
          buyingPrice: "$buyingPrice",
          manufactureDate: "$manufactureDate",
          transferStatus: "$transferStatus",
          expiryDate: "$expiryDate",
          status: "$status",
        },
      },
    },
  });

  pipeline.push({
    $sort: {
      name: 1,
    },
  });

  pipeline.push({
    $facet: {
      products: [
        {
          $skip: skip,
        },
        {
          $limit: limit,
        },
      ],
      total: [
        {
          $count: "count",
        },
      ],
    },
  });

  const result = await Inventory.aggregate(pipeline);

  return {
    inventory: result[0].products,
    total: result[0].total[0]?.count || 0,
    page,
    totalPages: Math.ceil((result[0].total[0]?.count || 0) / limit),
  };
};

export const updateInventoryService = async (productId, data, editorId) => {
  const product = await Inventory.findOne({
    _id: productId,
  });

  if (!product) {
    throw new ApiError(404, "Product not found.");
  }

  let status = "ACTIVE";
  const expiry = dayjs(data.expiryDate);
  const daysLeft = expiry.diff(dayjs(), "day");

  if (daysLeft <= 0) {
    status = "EXPIRED";
  } else if (daysLeft > 0 && daysLeft <= 7) {
    status = "EXPIRING";
  } else if (daysLeft > 7) {
    status = "ACTIVE";
  }

  product.quantity = data.quantity;
  product.buyingPrice = data.buyingPrice;
  product.manufactureDate = data.manufactureDate;
  product.expiryDate = data.expiryDate;
  product.status = status;
  product.editHistory.push({
    editor: editorId,
  });

  await product.save();

  return product;
};

export const deleteBatchService = async (req) => {
  const { id } = req.params;
  const product = await Inventory.findOne({
    ...(req.user.role == "supplier" && { holder: req.user._id }),
    _id: id,
  });

  if (!product) {
    throw new ApiError(404, "Batch not found.");
  }
  await Inventory.findByIdAndDelete(id);

  const isAnyProductExist = await Inventory.find({ product: product.product });

  if (isAnyProductExist.length == 0) {
    await Product.findByIdAndDelete(product.product);
  }
};

export const getExpiringProductService = async (req) => {
  const pipeline = [];

  pipeline.push({
    $lookup: {
      from: "products",
      localField: "product",
      foreignField: "_id",
      as: "product",
    },
  });

  pipeline.push({
    $unwind: "$product",
  });

  if (req.user.role == "admin") {
    pipeline.push({
      $lookup: {
        from: "users",
        localField: "product.holder",
        foreignField: "_id",
        as: "user",
      },
    });

    pipeline.push({
      $unwind: "$user",
    });
  }

  pipeline.push({
    $match: {
      ...((req.user.role == "supplier" || req.user.role == "employee") && {
        "product.holder": req.user._id,
      }),
      status: "EXPIRING",
    },
  });

  pipeline.push({
    $facet: {
      inventory: [
        {
          $group: {
            _id: "$_id",

            name: {
              $first: "$product.name",
            },

            ...(req.user.role == "admin" && {
              email: { $first: "$user.email" },
            }),

            quantity: { $first: "$quantity" },

            batchNumber: { $first: "$batchNumber" },

            expiryDate: { $first: "$expiryDate" },
          },
        },

        {
          $sort: {
            name: 1,
          },
        },
      ],

      totals: [
        {
          $group: {
            _id: null,
            totalBatchCount: {
              $sum: 1,
            },
          },
        },
      ],
    },
  });

  const result = await Inventory.aggregate(pipeline);

  return {
    inventory: result[0].inventory,
    totalBatches: result[0].totals[0]?.totalBatchCount || 0,
  };
};

export const deductUsedProductService = async (req) => {
  const { id } = req.params;
  const quantity = Number(req.body.quantity);

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid product ID");
  }

  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new ApiError(400, "Quantity must be a positive number");
  }

  const session = await mongoose.startSession();

  try {
    let result;

    await session.withTransaction(async () => {
      const product = await Product.findById(id)
        .select("holder")
        .session(session)
        .lean();

      if (!product) {
        throw new ApiError(404, "Product not found");
      }

      if (String(product.holder) !== String(req.user.id)) {
        throw new ApiError(403, "This product belongs to another user");
      }

      // FEFO: consume the inventory with the earliest expiry first.
      const inventories = await Inventory.find({
        product: product._id,
        holder: req.user.id,
        transferStatus: "DELIVERED",
        status: { $nin: ["EXPIRED", "USED"] },
        quantity: { $gt: 0 },
      })
        .sort({ expiryDate: 1, _id: 1 })
        .session(session)
        .lean();

      if (inventories.length === 0) {
        throw new ApiError(404, "No inventory found for this product");
      }

      const totalQuantity = inventories.reduce(
        (total, item) => total + Number(item.quantity),
        0,
      );

      if (totalQuantity < quantity) {
        throw new ApiError(
          400,
          `Insufficient stock. Available: ${totalQuantity}, requested: ${quantity}`,
        );
      }

      let remainingQuantity = quantity;
      const operations = [];

      for (const inventory of inventories) {
        if (remainingQuantity <= 0) break;

        const availableQuantity = Number(inventory.quantity);
        const usedQuantity = Math.min(remainingQuantity, availableQuantity);

        if (usedQuantity === availableQuantity) {
          // Entire batch has been consumed.
          operations.push({
            updateOne: {
              filter: {
                _id: inventory._id,
                quantity: availableQuantity,
              },
              update: {
                $set: { status: "USED" },
              },
            },
          });
        } else {
          // Keep the unused stock in the original inventory.
          operations.push({
            updateOne: {
              filter: {
                _id: inventory._id,
                quantity: availableQuantity,
              },
              update: {
                $inc: { quantity: -usedQuantity },
              },
            },
          });

          // Record the consumed portion as a separate USED inventory.
          // File: backend/services/inventory.service.js

          operations.push({
            insertOne: {
              document: {
                product: inventory.product,
                holder: inventory.holder,
                batchNumber: generateBatchNumber(),
                quantity: usedQuantity,
                buyingPrice: inventory.buyingPrice,
                expiryDate: inventory.expiryDate,
                manufactureDate: inventory.manufactureDate,
                editHistory: [
                  ...(inventory.editHistory ?? []),
                  {
                    editor: req.user.id,
                    transferStatus: inventory.transferStatus,
                    status: "USED",
                  },
                ],
                transferStatus: inventory.transferStatus,
                status: "USED",
              },
            },
          });
        }

        remainingQuantity -= usedQuantity;
      }

      const bulkResult = await Inventory.bulkWrite(operations, {
        session,
        ordered: true,
      });

      // Protect against unexpected concurrent modifications.
      if (
        bulkResult.matchedCount !==
        inventories.filter((item) => {
          const usedBefore = inventories
            .slice(0, inventories.indexOf(item))
            .reduce((sum, previous) => sum + Number(previous.quantity), 0);

          return usedBefore < quantity;
        }).length
      ) {
        throw new ApiError(
          409,
          "Inventory changed during deduction. Please try again.",
        );
      }

      result = {
        productId: product._id,
        requestedQuantity: quantity,
        deductedQuantity: quantity,
        remainingStock: totalQuantity - quantity,
        message: "Product quantity deducted successfully",
      };
    });

    return result;
  } finally {
    await session.endSession();
  }
};

export const getUsedProductAtTodayService = async (req) => {
  const now = new Date();

  const startOfDay = new Date(now);
  startOfDay.setHours(2, 0, 0, 0);

  if (now < startOfDay) {
    startOfDay.setDate(startOfDay.getDate() - 1);
  }

  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  const data = await Inventory.find({
    holder: req.user.id,
    status: "USED",
    updatedAt: {
      $gte: startOfDay,
      $lt: endOfDay,
    },
  })
    .select("product quantity updatedAt")
    .populate("product", "name")
    .sort({ updatedAt: -1 })
    .lean();

  return data;
};
