import { useEffect, useState } from "react";
import { getAllUSers, deleteUser, updateUser, createUser } from "./index.js";
import { useDispatch } from "react-redux";
import { showToast } from "../../redux/slice/toastSlice.js";
import { MoreHoriz } from "@mui/icons-material";
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
} from "@mui/material";
import { PenLine, Trash2 } from "lucide-react";

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    async function loadUsers() {
      try {
        setLoading(true);
        const data = await getAllUSers();
        setUsers(data || []);
      } catch (err) {
        dispatch(
          showToast([
            err.response?.data?.message || "Failed to fetch users",
            "error",
          ]),
        );
      } finally {
        setLoading(false);
      }
    }
    loadUsers();
  }, [dispatch]);

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

    setOpen(true);
    handleMenuClose();
  };

  const handleSave = async () => {
    try {
      if (selectedUser) {
        // Update User
        const response = await updateUser(selectedUser._id, formData);

        setUsers((prev) =>
          prev.map((user) =>
            user._id === selectedUser._id ? response.user : user,
          ),
        );

        dispatch(showToast(["User updated successfully", "success"]));
      } else {
        // Create User
        const response = await createUser(formData);

        setUsers((prev) => [response.user, ...prev]);

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
      await deleteUser(selectedUser._id);

      setUsers((prev) => prev.filter((user) => user._id !== selectedUser._id));

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
      role: "user",
    });

    setOpen(true);
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button variant="contained" onClick={handleAddUser}>
          Add User
        </Button>
      </div>
      {loading ? (
        <div>loading...</div>
      ) : (
        <div className="overflow-x-auto scrollbar-hide text-white border border-gray-200 rounded-lg shadow">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-3 py-1 not-md:text-xs md:py-1 text-left">
                  Name
                </th>
                <th className="px-3 py-1 not-md:text-xs md:py-1 text-left">
                  Email
                </th>
                <th className="px-3 py-1 not-md:text-xs md:py-1 text-left">
                  Role
                </th>
                <th className="px-3 py-1 not-md:text-xs md:py-1 text-left">
                  Created At
                </th>
                <th className="px-3 py-1 not-md:text-xs md:py-1 text-left">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr
                  key={user._id}
                  className="border-t border-gray-400 cursor-default"
                >
                  <td className="px-3 py-1 not-md:text-xs not-md:font-semibold md:py-1">
                    {user.name}
                  </td>

                  <td className="px-3 py-1 not-md:text-xs not-md:font-semibold md:py-1">
                    {user.email}
                  </td>

                  <td className="px-3 py-1 not-md:text-xs not-md:font-semibold md:py-1">
                    {user.role}
                  </td>

                  <td className="px-3 py-1 not-md:text-xs not-md:font-semibold md:py-1">
                    {new Date(user.createdAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-3 py-1 not-md:text-xs not-md:font-semibold md:py-1">
                    <IconButton onClick={(e) => handleMenuOpen(e, user)}>
                      <MoreHoriz className="text-white pl-1" fontSize="large" />
                    </IconButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
        </div>
      )}
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
            value={formData.password}
            onChange={(e) =>
              setFormData({
                ...formData,
                password: e.target.value,
              })
            }
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
              <MenuItem value="supply">Supply</MenuItem>
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
