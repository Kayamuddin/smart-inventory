import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  MenuItem,
  CircularProgress,
  Typography,
  Autocomplete,
} from "@mui/material";
import dayjs from "dayjs";

import { addInventory } from "../../pages/inventory/index.js";
import { useDispatch } from "react-redux";
import { showToast } from "../../redux/slice/toastSlice.js";

const categories = [
  "Dairy",
  "Bakery",
  "Beverages",
  "Snacks",
  "Frozen",
  "Medicine",
  "Electronics",
  "Other",
];

export default function AddProductModal({
  open,
  handleClose,
  refresh,
  products,
}) {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const uniqueProducts = Array.from(
    new Map(
      products.filter((p) => p.name).map((p) => [p.name.toLowerCase(), p]),
    ).values(),
  );

  const [form, setForm] = useState({
    name: "",
    category: "",
    quantity: "",
    buyingPrice: "",
    manufactureDate: dayjs().subtract(3, "day").format("YYYY-MM-DD"),
    expiryDate: dayjs().add(30, "day").format("YYYY-MM-DD"),
    unit: "",
  });

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleDateChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setForm({
      name: "",
      category: "",
      quantity: "",
      buyingPrice: "",
      manufactureDate: dayjs().subtract(3, "day").format("YYYY-MM-DD"),
      expiryDate: dayjs().add(30, "day").format("YYYY-MM-DD"),
      unit: "",
    });
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      dispatch(showToast(["Product name is required.", "error"]));
      return false;
    }

    if (!form.category) {
      dispatch(showToast(["Category is required.", "error"]));
      return false;
    }

    if (Number(form.quantity) <= 0) {
      dispatch(showToast(["Quantity must be greater than 0.", "error"]));
      return false;
    }

    if (Number(form.buyingPrice) < 0) {
      dispatch(showToast(["Buying price is invalid.", "error"]));
      return false;
    }

    if (dayjs(form.expiryDate).isBefore(dayjs(form.manufactureDate))) {
      dispatch(
        showToast(["Expiry date cannot be before manufacture date.", "error"]),
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const payload = {
        ...form,
        manufactureDate: dayjs(form.manufactureDate).format("YYYY-MM-DD"),
        expiryDate: dayjs(form.expiryDate).format("YYYY-MM-DD"),
        quantity: Number(form.quantity),
        buyingPrice: Number(form.buyingPrice),
      };

      await addInventory(payload);

      resetForm();

      handleClose();

      refresh();

      dispatch(showToast(["Product added successfully", "success"]));
    } catch (error) {
      console.error(error);
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

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle
        sx={{
          fontWeight: 700,
          fontSize: 24,
          pb: 1,
        }}
      >
        Add New Product
      </DialogTitle>

      <DialogContent dividers>
        {/* Product Information */}

        <Typography variant="subtitle1" fontWeight={600} mb={2}>
          Product Information
        </Typography>

        <Grid container spacing={2} mb={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Autocomplete
              freeSolo
              value={
                uniqueProducts.find((p) => p.name === form.name) ?? form.name
              }
              options={uniqueProducts}
              getOptionLabel={(option) =>
                typeof option === "string" ? option : option.name
              }
              onInputChange={(event, value) => {
                setForm((prev) => ({
                  ...prev,
                  name: value,
                }));
              }}
              onChange={(event, product) => {
                console.log(product);
                if (!product || typeof product === "string") return;

                setForm((prev) => ({
                  ...prev,
                  name: product.name,
                  category: product.category,
                  quantity: product.batches[0]?.quantity || "",
                  unit: product.unit,
                  buyingPrice: product.batches[0]?.buyingPrice,
                }));
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Product Name"
                  fullWidth
                  required
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              select
              fullWidth
              label="Category"
              name="category"
              value={form.category}
              onChange={handleChange}
              required
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

        {/* Inventory */}

        <Typography variant="subtitle1" fontWeight={600} mb={2}>
          Inventory Details
        </Typography>

        <Grid container spacing={2} mb={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              type="number"
              label="Quantity"
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Unit"
              name="unit"
              value={form.unit}
              onChange={handleChange}
            />
          </Grid>
        </Grid>

        {/* Pricing */}

        <Typography variant="subtitle1" fontWeight={600} mb={2}>
          Pricing
        </Typography>

        <Grid container spacing={2} mb={3}>
          <Grid size={12}>
            <TextField
              fullWidth
              type="number"
              label="Buying Price"
              name="buyingPrice"
              value={form.buyingPrice}
              onChange={handleChange}
            />
          </Grid>
        </Grid>

        {/* Dates */}

        <Typography variant="subtitle1" fontWeight={600} mb={2}>
          Dates
        </Typography>

        <Grid container spacing={2}>
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
              name="manufactureDate"
              value={form.manufactureDate}
              onClick={(e) => e.target.showPicker?.()}
              onChange={(e) =>
                handleDateChange("manufactureDate", e.target.value)
              }
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
              name="expiryDate"
              value={form.expiryDate}
              onClick={(e) => e.target.showPicker?.()}
              onChange={(e) => handleDateChange("expiryDate", e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-3"
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          gap: 1,
        }}
      >
        <Button
          color="inherit"
          disabled={loading}
          onClick={() => {
            resetForm();
            handleClose();
          }}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={
            loading ? <CircularProgress size={18} color="inherit" /> : null
          }
        >
          {loading ? "Saving..." : "Save Product"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
