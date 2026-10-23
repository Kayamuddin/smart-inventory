import mongoose from "mongoose";

const EmployeeStockSettingSchema = new mongoose.Schema(
  {
    product: {
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

    sendAtQauntity: {
      type: Number,
      required: true,
      min: 1,
    },

    resendRequest: true,
  },
  {
    timestamps: true,
  },
);

const EmployeeStockSetting = mongoose.model(
  "EmployeeStockSetting",
  EmployeeStockSettingSchema,
);
export default EmployeeStockSetting;
