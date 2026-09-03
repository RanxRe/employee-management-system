import express from "express";

import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";

import {
  //   createEmployeeTest,
  //   getEmployeeTest,
  createEmployee,
  getAllEmployee,
} from "../controllers/employee.controller.js";

export const employeeRouter = express.Router();

// employeeRouter.post("/test", authenticate, authorize("admin", "super_admin"), createEmployeeTest);
// employeeRouter.get("/test/:id", authenticate, authorize("admin", "super_admin"), getEmployeeTest);
employeeRouter.post("/", authenticate, authorize("admin", "super_admin"), createEmployee);
employeeRouter.get("/", authenticate, authorize("admin", "super_admin"), getAllEmployee);
