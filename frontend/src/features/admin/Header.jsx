import {
  Close,
  Notifications,
  NotificationsActive,
  Refresh,
} from "@mui/icons-material";
import MenuIcon from "@mui/icons-material/Menu";
import { Badge, CircularProgress, Dialog, IconButton } from "@mui/material";
import { useExpiringInventory } from "../../hooks/useExpiringInventory.js";
import { useState } from "react";
import dayjs from "dayjs";
import { useSelector } from "react-redux";

function Header({ setMobileOpen, setCollapsed }) {
  const [openDialog, setOpenDialog] = useState(false);
  const {
    loading,
    expiringProducts,
    refreshExpiringProducts,
    totalNotifications,
  } = useExpiringInventory();
  let isAdmin = false;

  const { user } = useSelector((state) => state.auth);

  if (user.role == "admin") {
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
      <header className="h-16 bg-black flex items-center justify-between px-2 sm:px-4 shadow">
        <div className="flex items-center gap-1 sm:gap-2 min-w-0">
          <IconButton onClick={handleMenuClick} size="small">
            <MenuIcon sx={{ color: "white" }} />
          </IconButton>

          <h1 className="text-white font-bold text-base sm:text-xl truncate">
            Admin Panel
          </h1>
        </div>

        <Badge
          badgeContent={totalNotifications || 0}
          color="error"
          sx={{
            "& .MuiBadge-badge": {
              right: 4,
              top: 4,
              fontSize: "0.65rem",
              minWidth: "16px",
              height: "16px",
            },
          }}
        >
          <IconButton onClick={() => setOpenDialog(true)} size="small">
            {totalNotifications > 0 ? (
              <NotificationsActive sx={{ color: "white" }} />
            ) : (
              <Notifications sx={{ color: "white" }} />
            )}
          </IconButton>
        </Badge>
      </header>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="lg"
        paperprops={{
          sx: {
            width: {
              xs: "calc(100% - 16px)",
              sm: "calc(100% - 32px)",
            },
            maxHeight: "90vh",
            m: 1,
            borderRadius: {
              xs: "8px",
              sm: "12px",
            },
          },
        }}
      >
        <div className="p-2 sm:p-4 md:p-5">
          {/* Header */}
          <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg md:text-xl font-bold">
                Expiring Products
              </h2>
              <Refresh
                className="text-black hover:text-gray-500 cursor-pointer"
                fontSize="medium"
                onClick={refreshExpiringProducts}
              />
            </div>

            <IconButton
              color="error"
              onClick={() => setOpenDialog(false)}
              size="small"
            >
              <Close fontSize="small" />
            </IconButton>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="h-32 sm:h-40 w-full flex justify-center items-center">
              <CircularProgress size={28} />
            </div>
          ) : expiringProducts.length === 0 ? (
            <div className=" h-32 sm:h-40 w-full py-8 sm:py-10 text-center text-sm sm:text-base text-gray-500">
              No expiring products at the moment.
            </div>
          ) : (
            <div className="w-full overflow-x-auto rounded-md border">
              <table className="w-full min-w-150 border-collapse text-xs sm:text-sm md:text-base">
                <thead>
                  <tr className="border-b bg-gray-50 font-semibold text-center">
                    <th className="px-2 py-2 sm:px-3 sm:py-3 whitespace-nowrap">
                      Name
                    </th>

                    <th className="px-2 py-2 sm:px-3 sm:py-3 whitespace-nowrap">
                      Batch Number
                    </th>

                    <th className="px-2 py-2 sm:px-3 sm:py-3 whitespace-nowrap">
                      Expiry Date
                    </th>

                    <th className="px-2 py-2 sm:px-3 sm:py-3 whitespace-nowrap">
                      Quantity
                    </th>

                    {isAdmin && (
                      <th className="px-2 py-2 sm:px-3 sm:py-3 whitespace-nowrap">
                        Email
                      </th>
                    )}
                  </tr>
                </thead>

                <tbody>
                  {expiringProducts.map((product) => (
                    <tr
                      key={product._id}
                      className="border-b last:border-b-0 text-center text-red-800 font-bold hover:bg-gray-50"
                    >
                      <td className="px-2 py-2 sm:px-3 sm:py-3 max-w-30">
                        <div className="truncate">{product.name}</div>
                      </td>

                      <td className="px-2 py-2 sm:px-3 sm:py-3 whitespace-nowrap">
                        {product.batchNumber}
                      </td>

                      <td className="px-2 py-2 sm:px-3 sm:py-3 whitespace-nowrap">
                        {dayjs(product.expiryDate).format("DD-MM-YYYY")}
                      </td>

                      <td className="px-2 py-2 sm:px-3 sm:py-3">
                        {product.quantity}
                      </td>

                      {isAdmin && (
                        <td className="px-2 py-2 sm:px-3 sm:py-3 max-w-45">
                          <div className="truncate" title={product.email}>
                            {product.email}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Dialog>
    </>
  );
}

export default Header;
