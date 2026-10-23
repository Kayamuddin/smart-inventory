import API from "./api";

export const getMenuProductService = async (params) => {
  const { data } = await API.get("/menu-product", { params });
  return data;
};
export const createMenuProductService = async (params) => {
  const { data } = await API.post("/menu-product", params);
  return data;
};
export const updateMenuProductService = async (id, params) => {
  const { data } = await API.post(`/menu-product/edit/${id}`, params);
  return data;
};
export const deleteMenuProductService = async (id) => {
  const { data } = await API.delete(`/menu-product/${id}`);
  return data;
};

export const getProductCategoryService = async () => {
  const { data } = await API.get("/menu-product/categories");
  return data;
};
