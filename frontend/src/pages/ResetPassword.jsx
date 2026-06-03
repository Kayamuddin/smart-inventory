import { Button, TextField, Snackbar, Alert } from "@mui/material";
import { useState } from "react";
import API from "../services/api.js";
import { Link } from "react-router-dom";

function ResetPassword() {
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const [loading, setLoading] = useState(false);

    // Snackbar State
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success"
    });
    const handleCloseSnackbar = () => {
        setSnackbar((prev) => ({
            ...prev,
            open: false
        }));
    };
    const showSnackbar = (
        message,
        severity = "success"
    ) => {
        setSnackbar({
            open: true,
            message,
            severity
        });
    };


    const handleSendOtp = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);

            if (!email) {
                showSnackbar("Please enter your email", "error");
                return;
            }

            const res = await API.post(
                "/api/auth/send-reset-otp",
                { email }
            );

            showSnackbar(res.data.message, "success");

        } catch (error) {

            showSnackbar(
                error.response?.data?.message || "Something went wrong",
                "error"
            );

        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        try {

            setLoading(true);

            if (!otp || !newPassword || !email) {
                showSnackbar("Please fill all fields", "error");
                return;
            }

            const res = await API.post(
                "/api/auth/reset-password",
                {
                    email,
                    otp,
                    newPassword
                }
            );

            showSnackbar(res.data.message, "success");

        } catch (error) {

            showSnackbar(
                error.response?.data?.message || "Something went wrong",
                "error"
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="w-screen min-h-screen flex items-center justify-center px-4">
                <div
                    className="
                    w-full
                    max-w-sm
                    p-6
                    sm:p-8
                    border
                    border-gray-200
                    rounded-2xl
                    flex
                    flex-col
                    items-center
                    gap-4
                    shadow-lg
                "
                >
                    <div className="text-2xl font-bold">
                        Reset Password
                    </div>

                    <form
                        className="flex flex-col gap-4 w-full"
                        onSubmit={handleSendOtp}
                    >
                        <TextField
                            label="Email"
                            type="email"
                            placeholder="Enter your email"
                            fullWidth
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            disabled={loading}
                            sx={{
                                textTransform: "none",
                                borderRadius: "10px",
                                backgroundColor: "black",
                                width: "100%",
                                color: "white",
                                fontSize: "18px",
                                fontWeight: "bold",

                                "&:hover": {
                                    backgroundColor: "#111",
                                },
                            }}
                        >
                            Send OTP
                        </Button>

                        <input
                            type="text"
                            placeholder="Enter OTP"
                            name="OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            maxLength={6}
                            inputMode="numeric"
                            className="
                                w-full
                                border
                                border-gray-300
                                rounded-md
                                px-4
                                py-4
                                outline-none
                                focus:border-black
                                text-base
                                text-center
                            "
                        />
                        <input
                            type="password"
                            placeholder="Enter new password"
                            name="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            maxLength={20}
                            className="
                                w-full
                                border
                                border-gray-300
                                rounded-md
                                px-4
                                py-4
                                outline-none
                                focus:border-black
                                text-base
                                text-center
                            "
                        />

                        <Button
                            variant="contained"
                            onClick={handleResetPassword}
                            disabled={loading}
                            sx={{
                                textTransform: "none",
                                borderRadius: "10px",
                                backgroundColor: "black",
                                width: "100%",
                                color: "white",
                                fontSize: "18px",
                                fontWeight: "bold",

                                "&:hover": {
                                    backgroundColor: "#111",
                                },
                            }}
                        >
                            Reset Password
                        </Button>
                    </form>
                    <div className="text-sm">Does password reset completed?{" "}<Link className="text-blue-600 hover:underline" to="/login">Login</Link></div>
                </div>
            </div>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{
                    vertical: "top",
                    horizontal: "center"
                }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ width: "100%" }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
}

export default ResetPassword;