import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
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

    status: {
      type: String,
      enum: ["ACTIVE", "EXPIRING", "EXPIRED"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
  },
);

inventorySchema.index({ expiryDate: 1 });
inventorySchema.index({ product: 1 });

const Inventory = mongoose.model("Inventory", inventorySchema);
export default Inventory;
