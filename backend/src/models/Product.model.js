import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
    },

    holder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    unit: {
      type: String,
      default: "pcs",
    },

    allExpired: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

productSchema.index({ name: 1, holder: 1 }, { unique: true });

const Product = mongoose.model("Product", productSchema);
export default Product;
