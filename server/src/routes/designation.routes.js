import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import {
  createDesignation,
  deleteDesignation,
  getAllDesignations,
  getDesignationById,
  updateDesignation,
  updateDesignationStatus,
} from "../controllers/designation.controller.js";

export const designationRouter = express.Router();

designationRouter.post("/", authenticate, authorize("admin", "super_admin"), createDesignation);
designationRouter.get("/", authenticate, authorize("admin", "super_admin"), getAllDesignations);
designationRouter.get("/:id", authenticate, authorize("admin", "super_admin"), getDesignationById);
designationRouter.patch("/:id", authenticate, authorize("admin", "super_admin"), updateDesignation);
designationRouter.delete(
  "/:id",
  authenticate,
  authorize("admin", "super_admin"),
  deleteDesignation,
);
designationRouter.patch(
  "/:id/status",
  authenticate,
  authorize("admin", "super_admin"),
  updateDesignationStatus,
);
