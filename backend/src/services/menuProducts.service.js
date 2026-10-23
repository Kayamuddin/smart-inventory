import MenuProduct from "../models/menuProducts/MenuProduct.model.js";
import ApiError from "../utils/ApiError.js";

export const createMenuProductService = async (req) => {
  const data = req.body;

  let isExist = await MenuProduct.findOne({
    createdBy: req.user._id,
    category: new RegExp(`^${data.category.trim()}$`, "i"),
    name: new RegExp(`^${data.name.trim()}$`, "i"),
  });

  if (isExist) {
    throw new ApiError(409, "Product already exists");
  }

  return await MenuProduct.create({
    name: data.name.trim(),
    category: data.category.trim(),
    createdBy: req.user._id,
  });
};

export const getMenuProductService = async (req) => {
  const category = req.query.category || "";
  const search = req.query.search || "";

  return await MenuProduct.find({
    ...(search && {
      name: {
        $regex: search,

        $options: "i",
      },
    }),
    ...(category && { category: category }),
  });
};

export const updateMenuProductService = async (req) => {
  const { id } = req.params;
  const { name, category } = req.body;

  const product = await MenuProduct.findById(id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  product.name = name || product.name;
  product.category = category || product.category;

  const isUnique = await MenuProduct.find({
    createdBy: product.createdBy,
    category: product.category,
    name: product.name,
  });

  if (isUnique.length != 0) {
    throw new ApiError(409, "Product already exists with these value");
  }

  return await product.save();
};

export const deleteMenuProductService = async (req) => {
  const { id } = req.params;

  const isExist = await MenuProduct.findById(id);

  if (!isExist) throw new ApiError(404, "Product not found");

  await MenuProduct.findByIdAndDelete(id);
};
