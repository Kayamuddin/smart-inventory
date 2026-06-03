import { useState } from "react";
import { Link } from "react-router-dom";
import { Button, TextField } from "@mui/material";
import { useDispatch } from "react-redux";

import API from "../services/api.js";
import { login } from "../redux/slice/authSlice.js";
import { showToast } from "../redux/slice/toastSlice.js";

function Register() {
    const dispatch = useDispatch();

    const [loading, setLoading] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        otp: "",
    });

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSendOtp = async () => {
        try {
            if (!formData.email.trim()) {
                dispatch(
                    showToast([
                        "Please enter your email",
                        "error",
                    ])
                );
                return;
            }

            setOtpLoading(true);

            const res = await API.post(
                "/api/auth/send-otp",
                {
                    email: formData.email,
                }
            );

            dispatch(
                showToast([
                    res.data.message ||
                    "OTP sent successfully",
                    "success",
                ])
            );
        } catch (error) {
            dispatch(
                showToast([
                    error.response?.data?.message ||
                    error.message ||
                    "Failed to send OTP",
                    "error",
                ])
            );
        } finally {
            setOtpLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (formData.otp.length !== 6) {
                dispatch(
                    showToast([
                        "Please enter a valid 6-digit OTP",
                        "error",
                    ])
                );
                return;
            }

            setLoading(true);

            const res = await API.post(
                "/api/auth/register",
                {
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    otp: formData.otp,
                }
            );


            dispatch(
                showToast([
                    "Registration successful",
                    "success",
                ])
            );
            dispatch(login(res.data));
        } catch (error) {
            dispatch(
                showToast([
                    error.response?.data?.message ||
                    error.message ||
                    "Registration failed",
                    "error",
                ])
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-screen h-screen flex items-center justify-center">
            <div
                className="
                    w-full
                    max-w-sm
                    p-6
                    sm:p-8
                    border
                    border-gray-200
                    rounded-2xl
                    shadow-lg
                "
            >
                <h1 className="text-xl font-bold text-center mb-5">
                    Register
                </h1>

                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-4"
                >
                    <TextField
                        label="Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        fullWidth
                        required
                    />

                    <TextField
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        fullWidth
                        required
                    />

                    <Button
                        variant="outlined"
                        onClick={handleSendOtp}
                        disabled={otpLoading}
                    >
                        {otpLoading
                            ? "Sending OTP..."
                            : "Send OTP"}
                    </Button>

                    <TextField
                        label="OTP"
                        name="otp"
                        value={formData.otp}
                        onChange={handleChange}
                        fullWidth
                        required
                    />

                    <TextField
                        label="Password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        fullWidth
                        required
                    />

                    <Button
                        type="submit"
                        disabled={loading}
                        sx={{
                            textTransform: "none",
                            borderRadius: "10px",
                            backgroundColor: "black",
                            color: "white",
                            fontSize: "18px",
                            fontWeight: "bold",

                            "&:hover": {
                                backgroundColor:
                                    "#222",
                            },
                        }}
                    >
                        {loading
                            ? "Registering..."
                            : "Register"}
                    </Button>
                </form>

                <div className="text-sm text-center mt-4">
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        className="text-blue-600 hover:underline"
                    >
                        Login
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Register;