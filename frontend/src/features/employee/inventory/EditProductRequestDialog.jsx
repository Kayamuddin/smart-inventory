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
  selectedRequest,
  updateProduct,
}) {
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState("");

  useEffect(() => {
    if (!open || !selectedRequest) {
      setQuantity("");
      return;
    }

    setQuantity(selectedRequest.quantity ?? "");
  }, [open, selectedRequest]);

  const resetForm = () => {
    setQuantity("");
  };

  const handleDialogClose = () => {
    if (loading) return;

    resetForm();
    handleClose();
  };

  const getProductName = () => {
    if (
      selectedRequest?.productId &&
      typeof selectedRequest.productId === "object"
    ) {
      return selectedRequest.productId.name || "";
    }

    return selectedRequest?.productName || "";
  };

  const getProductId = () => {
    if (
      selectedRequest?.productId &&
      typeof selectedRequest.productId === "object"
    ) {
      return selectedRequest.productId._id || "";
    }

    return selectedRequest?.productId || "";
  };

  const getHolderId = () => {
    if (selectedRequest?.to && typeof selectedRequest.to === "object") {
      return selectedRequest.to._id || "";
    }

    return selectedRequest?.holderId || "";
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
    if (loading || !selectedRequest || !validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const payload = {
        productName: getProductName(),
        productId: getProductId(),
        holderId: getHolderId(),
        quantity: Number(quantity),
      };

      await updateProduct(selectedRequest._id, payload);

      dispatch(showToast(["Product request updated successfully.", "success"]));

      resetForm();
      handleClose();
    } catch (error) {
      console.error("Update product request error:", error);

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

  if (!selectedRequest) {
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
        Edit Product Request
      </DialogTitle>

      <DialogContent dividers>
        <Typography variant="subtitle1" fontWeight={600} mb={1}>
          Product Name
        </Typography>

        <TextField
          fullWidth
          value={getProductName()}
          label="Product Name"
          slotProps={{
            input: {
              readOnly: true,
            },
          }}
        />

        <Typography variant="subtitle1" fontWeight={600} mb={1} mt={3}>
          Required Quantity
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
          {loading ? "Saving..." : "Update Request"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
