import {
  Button,
  Grid,
  Typography,
  Pagination,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";

import { useState } from "react";

import InventoryTable from "../../features/inventory/InventoryTable";
import AddProductModal from "../../features/inventory/AddProductModal";

import useInventory from "../../hooks/useInventory";

export default function Inventory() {
  const {
    loading,
    totalProducts,
    totalQuantity,
    refreshInventory,
    searchInventory,
    inventory,
    filteredInventory,

    pagination,
    setPagination,

    category,
    filterByCategory,
  } = useInventory();

  const [openModal, setOpenModal] = useState(false);

  const [search, setSearch] = useState("");

  const totalBatches = inventory.reduce(
    (sum, item) => sum + item.batches.length,
    0,
  );

  return (
    <div className="p-4 w-full">
      <Typography variant="h4" fontWeight={700} mb={3}>
        Inventory Management
      </Typography>

      <Grid container spacing={2} mb={3}>
        <Grid size={4} className="bg-white text-black rounded text-center">
          <Typography>Products</Typography>

          <Typography variant="h4">{totalProducts}</Typography>
        </Grid>

        <Grid size={4} className="bg-white text-black rounded text-center">
          <Typography>Batches</Typography>

          <Typography variant="h4">{totalBatches}</Typography>
        </Grid>

        <Grid size={4} className="bg-white text-black rounded text-center">
          <Typography>Total Quantity</Typography>

          <Typography variant="h4">{totalQuantity}</Typography>
        </Grid>
      </Grid>

      <div className="my-3 flex items-center justify-between gap-3">
        <div className="flex gap-3 w-full">
          <input
            placeholder="Search Product..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              searchInventory(e.target.value);
            }}
            className="h-9 max-w-75 w-full rounded border border-gray-300 bg-white px-3 text-black outline-none focus:border-blue-500"
          />

          <FormControl size="small" sx={{ width: "100%", maxWidth: 180 }}>
            <Select
              value={category}
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
              <MenuItem value="Dairy">Dairy</MenuItem>
              <MenuItem value="Bakery">Bakery</MenuItem>
              <MenuItem value="Beverages">Beverages</MenuItem>
              <MenuItem value="Snacks">Snacks</MenuItem>
              <MenuItem value="Frozen">Frozen</MenuItem>
            </Select>
          </FormControl>
        </div>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenModal(true)}
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

      <InventoryTable
        products={filteredInventory}
        loading={loading}
        refresh={refreshInventory}
      />

      <div className="mt-4 flex items-center justify-between">
        <FormControl size="small">
          <Select
            value={pagination.limit}
            onChange={(e) =>
              setPagination((prev) => ({
                ...prev,
                page: 1,
                limit: Number(e.target.value),
              }))
            }
            className="bg-white text-black "
          >
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={20}>20</MenuItem>
            <MenuItem value={50}>50</MenuItem>
            <MenuItem value={100}>100</MenuItem>
          </Select>
        </FormControl>

        <Pagination
          page={pagination.page}
          count={pagination.totalPages}
          color="primary"
          onChange={(e, page) =>
            setPagination((prev) => ({
              ...prev,
              page,
            }))
          }
          sx={{
            "& .MuiPaginationItem-root": {
              color: "#fff",
              borderColor: "#475569",
            },
            "& .Mui-selected": {
              backgroundColor: "#2563eb !important",
              color: "#fff",
            },
            "& .MuiPaginationItem-root:hover": {
              backgroundColor: "#1e293b",
            },
          }}
        />
      </div>

      <AddProductModal
        open={openModal}
        handleClose={() => setOpenModal(false)}
        refresh={refreshInventory}
        products={inventory}
      />
    </div>
  );
}
