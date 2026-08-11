import { Fragment, useState } from "react";
import {
  Box,
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

import dayjs from "dayjs";

export default function InventoryTable({ products, loading, role }) {
  const [openRows, setOpenRows] = useState({});

  const toggleRow = (id) => {
    setOpenRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  if (loading)
    return (
      <div className="flex justify-center py-5">
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

              {role == "admin" && <TableCell>Owner</TableCell>}

              <TableCell>Category</TableCell>

              <TableCell align="center">Total Qty</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {products.map((product) => (
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

                  {role == "admin" && <TableCell>{product.email}</TableCell>}

                  <TableCell>{product.category}</TableCell>

                  <TableCell align="center">{product.totalQuantity}</TableCell>
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

                              <TableCell>Price</TableCell>

                              <TableCell>Quantity</TableCell>

                              <TableCell>Expiry</TableCell>
                            </TableRow>
                          </TableHead>

                          <TableBody>
                            {product.batches.map((batch) => (
                              <TableRow key={batch._id}>
                                <TableCell>{batch.batchNumber}</TableCell>

                                <TableCell>{batch.buyingPrice}</TableCell>

                                <TableCell>{batch.quantity}</TableCell>

                                <TableCell>
                                  {dayjs(batch.expiryDate).format(
                                    "DD MMM YYYY",
                                  )}
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
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
