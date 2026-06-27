import { Router } from "express";
import { createUser, deleteUser, getAllUsers, updateUser } from "../controllers/admin.controller.js";
import authMiddleware from "../middleware/auth.middleware.js"
import allowedUser from "../middleware/userRole.middleware.js"

const adminRouter = Router();

adminRouter.get("/get-users", authMiddleware, allowedUser("admin"), getAllUsers);
adminRouter.put("/update-user/:id", authMiddleware, allowedUser("admin"), updateUser);
adminRouter.delete("/delete-user/:id", authMiddleware, allowedUser("admin"), deleteUser);
adminRouter.post("/create-user", authMiddleware, allowedUser("admin"), createUser);

export default adminRouter;