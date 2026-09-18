import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import {
  createDepartment,
  deleteDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  updateDepartmentStatus,
} from "../controllers/department.controller.js";

export const departmentRouter = express.Router();

departmentRouter.post("/", authenticate, authorize("admin", "super_admin"), createDepartment);
departmentRouter.get("/", authenticate, authorize("admin", "super_admin"), getAllDepartments);
departmentRouter.get("/:id", authenticate, authorize("admin", "super_admin"), getDepartmentById);
departmentRouter.patch("/:id", authenticate, authorize("admin", "super_admin"), updateDepartment);
departmentRouter.delete("/:id", authenticate, authorize("admin", "super_admin"), deleteDepartment);
departmentRouter.patch(
  "/:id/status",
  authenticate,
  authorize("admin", "super_admin"),
  updateDepartmentStatus,
);
