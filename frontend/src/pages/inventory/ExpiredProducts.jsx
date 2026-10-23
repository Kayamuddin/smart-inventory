import {
  Grid,
  Typography,
  Pagination,
  FormControl,
  Select,
  MenuItem,
  CircularProgress,
  IconButton,
} from "@mui/material";

import { useState } from "react";

import InventoryTable from "../../features/expiredInventory/InventoryTable.jsx";

import useExpiredInventory from "../../hooks/useExpiredInventory";
import { Refresh } from "@mui/icons-material";
import { useSelector } from "react-redux";

export default function ExpiredProducts() {
  const {
    loading,
    totalProducts,
    totalQuantity,
    refreshInventory,
    searchInventoryByEmail,
    searchInventoryByName,
    inventory,
    filteredInventory,

    pagination,
    setPagination,

    category,
    categoriesData,
    filterByCategory,
  } = useExpiredInventory();

  const { user } = useSelector((state) => state.auth);
  const role = user.role;
  const [searchEmail, setSearchEmail] = useState("");
  const [searchName, setSearchName] = useState("");

  const totalBatches = inventory.reduce(
    (sum, item) => sum + item.batches.length,
    0,
  );

  return (
    <div className="w-full h-[calc(100vh-64px)] p-4 flex flex-col">
      <div className="text-[1.25rem] sm:text-[2.125rem] font-bold">
        All Expired Products
      </div>

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

      <div className="my-3 flex items-center gap-3  w-full">
        {role == "admin" && (
          <input
            placeholder="Search Product by Email..."
            value={searchEmail}
            onChange={(e) => {
              setSearchEmail(e.target.value);
              searchInventoryByEmail(e.target.value);
            }}
            className="h-10 max-w-75 w-full rounded border border-gray-300 bg-white px-3 text-black outline-none focus:border-blue-500"
          />
        )}

        <input
          placeholder="Search Product..."
          value={searchName}
          onChange={(e) => {
            setSearchName(e.target.value);
            searchInventoryByName(e.target.value);
          }}
          className="h-10 max-w-75 w-full rounded border border-gray-300 bg-white px-3 text-black outline-none focus:border-blue-500"
        />

        <FormControl size="small" sx={{ width: "100%", maxWidth: 180 }}>
          <Select
            value={category}
            displayEmpty
            onChange={(e) => filterByCategory(e.target.value)}
            renderValue={(selected) =>
              selected || <span style={{ color: "#888" }}>All Categories</span>
            }
            className="bg-white text-black"
          >
            <MenuItem value="">All Categories</MenuItem>

            {categoriesData.map((cat) => {
              return (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
        <IconButton
          onClick={refreshInventory}
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
      {loading ? (
        <div className="flex flex-1 justify-center w-full items-center">
          <CircularProgress />
        </div>
      ) : filteredInventory.length === 0 ? (
        <div className="text-white text-center py-5">No products found.</div>
      ) : (
        <>
          <InventoryTable
            products={filteredInventory}
            loading={loading}
            refresh={refreshInventory}
            role={role}
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
    </div>
  );
}
