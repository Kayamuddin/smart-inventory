import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import ProtectedRoute from "./components/ProtectedRoutes.jsx";
import Toast from "./components/Toast.jsx";
import Users from "./pages/admin/Users.jsx";
import Layout from "./features/admin/Layout.jsx";
import Dashboard from "./pages/admin/Dashboard.jsx";
import Inventory from "./pages/inventory/Inventory.jsx";

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
          <Route path="/admin" element={<Layout />}>
            <Route index path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="inventory" element={<Inventory />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;
