import { useEffect, useState } from "react";
import {
  createProductRequestService,
  deleteProductRequestsService,
  getProductRequestsService,
  getProductSuggestionService,
  addProductToPackagingService,
  updateProductRequestsService,
  getPackedProductsService,
  transferPackedProductService,
  approveProductsDeliveryService,
  approveProductDeliveredService,
  approveRequestProductService,
  markAllDeliveredService,
} from "../services/productTransfer.service.js";
import { showToast } from "../redux/slice/toastSlice.js";
import { useDispatch } from "react-redux";

export default function useProductTransfer() {
  const dispatch = useDispatch();
  const [suggestProduct, setSuggestProduct] = useState([]);
  const [productRequests, setProductRequests] = useState([]);
  const [packedProducts, setPackedProducts] = useState([]);

  const [loadingRequests, setLoadingRequests] = useState(false);
  const [loadingPacked, setLoadingPacked] = useState(false);
  const [refreshRequestProducts, setRefreshRequestProducts] = useState(false);
  const [refreshPackedProducts, setRefreshPackedProducts] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
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

  useEffect(() => {
    if (userRole !== "employee") return;

    let cancelled = false;

    const loadProductSuggestion = async () => {
      try {
        const data = await getProductSuggestionService();

        if (cancelled) return;

        const uniqueProducts = Array.from(
          new Map(
            data
              .filter((product) => product?.name?.trim())
              .map((product) => [product.name.trim().toLowerCase(), product]),
          ).values(),
        );

        setSuggestProduct(uniqueProducts);
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load product suggestions:", error);
        }
      }
    };

    loadProductSuggestion();

    return () => {
      cancelled = true;
    };
  }, [userRole]);

  useEffect(() => {
    const loadProductRequests = async () => {
      try {
        setLoadingRequests(true);
        const data = await getProductRequestsService();
        setProductRequests(data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingRequests(false);
      }
    };
    loadProductRequests();
  }, [debouncedSearch, refreshRequestProducts]);

  useEffect(() => {
    const loadPackedProducts = async () => {
      try {
        setLoadingPacked(true);
        const data = await getPackedProductsService();

        setPackedProducts(data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingPacked(false);
      }
    };

    loadPackedProducts();
  }, [refreshPackedProducts]);

  let createProductRequest,
    updateProductRequest,
    deleteProductRequest,
    approveProductsDelivery,
    approveProductDelivered;
  if (userRole === "employee") {
    createProductRequest = async (data) => {
      const newData = await createProductRequestService(data);

      setProductRequests((prev) => {
        if (prev.some((request) => request._id === newData._id)) {
          return prev.map((request) =>
            request._id === newData._id ? newData : request,
          );
        }

        return [...prev, newData];
      });
    };

    updateProductRequest = async (requestId, data) => {
      const newData = await updateProductRequestsService(requestId, data);

      setProductRequests((prev) =>
        prev.map((group) => {
          // Support grouped API responses.
          if (Array.isArray(group.allRequestStock)) {
            return {
              ...group,
              allRequestStock: group.allRequestStock.map((item) =>
                item.requestId?._id === newData._id
                  ? { ...item, requestId: newData }
                  : item,
              ),
            };
          }

          // Support individual request objects.
          return group._id === newData._id ? newData : group;
        }),
      );
    };

    deleteProductRequest = async (requestId) => {
      await deleteProductRequestsService(requestId);

      setProductRequests((prev) =>
        prev
          .map((group) => {
            if (!Array.isArray(group.allRequestStock)) {
              return group._id === requestId ? null : group;
            }

            return {
              ...group,
              allRequestStock: group.allRequestStock.filter(
                (item) => item.requestId?._id !== requestId,
              ),
            };
          })
          .filter(
            (group) => group !== null && group.allRequestStock?.length !== 0,
          ),
      );
    };

    approveProductsDelivery = async (stockId, data) => {
      const newData = await approveProductsDeliveryService(stockId, data);

      setPackedProducts((prev) =>
        prev.map((stock) => (stock._id === newData._id ? newData : stock)),
      );
    };

    approveProductDelivered = async (requestId, data) => {
      const newData = await approveProductDeliveredService(requestId, data);

      const group = packedProducts.find((group) =>
        group.allRequestStock?.some(
          (item) => item.requestId?._id === newData._id,
        ),
      );

      if (!group) return newData;

      const updatedRequests = group.allRequestStock.map((item) =>
        item.requestId?._id === newData._id
          ? { ...item, requestId: newData }
          : item,
      );

      const allDelivered = updatedRequests.every(
        (item) => item.requestId?.status === "DELIVERED",
      );

      if (allDelivered) {
        await markAllDeliveredService(group._id);
        setPackedProducts((prev) =>
          prev.filter((item) => item._id !== group._id),
        );

        dispatch(
          showToast(["All Product marked Delivered successfully", "success"]),
        );
      } else {
        setPackedProducts((prev) =>
          prev.map((item) =>
            item._id === group._id
              ? { ...item, allRequestStock: updatedRequests }
              : item,
          ),
        );
        dispatch(
          showToast(["Product delivery approved successfully", "success"]),
        );
      }

      return newData;
    };
  }

  let approveRequestProduct;
  let addProductToPackaging;
  let transferPackedProduct;

  if (userRole === "supplier") {
    approveRequestProduct = async (requestId, data) => {
      const newData = await approveRequestProductService(requestId, data);

      setProductRequests((prev) =>
        prev.map((group) => {
          if (Array.isArray(group.allRequestStock)) {
            return {
              ...group,
              allRequestStock: group.allRequestStock.map((item) =>
                item.requestId?._id === newData._id
                  ? { ...item, requestId: newData }
                  : item,
              ),
            };
          }

          return group._id === newData._id ? newData : group;
        }),
      );
    };

    addProductToPackaging = async (requestId) => {
      const newData = await addProductToPackagingService(requestId);

      setProductRequests((prev) =>
        prev.map((group) => {
          if (Array.isArray(group.allRequestStock)) {
            return {
              ...group,
              allRequestStock: group.allRequestStock.map((item) =>
                item.requestId?._id === newData.stockRequest._id
                  ? {
                      ...item,
                      requestId: {
                        ...item.requestId,
                        status: newData.stockRequest.status,
                      },
                    }
                  : item,
              ),
            };
          }

          return group._id === newData.stockRequest._id
            ? { ...group, status: newData.stockRequest.status }
            : group;
        }),
      );
    };

    transferPackedProduct = async (stockId, data) => {
      const newData = await transferPackedProductService(stockId, data);

      setPackedProducts((prev) =>
        prev.map((product) =>
          product._id === newData._id ? newData : product,
        ),
      );
    };
  }

  return {
    suggestProduct,
    productRequests,
    loadingRequests,
    packedProducts,
    loadingPacked,
    search,
    setSearch,
    setRefreshRequestProducts,
    setRefreshPackedProducts,
    createProductRequest,
    updateProductRequest,
    deleteProductRequest,
    approveRequestProduct,
    addProductToPackaging,
    transferPackedProduct,
    approveProductsDelivery,
    approveProductDelivered,
  };
}
