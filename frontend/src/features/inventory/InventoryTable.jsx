import { useEffect, useState } from "react";
import {
  Chip,
  Collapse,
  IconButton,
  CircularProgress,
  Menu,
  MenuItem,
  Tooltip,
  Button,
} from "@mui/material";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";

import dayjs from "dayjs";
import DeleteBatchDialog from "./DeleteBatchDialog.jsx";
import EditBatchModal from "./EditBatchModal.jsx";
import { Add, MoreHoriz } from "@mui/icons-material";
import { PenLine, Trash2 } from "lucide-react";
import DeductUsedProduct from "../employee/inventory/DeductUsedDialog.jsx";

export default function InventoryTable({
  products,
  loading,
  refresh,
  deductUsedProduct,
}) {
  const [openRows, setOpenRows] = useState({});
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deductUsedOpen, setDeductUsedOpen] = useState(false);
  const [userRole, setUserRole] = useState("");

  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    setUserRole(JSON.parse(localStorage.getItem("user")).role);
  }, []);

  const handleMenuOpen = (event, batch) => {
    setAnchorEl(event.currentTarget);
    setSelectedBatch(batch);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const toggleRow = (id) => {
    setOpenRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getStatusChip = (status) => {
    switch (status) {
      case "ACTIVE":
        return <Chip label="Active" color="success" size="small" />;

      case "EXPIRING":
        return <Chip label="Expiring" color="warning" size="small" />;

      case "EXPIRED":
        return <Chip label="Expired" color="error" size="small" />;

      default:
        return <Chip label="Unknown" size="small" />;
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-5">
        <CircularProgress />
      </div>
    );

  return (
    <>
      <div className="w-full min-w-0 space-y-3 sm:space-y-4">
        {products.map((product) => {
          const availableBatches = product.batches.filter(
            (batch) =>
              batch.status !== "EXPIRED" &&
              batch.status !== "USED" &&
              (userRole != "employee"
                ? batch.transferStatus == "ONSTOCK"
                : batch.transferStatus == "DELIVERED"),
          );

          const totalQty = availableBatches.reduce(
            (total, batch) => total + (Number(batch.quantity) || 0),
            0,
          );

          const totalBatch = availableBatches.length;

          if (totalQty <= 0) return null;

          const isOpen = Boolean(openRows[product._id]);
          const canManage = ["admin", "supplier"].includes(userRole);

          return (
            <article
              key={product._id}
              className="min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md sm:rounded-2xl"
            >
              {/* Product summary */}
              <div className="p-3 sm:p-4 lg:p-5">
                <div className="flex min-w-0 items-start gap-2.5 sm:gap-4">
                  <button
                    type="button"
                    onClick={() => toggleRow(product._id)}
                    aria-expanded={isOpen}
                    aria-label={`${isOpen ? "Collapse" : "Expand"} ${product.name}`}
                    className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border transition-colors sm:size-10 sm:rounded-xl ${
                      isOpen
                        ? "border-blue-200 bg-blue-50 text-blue-700"
                        : "border-gray-200 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {isOpen ? (
                      <KeyboardArrowDownIcon fontSize="small" />
                    ) : (
                      <KeyboardArrowRightIcon fontSize="small" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <h3 className="break-words text-sm font-bold leading-5 text-gray-900 sm:text-base sm:leading-6">
                      {product.name}
                    </h3>

                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <span className="max-w-full break-words rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 sm:rounded-lg">
                        {product.category || "Uncategorized"}
                      </span>

                      <span className="text-xs text-gray-500">
                        {totalBatch} {totalBatch === 1 ? "batch" : "batches"}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 rounded-lg bg-blue-50 px-2.5 py-2 text-right sm:min-w-24 sm:rounded-xl sm:px-4">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-600 sm:text-xs">
                      Quantity
                    </p>
                    <p className="mt-0.5 text-lg font-extrabold leading-6 tabular-nums text-blue-800 sm:text-2xl sm:leading-8">
                      {totalQty}
                    </p>
                  </div>
                </div>
              </div>

              {/* Expandable batch section */}
              <Collapse in={isOpen} timeout="auto" unmountOnExit>
                <section className="min-w-0 border-t border-gray-200 bg-gray-50 p-3 sm:p-4 lg:p-5">
                  <div className="mb-3 flex min-w-0 items-center justify-between gap-2 sm:mb-4">
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-gray-900 sm:text-base">
                        Product batches
                      </h4>
                      <p className="mt-1 break-words text-xs text-gray-500 sm:text-sm">
                        Available stock for {product.name}
                      </p>
                    </div>

                    {canManage ? (
                      <span className="shrink-0 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-600 sm:px-3">
                        {totalBatch} {totalBatch === 1 ? "batch" : "batches"}
                      </span>
                    ) : (
                      <Button
                        startIcon={<Add />}
                        variant="contained"
                        onClick={() => {
                          setSelectedProduct(product);
                          setDeductUsedOpen(true);
                        }}
                      >
                        Used
                      </Button>
                    )}
                  </div>

                  {availableBatches.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-300 bg-white p-5 text-center text-sm text-gray-500">
                      No available batches.
                    </div>
                  ) : (
                    <div className="min-w-0 w-full">
                      {availableBatches.map((batch) => (
                        <div
                          key={batch._id}
                          className="grid grid-cols-1 sm:grid-cols-3 min-w-0 w-full rounded-xl border border-gray-200 bg-white p-3 transition-colors hover:border-gray-300 sm:rounded-2xl sm:p-4"
                        >
                          {/* Batch identity and action */}
                          <div className="flex min-w-0 items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 sm:text-xs">
                                Batch number
                              </p>
                              <p className="mt-1 break-all text-sm font-bold leading-5 text-gray-900 sm:text-base">
                                {batch.batchNumber}
                              </p>
                            </div>
                          </div>

                          {/* Batch metrics */}
                          <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-0 sm:gap-3">
                            <div className="min-w-0 rounded-lg bg-gray-50 p-2.5 sm:rounded-xl sm:p-3">
                              <p className="text-[11px] text-gray-500 sm:text-xs">
                                Quantity
                              </p>
                              <p className="mt-1 break-words text-base font-bold tabular-nums text-gray-900 sm:text-lg">
                                {batch.quantity}
                              </p>
                            </div>

                            <div className="min-w-0 rounded-lg bg-gray-50 p-2.5 sm:rounded-xl sm:p-3">
                              <p className="text-[11px] text-gray-500 sm:text-xs">
                                Expiry date
                              </p>
                              <p className="mt-1 break-words text-sm font-semibold leading-5 text-gray-800 sm:text-base">
                                {dayjs(batch.expiryDate).format("DD MMM YYYY")}
                              </p>
                            </div>
                          </div>

                          {/* Batch status & Actions */}
                          <div
                            className={`flex min-w-0 flex-wrap items-center ${canManage ? "justify-between" : "justify-center"} gap-2 border-t border-gray-100 sm:mt-0`}
                          >
                            <div
                              className="min-w-0 rounded-lg bg-gray-50 p-2.5 sm:rounded-xl sm:p-3 not-sm:flex not-sm:items-center not-sm:w-full not-sm:justify-between gap-2
                              "
                            >
                              <p className="text-[11px] text-gray-500 pl-2 sm:text-xs">
                                Status
                              </p>
                              <div className="sm:mt-1 break-words text-sm font-semibold leading-5 text-gray-800 sm:text-base">
                                {getStatusChip(batch.status)}
                              </div>
                            </div>
                            {canManage && (
                              <div className="min-w-0 rounded-lg bg-gray-50 p-2.5 sm:rounded-xl sm:p-3">
                                <p className="text-[11px] text-gray-500 sm:text-xs">
                                  Actions
                                </p>
                                <Tooltip title="More options">
                                  <IconButton
                                    size="small"
                                    aria-label="Open batch menu"
                                    aria-haspopup="menu"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMenuOpen(e, batch);
                                    }}
                                    className="rounded-lg!"
                                  >
                                    <MoreHoriz fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </Collapse>
            </article>
          );
        })}
      </div>

      {/* Batch action menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        slotProps={{
          paper: {
            sx: {
              minWidth: 160,
              mt: 1,
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
              boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
              "& .MuiMenuItem-root": {
                gap: 1,
                py: 1.25,
                fontSize: "0.875rem",
              },
            },
          },
        }}
      >
        <MenuItem onClick={() => setEditOpen(true)}>
          <PenLine size={16} />
          Edit batch
        </MenuItem>

        <MenuItem onClick={() => setDeleteOpen(true)} sx={{ color: "#dc2626" }}>
          <Trash2 size={16} />
          Delete batch
        </MenuItem>
      </Menu>

      <DeleteBatchDialog
        open={deleteOpen}
        handleClose={() => setDeleteOpen(false)}
        batch={selectedBatch}
        refresh={refresh}
      />

      <EditBatchModal
        open={editOpen}
        handleClose={() => setEditOpen(false)}
        batch={selectedBatch}
        refresh={refresh}
      />

      <DeductUsedProduct
        open={deductUsedOpen}
        handleClose={() => setDeductUsedOpen(false)}
        product={selectedProduct}
        refresh={refresh}
        deductUsedProduct={deductUsedProduct}
      />
    </>
  );
}
