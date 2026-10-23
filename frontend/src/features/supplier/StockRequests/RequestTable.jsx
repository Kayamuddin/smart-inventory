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
import dayjs from "dayjs";
import { Add, Store } from "@mui/icons-material";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { showToast } from "../../../redux/slice/toastSlice.js";
import { ChevronDown, ChevronUp } from "lucide-react";

function RequestProductTable({
  productRequests,
  loading,
  addProductToPackaging,
  approveRequestProduct,
}) {
  const [addToPackageOpen, setAddToPackageOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [expandedOutlets, setExpandedOutlets] = useState({});
  const dispatch = useDispatch();

  const handleClose = () => {
    setAddToPackageOpen(false);
  };

  const handlePackageRequest = async () => {
    try {
      if (!selectedRequest?._id) return;

      await addProductToPackaging(selectedRequest._id);

      dispatch(showToast(["Product request packaged successfully", "success"]));

      setSelectedRequest(null);
    } catch (error) {
      console.error("Error packaging product request:", error);

      dispatch(
        showToast([
          error.response?.data?.message ||
            error.message ||
            "Something went wrong.",
          "error",
        ]),
      );
    } finally {
      setAddToPackageOpen(false);
    }
  };

  const handleApproveRequest = async (request) => {
    try {
      await approveRequestProduct(request._id, request);

      dispatch(showToast(["Product request approved successfully", "success"]));
    } catch (error) {
      console.error("Failed to approve product request:", error);

      dispatch(
        showToast([
          error.response?.data?.message ||
            error.message ||
            "Failed to approve request.",
          "error",
        ]),
      );
    }
  };

  const toggleOutlet = (id) => {
    setExpandedOutlets((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  if (loading)
    return (
      <div className="flex justify-center py-5">
        <CircularProgress />
      </div>
    );

  if (productRequests.length == 0)
    return (
      <div className="grid place-items-center py-20">
        No Product Request Found.
      </div>
    );

  return (
    <>
      <div className="w-full space-y-5 select-none">
        {productRequests.map((group) => {
          const isExpanded = !!expandedOutlets[group._id];

          return (
            <div
              key={group._id}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white text-gray-900 shadow-sm"
            >
              {/* Outlet header */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-50 px-4 py-4 sm:px-5">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                    <Store size={22} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Outlet
                    </p>
                    <h3 className="break-words text-base font-bold sm:text-lg">
                      {group.from?.name ?? "Unknown outlet"}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Requested {dayjs(group.createdAt).format("DD MMM YYYY")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 not-sm:w-full not-sm:justify-between">
                  <span className="rounded-full bg-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-700">
                    {group.allRequestStock.length}{" "}
                    {group.allRequestStock.length === 1
                      ? "Request"
                      : "Requests"}
                  </span>

                  <Button
                    onClick={() => toggleOutlet(group._id)}
                    variant="outlined"
                    size="small"
                    endIcon={
                      isExpanded ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )
                    }
                    sx={{
                      textTransform: "none",
                      borderRadius: "10px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {isExpanded ? "Hide products" : "View products"}
                  </Button>
                </div>
              </div>

              {/* Collapsible product rows */}
              {isExpanded && (
                <div className="border-t border-gray-200 p-3 sm:p-5">
                  <div className="mb-3 hidden grid-cols-12 gap-3 px-3 text-xs font-semibold uppercase tracking-wide text-gray-500 sm:grid">
                    <span className="col-span-5">Product</span>
                    <span className="col-span-2">Quantity</span>
                    <span className="col-span-3">Status</span>
                    <span className="col-span-2 text-center">Action</span>
                  </div>

                  <div className="space-y-3">
                    {group.allRequestStock.map(({ requestId: request }) => (
                      <div
                        key={request._id}
                        className="grid grid-cols-2 items-center gap-3 rounded-xl border border-gray-100 p-3 hover:bg-gray-50 sm:grid-cols-12 sm:px-3"
                      >
                        <div className="min-w-0 sm:col-span-5">
                          <p className="text-xs text-gray-500 sm:hidden">
                            Product
                          </p>
                          <p className="break-words select-text text-sm font-semibold">
                            {request.productId?.name ?? "Unknown product"}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {dayjs(request.createdAt).format("DD MMM YYYY")}
                          </p>
                        </div>

                        <div className="min-w-0 sm:col-span-2">
                          <p className="text-xs text-gray-500 sm:hidden">
                            Quantity
                          </p>
                          <p className="text-sm font-semibold">
                            {request.quantity}
                          </p>
                        </div>

                        <div className="min-w-0 sm:col-span-3">
                          <Chip
                            label={request.status}
                            size="small"
                            color={
                              {
                                PENDING: "error",
                                APPROVED: "primary",
                                PACKED: "secondary",
                                ONDELIVERY: "info",
                                DELIVERED: "success",
                              }[request.status] ?? "default"
                            }
                          />
                        </div>

                        {request.status === "PENDING" ? (
                          <Button
                            onClick={() => handleApproveRequest(request)}
                            variant="contained"
                            color="success"
                            size="small"
                            sx={{
                              textTransform: "none",
                              borderRadius: "10px",
                            }}
                            className="col-span-1 max-w-[auto] sm:col-span-2"
                          >
                            Approve
                          </Button>
                        ) : (
                          <Button
                            onClick={() => {
                              setSelectedRequest(request);
                              setAddToPackageOpen(true);
                            }}
                            disabled={request.status !== "APPROVED"}
                            variant="outlined"
                            size="small"
                            startIcon={<Add size={16} />}
                            sx={{
                              textTransform: "none",
                              borderRadius: "10px",
                            }}
                            className="col-span-1 sm:col-span-2"
                          >
                            Package
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  {group.allRequestStock.length === 0 && (
                    <p className="py-8 text-center text-sm text-gray-500">
                      No product requests in this outlet.
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <Dialog
        open={addToPackageOpen}
        onClose={loading ? undefined : handleClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <strong>Pack Inventory Request</strong>
        </DialogTitle>

        <DialogContent>
          <DialogContentText>
            Are you sure you have packaged this inventory request?
          </DialogContentText>

          <Typography mt={2}>
            <strong>Name:</strong>{" "}
            {selectedRequest?.productId.name || "Product Name"}
          </Typography>

          <Typography>
            <strong>Quantity:</strong>{" "}
            {selectedRequest?.quantity || "Product quantity"}
          </Typography>

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
            onClick={handlePackageRequest}
            disabled={loading}
            startIcon={
              loading ? <CircularProgress size={18} color="inherit" /> : null
            }
          >
            {loading ? "Packaging..." : "Add in Package"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default RequestProductTable;
