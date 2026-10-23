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

import { showToast } from "../../../redux/slice/toastSlice.js";

export default function DeleteProductDialog({
  open,
  handleClose,
  product,
  deleteMenuProduct,
  refresh,
}) {
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    try {
      setLoading(true);

      await deleteMenuProduct(product);

      dispatch(showToast(["Product deleted successfully.", "success"]));

      refresh();

      handleClose();
    } catch (error) {
      dispatch(
        showToast([
          error?.response?.data?.message || "Failed to delete product.",
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
      <DialogTitle>Delete Menu Product</DialogTitle>

      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete this menu product?
        </DialogContentText>

        <Typography mt={2}>
          <strong>Name:</strong> {product?.name || "Product Name"}
        </Typography>

        <Typography>
          <strong>Category:</strong> {product?.category || "Product Category"}
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
          {loading ? "Deleting..." : "Delete Product"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
