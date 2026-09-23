import express from "express";

import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";

import {
  getMyNotifications,
  getUnreadNotifications,
  markNotificationAsRead,
} from "../controllers/notification.controller.js";

export const notificationRouter = express.Router();

notificationRouter.get("/my", authenticate, authorize("employee"), getMyNotifications);
notificationRouter.get("/unread", authenticate, authorize("employee"), getUnreadNotifications);
notificationRouter.patch("/:id/read", authenticate, authorize("employee"), markNotificationAsRead);
