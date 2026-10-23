import {
  Button,
  Grid,
  Typography,
  Pagination,
  FormControl,
  Select,
  MenuItem,
  CircularProgress,
  IconButton,
  Tooltip,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";

import { useState } from "react";

import InventoryTable from "../../features/inventory/InventoryTable";
import AddProductModal from "../../features/inventory/AddProductModal";

import useInventory from "../../hooks/useInventory";
import {
  Inventory2Outlined,
  LayersOutlined,
  Refresh,
  Search,
  WarehouseOutlined,
} from "@mui/icons-material";

export default function Inventory() {
  const {
    loading,
    totalProducts,
    totalBatches,
    totalQuantity,
    refreshInventory,
    searchInventory,
    inventory,
    filteredInventory,

    pagination,
    setPagination,

    category,
    categoriesData,
    filterByCategory,
  } = useInventory();

  const [openModal, setOpenModal] = useState(false);

  const [search, setSearch] = useState("");

  return (
    <div className="w-full p-4 flex flex-col gap-3">
      {/* Inventory Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-[1.25rem] sm:text-[2.125rem] font-bold">
            Manage Inventory
          </div>

          <p className="mt-1 text-sm text-gray-500">
            Track products, batches, and available stock.
          </p>
        </div>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenModal(true)}
          sx={{
            minHeight: 42,
            borderRadius: "12px",
            px: 2.5,
            textTransform: "none",
            fontWeight: 600,
            alignSelf: { xs: "stretch", sm: "auto" },
            boxShadow: "none",
          }}
        >
          Add Product
        </Button>
      </div>

      {/* Inventory Statistics */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          {
            label: "Products",
            value: totalProducts,
            icon: <Inventory2Outlined />,
            iconClass: "bg-blue-100 text-blue-700",
          },
          {
            label: "Batches",
            value: totalBatches,
            icon: <LayersOutlined />,
            iconClass: "bg-violet-100 text-violet-700",
          },
          {
            label: "Total Quantity",
            value: totalQuantity,
            icon: <WarehouseOutlined />,
            iconClass: "bg-emerald-100 text-emerald-700",
          },
        ].map((item) => (
          <Grid key={item.label} size={{ xs: 12, sm: 4 }}>
            <div className="flex h-full items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${item.iconClass}`}
              >
                {item.icon}
              </div>

              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-500">
                  {item.label}
                </p>

                <p className="mt-1 break-words text-2xl font-bold tabular-nums text-gray-900">
                  {item.value}
                </p>
              </div>
            </div>
          </Grid>
        ))}
      </Grid>

      {/* Search and Filters */}
      <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative min-w-0 flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="search"
              placeholder="Search products..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                searchInventory(e.target.value);
              }}
              className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Category Filter and Refresh */}
          <div className="flex gap-2">
            <FormControl
              size="small"
              sx={{ flex: 1, minWidth: 0, width: { xs: "100%", sm: 200 } }}
            >
              <Select
                value={category}
                displayEmpty
                onChange={(e) => filterByCategory(e.target.value)}
                renderValue={(selected) =>
                  selected || (
                    <span className="text-gray-500">All Categories</span>
                  )
                }
                sx={{
                  height: 44,
                  borderRadius: "12px",
                  backgroundColor: "#f9fafb",
                  "& fieldset": { borderColor: "#e5e7eb" },
                }}
              >
                <MenuItem value="">All Categories</MenuItem>

                {categoriesData.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Tooltip title="Refresh inventory">
              <IconButton
                onClick={refreshInventory}
                aria-label="Refresh inventory"
                sx={{
                  height: 44,
                  width: 44,
                  flexShrink: 0,
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  color: "#374151",
                  backgroundColor: "#f9fafb",
                  "&:hover": { backgroundColor: "#f3f4f6" },
                }}
              >
                <Refresh size={19} />
              </IconButton>
            </Tooltip>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-1 justify-center w-full items-center">
          <CircularProgress />
        </div>
      ) : filteredInventory.length === 0 || totalProducts === 0 ? (
        <div className="text-white text-center py-5">No products found.</div>
      ) : (
        <>
          <InventoryTable
            products={filteredInventory}
            loading={loading}
            refresh={refreshInventory}
            deductUsedProduct={() => {}}
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
        </>
      )}
      <AddProductModal
        open={openModal}
        handleClose={() => setOpenModal(false)}
        refresh={refreshInventory}
        products={inventory}
        categoriesData={categoriesData}
      />
    </div>
  );
}
