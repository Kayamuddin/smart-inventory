import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    holder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    batchNumber: {
      type: String,
      required: true,
      unique: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    buyingPrice: {
      type: Number,
      required: true,
    },

    expiryDate: {
      type: Date,
      required: true,
    },

    manufactureDate: Date,

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
        transferStatus: {
          type: String,
          enum: ["ONSTOCK", "ONPACKING", "DELIVERED"],
        },
        status: {
          type: String,
          enum: ["ACTIVE", "EXPIRING", "EXPIRED", "USED"],
        },
      },
    ],

    transferStatus: {
      type: String,
      enum: ["ONSTOCK", "ONPACKING", "DELIVERED"],
      default: "ONSTOCK",
    },

    status: {
      type: String,
      enum: ["ACTIVE", "EXPIRING", "EXPIRED", "USED"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
  },
);

inventorySchema.index({ holder: 1, status: 1 });
inventorySchema.index({ product: 1, holder: 1, transferStatus: 1, status: 1 });

const Inventory = mongoose.model("Inventory", inventorySchema);
export default Inventory;
