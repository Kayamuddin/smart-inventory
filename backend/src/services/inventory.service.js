import Product from "../models/Product.model.js";
import Inventory from "../models/Inventory.model.js";
import sendEmail from "../utils/sendEmail.js";
import ApiError from "../utils/ApiError.js";

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
  let product = await Product.findOne({
    name: data.name,
    supplier: supplierId,
  });

  if (!product) {
    product = await Product.create({
      name: data.name,
      category: data.category,
      supplier: supplierId,
      unit: data.unit,
    });
  }

  const inventory = await Inventory.create({
    product: product._id,
    batchNumber: data.batchNumber,
    quantity: data.quantity,
    buyingPrice: data.buyingPrice,
    manufactureDate: data.manufactureDate,
    expiryDate: data.expiryDate,
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
    throw new ApiError("Product not found.", 404);
  }

  return product;
};

export const updateInventoryService = async (productId, data, supplierId) => {
  const product = await Inventory.findOne({
    _id: productId,
    supplier: supplierId,
  });

  if (!product) {
    throw new ApiError("Product not found.", 404);
  }

  product.name = data.name;
  product.category = data.category;

  await product.save();

  return product;
};

export const deleteBatchService = async (batchId, supplierId) => {
  const product = await Inventory.findOne({
    supplier: supplierId,
    "batches._id": batchId,
  });

  if (!product) {
    throw new ApiError("Batch not found.", 404);
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
