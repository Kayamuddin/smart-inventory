import { useState } from "react";
import { useDispatch } from "react-redux";
import { showToast } from "../../redux/slice/toastSlice.js";
import {
  MoreHoriz,
  Add as AddIcon,
  VisibilityOff,
  Visibility,
  Refresh,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import {
  Dialog,
  IconButton,
  Menu,
  MenuItem,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  InputAdornment,
  Typography,
  Grid,
  Pagination,
  TableContainer,
  TableHead,
  Table,
  TableRow,
  TableCell,
  TableBody,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { PenLine, Trash2 } from "lucide-react";
import useUser from "../../hooks/useUser.js";

function Users() {
  const {
    loading,
    editUser,
    addUser,
    removeUser,
    searchUser,
    refreshUsers,
    user,
    totalData,
    pagination,
    setPagination,
    category,
    categoriesData,
    filterByCategory,
  } = useUser();

  const [search, setSearch] = useState("");
  // const [users, setusers] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = useState(null);
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });

  const handleMenuOpen = (event, user) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);

    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
    });

    handleMenuClose();
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      if (selectedUser) {
        // Update User
        await editUser(selectedUser._id, formData);
        dispatch(showToast(["User updated successfully", "success"]));
      } else {
        // Create User
        await addUser(formData);
        dispatch(showToast(["User created successfully", "success"]));
      }

      setOpen(false);
    } catch (err) {
      dispatch(
        showToast([err.response?.data?.message || "Operation failed", "error"]),
      );
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

    try {
      await removeUser(selectedUser._id);
      dispatch(showToast(["User deleted successfully", "success"]));

      handleMenuClose();
      setSelectedUser(null);
    } catch (err) {
      dispatch(
        showToast([
          err.response?.data?.message || "Failed to delete user",
          "error",
        ]),
      );
    }
  };

  const handleAddUser = () => {
    setSelectedUser(null);

    setFormData({
      name: "",
      email: "",
      password: "",
      role: "",
    });

    setOpen(true);
  };

  return (
    <div className="w-full h-[calc(100vh-64px)] p-4 flex flex-col">
      <Typography variant="h4" fontWeight={700} mb={3}>
        Manage Users
      </Typography>

      <Grid container spacing={2} mb={3}>
        <Grid size={6} className="bg-white text-black rounded text-center">
          <Typography>Total Users</Typography>

          <Typography variant="h4">{totalData.totalUser}</Typography>
        </Grid>
        <Grid size={6} className="bg-white text-black rounded text-center">
          <Typography>Total Admin</Typography>

          <Typography variant="h4">{totalData.totalAdmin}</Typography>
        </Grid>

        <Grid size={4} className="bg-white text-black rounded text-center">
          <Typography>Total Supplier</Typography>

          <Typography variant="h4">{totalData.totalSupplier}</Typography>
        </Grid>
        <Grid size={4} className="bg-white text-black rounded text-center">
          <Typography>Total Employee</Typography>

          <Typography variant="h4">{totalData.totalEmployee}</Typography>
        </Grid>
        <Grid size={4} className="bg-white text-black rounded text-center">
          <Typography>Total Customer</Typography>

          <Typography variant="h4">{totalData.totalCustomer}</Typography>
        </Grid>
      </Grid>

      <div className="my-3 flex items-center justify-between gap-3">
        <div className="flex gap-3 w-full">
          <input
            placeholder="Search User by Email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              searchUser(e.target.value);
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

              {categoriesData.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <IconButton
            onClick={refreshUsers}
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
          onClick={(e) => {
            e.currentTarget.blur();
            handleAddUser();
          }}
          sx={{
            height: 36,
            whiteSpace: "nowrap",
            textTransform: "none",
            flexShrink: 0,
          }}
        >
          Add User
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-1 justify-center w-full items-center">
          <CircularProgress />
        </div>
      ) : user.length === 0 ? (
        <div className="text-white text-center py-3">No users found.</div>
      ) : (
        <>
          <TableContainer
            sx={{
              backgroundColor: "white",
              display: { xs: "none", md: "block" },
            }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>CreatedAt</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {user.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        className="not-md:text-xs not-md:font-semibold md:py-1"
                        onClick={(e) => {
                          e.currentTarget.blur(); // remove focus
                          handleMenuOpen(e, user);
                        }}
                      >
                        <MoreHoriz fontSize="large" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Grid
            container
            spacing={2}
            sx={{
              display: { xs: "flex", md: "none" },
              gap: 0,
            }}
          >
            {user.map((user) => (
              <Grid size={{ xs: 12 }} key={user._id}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography fontWeight={600}>{user.email}</Typography>
                  </AccordionSummary>

                  <AccordionDetails>
                    <Typography>
                      <strong>Name:</strong> {user.name}
                    </Typography>

                    <Typography>
                      <strong>Role:</strong> {user.role}
                    </Typography>

                    <Typography>
                      <strong>Created:</strong>{" "}
                      {new Date(user.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </Typography>

                    <IconButton
                      onClick={(e) => {
                        e.currentTarget.blur();
                        handleMenuOpen(e, user);
                      }}
                    >
                      <MoreHoriz />
                    </IconButton>
                  </AccordionDetails>
                </Accordion>
              </Grid>
            ))}
          </Grid>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem
              onClick={() => {
                handleEdit(selectedUser);
              }}
            >
              <PenLine size={16} className="mr-2" />
              Edit
            </MenuItem>

            <MenuItem
              onClick={() => {
                handleDelete();
              }}
              sx={{ color: "red" }}
            >
              <Trash2 size={16} className="mr-2" />
              Delete
            </MenuItem>
          </Menu>
        </>
      )}
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
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{selectedUser ? "Edit User" : "Add User"}</DialogTitle>

        <DialogContent>
          <TextField
            margin="normal"
            fullWidth
            label="Name"
            value={formData.name}
            onChange={(e) =>
              setFormData({
                ...formData,
                name: e.target.value,
              })
            }
          />

          <TextField
            margin="normal"
            fullWidth
            label="Email"
            value={formData.email}
            onChange={(e) =>
              setFormData({
                ...formData,
                email: e.target.value,
              })
            }
          />
          <TextField
            margin="normal"
            fullWidth
            label="Password"
            placeholder="Enter the New Password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(e) =>
              setFormData({
                ...formData,
                password: e.target.value,
              })
            }
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((prev) => !prev)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>

            <Select
              value={formData.role}
              label="Role"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  role: e.target.value,
                })
              }
            >
              <MenuItem value="customer">Customer</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="employee">Employee</MenuItem>
              <MenuItem value="supplier">Supplier</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>

          <Button variant="contained" onClick={handleSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Users;
