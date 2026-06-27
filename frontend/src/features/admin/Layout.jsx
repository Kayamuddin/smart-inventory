import { Outlet } from "react-router-dom";
import { useState } from "react";
import Header from "./Header";
import SideBar from "./SideBar";

function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="h-screen bg-black">
      <SideBar
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        collapsed={collapsed}
      />

      <div
        className={`
                    h-screen
                    flex flex-col
                    transition-all duration-300
                    ${collapsed ? "lg:ml-16" : "lg:ml-64"}
                `}
      >
        <Header setMobileOpen={setMobileOpen} setCollapsed={setCollapsed} />

        <main className="flex-1 overflow-y-auto p-4 text-white">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
