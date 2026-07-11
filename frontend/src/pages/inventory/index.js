import API from "../../services/api.js";

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
  const response = await API.put(`/inventory/${batchId}`, data);

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
