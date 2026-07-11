import { Router } from "express";
import {
  createUser,
  deleteUser,
  getAllUsers,
  updateUser,
} from "../controllers/admin.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import authorize from "../middleware/authorize.middleware.js";
import {
  createUserValidation,
  deleteUserValidation,
  updateUserValidation,
} from "../validations/admin.validation.js";
import validationMiddleware from "../middleware/validate.middleware.js";

const adminRouter = Router();

adminRouter.get("/get-users", authMiddleware, authorize("admin"), getAllUsers);
adminRouter.put(
  "/update-user/:id",
  authMiddleware,
  authorize("admin"),
  updateUserValidation,
  validationMiddleware,
  updateUser,
);
adminRouter.delete(
  "/delete-user/:id",
  authMiddleware,
  authorize("admin"),
  deleteUserValidation,
  validationMiddleware,
  deleteUser,
);
adminRouter.post(
  "/create-user",
  authMiddleware,
  authorize("admin"),
  createUserValidation,
  validationMiddleware,
  createUser,
);

export default adminRouter;
