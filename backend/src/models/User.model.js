import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        min: [2, "Name must contain atleast 2 Charactor"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: [true, "This Email is already exist"],
        lowercase: true
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        min: [8, "Password length must be minimum 8"]
    },
    role: {
        type: String,
        enum: ["admin", "supply", "employee", "customer"],
        default: "customer"
    },
    refreshToken: String,
    resetOtp: String,
    resetOtpExpiry: String,
}, { timestamps: true });

const User = mongoose.model("User", UserSchema);
export default User;