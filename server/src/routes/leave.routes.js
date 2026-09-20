import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import {
  createLeave,
  getAllLeaves,
  getLeaveById,
  getMyLeaves,
  updateLeaveStatus,
  updateMyLeave,
} from "../controllers/leave.controller.js";

export const leaveRouter = express.Router();

leaveRouter.post("/", authenticate, authorize("employee"), createLeave);
leaveRouter.get("/my", authenticate, authorize("employee"), getMyLeaves);
leaveRouter.get("/", authenticate, authorize("admin", "super_admin"), getAllLeaves);
leaveRouter.patch(
  "/:id/status",
  authenticate,
  authorize("admin", "super_admin"),
  updateLeaveStatus,
);
leaveRouter.get("/:id", authenticate, authorize("admin", "super_admin"), getLeaveById);
leaveRouter.patch("/:id", authenticate, authorize("employee"), updateMyLeave);
