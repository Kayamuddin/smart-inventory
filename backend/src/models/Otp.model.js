import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        otp: {
            type: String,
            required: true,
        },

        expiresAt: {
            type: Date,
            required: true,

            // TTL Index
            expires: 0,
        },
    },
    {
        timestamps: true,
    }
);

const Otp = mongoose.model("Otp", otpSchema);

export default Otp;