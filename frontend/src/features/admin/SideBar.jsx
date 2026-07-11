import { NavLink } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import InventoryIcon from "@mui/icons-material/Inventory";
import SettingsIcon from "@mui/icons-material/Settings";

function SideBar({ mobileOpen, setMobileOpen, collapsed }) {
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
          <NavLink
            to="/admin/settings"
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `
                flex items-center
                gap-3
                px-4
                py-3
                rounded-lg
                transition-colors
                ${isActive ? "bg-slate-800" : "hover:bg-slate-900"}
              `
            }
          >
            <SettingsIcon />
            {!collapsed && <span>Settings</span>}
          </NavLink>
        </div>
      </aside>
    </>
  );
}

export default SideBar;
