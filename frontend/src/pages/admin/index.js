import API from "../../services/api"

export const getAllUSers = async () => {
    const response = await API.get("/admin/get-users");
    return response.data;
}

export const createUser = async (data) => {
  const response = await API.post(
    "/admin/create-user",
    data
  );

  return response.data;
};

export const updateUser = async (id, data) => {
  const response = await API.put(
    `/admin/update-user/${id}`,
    data
  );

  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await API.delete(
    `/admin/delete-user/${userId}`
  );

  return response.data;
};
