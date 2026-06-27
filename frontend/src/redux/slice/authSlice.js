import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : { name: "User", email: "", role: "" },
    token: localStorage.getItem("token") || null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        login: (state, action) => {
            localStorage.setItem("token", action.payload.token)
            state.token = action.payload.token;
            state.user = {
                name: action.payload.data.name,
                email: action.payload.data.email,
                role: action.payload.data.role,
            }
            localStorage.setItem("user", JSON.stringify(state.user))
            window.location.href = "/"
        },
        logout: (state) => {
            localStorage.removeItem("token")
            localStorage.removeItem("user")
            state.token = null;
            state.user = null;
            window.location.href = "/login"
        }
    },
});

export const {
    login,
    logout
} = authSlice.actions;

export default authSlice.reducer;