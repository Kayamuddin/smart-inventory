import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import ProtectedRoute from "./components/ProtectedRoutes.jsx";
import Toast from "./components/Toast.jsx";
import Users from "./pages/admin/Users.jsx";
import AdminLayout from "./features/admin/Layout.jsx";
import SupplierLayout from "./features/supplier/Layout.jsx";
import EmployeeLayout from "./features/employee/Layout/Layout.jsx";
import AdminDashboard from "./pages/admin/Dashboard.jsx";
import SupplierDashboard from "./pages/supplier/Dashboard.jsx";
import EmployeeDashboard from "./pages/employee/Dashboard.jsx";
import Inventory from "./pages/inventory/Inventory.jsx";
import EmployeeInventory from "./pages/employee/Inventory.jsx";
import ExpiredProducts from "./pages/inventory/ExpiredProducts.jsx";
import MenuProducts from "./pages/admin/MenuProducts.jsx";
import PageNotFound from "./pages/PageNotFound.jsx";
import SupplierStockRequests from "./pages/supplier/StockRequests.jsx";
import EmployeeStockRequests from "./pages/employee/StockRequests.jsx";

function App() {
  return (
    <>
      <Toast />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<PageNotFound />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="expiredProducts" element={<ExpiredProducts />} />
            <Route path="menuProducts" element={<MenuProducts />} />
          </Route>
          <Route path="/supplier" element={<SupplierLayout />}>
            <Route index path="dashboard" element={<SupplierDashboard />} />
            <Route path="inventory" element={<Inventory />} />
            <Route
              path="manage-inventory-request"
              element={<SupplierStockRequests />}
            />
            <Route path="expiredProducts" element={<ExpiredProducts />} />
          </Route>
          <Route path="/employee" element={<EmployeeLayout />}>
            <Route index path="dashboard" element={<EmployeeDashboard />} />
            <Route path="inventory" element={<EmployeeInventory />} />
            <Route
              path="manage-inventory-request"
              element={<EmployeeStockRequests />}
            />
            <Route path="expiredProducts" element={<ExpiredProducts />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;
