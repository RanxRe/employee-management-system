import mongoose from "mongoose";
// import User from "./User.model.js";

const employeeSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
      unique: true,
    },
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "departments",
      required: true,
      trim: true,
    },

    designation: {
      type: String,
      required: true,
      trim: true,
    },

    joiningDate: {
      type: Date,
      required: true,
    },

    employmentStatus: {
      type: String,
      enum: ["pending", "active", "rejected", "terminated", "resigned"],
      default: "pending",
    },
  },
  { timestamps: true },
);

const Employee = mongoose.model("employees", employeeSchema);

export default Employee;
