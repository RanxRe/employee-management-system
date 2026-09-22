import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import {
  createPayroll,
  getAllPayroll,
  getMyPayroll,
  getPayrollById,
  updatePayroll,
  updatePayrollStatus,
} from "../controllers/payroll.controller.js";

export const payrollRouter = express.Router();

payrollRouter.post("/", authenticate, authorize("admin", "super_admin"), createPayroll);
payrollRouter.get("/", authenticate, authorize("admin", "super_admin"), getAllPayroll);
payrollRouter.get("/my", authenticate, authorize("employee"), getMyPayroll);
payrollRouter.patch(
  "/:id/status",
  authenticate,
  authorize("admin", "super_admin"),
  updatePayrollStatus,
);
payrollRouter.patch("/:id", authenticate, authorize("admin", "super_admin"), updatePayroll);
payrollRouter.get("/:id", authenticate, authorize("admin", "super_admin"), getPayrollById);
