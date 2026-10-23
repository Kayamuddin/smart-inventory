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
import { useState } from "react";
import { useDispatch } from "react-redux";
import { showToast } from "../../../redux/slice/toastSlice.js";
import { Delete, Edit } from "@mui/icons-material";
import { Package } from "lucide-react";

function RequestProductTable({
  productRequests,
  setOpenRequestDialog,
  loading,
  setSelectedRequest,
  selectedRequest,
  deleteProductRequest,
}) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const dispatch = useDispatch();

  const handleClose = () => {
    setDeleteOpen(false);
  };

  const handleDelete = async () => {
    try {
      // Implement delete logic here
      await deleteProductRequest(selectedRequest._id);
      dispatch(showToast(["Product request deleted successfully", "success"]));
      setSelectedRequest(null);
    } catch (error) {
      console.error("Error deleting product request:", error);
      dispatch(
        showToast([
          error.response?.data?.message || "Something went wrong.",
          "error",
        ]),
      );
    }
    setDeleteOpen(false);
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
      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {productRequests.map((request) => (
          <div
            key={request._id}
            className="overflow-hidden rounded-2xl border border-gray-200 bg-white text-gray-900 shadow-sm transition-shadow hover:shadow-md"
          >
            {/* Product Header */}
            <div className="flex items-start justify-between gap-3 border-b border-gray-100 bg-gray-50/70 p-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                  <Package size={21} />
                </div>

                <div className="min-w-0">
                  <h3 className="break-words text-sm font-bold sm:text-base">
                    {request.productId?.name ?? "Unknown product"}
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    Created {dayjs(request.createdAt).format("DD MMM YYYY")}
                  </p>
                </div>
              </div>

              <div className="shrink-0 rounded-xl bg-blue-50 px-3 py-2 text-right">
                <p className="text-xs text-blue-600">Quantity</p>
                <p className="text-lg font-bold tabular-nums text-blue-800">
                  {request.quantity}
                </p>
              </div>
            </div>

            {/* Request Details */}
            <div className="space-y-3 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-medium text-gray-500">
                  Request status
                </span>

                <Chip
                  label={request.status}
                  size="small"
                  color={
                    {
                      PENDING: "warning",
                      APPROVED: "primary",
                      PACKED: "secondary",
                      ONDELIVERY: "info",
                      DELIVERED: "success",
                      REJECTED: "error",
                    }[request.status] ?? "default"
                  }
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-medium text-gray-500">
                  Request type
                </span>

                <Chip
                  label={request.requestType}
                  size="small"
                  variant="outlined"
                  color="primary"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 border-t border-gray-100 p-3">
              <Button
                fullWidth
                variant="outlined"
                size="small"
                startIcon={<Edit size={16} />}
                onClick={() => {
                  setSelectedRequest(request);
                  setOpenRequestDialog(true);
                }}
                sx={{
                  borderRadius: "10px",
                  textTransform: "none",
                }}
              >
                Edit
              </Button>

              <Button
                fullWidth
                variant="outlined"
                color="error"
                size="small"
                startIcon={<Delete size={16} />}
                onClick={() => {
                  setSelectedRequest(request);
                  setDeleteOpen(true);
                }}
                sx={{
                  borderRadius: "10px",
                  textTransform: "none",
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
      <Dialog
        open={deleteOpen}
        onClose={loading ? undefined : handleClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Inventory Request</DialogTitle>

        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this inventory request?
          </DialogContentText>

          <Typography mt={2}>
            <strong>Name:</strong>{" "}
            {selectedRequest?.productName || "Product Name"}
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
            color="error"
            onClick={handleDelete}
            disabled={loading}
            startIcon={
              loading ? <CircularProgress size={18} color="inherit" /> : null
            }
          >
            {loading ? "Deleting..." : "Delete Request"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default RequestProductTable;
