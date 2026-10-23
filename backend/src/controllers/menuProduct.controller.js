import MenuProduct from "../models/menuProducts/MenuProduct.model.js";
import {
  createMenuProductService,
  deleteMenuProductService,
  getMenuProductService,
  updateMenuProductService,
} from "../services/menuProducts.service.js";

export const createMenuProduct = async (req, res, next) => {
  try {
    const product = await createMenuProductService(req);
    return res.status(201).json({
      success: true,
      message: "Product created successfully.",
      product,
    });
  } catch (error) {
    next(error);
  }
};

export const getMenuProduct = async (req, res, next) => {
  try {
    const product = await getMenuProductService(req);
    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMenuProduct = async (req, res, next) => {
  try {
    const product = await updateMenuProductService(req);
    return res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      product,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMenuProduct = async (req, res, next) => {
  try {
    const product = await deleteMenuProductService(req);
    return res.status(204).json({
      success: true,
      message: "",
    });
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (req, res, next) => {
  try {
    const categories = await MenuProduct.distinct("category", {
      category: { $ne: "" },
      ...(req.user.role == "employee" && {
        holder: req.user._id,
      }),
    });

    res.status(200).json({
      success: true,
      categories: categories.sort(),
    });
  } catch (error) {
    next(error);
  }
};
