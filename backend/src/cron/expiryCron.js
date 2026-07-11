import cron from "node-cron";
import dayjs from "dayjs";

import Inventory from "../models/Inventory.model.js";
import ExpiredProduct from "../models/ExpiredProduct.model.js";
import Product from "../models/Product.model.js";
import User from "../models/User.model.js";

import { sendExpiryMail } from "../services/inventory.service.js";

cron.schedule("0 0 * * *", async () => {
  console.log("Checking expiry products...");

  const today = dayjs();

  const inventories = await Inventory.find().populate("product");

  for (const item of inventories) {
    const expiry = dayjs(item.expiryDate);
    const daysLeft = expiry.diff(today, "day");
    const supplier = await User.findById(item.product.supplier);

    if (daysLeft === 7) {
      await sendExpiryMail(
        supplier.email,
        item.product.name,
        item.batchNumber,
        expiry.format("DD MMM YYYY"),
      );
    }

    if (daysLeft <= 0) {
      await ExpiredProduct.create({
        product: item.product._id,
        batchNumber: item.batchNumber,
        quantity: item.quantity,
        buyingPrice: item.buyingPrice,
        expiryDate: item.expiryDate,
      });

      await Inventory.findByIdAndDelete(item._id);
    }
  }
});
