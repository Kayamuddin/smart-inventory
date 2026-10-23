// frontend/src/components/StockRequest/AddProductRequestDialog.jsx

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
  Autocomplete,
} from "@mui/material";

import { useDispatch } from "react-redux";
import { showToast } from "../../../redux/slice/toastSlice.js";

const initialForm = {
  productName: "",
  productId: "",
  holderId: "",
  holderName: "",
  quantity: "",
};

export default function AddProductRequestDialog({
  open,
  handleClose,
  suggestProduct = [],
  createProduct,
}) {
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (!open) {
      setForm(initialForm);
    }
  }, [open]);

  const resetForm = () => {
    setForm(initialForm);
  };

  const handleDialogClose = () => {
    if (loading) return;

    resetForm();
    handleClose();
  };

  const handleQuantityChange = (event) => {
    setForm((prev) => ({
      ...prev,
      quantity: event.target.value,
    }));
  };

  const handleProductChange = (event, product) => {
    if (!product) {
      setForm(initialForm);
      return;
    }

    if (typeof product === "string") return;

    setForm({
      productName: product.name || "",
      productId: product._id || "",
      holderId: product.holderId || "",
      holderName: product.holderName || "",
      quantity: "",
    });
  };

  const validateForm = () => {
    if (!form.productId) {
      dispatch(showToast(["Please select a product.", "error"]));

      return false;
    }

    if (!form.holderId) {
      dispatch(showToast(["Product holder not found.", "error"]));

      return false;
    }

    const quantity = Number(form.quantity);

    if (!Number.isInteger(quantity) || quantity <= 0) {
      dispatch(
        showToast(["Quantity must be a positive whole number.", "error"]),
      );

      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (loading || !validateForm()) return;

    try {
      setLoading(true);

      const payload = {
        productName: form.productName.trim(),
        productId: form.productId,
        holderId: form.holderId,
        holderName: form.holderName,
        quantity: Number(form.quantity),
      };

      await createProduct(payload);

      dispatch(showToast(["Product request created successfully.", "success"]));

      resetForm();
      handleClose();
    } catch (error) {
      console.error("Create product request error:", error);

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

  const selectedProduct =
    suggestProduct.find((product) => product._id === form.productId) || null;

  return (
    <Dialog open={open} onClose={handleDialogClose} fullWidth maxWidth="md">
      <DialogTitle
        sx={{
          fontWeight: 700,
          fontSize: 24,
          pb: 1,
        }}
      >
        Create Product Request
      </DialogTitle>

      <DialogContent dividers>
        <Typography variant="subtitle1" fontWeight={600} mb={1}>
          Product Name
        </Typography>

        <Autocomplete
          value={selectedProduct}
          options={suggestProduct}
          isOptionEqualToValue={(option, value) =>
            option?._id === (typeof value === "object" ? value?._id : value)
          }
          getOptionLabel={(option) =>
            typeof option === "string" ? option : option?.name || ""
          }
          onChange={handleProductChange}
          renderInput={(params) => (
            <TextField {...params} label="Product Name" fullWidth required />
          )}
        />

        <Typography variant="subtitle1" fontWeight={600} mb={1} mt={2}>
          Required Quantity
        </Typography>

        <TextField
          fullWidth
          type="number"
          label="Quantity"
          value={form.quantity}
          onChange={handleQuantityChange}
          slotProps={{
            htmlInput: {
              min: 1,
              step: 1,
            },
          }}
          autoComplete="off"
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
          {loading ? "Saving..." : "Create Request"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
