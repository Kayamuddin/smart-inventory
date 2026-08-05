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

import dayjs from "dayjs";

import { updateBatch } from "../../services/inventory.service.js";
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

      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Batch Number"
              value={batch?.batchNumber || ""}
              slotProps={{
                htmlInput: {
                  readOnly: true,
                },
              }}
              helperText="Batch number cannot be changed."
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Quantity"
              name="quantity"
              type="number"
              value={form.quantity}
              onChange={handleChange}
            />
          </Grid>

          <Grid size={12}>
            <TextField
              fullWidth
              label="Buying Price"
              name="buyingPrice"
              type="number"
              value={form.buyingPrice}
              onChange={handleChange}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <label
              htmlFor="manufactureDate"
              className="block mb-1 text-sm font-medium text-gray-700"
            >
              Manufacture Date
            </label>

            <input
              id="manufactureDate"
              type="date"
              value={
                form.manufactureDate
                  ? dayjs(form.manufactureDate).format("YYYY-MM-DD")
                  : ""
              }
              onClick={(e) => e.target.showPicker?.()}
              onChange={(e) => handleDate("manufactureDate", e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-3"
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <label
              htmlFor="expiryDate"
              className="block mb-1 text-sm font-medium text-gray-700"
            >
              Expiry Date
            </label>

            <input
              id="expiryDate"
              type="date"
              value={
                form.expiryDate
                  ? dayjs(form.expiryDate).format("YYYY-MM-DD")
                  : ""
              }
              onClick={(e) => e.target.showPicker?.()}
              onChange={(e) => handleDate("expiryDate", e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-3"
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
