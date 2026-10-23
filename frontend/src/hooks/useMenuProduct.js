import { useCallback, useEffect, useMemo, useState } from "react";

import {
  createMenuProductService,
  deleteMenuProductService,
  getMenuProductService,
  getProductCategoryService,
  updateMenuProductService,
} from "../services/menuProduct.service.js";

export default function useMenuProduct() {
  const [menuProduct, setMenuProduct] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("");
  const [categoriesData, setCategoriesData] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const loadMenuProduct = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getMenuProductService({
        search: debouncedSearch,
        category,
      });

      setMenuProduct(
        [...response.product]
          .sort((a, b) => a.name.localeCompare(b.name))
          .sort((a, b) => a.category.localeCompare(b.category)) || [],
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, category]);

  const fetchCategories = async () => {
    try {
      const data = await getProductCategoryService();
      setCategoriesData(data.categories);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    loadMenuProduct();
  }, [loadMenuProduct]);

  const refreshMenuProduct = async () => {
    await loadMenuProduct();
    await fetchCategories();
  };

  const createMenuProduct = async (data) => {
    const response = await createMenuProductService(data);
    setMenuProduct((prev) =>
      [...prev, response.product]
        .sort((a, b) => a.name.localeCompare(b.name))
        .sort((a, b) => a.category.localeCompare(b.category)),
    );
    if (!categoriesData.includes(response.product.category)) {
      setCategoriesData((prev) =>
        [...prev, response.product.category].sort((a, b) => a.localeCompare(b)),
      );
    }
  };

  const updateMenuProduct = async (oldProduct, data) => {
    const response = await updateMenuProductService(oldProduct._id, data);

    if (
      response.product.category &&
      !categoriesData.includes(response.product.category)
    ) {
      setCategoriesData((prev) =>
        [...prev, response.product.category].sort((a, b) => a.localeCompare(b)),
      );
    }

    if (
      menuProduct.filter((product) => product.category == oldProduct.category)
        .length == 1
    ) {
      setCategoriesData((prev) => prev.filter((p) => p != oldProduct.category));
    }

    setMenuProduct((prev) =>
      prev
        .map((product) =>
          product._id === oldProduct._id ? response.product : product,
        )
        .sort((a, b) => a.name.localeCompare(b.name))
        .sort((a, b) => a.category.localeCompare(b.category)),
    );
  };

  const deleteMenuProduct = async (oldProduct) => {
    await deleteMenuProductService(oldProduct._id);
    setMenuProduct((prev) =>
      prev.filter((product) => product._id != oldProduct._id),
    );

    if (
      menuProduct.filter((product) => product.category == oldProduct.category)
        .length == 1
    ) {
      setCategoriesData((prev) => prev.filter((p) => p != oldProduct.category));
    }
  };

  const searchMenuProduct = (keyword) => {
    setSearch(keyword);
  };

  const filterByCategory = (value) => {
    setCategory(value);
  };

  const totalProducts = useMemo(() => menuProduct.length, [menuProduct]);

  return {
    loading,

    menuProduct,

    search,
    category,
    categoriesData,

    setSearch,
    setCategory,

    searchMenuProduct,
    filterByCategory,

    refreshMenuProduct,

    createMenuProduct,
    updateMenuProduct,
    deleteMenuProduct,

    totalProducts,
  };
}
