import mongoose from "mongoose";

const availableProductSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuProduct",
      required: true,
    },

    holder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    available: true,
  },
  {
    timestamps: true,
  },
);

const AvailableProduct = mongoose.model(
  "AvailableProduct",
  availableProductSchema,
);
export default AvailableProduct;
