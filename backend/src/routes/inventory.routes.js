import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  addInventory,
  deductUsedProduct,
  deleteInventory,
  getCategories,
  getExpiredCategories,
  getExpiredProducts,
  getExpiringProducts,
  getInventory,
  getUsedProductAtToday,
  updateInventory,
} from "../controllers/inventory.controller.js";
import {
  addInventoryValidation,
  updateInventoryValidation,
} from "../validations/inventory.validation.js";
import authorize from "../middleware/authorize.middleware.js";
import validationMiddleware from "../middleware/validate.middleware.js";

const router = express.Router();

router.get(
  "/expired-products",
  authMiddleware,
  authorize("employee", "admin", "supplier"),
  getExpiredProducts,
);

router.get(
  "/expiring-products",
  authMiddleware,
  authorize("employee", "admin", "supplier"),
  getExpiringProducts,
);

router.get(
  "/expired-categories",
  authMiddleware,
  authorize("employee", "admin", "supplier"),
  getExpiredCategories,
);

router.get(
  "/",
  authMiddleware,
  authorize("employee", "admin", "supplier"),
  getInventory,
);

router.get(
  "/categories",
  authMiddleware,
  authorize("employee", "admin", "supplier"),
  getCategories,
);

router.patch(
  "/deduct-used-product/:id",
  authMiddleware,
  authorize("admin", "employee"),
  deductUsedProduct,
);

router.get(
  "/used-product-at-today",
  authMiddleware,
  authorize("admin", "employee"),
  getUsedProductAtToday,
);

router.use(authMiddleware, authorize("admin", "supplier"));

router.post("/add", addInventoryValidation, validationMiddleware, addInventory);

router.put(
  "/edit/:id",
  updateInventoryValidation,
  validationMiddleware,
  updateInventory,
);

router.delete("/:id", deleteInventory);

export default router;
