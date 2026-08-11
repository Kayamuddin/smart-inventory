import Product from "../models/Product.model.js";
import Inventory from "../models/Inventory.model.js";
import sendEmail from "../utils/sendEmail.js";
import ApiError from "../utils/ApiError.js";
import dayjs from "dayjs";
import generateBatchNumber from "../utils/generateBatchNumber.js";

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

export const addProductInventory = async (data, supplierId) => {
  const productName = data.name.trim();
  let status = "ACTIVE";
  const expiry = dayjs(data.expiryDate);
  const daysLeft = expiry.diff(dayjs(), "day");
  let batchNumber = generateBatchNumber();
  let batchExists;

  let product = await Product.findOne({
    supplier: supplierId,
    name: new RegExp(`^${productName}$`, "i"),
  });

  if (!product) {
    product = await Product.create({
      name: productName,
      category: data.category,
      supplier: supplierId,
      unit: data.unit,
    });
  }

  async function checkBatchNumber() {
    batchExists = await Inventory.findOne({
      batchNumber: batchNumber,
    });
    if (batchExists) {
      batchNumber = generateBatchNumber();
      checkBatchNumber();
    }
  }

  checkBatchNumber();

  if (daysLeft <= 0) {
    status = "EXPIRED";
  } else if (daysLeft > 0 && daysLeft <= 7) {
    status = "EXPIRING";
  } else if (daysLeft > 7) {
    status = "ACTIVE";
  }

  const inventory = await Inventory.create({
    product: product._id,
    batchNumber: batchNumber,
    quantity: data.quantity,
    buyingPrice: data.buyingPrice,
    manufactureDate: data.manufactureDate,
    expiryDate: data.expiryDate,
    status: status,
  });

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
      ...(req.user.role === "supplier" && {
        "product.supplier": req.user._id,
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

      status: {
        $in: ["ACTIVE", "EXPIRING"],
      },
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
        $sum: "$quantity",
      },

      batches: {
        $push: {
          _id: "$_id",
          batchNumber: "$batchNumber",
          quantity: "$quantity",
          buyingPrice: "$buyingPrice",
          manufactureDate: "$manufactureDate",
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

export const getInventoryByIdService = async (productId, supplierId) => {
  const product = await Inventory.findOne({
    _id: productId,
    supplier: supplierId,
  });

  if (!product) {
    throw new ApiError(404, "Product not found.");
  }

  return product;
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

export const deleteBatchService = async (batchId, supplierId) => {
  const product = await Inventory.findOne({
    supplier: supplierId,
    "batches._id": batchId,
  });

  if (!product) {
    throw new ApiError(404, "Batch not found.");
  }

  product.batches = product.batches.filter(
    (batch) => batch._id.toString() !== batchId,
  );

  if (product.batches.length === 0) {
    await Inventory.findByIdAndDelete(product._id);
    return;
  }

  await product.save();
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
        localField: "product.supplier",
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
      ...(req.user.role == "supplier" ||
        (req.user.role == "employee" && {
          "product.supplier": req.user._id,
        })),
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
