import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  AccountCircle as AccountCircleIcon,
  Settings as SettingsIcon,
  Inventory as InventoryIcon,
  People as PeopleIcon,
  Dashboard as DashboardIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { useState } from "react";
import { Menu, MenuItem } from "@mui/material";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/slice/authSlice";

function SideBar({ mobileOpen, setMobileOpen, collapsed }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const menuItems = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: <DashboardIcon />,
    },
    {
      name: "Users",
      path: "/admin/users",
      icon: <PeopleIcon />,
    },
    {
      name: "Inventory",
      path: "/admin/inventory",
      icon: <InventoryIcon />,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen
          bg-black text-white
          border-r border-slate-800
          transition-all duration-300
          flex flex-col

          ${collapsed ? "lg:w-16" : "w-64"}

          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-slate-700">
          {!collapsed && <h2 className="font-bold text-lg">Admin Panel</h2>}
        </div>

        {/* Menu */}
        <nav className="mt-4 flex-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `
                flex items-center
                gap-3
                mx-2
                px-4
                py-3
                rounded-lg
                transition-colors
                ${isActive ? "bg-slate-800" : "hover:bg-slate-900"}
                `
              }
            >
              {item.icon}
              {!collapsed && <span>{item.name}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-700 p-2">
          <div
            onClick={(event) => setAnchorEl(event.currentTarget)}
            className="
                flex items-center
                gap-3
                px-4
                py-3
                rounded-lg
                transition-colors
              hover:bg-slate-900
                cursor-pointer
              "
          >
            <AccountCircleIcon />
            {!collapsed && (
              <span className="text-white">
                {typeof localStorage.getItem("user") === "string"
                  ? JSON.parse(localStorage.getItem("user")).name
                  : localStorage.getItem("user")?.name || "User"}
              </span>
            )}
          </div>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl) || false}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                dispatch(logout());
                navigate("/login", { replace: true });
              }}
            >
              <LogoutIcon sx={{ mr: 1 }} />
              Logout
            </MenuItem>
            <MenuItem
              component={Link}
              to="/admin/settings"
              onClick={() => setAnchorEl(null)}
            >
              <SettingsIcon sx={{ mr: 1 }} />
              Settings
            </MenuItem>
          </Menu>
        </div>
      </aside>
    </>
  );
}

export default SideBar;
