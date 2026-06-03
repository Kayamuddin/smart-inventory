import { Link } from "react-router-dom";
import API from "../services/api.js";
import { useDispatch } from "react-redux"
import { Button, TextField } from "@mui/material";
import { login } from "../redux/slice/authSlice.js";

function Login() {
    const dispatch = useDispatch();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await API.post("/api/auth/login", {
                email: e.target.email.value,
                password: e.target.password.value,
            });
            dispatch(login(res.data));
        } catch (error) {
            alert(error.response?.data?.message || "Internal Server Error");
        }
    }
    return (
        <div className="w-screen h-screen flex items-center justify-center">
            <div className="w-full max-w-sm p-6 sm:p-8 border border-gray-200 rounded-2xl flex flex-col items-center gap-4 shadow-lg">
                <div className="text-xl font-bold">Login</div>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
                    <TextField
                        label="Email"
                        name="email"
                        variant="outlined"
                        placeholder="Enter your email"
                        fullWidth
                        required
                    />
                    <TextField
                        label="Password"
                        name="password"
                        variant="outlined"
                        type="password"
                        fullWidth
                        required
                    />
                    <Button
                        type="submit"
                        sx={{
                            textTransform: "none", borderRadius: "10px", backgroundColor: "black", width: "100%", color: "white", fontSize: "18px", fontWeight: "bold"
                        }}
                    >Log in</Button>
                </form>
                <div className="text-sm">Forgot your password? <Link className="text-blue-600 hover:underline" to="/reset-password">Reset it</Link></div>
                <div className="text-sm">No account? <Link className="text-blue-600 hover:underline" to="/register">Create one</Link></div>
            </div>
        </div>
    )
}

export default Login;
