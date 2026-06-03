import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./slice/authSlice.js"
import toastSlice from "./slice/toastSlice.js"

const store = configureStore({
    reducer: {
        auth: authReducer,
        toast: toastSlice,
    }
})

export default store