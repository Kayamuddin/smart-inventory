import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import authorize from "../middleware/authorize.middleware.js";
import {
  addProductToPackaging,
  approveProductDelivered,
  approveProductsDelivery,
  approveRequestProduct,
  createRequestProduct,
  deleteRequestProduct,
  getPackedProducts,
  getProductSuggestion,
  getRequestProduct,
  markAllDelivered,
  transferPackedProduct,
  updateRequestProduct,
} from "../controllers/productTransfer.controller.js";
import validationMiddleware from "../middleware/validate.middleware.js";
import {
  addProductToPackagingValidation,
  approveRequestProductValidation,
  createRequestProductValidation,
  deleteRequestProductValidation,
  transferPackedProductValidation,
  updateRequestProductValidation,
} from "../validations/productTransfer.validation.js";

const router = Router();

router.use(authMiddleware);

router.get(
  "/product-suggestion",
  authorize("admin", "employee"),
  getProductSuggestion,
);

router.get(
  "/product-requests",
  authorize("admin", "employee", "supplier"),
  getRequestProduct,
);

router.post(
  "/create-product-request",
  authorize("admin", "employee"),
  createRequestProductValidation,
  validationMiddleware,
  createRequestProduct("REQUEST"),
);

router.post(
  "/auto-create-product-request",
  authorize("admin", "employee"),
  createRequestProductValidation,
  validationMiddleware,
  createRequestProduct("AUTO"),
);

router.patch(
  "/update-product-request/:id",
  authorize("admin", "employee"),
  updateRequestProductValidation,
  validationMiddleware,
  updateRequestProduct,
);

router.delete(
  "/delete-product-request/:id",
  authorize("admin", "employee"),
  deleteRequestProductValidation,
  validationMiddleware,
  deleteRequestProduct,
);

router.patch(
  "/add-product-to-packaging/:id",
  authorize("admin", "supplier"),
  addProductToPackagingValidation,
  validationMiddleware,
  addProductToPackaging,
);

router.patch(
  "/approve-request/:id",
  authorize("admin", "supplier"),
  approveRequestProductValidation,
  validationMiddleware,
  approveRequestProduct,
);

router.get(
  "/packed-products",
  authorize("admin", "supplier", "employee"),
  getPackedProducts,
);

router.patch(
  "/transfer-packed-product/:id",
  authorize("admin", "supplier"),
  transferPackedProductValidation,
  validationMiddleware,
  transferPackedProduct,
);

router.patch(
  "/approve-delivery/:id",
  authorize("admin", "employee"),
  transferPackedProductValidation,
  validationMiddleware,
  approveProductsDelivery,
);

router.patch(
  "/approve-delivered/:id",
  authorize("admin", "employee"),
  approveProductDelivered,
);

router.patch(
  "/mark-all-delivered/:id",
  authorize("admin", "employee"),
  markAllDelivered,
);

export default router;
