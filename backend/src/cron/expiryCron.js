import cron from "node-cron";
import dayjs from "dayjs";

import Inventory from "../models/Inventory.model.js";
import ExpiredProduct from "../models/ExpiredProduct.model.js";
import Product from "../models/Product.model.js";
import User from "../models/User.model.js";

import { sendExpiryMail } from "../services/inventory.service.js";

cron.schedule("0 0 * * *", async () => {
  const today = dayjs();

  const inventories = await Inventory.find({
    status: {
      $not: "USED",
    },
  }).populate("product");

  for (const item of inventories) {
    const expiry = dayjs(item.expiryDate);
    const daysLeft = expiry.diff(today, "day");
    const supplier = await User.findById(item.product.holder);

    if (daysLeft > 0 && daysLeft <= 7) {
      await sendExpiryMail(
        supplier.email,
        item.product.name,
        item.batchNumber,
        expiry.format("DD MMM YYYY"),
      );
      item.status = "EXPIRING";
      await item.save();
    }

    if (daysLeft <= 0) {
      await ExpiredProduct.create({
        product: item.product._id,
        owner: supplier._id,
        batchNumber: item.batchNumber,
        quantity: item.quantity,
        buyingPrice: item.buyingPrice,
        expiryDate: item.expiryDate,
      });

      const inventoryItem = await Inventory.findById(item._id);
      inventoryItem.status = "EXPIRED";
      await inventoryItem.save();

      const isProductExist = await Inventory.find({
        product: item.product._id,
      });
      if (!isProductExist) {
        const product = await Product.findById(item.product._id);
        product.allExpired = true;
        await product.save();
      }
    }
  }
});
