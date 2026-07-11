import { Fragment, useState } from "react";
import {
  Box,
  Chip,
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
} from "@mui/material";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import dayjs from "dayjs";
import DeleteBatchDialog from "./DeleteBatchDialog.jsx";

export default function InventoryTable({ products, loading, refresh }) {
  const [openRows, setOpenRows] = useState({});
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

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
      <div className="flex justify-content py-5">
        <CircularProgress />
      </div>
    );

  return (
    <>
      <TableContainer sx={{ backgroundColor: "white" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell />

              <TableCell>Product</TableCell>

              <TableCell>Category</TableCell>

              <TableCell align="center">Total Qty</TableCell>

              <TableCell align="center">Total Batches</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {products.map((product) => {
              const totalQty = product.batches.reduce(
                (sum, batch) => sum + batch.quantity,
                0,
              );

              return (
                <Fragment key={product._id}>
                  <TableRow hover>
                    <TableCell>
                      <IconButton onClick={() => toggleRow(product._id)}>
                        {openRows[product._id] ? (
                          <KeyboardArrowDownIcon />
                        ) : (
                          <KeyboardArrowRightIcon />
                        )}
                      </IconButton>
                    </TableCell>

                    <TableCell>{product.name}</TableCell>

                    <TableCell>{product.category}</TableCell>

                    <TableCell align="center">{totalQty}</TableCell>

                    <TableCell align="center">
                      {product.batches.length}
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell
                      colSpan={5}
                      sx={{
                        paddingBottom: 0,
                        paddingTop: 0,
                      }}
                    >
                      <Collapse in={openRows[product._id]}>
                        <Box m={2}>
                          <Typography fontWeight={600} mb={2}>
                            Product Batches
                          </Typography>

                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Batch</TableCell>

                                <TableCell>Quantity</TableCell>

                                <TableCell>Expiry</TableCell>

                                <TableCell>Status</TableCell>

                                <TableCell>Actions</TableCell>
                              </TableRow>
                            </TableHead>

                            <TableBody>
                              {product.batches.map((batch) => (
                                <TableRow key={batch._id}>
                                  <TableCell>{batch.batchNumber}</TableCell>

                                  <TableCell>{batch.quantity}</TableCell>

                                  <TableCell>
                                    {dayjs(batch.expiryDate).format(
                                      "DD MMM YYYY",
                                    )}
                                  </TableCell>

                                  <TableCell>
                                    {getStatusChip(batch.status)}
                                  </TableCell>

                                  <TableCell>
                                    <IconButton>
                                      <EditIcon color="primary" />
                                    </IconButton>

                                    <IconButton
                                      color="error"
                                      onClick={() => {
                                        setSelectedBatch(batch);
                                        setDeleteOpen(true);
                                      }}
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <DeleteBatchDialog
        open={deleteOpen}
        handleClose={() => setDeleteOpen(false)}
        batch={selectedBatch}
        refresh={refresh}
      />
    </>
  );
}
