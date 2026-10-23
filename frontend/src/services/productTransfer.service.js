import API from "./api.js";

export const getProductSuggestionService = async () => {
  const { data } = await API.get("/product-transfer/product-suggestion");
  return data.products;
};

export const getProductRequestsService = async () => {
  const { data } = await API.get("/product-transfer/product-requests");
  return data.products;
};

export const createProductRequestService = async (data) => {
  const { data: responseData } = await API.post(
    "/product-transfer/create-product-request",
    data,
  );
  return responseData.product;
};

export const updateProductRequestsService = async (requestId, data) => {
  const { data: responseData } = await API.patch(
    `/product-transfer/update-product-request/${requestId}`,
    data,
  );
  return responseData.product;
};

export const deleteProductRequestsService = async (requestId) => {
  const { data: responseData } = await API.delete(
    `/product-transfer/delete-product-request/${requestId}`,
  );
  return responseData.product;
};

export const approveRequestProductService = async (requestId, data) => {
  const { data: responseData } = await API.patch(
    `/product-transfer/approve-request/${requestId}`,
    data,
  );
  return responseData.request;
};

export const addProductToPackagingService = async (requestId) => {
  const { data: responseData } = await API.patch(
    `/product-transfer/add-product-to-packaging/${requestId}`,
  );
  return responseData;
};

export const getPackedProductsService = async () => {
  const { data } = await API.get("/product-transfer/packed-products");
  return data.packedStock;
};

export const transferPackedProductService = async (stockId, data) => {
  const { data: responseData } = await API.patch(
    `/product-transfer/transfer-packed-product/${stockId}`,
    data,
  );
  return responseData.stockTransfer;
};

export const approveProductsDeliveryService = async (stockId, data) => {
  const { data: responseData } = await API.patch(
    `/product-transfer/approve-delivery/${stockId}`,
    data,
  );
  return responseData.stockTransfer;
};

export const approveProductDeliveredService = async (requestId, data) => {
  const { data: responseData } = await API.patch(
    `/product-transfer/approve-delivered/${requestId}`,
    data,
  );
  return responseData.request;
};

export const markAllDeliveredService = async (stockId) => {
  const { data: responseData } = await API.patch(
    `/product-transfer/mark-all-delivered/${stockId}`,
  );
  return responseData.stockTransfer;
};
