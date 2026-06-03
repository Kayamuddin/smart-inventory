import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    open: false,
    message: "",
    severity: "success",
};

const toastSlice = createSlice({
    name: "toast",
    initialState,
    reducers: {
        showToast: (state, action) => {
            state.open = true;
            state.message = action.payload[0];
            state.severity = action.payload[1];
        },

        hideToast: (state) => {
            state.open = false;
        },
    },
});

export const {
    showToast,
    hideToast,
} = toastSlice.actions;

export default toastSlice.reducer;