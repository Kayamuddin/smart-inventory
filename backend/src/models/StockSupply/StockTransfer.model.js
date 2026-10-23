import mongoose from "mongoose";

const StockTransferSchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    allRequestStock: [
      {
        requestId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "StockRequest",
          required: true,
        },
      },
    ],

    editHistory: [
      {
        editor: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        editedAt: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ["ONDELIVERY", "DELIVERED", "ALLDELIVERED"],
          default: "ONDELIVERY",
        },
      },
    ],

    deliveryAt: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ["ONPACKING", "ONDELIVERY", "DELIVERED", "ALLDELIVERED"],
      default: "ONPACKING",
    },
  },
  {
    timestamps: true,
  },
);

const StockTransfer = mongoose.model("StockTransfer", StockTransferSchema);
export default StockTransfer;
