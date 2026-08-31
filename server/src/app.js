import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { authRouter } from "./routes/auth.routes.js";
import { testRouter } from "./routes/test.routes.js";

const app = express();

//MIDDLEWARES
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

//ROUTES
app.get("/", (req, res) => {
  res.json("Welcome to Employee Management System server");
});

app.use("/api/auth", authRouter);
app.use("/api/test", testRouter);

//ERROR HANDLING MIDDLEWARE
app.use(errorMiddleware);

export default app;
