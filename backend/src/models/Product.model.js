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

    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    unit: {
      type: String,
      default: "pcs",
    },
  },
  {
    timestamps: true,
  },
);

productSchema.index({ name: 1, supplier: 1 }, { unique: true });

const Product = mongoose.model("Product", productSchema);
export default Product;
