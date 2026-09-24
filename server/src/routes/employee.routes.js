import express from "express";

import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";

import {
  //   createEmployeeTest,
  //   getEmployeeTest,
  createEmployee,
  getAllEmployee,
  getEmployeeById,
  updateEmploymentStatus,
  updateEmployee,
  updateAccountStatus,
  getMyProfile,
  updateMyProfile,
  changeMyPassword,
} from "../controllers/employee.controller.js";

export const employeeRouter = express.Router();

// employeeRouter.post("/test", authenticate, authorize("admin", "super_admin"), createEmployeeTest);
// employeeRouter.get("/test/:id", authenticate, authorize("admin", "super_admin"), getEmployeeTest);
employeeRouter.post("/", authenticate, authorize("admin", "super_admin"), createEmployee);
employeeRouter.get("/", authenticate, authorize("admin", "super_admin"), getAllEmployee);
employeeRouter.get("/me", authenticate, authorize("employee"), getMyProfile);
employeeRouter.patch("/me", authenticate, authorize("employee"), updateMyProfile);
employeeRouter.patch("/me/password", authenticate, authorize("employee"), changeMyPassword);
employeeRouter.get("/:id", authenticate, authorize("admin", "super_admin"), getEmployeeById);
employeeRouter.patch(
  "/:id/status",
  authenticate,
  authorize("admin", "super_admin"),
  updateEmploymentStatus,
);
employeeRouter.patch(
  "/:id/account-status",
  authenticate,
  authorize("admin", "super_admin"),
  updateAccountStatus,
);
employeeRouter.patch("/:id", authenticate, authorize("admin", "super_admin"), updateEmployee);
