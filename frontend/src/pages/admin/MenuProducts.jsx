import { Refresh, Add as AddIcon } from "@mui/icons-material";
import {
  Autocomplete,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { PenLine, Trash2 } from "lucide-react";
import useMenuProduct from "../../hooks/useMenuProduct.js";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { showToast } from "../../redux/slice/toastSlice.js";
import DeleteProductDialog from "../../features/admin/menuProduct/DeleteProductDialog.jsx";

function MenuProducts() {
  const dispatch = useDispatch();
  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const {
    menuProduct,
    categoriesData,
    filterByCategory,
    refreshMenuProduct,
    updateMenuProduct,
    createMenuProduct,
    deleteMenuProduct,
    searchMenuProduct,
  } = useMenuProduct();

  const [form, setForm] = useState({ name: "", category: "" });
  const [addProductLoading, setAddProductLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event, product) => {
    setAnchorEl(event.currentTarget);
    setSelectedProduct(product);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);

    setForm({
      name: product.name,
      category: product.category,
    });

    handleMenuClose();
    setOpenModal(true);
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);

    setForm({
      name: "",
      category: "",
    });

    setOpenModal(true);
  };

  const handleSubmit = async () => {
    try {
      setAddProductLoading(true);

      if (selectedProduct) {
        await updateMenuProduct(selectedProduct, form);
        dispatch(showToast(["Product updated successfully", "success"]));
      } else {
        await createMenuProduct(form);
        dispatch(showToast(["Product created successfully", "success"]));
      }

      setOpenModal(false);
    } catch (err) {
      dispatch(
        showToast([err.response?.data?.message || "Operation failed", "error"]),
      );
    } finally {
      setAddProductLoading(false);
    }
  };
  return (
    <div className="max-w-full overflow-x-hidden h-[calc(100vh-64px)] p-4 flex flex-col">
      <div className="text-[1.25rem] sm:text-[2.125rem] font-bold">
        Manage Menu Products
      </div>

      <Grid container spacing={2} mb={3}>
        <Grid size={6} className="bg-white text-black rounded text-center">
          <Typography>Products</Typography>

          <Typography variant="h4">{menuProduct.length}</Typography>
        </Grid>

        <Grid size={6} className="bg-white text-black rounded text-center">
          <Typography>Categories</Typography>

          <Typography variant="h4">{categoriesData.length}</Typography>
        </Grid>
      </Grid>

      <div className="my-3 flex items-center justify-between gap-3">
        <div className="flex gap-3 w-full">
          <input
            placeholder="Search Product..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              searchMenuProduct(e.target.value);
            }}
            className="h-10 max-w-75 w-full rounded border border-gray-300 bg-white px-3 text-black outline-none focus:border-blue-500"
          />

          <FormControl size="small" sx={{ width: "100%", maxWidth: 180 }}>
            <Select
              value={""}
              displayEmpty
              onChange={(e) => filterByCategory(e.target.value)}
              renderValue={(selected) =>
                selected || (
                  <span style={{ color: "#888" }}>All Categories</span>
                )
              }
              className="bg-white text-black"
            >
              <MenuItem value="">All Categories</MenuItem>

              {categoriesData.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <IconButton
            onClick={refreshMenuProduct}
            sx={{
              height: 36,
              width: 36,
              flexShrink: 0,
            }}
          >
            <Refresh
              className="bg-white text-black"
              sx={{
                height: 36,
                width: 36,
              }}
            />
          </IconButton>
        </div>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddProduct}
          sx={{
            height: 36,
            whiteSpace: "nowrap",
            textTransform: "none",
            flexShrink: 0,
          }}
        >
          Add Product
        </Button>
      </div>

      <Grid
        container
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(4, 1fr)",
            md: "repeat(6, 1fr)",
          },

          gap: 2,
          paddingBottom: "15px",
        }}
      >
        {menuProduct.map((product) => (
          <Paper
            key={product._id}
            sx={{
              p: 1.5,
              textAlign: "center",
              borderRadius: 2,
              aspectRatio: "1/1",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "space-between",
            }}
            onClick={(e) => {
              e.currentTarget.blur(); // remove focus
              handleMenuOpen(e, product);
            }}
          >
            <Typography>{product.name}</Typography>
            <Chip label={product.category} color="success" size="small" />
          </Paper>
        ))}
      </Grid>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            handleEdit(selectedProduct);
          }}
        >
          <PenLine size={16} className="mr-2" />
          Edit
        </MenuItem>

        <MenuItem
          onClick={() => {
            setDeleteOpen(true);
            handleMenuClose();
          }}
          sx={{ color: "red" }}
        >
          <Trash2 size={16} className="mr-2" />
          Delete
        </MenuItem>
      </Menu>
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            fontSize: 24,
            pb: 1,
          }}
        >
          {selectedProduct ? "Edit Product" : "Add New Product"}
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            value={form.name}
            onChange={(e) => {
              setForm(() => ({
                ...form,
                name: e.target.value || "",
              }));
            }}
            label="Name"
            fullWidth
            required
            sx={{ marginBottom: "5px" }}
          />
          <Autocomplete
            freeSolo
            value={form.category}
            options={categoriesData}
            onInputChange={(event, value) => {
              setForm((prev) => ({
                ...prev,
                category: value,
              }));
            }}
            onChange={(event, value) => {
              setForm((prev) => ({
                ...prev,
                category: value || "",
              }));
            }}
            renderInput={(params) => (
              <TextField {...params} label="Category" fullWidth required />
            )}
          />
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
            disabled={addProductLoading}
            onClick={() => {
              setForm({
                name: "",
                category: "",
              });
              setOpenModal(false);
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={addProductLoading}
            startIcon={
              addProductLoading ? (
                <CircularProgress size={18} color="inherit" />
              ) : null
            }
          >
            {addProductLoading ? "Saving..." : "Save Product"}
          </Button>
        </DialogActions>
      </Dialog>
      <DeleteProductDialog
        open={deleteOpen}
        handleClose={() => setDeleteOpen(false)}
        product={selectedProduct}
        deleteMenuProduct={deleteMenuProduct}
        refresh={refreshMenuProduct}
      />
    </div>
  );
}

export default MenuProducts;
