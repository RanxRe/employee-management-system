import express from "express";
import { authorize } from "../middlewares/role.middleware.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";
import {
  checkIn,
  checkOut,
  startBreak,
  endBreak,
  createAttendance,
  getAllAttendance,
  getAttendanceById,
  getMyAttendance,
  getMyAttendanceSummary,
  updateAttendance,
  getMyTodayAttendance,
  adminStartBreak,
  adminEndBreak,
  adjustWorkingTime,
  deleteAttendance,
} from "../controllers/attendance.controller.js";

export const attendanceRouter = express.Router();

attendanceRouter.post("/", authenticate, authorize("admin", "super_admin"), createAttendance);
attendanceRouter.get("/", authenticate, authorize("admin", "super_admin"), getAllAttendance);
attendanceRouter.get("/my", authenticate, authorize("employee"), getMyAttendance);
attendanceRouter.post(
  "/check-in",
  authenticate,
  authorize("employee"),
  upload.single("selfie"),
  checkIn,
);
attendanceRouter.patch("/check-out", authenticate, authorize("employee"), checkOut);
attendanceRouter.get("/my/summary", authenticate, authorize("employee"), getMyAttendanceSummary);
attendanceRouter.get("/my/today", authenticate, authorize("employee"), getMyTodayAttendance);
attendanceRouter.post("/break/start", authenticate, authorize("employee"), startBreak);
attendanceRouter.patch("/break/end", authenticate, authorize("employee"), endBreak);
attendanceRouter.post(
  "/:id/break/start",
  authenticate,
  authorize("admin", "super_admin"),
  adminStartBreak,
);
attendanceRouter.patch(
  "/:id/break/end",
  authenticate,
  authorize("admin", "super_admin"),
  adminEndBreak,
);
attendanceRouter.patch(
  "/:id/working-time/adjust",
  authenticate,
  authorize("admin", "super_admin"),
  adjustWorkingTime,
);
attendanceRouter.delete("/:id", authenticate, authorize("admin", "super_admin"), deleteAttendance);
attendanceRouter.get("/:id", authenticate, authorize("admin", "super_admin"), getAttendanceById);
attendanceRouter.patch("/:id", authenticate, authorize("admin", "super_admin"), updateAttendance);
