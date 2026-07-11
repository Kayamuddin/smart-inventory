import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
  Typography,
} from "@mui/material";

import { useDispatch } from "react-redux";

import { showToast } from "../../redux/slice/toastSlice";
import { deleteBatch } from "../../pages/inventory/index.js";

export default function DeleteBatchDialog({
  open,
  handleClose,
  batch,
  refresh,
}) {
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    try {
      setLoading(true);

      await deleteBatch(batch._id);

      dispatch(showToast(["Batch deleted successfully.", "success"]));

      refresh();

      handleClose();
    } catch (error) {
      dispatch(
        showToast([
          error?.response?.data?.message || "Failed to delete batch.",
          "error",
        ]),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Delete Inventory Batch</DialogTitle>

      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete this inventory batch?
        </DialogContentText>

        <Typography mt={2}>
          <strong>Batch:</strong> {batch?.batchNumber}
        </Typography>

        <Typography>
          <strong>Quantity:</strong> {batch?.quantity}
        </Typography>

        <Typography>
          <strong>Expiry:</strong>{" "}
          {batch?.expiryDate
            ? new Date(batch.expiryDate).toLocaleDateString()
            : "-"}
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
          {loading ? "Deleting..." : "Delete Batch"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
