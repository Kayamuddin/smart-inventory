
import { Route, Routes } from "react-router-dom"
import Home from "./pages/Home.jsx"
import Login from "./pages/Login.jsx"
import Register from "./pages/Register.jsx"
import ResetPassword from "./pages/ResetPassword.jsx"
import ProtectedRoute from "./components/ProtectedRoutes.jsx"
import Toast from "./components/Toast.jsx"

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
        </Route>
      </Routes>
    </>
  )
}

export default App
