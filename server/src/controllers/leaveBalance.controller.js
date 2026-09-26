import LeaveBalance from "../models/leaveBalance.model.js";
import Employee from "../models/Employee.model.js";

export const createLeaveBalance = async (req, res, next) => {
  try {
    const { employee, year, leaveType, allocated } = req.body;

    // --------------------------------
    // 1. Validate required fields
    // --------------------------------

    if (!employee || !year || !leaveType || allocated === undefined) {
      return res.status(400).json({
        success: false,
        message: "Employee, year, leave type and allocated leave are required.",
      });
    }

    // --------------------------------
    // 2. Validate employee
    // --------------------------------

    const employeeExists = await Employee.findById(employee);

    if (!employeeExists) {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }

    // --------------------------------
    // 3. Validate year
    // --------------------------------

    const numericYear = Number(year);

    if (!Number.isInteger(numericYear) || numericYear < 2000 || numericYear > 2100) {
      return res.status(400).json({
        success: false,
        message: "Invalid year.",
      });
    }

    // --------------------------------
    // 4. Validate allocated amount
    // --------------------------------

    const numericAllocated = Number(allocated);

    if (!Number.isFinite(numericAllocated) || numericAllocated < 0) {
      return res.status(400).json({
        success: false,
        message: "Allocated leave must be a non-negative number.",
      });
    }

    // --------------------------------
    // 5. Check duplicate balance
    // --------------------------------

    const existingBalance = await LeaveBalance.findOne({
      employee,
      year: numericYear,
      leaveType,
    });

    if (existingBalance) {
      return res.status(409).json({
        success: false,
        message: "Leave balance already exists for this employee, year and leave type.",
      });
    }

    // --------------------------------
    // 6. Create balance
    // --------------------------------

    const leaveBalance = await LeaveBalance.create({
      employee,
      year: numericYear,
      leaveType,
      allocated: numericAllocated,
      used: 0,
      remaining: numericAllocated,
    });

    return res.status(201).json({
      success: true,
      message: "Leave balance created successfully.",
      leaveBalance,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllLeaveBalances = async (req, res, next) => {
  try {
    const { year, employee, leaveType } = req.query;

    const filter = {};

    // -----------------------------
    // Year filter
    // -----------------------------

    if (year !== undefined) {
      const numericYear = Number(year);

      if (!Number.isInteger(numericYear) || numericYear < 2000 || numericYear > 2100) {
        return res.status(400).json({
          success: false,
          message: "Invalid year.",
        });
      }

      filter.year = numericYear;
    }

    // -----------------------------
    // Employee filter
    // -----------------------------

    if (employee) {
      const employeeExists = await Employee.findById(employee);

      if (!employeeExists) {
        return res.status(404).json({
          success: false,
          message: "Employee not found.",
        });
      }

      filter.employee = employee;
    }

    // -----------------------------
    // Leave type filter
    // -----------------------------

    if (leaveType) {
      const allowedLeaveTypes = ["casual", "sick", "earned", "unpaid", "other"];

      if (!allowedLeaveTypes.includes(leaveType)) {
        return res.status(400).json({
          success: false,
          message: "Invalid leave type.",
        });
      }

      filter.leaveType = leaveType;
    }

    // -----------------------------
    // Get balances
    // -----------------------------

    const leaveBalances = await LeaveBalance.find(filter)
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
      .sort({
        year: -1,
        leaveType: 1,
      })
      .exec();

    if (leaveBalances.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No leave balance found.",
      });
    }

    return res.status(200).json({
      success: true,
      count: leaveBalances.length,
      leaveBalances,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyLeaveBalances = async (req, res, next) => {
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

    const { year } = req.query;

    const filter = {
      employee: employee._id,
    };

    // -----------------------------
    // Optional year filter
    // -----------------------------

    if (year !== undefined) {
      const numericYear = Number(year);

      if (!Number.isInteger(numericYear) || numericYear < 2000 || numericYear > 2100) {
        return res.status(400).json({
          success: false,
          message: "Invalid year.",
        });
      }

      filter.year = numericYear;
    }

    const leaveBalances = await LeaveBalance.find(filter)
      .sort({
        year: -1,
        leaveType: 1,
      })
      .exec();

    if (leaveBalances.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No leave balance found.",
      });
    }

    return res.status(200).json({
      success: true,
      count: leaveBalances.length,
      leaveBalances,
    });
  } catch (error) {
    next(error);
  }
};
