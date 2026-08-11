import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  addInventory,
  getCategories,
  getExpiredCategories,
  getExpiredProducts,
  getExpiringProducts,
  getInventory,
  getInventoryById,
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
  "/expiredProducts",
  authMiddleware,
  authorize("employee", "admin", "supplier"),
  getExpiredProducts,
);

router.get(
  "/expiringProducts",
  authMiddleware,
  authorize("employee", "admin", "supplier"),
  getExpiringProducts,
);

router.get(
  "/expiredCategories",
  authMiddleware,
  authorize("employee", "admin", "supplier"),
  getExpiredCategories,
);

router.use(authMiddleware, authorize("admin", "supplier"));

router.get("/", getInventory);

router.get("/categories", getCategories);

router.get("/:id", getInventoryById);

router.post("/add", addInventoryValidation, validationMiddleware, addInventory);

router.put(
  "/edit/:id",
  updateInventoryValidation,
  validationMiddleware,
  updateInventory,
);

export default router;
