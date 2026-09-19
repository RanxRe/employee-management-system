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
