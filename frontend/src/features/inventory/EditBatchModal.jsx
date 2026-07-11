import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  CircularProgress,
} from "@mui/material";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

import { updateBatch } from "../../pages/inventory/index.js";
import { useDispatch } from "react-redux";
import { showToast } from "../../redux/slice/toastSlice";

export default function EditBatchModal({ open, handleClose, batch, refresh }) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    quantity: "",
    buyingPrice: "",
    sellingPrice: "",
    manufactureDate: null,
    expiryDate: null,
  });

  useEffect(() => {
    if (batch) {
      setForm({
        quantity: batch.quantity,
        buyingPrice: batch.buyingPrice,
        sellingPrice: batch.sellingPrice,
        manufactureDate: dayjs(batch.manufactureDate),
        expiryDate: dayjs(batch.expiryDate),
      });
    }
  }, [batch]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleDate = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const dispatch = useDispatch();

  const validateForm = () => {
    if (Number(form.quantity) <= 0) {
      dispatch(showToast(["Quantity must be greater than 0", "error"]));

      return false;
    }

    if (Number(form.buyingPrice) < 0) {
      dispatch(showToast(["Buying price is invalid", "error"]));

      return false;
    }

    if (Number(form.sellingPrice) < Number(form.buyingPrice)) {
      dispatch(
        showToast(["Selling price cannot be less than buying price", "error"]),
      );

      return false;
    }

    if (dayjs(form.expiryDate).isBefore(dayjs(form.manufactureDate))) {
      dispatch(
        showToast(["Expiry date must be after manufacture date", "error"]),
      );

      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      await updateBatch(batch._id, {
        quantity: Number(form.quantity),

        buyingPrice: Number(form.buyingPrice),

        sellingPrice: Number(form.sellingPrice),

        manufactureDate: dayjs(form.manufactureDate).format("YYYY-MM-DD"),

        expiryDate: dayjs(form.expiryDate).format("YYYY-MM-DD"),
      });

      dispatch(showToast(["Batch updated successfully", "success"]));

      refresh();

      handleClose();
    } catch (error) {
      dispatch(
        showToast([
          error?.response?.data?.message || "Failed to update batch",
          "error",
        ]),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>Edit Inventory Batch</DialogTitle>

      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Batch Number"
              value={batch?.batchNumber || ""}
              InputProps={{
                readOnly: true,
              }}
              helperText="Batch number cannot be changed."
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Quantity"
              name="quantity"
              type="number"
              value={form.quantity}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Buying Price"
              name="buyingPrice"
              type="number"
              value={form.buyingPrice}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Selling Price"
              name="sellingPrice"
              type="number"
              value={form.sellingPrice}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <DatePicker
              label="Manufacture Date"
              value={form.manufactureDate}
              onChange={(value) => handleDate("manufactureDate", value)}
              slotProps={{
                textField: {
                  fullWidth: true,
                },
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <DatePicker
              label="Expiry Date"
              value={form.expiryDate}
              onChange={(value) => handleDate("expiryDate", value)}
              slotProps={{
                textField: {
                  fullWidth: true,
                },
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>

        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          {loading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            "Save Changes"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
