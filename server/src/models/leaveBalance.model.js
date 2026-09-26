import mongoose from "mongoose";

const leaveBalanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "employees",
      required: true,
    },

    year: {
      type: Number,
      required: true,
    },

    leaveType: {
      type: String,
      enum: ["casual", "sick", "earned", "unpaid", "other"],
      required: true,
    },

    allocated: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    used: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    remaining: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

leaveBalanceSchema.index(
  {
    employee: 1,
    year: 1,
    leaveType: 1,
  },
  {
    unique: true,
  },
);

const LeaveBalance = mongoose.model("leaveBalances", leaveBalanceSchema);

export default LeaveBalance;
