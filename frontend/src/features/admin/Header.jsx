import MenuIcon from "@mui/icons-material/Menu";
import { IconButton } from "@mui/material";

function Header({
    setMobileOpen,
    setCollapsed,
}) {
    const handleMenuClick = () => {
        if (window.innerWidth >= 1024) {
            // Desktop
            setCollapsed(prev => !prev);
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

                <h1 className="text-white font-bold text-xl">
                    Admin Panel
                </h1>
            </div>

            <div>
                {/* Profile / Notifications */}
            </div>
        </header>
    );
}

export default Header;