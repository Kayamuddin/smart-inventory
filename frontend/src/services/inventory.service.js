import API from "./api";

// Get all inventory
export const getInventory = async (params) => {
  const response = await API.get("/inventory", { params });
  return response.data;
};

// Add new inventory batch
export const addInventory = async (data) => {
  const response = await API.post("/inventory/add", data);
  return response.data;
};

// Update inventory batch
export const updateBatch = async (batchId, data) => {
  const response = await API.put(`/inventory/edit/${batchId}`, data);

  return response.data;
};

// Delete inventory batch
export const deleteBatch = async (batchId) => {
  const response = await API.delete(`/inventory/${batchId}`);

  return response.data;
};

// Get single product batches
export const getProductBatches = async (productId) => {
  const response = await API.get(`/inventory/${productId}`);

  return response.data;
};

export const getCategories = async (params) => {
  const { data } = await API.get("/inventory/categories", { params });

  return data.categories;
};

export const getExpiredProductsService = async (params) => {
  const { data } = await API.get("/inventory/expired-products", { params });
  return data;
};

export const getExpiringProductsService = async () => {
  const { data } = await API.get("/inventory/expiring-products");
  return data;
};

export const getExpiredCategoryService = async (params) => {
  const { data } = await API.get("/inventory/expired-categories", { params });
  return data;
};

export const deductUsedProductService = async (id, params) => {
  const { data } = await API.patch(
    `/inventory/deduct-used-product/${id}`,
    params,
  );
  return data;
};

export const getUsedProductAtTodayService = async () => {
  const { data } = await API.get("/inventory/used-product-at-today");
  return data;
};
