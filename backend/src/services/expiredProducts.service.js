import ExpiredProduct from "../models/ExpiredProduct.model.js";

export const getExpiredProductService = async (req) => {
  const page = Number(req.query.page) || 1;

  const limit = Number(req.query.limit) || 10;

  const skip = (page - 1) * limit;

  const searchByEmail = req.query.searchByEmail || "";

  const searchByName = req.query.searchByName || "";

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

  pipeline.push({
    $match: {
      ...(req.user.role === "supplier" && {
        "product.supplier": req.user._id,
      }),

      ...(searchByEmail && {
        "user.email": {
          $regex: searchByEmail,

          $options: "i",
        },
      }),

      ...(searchByName && {
        "product.name": {
          $regex: searchByName,

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

      email: {
        $first: "$user.email",
      },

      category: {
        $first: "$product.category",
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
          expiryDate: "$expiryDate",
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

  const result = await ExpiredProduct.aggregate(pipeline);

  return {
    inventory: result[0].products,
    total: result[0].total[0]?.count || 0,
    page,
    totalPages: Math.ceil((result[0].total[0]?.count || 0) / limit),
  };
};

export const getExpiredCategoryService = async (req) => {
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
      ...((req.user.role === "supplier" || req.user.role === "employee") && {
        "product.supplier": req.user._id,
      }),
      ...(category && {
        "product.category": category,
      }),
    },
  });

  pipeline.push({
    $group: {
      _id: "$product._id",
      category: {
        $first: "$product.category",
      },
    },
  });

  pipeline.push({
    $facet: {
      category: [],
    },
  });

  const result = await ExpiredProduct.aggregate(pipeline);
  const array = result[0].category;
  const categoryArray = [];
  array.forEach((element) => {
    if (!categoryArray.includes(element.category)) {
      categoryArray.push(element.category);
    }
  });

  return categoryArray.sort();
};
