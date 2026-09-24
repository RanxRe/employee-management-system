import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import {
  changeMyPassword,
  createAdmin,
  getAdminById,
  getAllAdmins,
  updateAdmin,
  updateAdminPassword,
  updateAdminStatus,
} from "../controllers/admin.controller.js";

export const adminRouter = express.Router();

adminRouter.get("/", authenticate, authorize("super_admin"), getAllAdmins);
adminRouter.post("/", authenticate, authorize("super_admin"), createAdmin);
adminRouter.patch("/:id/status", authenticate, authorize("super_admin"), updateAdminStatus);
adminRouter.get("/:id", authenticate, authorize("super_admin"), getAdminById);
adminRouter.patch("/:id", authenticate, authorize("super_admin"), updateAdmin);
// Admin/Super Admin changes their own password
adminRouter.patch(
  "/me/password",
  authenticate,
  authorize("admin", "super_admin"),
  changeMyPassword,
);

// Super Admin changes an admin's password
adminRouter.patch("/:id/password", authenticate, authorize("super_admin"), updateAdminPassword);
