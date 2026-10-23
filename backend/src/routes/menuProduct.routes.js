import { Router } from "express";
import {
  createMenuProduct,
  deleteMenuProduct,
  getCategories,
  getMenuProduct,
  updateMenuProduct,
} from "../controllers/menuProduct.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import authorize from "../middleware/authorize.middleware.js";
import {
  createProductValidation,
  updateProductValidation,
} from "../validations/menuProduct.validation.js";
import validationMiddleware from "../middleware/validate.middleware.js";

const router = Router();

router.use(authMiddleware, authorize("admin"));

router.get("/", authorize("admin", "employee"), getMenuProduct);
router.get("/categories", authorize("admin", "employee"), getCategories);
router.post(
  "/",
  createProductValidation,
  validationMiddleware,
  createMenuProduct,
);
router.post(
  "/edit/:id",
  updateProductValidation,
  validationMiddleware,
  updateMenuProduct,
);
router.delete("/:id", deleteMenuProduct);

export default router;
