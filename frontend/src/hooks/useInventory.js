import { useCallback, useEffect, useMemo, useState } from "react";

import {
  getInventory,
  addInventory,
  updateBatch,
  deleteBatch,
} from "../pages/inventory/index.js";

export default function useInventory() {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("");

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

  const loadInventory = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getInventory({
        page: pagination.page,
        limit: pagination.limit,
        search: debouncedSearch,
        category,
      });

      setInventory(response.inventory || []);
      setFilteredInventory(response.inventory || []);

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
    loadInventory();
  }, [loadInventory]);

  const refreshInventory = async () => {
    try {
      setRefreshing(true);
      await loadInventory();
    } finally {
      setRefreshing(false);
    }
  };

  const createInventory = async (data) => {
    await addInventory(data);
    await refreshInventory();
  };

  const editBatch = async (batchId, data) => {
    await updateBatch(batchId, data);
    await refreshInventory();
  };

  const removeBatch = async (batchId) => {
    await deleteBatch(batchId);
    await refreshInventory();
  };

  const searchInventory = (keyword) => {
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
      setFilteredInventory(inventory);
      return;
    }

    const filtered = inventory.filter((product) => product.category === value);

    setFilteredInventory(filtered);
  };

  const totalProducts = useMemo(() => inventory.length, [inventory]);

  const totalQuantity = useMemo(() => {
    return inventory.reduce((total, product) => {
      return (
        total + product.batches.reduce((sum, batch) => sum + batch.quantity, 0)
      );
    }, 0);
  }, [inventory]);

  return {
    loading,
    refreshing,

    inventory,
    filteredInventory,

    pagination,

    search,
    category,

    setSearch,
    setCategory,

    searchInventory,
    filterByCategory,

    loadInventory,
    refreshInventory,

    createInventory,
    editBatch,
    removeBatch,

    totalProducts,
    totalQuantity,

    setPagination,
  };
}
