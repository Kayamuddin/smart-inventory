import ExpiredProduct from "../models/ExpiredProduct.model.js";
import Product from "../models/Product.model.js";
import {
  getExpiredCategoryService,
  getExpiredProductService,
} from "../services/expiredProducts.service.js";
import {
  addProductInventory,
  getExpiringProductService,
  getInventoryByIdService,
  getInventoryService,
  updateInventoryService,
} from "../services/inventory.service.js";
import generateBatchNumber from "../utils/generateBatchNumber.js";

export const addInventory = async (req, res, next) => {
  try {
    const inventory = await addProductInventory({ ...req.body }, req.user._id);

    return res.status(201).json({
      success: true,
      message: "Inventory added successfully",
      inventory,
    });
  } catch (error) {
    next(error);
  }
};

export const getInventory = async (req, res, next) => {
  try {
    const inventory = await getInventoryService(req);

    return res.status(200).json({
      success: true,

      ...inventory,
    });
  } catch (error) {
    next(error);
  }
};

export const getInventoryById = async (req, res, next) => {
  try {
    const { supplierId } = req.body;
    const { id } = req.params;

    const product = await getInventoryByIdService(id, supplierId);

    return res.status(200).json({
      success: true,
      message: "Product fetched successfully.",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const updateInventory = async (req, res, next) => {
  try {
    const editorId = req.user.id;
    const { id } = req.params;

    const product = await updateInventoryService(id, req.body, editorId);

    return res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (req, res, next) => {
  try {
    const categories = await Product.distinct("category", {
      category: { $ne: "" },
      ...(req.user.role != "admin" && {
        supplier: req.user._id,
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

export const getExpiredProducts = async (req, res, next) => {
  try {
    const expiredProducts = await getExpiredProductService(req);

    return res.status(200).json({
      success: true,
      ...expiredProducts,
    });
  } catch (error) {
    next(error);
  }
};

export const getExpiredCategories = async (req, res, next) => {
  try {
    const categories = await getExpiredCategoryService(req);

    res.status(200).json({
      success: true,
      categories: categories,
    });
  } catch (error) {
    next(error);
  }
};

export const getExpiringProducts = async (req, res, next) => {
  try {
    const inventory = await getExpiringProductService(req);

    return res.status(200).json({
      success: true,

      ...inventory,
    });
  } catch (error) {
    next(error);
  }
};
