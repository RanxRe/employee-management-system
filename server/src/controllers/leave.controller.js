import mongoose from "mongoose";
import Employee from "../models/Employee.model.js";
import Leave from "../models/Leave.model.js";

export const createLeave = async (req, res, next) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        message: "Leave type, start date, end date and reason are required.",
      });
    }

    const employee = await Employee.findOne({
      user: req.user._id,
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee profile not found.",
      });
    }

    if (employee.employmentStatus !== "active") {
      return res.status(403).json({
        success: false,
        message: "Your employment status does not allow leave requests.",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid start date or end date.",
      });
    }

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    if (start > end) {
      return res.status(400).json({
        success: false,
        message: "Start date cannot be after end date.",
      });
    }

    const overlappingLeave = await Leave.findOne({
      employee: employee._id,

      status: {
        $in: ["pending", "approved"],
      },

      startDate: {
        $lte: end,
      },

      endDate: {
        $gte: start,
      },
    });

    if (overlappingLeave) {
      return res.status(409).json({
        success: false,
        message: "You already have a pending or approved leave for these dates.",
      });
    }

    const leave = await Leave.create({
      employee: employee._id,
      leaveType,
      startDate: start,
      endDate: end,
      reason: reason.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Leave request submitted successfully.",
      leave,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyLeaves = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({
      user: req.user._id,
    });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee profile not found.",
      });
    }

    const leaves = await Leave.find({ employee: employee._id }).sort({ startDate: -1 }).exec();

    if (leaves.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No leave records found.",
      });
    }

    return res.status(200).json({
      success: true,
      count: leaves.length,
      leaves,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllLeaves = async (req, res, next) => {
  try {
    const leaves = await Leave.find()
      .populate({
        path: "employee",
        populate: [
          { path: "user", select: "-password" },
          { path: "department" },
          { path: "designation" },
        ],
      })
      .populate({ path: "reviewedBy", select: "-password" })
      .sort({ createdAt: -1 })
      .exec();

    return res.status(200).json({ success: true, count: leaves.length, leaves });
  } catch (error) {
    next(error);
  }
};

export const updateLeaveStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, reviewComment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid leave ID.",
      });
    }

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be approved or rejected.",
      });
    }

    const leave = await Leave.findById(id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found.",
      });
    }

    if (leave.status !== "pending") {
      return res.status(409).json({
        success: false,
        message: "Only pending leave requests can be reviewed.",
      });
    }

    leave.status = status;
    leave.reviewedBy = req.user._id;
    leave.reviewedAt = new Date();
    leave.reviewComment = reviewComment?.trim() || "";

    await leave.save();

    return res.status(200).json({
      success: true,
      message: `Leave request ${status} successfully.`,
      leave,
    });
  } catch (error) {
    next(error);
  }
};

export const getLeaveById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid leave ID.",
      });
    }

    const leave = await Leave.findById(id)
      .populate({
        path: "employee",
        populate: [
          {
            path: "user",
            select: "-password",
          },
          {
            path: "department",
          },
          {
            path: "designation",
          },
        ],
      })
      .populate({
        path: "reviewedBy",
        select: "-password",
      })
      .exec();

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found.",
      });
    }

    return res.status(200).json({
      success: true,
      leave,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMyLeave = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { leaveType, startDate, endDate, reason, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid leave ID.",
      });
    }

    const employee = await Employee.findOne({
      user: req.user._id,
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee profile not found.",
      });
    }

    const leave = await Leave.findById(id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found.",
      });
    }

    // Make sure this leave belongs to the logged-in employee
    if (leave.employee.toString() !== employee._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to modify this leave request.",
      });
    }

    // Only pending leave can be modified
    if (leave.status !== "pending") {
      return res.status(409).json({
        success: false,
        message: "Only pending leave requests can be modified.",
      });
    }

    // Allow cancellation
    if (status !== undefined) {
      if (status !== "cancelled") {
        return res.status(400).json({
          success: false,
          message: "You can only cancel a pending leave request.",
        });
      }

      leave.status = "cancelled";

      await leave.save();

      return res.status(200).json({
        success: true,
        message: "Leave request cancelled successfully.",
        leave,
      });
    }

    // Update leave fields
    if (leaveType !== undefined) {
      if (!["casual", "sick", "earned", "unpaid", "other"].includes(leaveType)) {
        return res.status(400).json({
          success: false,
          message: "Invalid leave type.",
        });
      }

      leave.leaveType = leaveType;
    }

    if (startDate !== undefined) {
      const start = new Date(startDate);

      if (isNaN(start.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid start date.",
        });
      }

      start.setHours(0, 0, 0, 0);
      leave.startDate = start;
    }

    if (endDate !== undefined) {
      const end = new Date(endDate);

      if (isNaN(end.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid end date.",
        });
      }

      end.setHours(23, 59, 59, 999);
      leave.endDate = end;
    }

    if (leave.startDate > leave.endDate) {
      return res.status(400).json({
        success: false,
        message: "Start date cannot be after end date.",
      });
    }

    const overlappingLeave = await Leave.findOne({
      _id: { $ne: leave._id },

      employee: employee._id,

      status: {
        $in: ["pending", "approved"],
      },

      startDate: {
        $lte: leave.endDate,
      },

      endDate: {
        $gte: leave.startDate,
      },
    });

    if (overlappingLeave) {
      return res.status(409).json({
        success: false,
        message: "The updated leave dates overlap with another pending or approved leave.",
      });
    }

    if (reason !== undefined) {
      if (!reason.trim()) {
        return res.status(400).json({
          success: false,
          message: "Reason cannot be empty.",
        });
      }

      leave.reason = reason.trim();
    }

    await leave.save();

    return res.status(200).json({
      success: true,
      message: "Leave request updated successfully.",
      leave,
    });
  } catch (error) {
    next(error);
  }
};
