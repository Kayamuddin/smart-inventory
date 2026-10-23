import { useCallback, useEffect, useMemo, useState } from "react";

import {
  getInventory,
  addInventory,
  updateBatch,
  deleteBatch,
  getCategories,
  deductUsedProductService,
  getUsedProductAtTodayService,
} from "../services/inventory.service.js";

export default function useInventory() {
  const [inventory, setInventory] = useState([]);
  const [usedProducts, setUsedProducts] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingUsedProduct, setLoadingUsedProduct] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("");
  const [categoriesData, setCategoriesData] = useState([]);
  const [userRole, setUserRole] = useState({});

  useEffect(() => {
    setUserRole(JSON.parse(localStorage.getItem("user")).role);
  }, []);

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

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategoriesData(data);
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
      await fetchCategories();
    } finally {
      setRefreshing(false);
    }
  };

  let createInventory, editBatch, removeBatch;
  if (userRole == "supplier" || userRole == "admin") {
    createInventory = async (data) => {
      await addInventory(data);
      await refreshInventory();
    };

    editBatch = async (batchId, data) => {
      await updateBatch(batchId, data);
      await refreshInventory();
    };

    removeBatch = async (batchId) => {
      await deleteBatch(batchId);
      await refreshInventory();
    };
  }

  let deductUsedProduct, getUsedProductAtToday;
  if (userRole == "employee" || userRole == "admin") {
    getUsedProductAtToday = async () => {
      setLoadingUsedProduct(true);
      const user = JSON.parse(localStorage.getItem("user"));

      if (!["employee", "admin"].includes(user?.role)) return;

      const { products = [] } = await getUsedProductAtTodayService();

      const groupedProducts = [
        ...products
          .reduce((map, item) => {
            const productId = item.product?._id;

            if (!productId) return map;

            if (map.has(productId)) {
              map.get(productId).quantity += Number(item.quantity);
            } else {
              map.set(productId, {
                ...item,
                quantity: Number(item.quantity),
              });
            }

            return map;
          }, new Map())
          .values(),
      ];

      setUsedProducts(groupedProducts);
      setLoadingUsedProduct(false);
    };

    deductUsedProduct = async (id, quantity) => {
      await deductUsedProductService(id, quantity);
      refreshInventory();
      getUsedProductAtToday();
    };
  }

  useEffect(() => {
    const getUsedProductAtToday = async () => {
      setLoadingUsedProduct(true);
      const user = JSON.parse(localStorage.getItem("user"));

      if (!["employee", "admin"].includes(user?.role)) return;

      const { products = [] } = await getUsedProductAtTodayService();

      const groupedProducts = [
        ...products
          .reduce((map, item) => {
            const productId = item.product?._id;

            if (!productId) return map;

            if (map.has(productId)) {
              map.get(productId).quantity += Number(item.quantity);
            } else {
              map.set(productId, {
                ...item,
                quantity: Number(item.quantity),
              });
            }

            return map;
          }, new Map())
          .values(),
      ];

      setUsedProducts(groupedProducts);
      setLoadingUsedProduct(false);
    };

    getUsedProductAtToday();
  }, []);

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

  const totalProducts = useMemo(() => {
    return inventory.reduce((total, product) => {
      return (
        total +
        (product.batches.filter(
          (batch) =>
            batch.status !== "EXPIRED" &&
            batch.status !== "USED" &&
            (userRole != "employee"
              ? batch.transferStatus == "ONSTOCK"
              : batch.transferStatus == "DELIVERED"),
        ).length == 0
          ? 0
          : 1)
      );
    }, 0);
  }, [inventory]);

  const totalBatches = useMemo(() => {
    return inventory.reduce((total, product) => {
      return (
        total +
        product.batches.filter(
          (batch) =>
            batch.status !== "EXPIRED" &&
            batch.status !== "USED" &&
            (userRole != "employee"
              ? batch.transferStatus == "ONSTOCK"
              : batch.transferStatus == "DELIVERED"),
        ).length
      );
    }, 0);
  }, [inventory]);

  const totalQuantity = useMemo(() => {
    return inventory.reduce((total, product) => {
      return (
        total +
        product.batches.reduce(
          (sum, batch) =>
            batch.status !== "EXPIRED" &&
            batch.status !== "USED" &&
            (userRole != "employee"
              ? batch.transferStatus == "ONSTOCK"
              : batch.transferStatus == "DELIVERED")
              ? sum + batch.quantity
              : sum,
          0,
        )
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
    categoriesData,

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
    totalBatches,
    totalQuantity,

    setPagination,

    deductUsedProduct,
    usedProducts,
    loadingUsedProduct,
  };
}
