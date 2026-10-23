import mongoose from "mongoose";

const menuProductSchema = new mongoose.Schema(
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

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

menuProductSchema.index(
  { name: 1, category: 1, createdBy: 1 },
  { unique: true },
);

const MenuProduct = mongoose.model("MenuProduct", menuProductSchema);
export default MenuProduct;
