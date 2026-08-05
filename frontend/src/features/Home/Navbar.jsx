import {
  Logout as LogoutIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { Avatar, Menu, MenuItem, Button, ListItemIcon } from "@mui/material";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/slice/authSlice";
import { useNavigate } from "react-router-dom";

function NavBar() {
  const [anchorEl, setAnchorEl] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  function stringToColor(str) {
    const colors = [
      "#F44336",
      "#E91E63",
      "#9C27B0",
      "#673AB7",
      "#3F51B5",
      "#2196F3",
      "#03A9F4",
      "#009688",
      "#4CAF50",
      "#8BC34A",
      "#FF9800",
      "#FF5722",
    ];

    let hash = 0;

    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  }

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <nav className="w-[95%] sm:w-[90%] md:max-w-5xl h-12 bg-indigo-700 rounded-3xl mx-auto mt-4 text-white flex items-center justify-between px-4">
      <h1 className="text-sm sm:text-base md:text-lg font-semibold">Logo</h1>

      <Button onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: 0 }}>
        <Avatar
          sx={{ width: 32, height: 32, bgcolor: stringToColor(user.email) }}
        >
          {user?.email?.charAt(0).toUpperCase()}
        </Avatar>
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose();
            dispatch(logout());
            navigate("/login", { replace: true });
          }}
        >
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </nav>
  );
}

export default NavBar;
