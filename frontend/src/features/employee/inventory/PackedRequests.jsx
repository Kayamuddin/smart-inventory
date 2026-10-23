import { useState } from "react";
import { useDispatch } from "react-redux";
import { showToast } from "../../../redux/slice/toastSlice.js";
import {
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import dayjs from "dayjs";
import { ChevronDown, ChevronUp, Package } from "lucide-react";

function PackedRequests({
  loading,
  packedProducts,
  approveProductDelivered,
  approveProductsDelivery,
}) {
  const [approveProductsDeliveryOpen, setApproveProductsDeliveryOpen] =
    useState(false);
  const [approvingRequests, setApprovingRequests] = useState({});
  const [selectedStock, setSelectedStock] = useState(null);
  const [expandedStocks, setExpandedStocks] = useState({});
  const dispatch = useDispatch();

  const handleClose = () => {
    setApproveProductsDeliveryOpen(false);
  };

  const handleApproveDelivery = async () => {
    try {
      await approveProductsDelivery(selectedStock._id, selectedStock);
      dispatch(showToast(["Stock Delivery Approved successfully", "success"]));
      setSelectedStock(null);
    } catch (error) {
      console.error("Error: ", error);

      dispatch(
        showToast([
          error.response?.data?.message ||
            error.message ||
            "Something went wrong.",
          "error",
        ]),
      );
    } finally {
      setApproveProductsDeliveryOpen(false);
    }
  };

  const handleApproveProductDelivered = async (requestId, request) => {
    setApprovingRequests((prev) => ({
      ...prev,
      [requestId]: true,
    }));

    try {
      await approveProductDelivered(requestId, request);
    } catch (error) {
      dispatch(
        showToast([
          error.response?.data?.message ||
            error.message ||
            "Failed to approve product delivery.",
          "error",
        ]),
      );
    } finally {
      setApprovingRequests((prev) => ({
        ...prev,
        [requestId]: false,
      }));
    }
  };

  if (loading)
    return (
      <div className="flex justify-center w-full py-5">
        <CircularProgress />
      </div>
    );

  if (packedProducts.length == 0)
    return (
      <div className="grid place-items-center w-full py-20">
        No Packed Stock Found.
      </div>
    );

  return (
    <>
      <div className="w-full space-y-5 select-none">
        {packedProducts.map((stock) => (
          <div
            key={stock._id}
            className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            {/* Card Header */}
            <div className="flex flex-col gap-4 border-b border-gray-100 bg-gray-50/70 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                  <Package size={21} />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Outlet
                  </p>
                  <h3 className="break-words text-base font-bold text-gray-900">
                    {stock.to?.name ?? "Unknown outlet"}
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    Created {dayjs(stock.createdAt).format("DD MMM YYYY")}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 sm:justify-end">
                <Chip
                  label={stock.status}
                  color={stock.status === "DELIVERED" ? "success" : "info"}
                  size="small"
                />

                <Button
                  variant={
                    stock.status == "ONDELIVERY" ? "contained" : "outlined"
                  }
                  size="small"
                  startIcon={<Add size={17} />}
                  onClick={() => {
                    setSelectedStock(stock);
                    setApproveProductsDeliveryOpen(true);
                  }}
                  disabled={stock.status !== "ONDELIVERY"}
                  sx={{
                    borderRadius: "10px",
                    textTransform: "none",
                    boxShadow: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  Approve
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() =>
                    setExpandedStocks((prev) => ({
                      ...prev,
                      [stock._id]: !prev[stock._id],
                    }))
                  }
                  sx={{
                    borderRadius: "10px",
                    textTransform: "none",
                    whiteSpace: "nowrap",
                    gap: "5px",
                  }}
                >
                  <span className="not-sm:hidden">
                    {expandedStocks[stock._id]
                      ? "Hide Products"
                      : "View Products"}
                  </span>
                  {expandedStocks[stock._id] ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </Button>
              </div>
            </div>

            {expandedStocks[stock._id] && (
              <>
                {/* Summary */}
                <div className="grid grid-cols-2 gap-3 p-4 sm:px-5">
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                    <p className="text-xs font-medium text-gray-500">
                      Total Products
                    </p>
                    <p className="mt-1 text-xl font-bold text-gray-900">
                      {stock.allRequestStock.length}
                    </p>
                  </div>

                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                    <p className="text-xs font-medium text-gray-500">
                      Packed Stock
                    </p>
                    <p className="mt-1 text-xl font-bold text-gray-900">
                      {stock.allRequestStock.reduce(
                        (total, item) =>
                          total + (Number(item.requestId?.quantity) || 0),
                        0,
                      )}
                    </p>
                  </div>
                </div>

                {/* Product List */}
                <div className="px-4 pb-4 sm:px-5">
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="text-sm font-bold text-gray-800">
                      Products in this package
                    </h4>
                    <span className="text-xs text-gray-500">
                      {stock.allRequestStock.length} items
                    </span>
                  </div>

                  <div className="overflow-hidden rounded-xl border border-gray-200">
                    <div className="grid grid-cols-[1fr_auto] gap-3 bg-gray-50 px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-500 sm:px-4">
                      <span>Product name</span>
                      <span className="text-right">Quantity</span>
                    </div>

                    <div className="divide-y divide-gray-100">
                      {stock.allRequestStock.map((request) => {
                        const productRequest = request.requestId;

                        const requestId = productRequest?._id;

                        const isDelivered =
                          productRequest?.status === "DELIVERED";

                        const isApproving = Boolean(
                          approvingRequests[requestId],
                        );

                        return (
                          <div
                            key={requestId}
                            className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-3 py-3 transition-colors hover:bg-gray-50 sm:px-4"
                          >
                            {/* Approve delivery checkbox */}
                            <input
                              type="checkbox"
                              checked={isDelivered}
                              disabled={
                                !requestId ||
                                isDelivered ||
                                isApproving ||
                                stock.status !== "DELIVERED" ||
                                productRequest?.status === "DELIVERED"
                              }
                              onChange={(event) => {
                                if (event.target.checked && requestId) {
                                  handleApproveProductDelivered(
                                    requestId,
                                    productRequest,
                                  );
                                }
                              }}
                              aria-label={`Approve delivery for ${
                                productRequest?.productId?.name ?? "product"
                              }`}
                              className="h-4 w-4 cursor-pointer accent-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                            />

                            {/* Product name */}
                            <div className="flex min-w-0 items-center gap-2.5">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                                <Package size={16} />
                              </div>

                              <div className="min-w-0">
                                <span className="block break-words text-sm font-medium text-gray-800">
                                  {productRequest?.productId?.name ??
                                    "Unknown product"}
                                </span>

                                {isApproving && (
                                  <span className="text-xs text-blue-600">
                                    Approving delivery...
                                  </span>
                                )}

                                {isDelivered && (
                                  <span className="text-xs text-green-600">
                                    Delivered
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Quantity */}
                            <span className="whitespace-nowrap rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-bold tabular-nums text-blue-700">
                              {productRequest?.quantity ?? 0}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      <Dialog
        open={approveProductsDeliveryOpen}
        onClose={loading ? undefined : handleClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <strong>Approve Delivery</strong>
        </DialogTitle>

        <DialogContent>
          <DialogContentText>
            Are you sure this stock has been delivered?
          </DialogContentText>

          <Typography color="error" mt={2}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading} color="inherit">
            Cancel
          </Button>

          <Button
            variant="contained"
            color="primary"
            onClick={handleApproveDelivery}
            disabled={loading}
            startIcon={
              loading ? <CircularProgress size={18} color="inherit" /> : null
            }
          >
            {loading ? "Approving..." : "Approve delivery"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default PackedRequests;
