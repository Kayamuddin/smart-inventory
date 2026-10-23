import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  Typography,
} from "@mui/material";

import { useDispatch } from "react-redux";
import { showToast } from "../../../redux/slice/toastSlice.js";

export default function EditProductRequestDialog({
  open,
  handleClose,
  product,
  deductUsedProduct,
  refresh,
}) {
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState("");

  useEffect(() => {
    if (!open || !product) {
      setQuantity("");
      return;
    }

    setQuantity(product.quantity ?? "");
  }, [open, product]);

  const resetForm = () => {
    setQuantity("");
  };

  const handleDialogClose = () => {
    if (loading) return;

    resetForm();
    handleClose();
  };

  const validateForm = () => {
    const value = Number(quantity);

    if (!Number.isInteger(value) || value <= 0) {
      dispatch(
        showToast(["Quantity must be a positive whole number.", "error"]),
      );

      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (loading || !product || !validateForm()) {
      return;
    }

    try {
      setLoading(true);

      await deductUsedProduct(product._id, { quantity: Number(quantity) });

      dispatch(showToast(["Quantity Deducted successfully.", "success"]));

      resetForm();
      refresh();
      handleClose();
    } catch (error) {
      console.error("Quantity Deducted error:", error);

      dispatch(
        showToast([
          error?.response?.data?.message || "Something went wrong.",
          "error",
        ]),
      );
    } finally {
      setLoading(false);
    }
  };

  if (!product) {
    return null;
  }

  return (
    <Dialog open={open} onClose={handleDialogClose} fullWidth maxWidth="md">
      <DialogTitle
        sx={{
          fontWeight: 700,
          fontSize: 24,
          pb: 1,
        }}
      >
        Deduct Used Inventory
      </DialogTitle>

      <DialogContent dividers>
        <Typography variant="subtitle1" fontWeight={600} mb={1}>
          Product Name
        </Typography>

        <TextField
          fullWidth
          value={product?.name || ""}
          label="Product Name"
          slotProps={{
            input: {
              readOnly: true,
            },
          }}
        />

        <Typography variant="subtitle1" fontWeight={600} mb={1} mt={3}>
          Used Quantity
        </Typography>

        <TextField
          fullWidth
          type="number"
          label="Quantity"
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
          slotProps={{
            htmlInput: {
              min: 1,
              step: 1,
            },
          }}
          required
        />
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          gap: 1,
        }}
      >
        <Button color="inherit" disabled={loading} onClick={handleDialogClose}>
          Cancel
        </Button>

        <Button
          variant="contained"
          disabled={loading}
          onClick={handleSubmit}
          startIcon={
            loading ? <CircularProgress size={18} color="inherit" /> : null
          }
        >
          {loading ? "Saving..." : "Deduct Used"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
