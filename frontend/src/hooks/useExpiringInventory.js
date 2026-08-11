import { useState, useEffect } from "react";
import { getExpiringProductsService } from "../services/inventory.service.js";

export const useExpiringInventory = () => {
  const [expiringProducts, setExpiringProducts] = useState([]);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchExpiringProducts = async () => {
    try {
      setLoading(true);
      const response = await getExpiringProductsService();

      setExpiringProducts(response.inventory);
      setTotalNotifications(response.totalBatches);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchExpiringProducts();
  }, []);

  const refreshExpiringProducts = () => {
    fetchExpiringProducts();
  };

  return {
    expiringProducts,
    totalNotifications,
    loading,
    refreshExpiringProducts,
  };
};
