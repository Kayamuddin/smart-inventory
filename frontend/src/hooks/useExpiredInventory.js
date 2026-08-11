import { useCallback, useEffect, useMemo, useState } from "react";

import {
  getExpiredCategoryService,
  getExpiredProductsService,
} from "../services/inventory.service.js";

export default function useExpiredInventory() {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [searchByEmail, setSearchByEmail] = useState("");
  const [searchByName, setSearchByName] = useState("");
  const [debouncedSearchName, setDebouncedSearchName] = useState("");
  const [debouncedSearchEmail, setDebouncedSearchEmail] = useState("");
  const [category, setCategory] = useState("");
  const [categoriesData, setCategoriesData] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchName(searchByName);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchByName]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchEmail(searchByEmail);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchByEmail]);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const loadInventory = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getExpiredProductsService({
        page: pagination.page,
        limit: pagination.limit,
        searchByEmail: debouncedSearchEmail,
        searchByName: debouncedSearchName,
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
  }, [
    pagination.page,
    pagination.limit,
    debouncedSearchEmail,
    debouncedSearchName,
    category,
  ]);

  const fetchCategories = async () => {
    try {
      const data = await getExpiredCategoryService();
      setCategoriesData(data.categories);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

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

  const searchInventoryByEmail = (keyword) => {
    setSearchByEmail(keyword);

    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));
  };

  const searchInventoryByName = (keyword) => {
    setSearchByName(keyword);

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

    searchByEmail,
    searchByName,
    category,
    categoriesData,

    setSearchByEmail,
    setSearchByName,
    setCategory,

    searchInventoryByEmail,
    searchInventoryByName,
    filterByCategory,

    loadInventory,
    refreshInventory,

    totalProducts,
    totalQuantity,

    setPagination,
  };
}
