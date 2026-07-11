import mongoose from "mongoose";

const expiredProductSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },

    batchNumber: String,

    quantity: Number,

    buyingPrice: Number,

    expiryDate: Date,

    expiredAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

const ExpiredProduct = mongoose.model("ExpiredProduct", expiredProductSchema);
export default ExpiredProduct;
