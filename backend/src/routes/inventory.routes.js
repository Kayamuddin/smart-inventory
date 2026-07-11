import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  addInventory,
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

router.use(authMiddleware, authorize("admin", "supplier"));

router.get("/", getInventory);

router.get("/:id", getInventoryById);

router.post("/add", addInventoryValidation, validationMiddleware, addInventory);

router.put(
  "/:id/edit",
  updateInventoryValidation,
  validationMiddleware,
  updateInventory,
);

export default router;
