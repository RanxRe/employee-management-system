import express from "express";
import { authorize } from "../middlewares/role.middleware.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import {
  checkIn,
  checkOut,
  createAttendance,
  getAllAttendance,
  getAttendanceById,
  getMyAttendance,
  updateAttendance,
} from "../controllers/attendance.controller.js";

export const attendanceRouter = express.Router();

attendanceRouter.post("/", authenticate, authorize("admin", "super_admin"), createAttendance);
attendanceRouter.get("/", authenticate, authorize("admin", "super_admin"), getAllAttendance);
attendanceRouter.get("/my", authenticate, authorize("employee"), getMyAttendance);
attendanceRouter.post("/check-in", authenticate, authorize("employee"), checkIn);
attendanceRouter.patch("/check-out", authenticate, authorize("employee"), checkOut);
attendanceRouter.get("/:id", authenticate, authorize("admin", "super_admin"), getAttendanceById);
attendanceRouter.patch("/:id", authenticate, authorize("admin", "super_admin"), updateAttendance);
