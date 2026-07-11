import {
  addProductInventory,
  getInventoryByIdService,
  getInventoryService,
  updateInventoryService,
} from "../services/inventory.service.js";
import generateBatchNumber from "../utils/generateBatchNumber.js";

export const addInventory = async (req, res, next) => {
  try {
    const inventory = await addProductInventory(
      { ...req.body, batchNumber: generateBatchNumber() },
      req.user._id,
    );

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
    const supplierId = req.user.id;
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
    const supplierId = req.user.id;
    const { id } = req.params;

    const product = await updateInventoryService(id, req.body, supplierId);

    return res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};
