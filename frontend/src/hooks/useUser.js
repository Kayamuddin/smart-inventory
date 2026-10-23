import { useCallback, useEffect, useMemo, useState } from "react";

import {
  getAllUSers,
  createUser,
  updateUser,
  deleteUser,
} from "../services/admin.service.js";

export default function useUser() {
  const [user, setUser] = useState([]);

  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("");
  const categoriesData = ["admin", "supplier", "employee", "customer"];
  const [totalData, setTotalData] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getAllUSers({
        page: pagination.page,
        limit: pagination.limit,
        search: debouncedSearch,
        category,
      });

      setUser(response.users || []);
      setTotalData(response || []);

      setPagination((prev) => ({
        ...prev,
        total: response.total || 0,
        totalPages: response.totalPages || 1,
      }));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, debouncedSearch, category]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const refreshUsers = async () => {
    await loadUsers();
  };

  const addUser = async (data) => {
    const response = await createUser(data);
    setUser((prev) =>
      [...prev, response.user].sort((a, b) => a.email.localeCompare(b.email)),
    );
  };

  const editUser = async (oldUser, data) => {
    const response = await updateUser(oldUser._id, data);
    setUser((prev) =>
      prev
        .map((user) => (user._id === oldUser._id ? response.user : user))
        .sort((a, b) => a.email.localeCompare(b.email)),
    );
  };

  const removeUser = async (oldUser) => {
    await deleteUser(oldUser._id);
    setUser((prev) => prev.filter((user) => user._id != oldUser._id));
  };

  const searchUser = (keyword) => {
    setSearch(keyword);

    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));
  };

  const filterByCategory = (value) => {
    setCategory(value);

    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));

    if (!value) {
      setUser(user);
      return;
    }

    const filtered = user.filter((product) => product.category === value);

    setUser(filtered);
  };

  return {
    loading,

    user,
    totalData,

    pagination,

    category,
    categoriesData,

    setCategory,

    search,
    searchUser,
    filterByCategory,

    refreshUsers,

    loadUsers,
    addUser,
    editUser,
    removeUser,
    setPagination,
  };
}
