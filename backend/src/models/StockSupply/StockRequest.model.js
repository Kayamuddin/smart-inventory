import mongoose from "mongoose";

const StockRequestSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

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

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "PACKED", "ONDELIVERY", "DELIVERED"],
      default: "PENDING",
    },

    requestType: {
      type: String,
      enum: ["AUTO", "REQUEST"],
      default: "REQUEST",
    },

    allRequestInventory: [
      {
        inventoryId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Inventory",
          required: true,
        },
      },
    ],

    editHistory: [
      {
        editor: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        editedAt: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ["PENDING", "APPROVED", "PACKED", "ONDELIVERY", "DELIVERED"],
          default: "PENDING",
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

StockRequestSchema.index({ from: 1, product: 1, status: 1 });
StockRequestSchema.index({ to: 1, product: 1, status: 1 });

const StockRequest = mongoose.model("StockRequest", StockRequestSchema);
export default StockRequest;
