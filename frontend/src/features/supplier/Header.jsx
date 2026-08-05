import { Notifications, NotificationsActive } from "@mui/icons-material";
import MenuIcon from "@mui/icons-material/Menu";
import { Badge, IconButton } from "@mui/material";

function Header({ setMobileOpen, setCollapsed }) {
  const unreadCount = 3;
  const handleMenuClick = () => {
    if (window.innerWidth >= 1024) {
      // Desktop
      setCollapsed((prev) => !prev);
      setMobileOpen(false);
    } else {
      // Mobile
      setMobileOpen(true);
      setCollapsed(false);
    }
  };

  return (
    <header className="h-16 bg-black flex items-center justify-between px-4 shadow">
      <div className="flex items-center gap-2">
        <IconButton onClick={handleMenuClick}>
          <MenuIcon sx={{ color: "white" }} />
        </IconButton>

        <h1 className="text-white font-bold text-xl">Supplier Panel</h1>
      </div>

      <div>
        <Badge
          badgeContent={unreadCount}
          color="error"
          sx={{
            "& .MuiBadge-badge": {
              right: 6,
              top: 6,
            },
          }}
        >
          <IconButton>
            {unreadCount > 0 ? (
              <NotificationsActive sx={{ color: "white" }} />
            ) : (
              <Notifications sx={{ color: "white" }} />
            )}
          </IconButton>
        </Badge>
      </div>
    </header>
  );
}

export default Header;
