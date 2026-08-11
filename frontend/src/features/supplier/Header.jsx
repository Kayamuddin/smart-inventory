import { Close, Notifications, NotificationsActive } from "@mui/icons-material";
import MenuIcon from "@mui/icons-material/Menu";
import { Badge, Dialog, IconButton } from "@mui/material";
import { useExpiringInventory } from "../../hooks/useExpiringInventory.js";
import { useState } from "react";
import dayjs from "dayjs";

function Header({ setMobileOpen, setCollapsed }) {
  const [openDialog, setOpenDialog] = useState(false);
  const {
    loading,
    expiringProducts,
    refreshExpiringProducts,
    totalNotifications,
  } = useExpiringInventory();
  const role = localStorage.getItem("user").role;
  let isAdmin = false;
  if (role == "admin") {
    isAdmin = true;
  }

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
    <>
      <header className="h-16 bg-black flex items-center justify-between px-4 shadow">
        <div className="flex items-center gap-2">
          <IconButton onClick={handleMenuClick}>
            <MenuIcon sx={{ color: "white" }} />
          </IconButton>

          <h1 className="text-white font-bold text-xl">Supplier Panel</h1>
        </div>

        <div>
          <Badge
            badgeContent={totalNotifications || 0}
            color="error"
            sx={{
              "& .MuiBadge-badge": {
                right: 6,
                top: 6,
              },
            }}
          >
            <IconButton onClick={() => setOpenDialog(true)}>
              {totalNotifications > 0 ? (
                <NotificationsActive sx={{ color: "white" }} />
              ) : (
                <Notifications sx={{ color: "white" }} />
              )}
            </IconButton>
          </Badge>
        </div>
      </header>
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <div className="p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold mb-2">Expiring Products</h2>
            <IconButton color="error" onClick={() => setOpenDialog(false)}>
              <Close />
            </IconButton>
          </div>
          {expiringProducts.length == 0 && (
            <p>No expiring products at the moment.</p>
          )}
          <div className="border-2">
            <div
              className={`grid ${isAdmin ? "grid-cols-5" : "grid-cols-4"} gap-4 m-1 font-semibold text-center items-center border-b-2`}
            >
              <div className="col-span-1">Name</div>
              <div className="col-span-1">Batch Number</div>
              <div className="col-span-1">Expiry Date</div>
              <div className="col-span-1">Quantity</div>
              {isAdmin && <div className="col-span-1">Email</div>}
            </div>
            {expiringProducts.map((product) => {
              return (
                <div
                  className={`grid ${isAdmin ? "grid-cols-5" : "grid-cols-4"} gap-4 m-1 items-center text-center text-red-800 font-bold`}
                  key={product._id}
                >
                  <div className="col-span-1">{product.name}</div>
                  <div className="col-span-1">{product.batchNumber}</div>
                  <div className="col-span-1">
                    {dayjs(product.expiryDate).format("DD-MM-YYYY")}
                  </div>
                  <div className="col-span-1">{product.quantity}</div>
                  {isAdmin && <div className="col-span-1">{product.email}</div>}
                </div>
              );
            })}
          </div>
        </div>
      </Dialog>
    </>
  );
}

export default Header;
