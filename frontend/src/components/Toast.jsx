import { Snackbar, Alert } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { hideToast } from "../redux/slice/toastSlice.js";

function Toast() {
    const dispatch = useDispatch();

    const {
        open,
        message,
        severity,
    } = useSelector(
        (state) => state.toast
    );

    const handleClose = () => {
        dispatch(hideToast());
    };

    return (
        <Snackbar
            open={open}
            autoHideDuration={3000}
            onClose={handleClose}
            anchorOrigin={{
                vertical: "top",
                horizontal: "center",
            }}
        >
            <Alert
                severity={severity}
                variant="filled"
                onClose={handleClose}
                sx={{ width: "100%" }}
            >
                {message}
            </Alert>
        </Snackbar>
    );
}

export default Toast;