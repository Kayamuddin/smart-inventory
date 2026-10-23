import {
  addProductToPackagingService,
  approveProductDeliveredService,
  approveProductsDeliveryService,
  approveRequestProductService,
  createRequestProductService,
  deleteRequestProductService,
  getPackedProductsService,
  getProductSuggestionService,
  getRequestProductService,
  markAllDeliveredService,
  transferPackedProductService,
  updateRequestProductService,
} from "../services/productTransfer.service.js";

export const getProductSuggestion = async (req, res, next) => {
  try {
    const products = await getProductSuggestionService(req);
    return res.status(200).json({
      success: true,
      message: "Product suggestion fetched successfully",
      products,
    });
  } catch (error) {
    next(error);
  }
};

export const getRequestProduct = async (req, res, next) => {
  try {
    const products = await getRequestProductService(req);

    return res.status(200).json({
      success: true,
      message: "Products request fetched successfully",
      products,
    });
  } catch (error) {
    next(error);
  }
};

export const createRequestProduct = (requestType) => async (req, res, next) => {
  try {
    const product = await createRequestProductService(req, requestType);
    return res.status(201).json({
      success: true,
      message: "Product request created successfully",
      product,
    });
  } catch (error) {
    next(error);
  }
};

export const updateRequestProduct = async (req, res, next) => {
  try {
    const product = await updateRequestProductService(req);
    return res.status(200).json({
      success: true,
      message: "Product request Updated successfully",
      product,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteRequestProduct = async (req, res, next) => {
  try {
    const product = await deleteRequestProductService(req);
    return res.status(204).json({
      success: true,
      message: "Product request deleted successfully",
      product,
    });
  } catch (error) {
    next(error);
  }
};

export const addProductToPackaging = async (req, res, next) => {
  try {
    const { stockRequest, stockTransfer } =
      await addProductToPackagingService(req);
    return res.status(201).json({
      success: true,
      message: "Product request added to Package",
      stockRequest,
      stockTransfer,
    });
  } catch (error) {
    next(error);
  }
};

export const approveRequestProduct = async (req, res, next) => {
  try {
    const request = await approveRequestProductService(req);
    return res.status(201).json({
      success: true,
      message: "Product request approved successfully",
      request,
    });
  } catch (error) {
    next(error);
  }
};

export const getPackedProducts = async (req, res, next) => {
  try {
    const packedStock = await getPackedProductsService(req);
    return res.status(201).json({
      success: true,
      message: "Packaged request fetched successfully",
      packedStock,
    });
  } catch (error) {
    next(error);
  }
};

export const transferPackedProduct = async (req, res, next) => {
  try {
    const stockTransfer = await transferPackedProductService(req);
    return res.status(200).json({
      success: true,
      message: "Packed product transferred successfully",
      stockTransfer,
    });
  } catch (error) {
    next(error);
  }
};

export const approveProductsDelivery = async (req, res, next) => {
  try {
    const stockTransfer = await approveProductsDeliveryService(req);
    return res.status(200).json({
      success: true,
      message: "Product delivery approved successfully",
      stockTransfer,
    });
  } catch (error) {
    next(error);
  }
};

export const approveProductDelivered = async (req, res, next) => {
  try {
    const request = await approveProductDeliveredService(req);
    return res.status(201).json({
      success: true,
      message: "Product delivered approved successfully",
      request,
    });
  } catch (error) {
    next(error);
  }
};

export const markAllDelivered = async (req, res, next) => {
  try {
    const stockTransfer = await markAllDeliveredService(req);
    return res.status(200).json({
      success: true,
      message: "All Product delivered successfully",
      stockTransfer,
    });
  } catch (error) {
    next(error);
  }
};
