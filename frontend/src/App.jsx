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
import AdminDashboard from "./pages/admin/Dashboard.jsx";
import SupplierDashboard from "./pages/supplier/Dashboard.jsx";
import Inventory from "./pages/inventory/Inventory.jsx";
import ExpiredProducts from "./pages/inventory/ExpiredProducts.jsx";

function App() {
  return (
    <>
      <Toast />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="expiredProducts" element={<ExpiredProducts />} />
          </Route>
          <Route path="/supplier" element={<SupplierLayout />}>
            <Route index path="dashboard" element={<SupplierDashboard />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="expiredProducts" element={<ExpiredProducts />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;
