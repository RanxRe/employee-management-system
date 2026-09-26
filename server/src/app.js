import express from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { authRouter } from "./routes/auth.routes.js";
import { testRouter } from "./routes/test.routes.js";
import { employeeRouter } from "./routes/employee.routes.js";
import { departmentRouter } from "./routes/department.routes.js";
import { designationRouter } from "./routes/designation.routes.js";
import { attendanceRouter } from "./routes/attendance.routes.js";
import { leaveRouter } from "./routes/leave.routes.js";
import { payrollRouter } from "./routes/payroll.routes.js";
import { notificationRouter } from "./routes/notification.routes.js";
import { dashboardRouter } from "./routes/dashboard.routes.js";
import { adminRouter } from "./routes/admin.routes.js";
import leaveBalanceRouter from "./routes/leaveBalance.routes.js";

const app = express();

//MIDDLEWARES
app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

//ROUTES
app.get("/", (req, res) => {
  res.json("Welcome to Employee Management System server");
});

app.use("/api/auth", authRouter);
app.use("/api/test", testRouter);
app.use("/api/employees", employeeRouter);
app.use("/api/departments", departmentRouter);
app.use("/api/designations", designationRouter);
app.use("/api/attendances", attendanceRouter);
app.use("/api/leaves", leaveRouter);
app.use("/api/payroll", payrollRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/admins", adminRouter);
app.use("/api/leave-balances", leaveBalanceRouter);
//ERROR HANDLING MIDDLEWARE
app.use(errorMiddleware);

export default app;
