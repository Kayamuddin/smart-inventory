import mongoose from "mongoose";
import ExpiredProduct from "../models/ExpiredProduct.model.js";
import Product from "../models/Product.model.js";
import {
  getExpiredCategoryService,
  getExpiredProductService,
} from "../services/expiredProducts.service.js";
import {
  addProductInventory,
  deductUsedProductService,
  deleteBatchService,
  getExpiringProductService,
  getInventoryService,
  getUsedProductAtTodayService,
  updateInventoryService,
} from "../services/inventory.service.js";

export const addInventory = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const inventory = await addProductInventory(
      { ...req.body },
      req.user._id,
      session,
    );

    await session.commitTransaction();

    return res.status(201).json({
      success: true,
      message: "Inventory added successfully",
      inventory,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    await session.endSession();
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

export const deleteInventory = async (req, res, next) => {
  try {
    await deleteBatchService(req);
    return res.status(204).json({
      success: true,
      message: "Batch deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (req, res, next) => {
  try {
    const categories = await Product.distinct("category", {
      category: { $ne: "" },
      ...((req.user.role == "supplier" || req.user.role == "employee") && {
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

export const deductUsedProduct = async (req, res, next) => {
  try {
    const result = await deductUsedProductService(req);
    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

export const getUsedProductAtToday = async (req, res, next) => {
  try {
    const result = await getUsedProductAtTodayService(req);
    return res.status(200).json({
      success: true,
      message: "Used product fetched successfully",
      products: result,
    });
  } catch (error) {
    next(error);
  }
};
