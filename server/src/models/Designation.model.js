import mongoose, { mongo } from "mongoose";

const designationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true },
);

const Designation = mongoose.model("designations", designationSchema);

export default Designation;
