import mongoose from "mongoose";
import Employee from "../models/Employee.model.js";
import Payroll from "../models/Payroll.model.js";
import Notification from "../models/Notification.model.js";

export const createPayroll = async (req, res, next) => {
  try {
    const {
      employee,
      month,
      year,
      basicSalary,
      allowances = 0,
      deductions = 0,
      remarks = "",
    } = req.body;

    if (!employee || month === undefined || year === undefined || basicSalary === undefined) {
      return res.status(400).json({
        success: false,
        message: "Employee, month, year and basic salary are required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(employee)) {
      return res.status(400).json({
        success: false,
        message: "Invalid employee ID.",
      });
    }

    if (!Number.isInteger(Number(month)) || Number(month) < 1 || Number(month) > 12) {
      return res.status(400).json({
        success: false,
        message: "Month must be between 1 and 12.",
      });
    }

    if (!Number.isInteger(Number(year)) || Number(year) < 2000) {
      return res.status(400).json({
        success: false,
        message: "Invalid year.",
      });
    }

    if (Number(basicSalary) < 0) {
      return res.status(400).json({
        success: false,
        message: "Basic salary cannot be negative.",
      });
    }

    if (Number(allowances) < 0 || Number(deductions) < 0) {
      return res.status(400).json({
        success: false,
        message: "Allowances and deductions cannot be negative.",
      });
    }

    const employeeRecord = await Employee.findById(employee);

    if (!employeeRecord) {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }

    if (employeeRecord.employmentStatus !== "active") {
      return res.status(409).json({
        success: false,
        message: "Payroll can only be generated for an active employee.",
      });
    }

    const existingPayroll = await Payroll.findOne({
      employee,
      month: Number(month),
      year: Number(year),
    });

    if (existingPayroll) {
      return res.status(409).json({
        success: false,
        message: "Payroll already exists for this employee and month.",
      });
    }

    const netSalary = Number(basicSalary) + Number(allowances) - Number(deductions);

    if (netSalary < 0) {
      return res.status(400).json({
        success: false,
        message: "Net salary cannot be negative.",
      });
    }

    const payroll = await Payroll.create({
      employee,
      month: Number(month),
      year: Number(year),
      basicSalary: Number(basicSalary),
      allowances: Number(allowances),
      deductions: Number(deductions),
      netSalary,
      remarks: remarks.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Payroll generated successfully.",
      payroll,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllPayroll = async (req, res, next) => {
  try {
    const { employee, month, year } = req.query;

    const filter = {};

    // Filter by employee MongoDB _id
    if (employee) {
      if (!mongoose.Types.ObjectId.isValid(employee)) {
        return res.status(400).json({
          success: false,
          message: "Invalid employee ID.",
        });
      }

      filter.employee = employee;
    }

    // Filter by month
    if (month !== undefined) {
      const monthNumber = Number(month);

      if (!Number.isInteger(monthNumber) || monthNumber < 1 || monthNumber > 12) {
        return res.status(400).json({
          success: false,
          message: "Month must be between 1 and 12.",
        });
      }

      filter.month = monthNumber;
    }

    // Filter by year
    if (year !== undefined) {
      const yearNumber = Number(year);

      if (!Number.isInteger(yearNumber) || yearNumber < 2000) {
        return res.status(400).json({
          success: false,
          message: "Invalid year.",
        });
      }

      filter.year = yearNumber;
    }

    const payrolls = await Payroll.find(filter)
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
      .sort({ year: -1, month: -1 })
      .exec();

    if (payrolls.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No payroll records found.",
      });
    }

    return res.status(200).json({
      success: true,
      count: payrolls.length,
      payrolls,
    });
  } catch (error) {
    next(error);
  }
};

export const getPayrollById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payroll ID.",
      });
    }

    const payroll = await Payroll.findById(id)
      .populate({
        path: "employee",
        populate: [
          { path: "user", select: "-password" },
          { path: "department" },
          { path: "designation" },
        ],
      })
      .exec();

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: "Payroll not found.",
      });
    }

    return res.status(200).json({
      success: true,
      payroll,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyPayroll = async (req, res, next) => {
  try {
    const { month, year } = req.query;

    const employee = await Employee.findOne({
      user: req.user._id,
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee profile not found.",
      });
    }

    const filter = {
      employee: employee._id,
    };

    if (month !== undefined) {
      const monthNumber = Number(month);

      if (!Number.isInteger(monthNumber) || monthNumber < 1 || monthNumber > 12) {
        return res.status(400).json({
          success: false,
          message: "Month must be between 1 and 12.",
        });
      }

      filter.month = monthNumber;
    }

    if (year !== undefined) {
      const yearNumber = Number(year);

      if (!Number.isInteger(yearNumber) || yearNumber < 2000) {
        return res.status(400).json({
          success: false,
          message: "Invalid year.",
        });
      }

      filter.year = yearNumber;
    }

    const payrolls = await Payroll.find(filter).sort({ year: -1, month: -1 }).exec();

    if (payrolls.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No payroll records found.",
      });
    }

    return res.status(200).json({
      success: true,
      count: payrolls.length,
      payrolls,
    });
  } catch (error) {
    next(error);
  }
};
export const updatePayrollStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payroll ID.",
      });
    }

    if (!["draft", "processed", "paid"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payroll status.",
      });
    }

    const payroll = await Payroll.findById(id).populate({
      path: "employee",
      populate: {
        path: "user",
        select: "_id",
      },
    });

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: "Payroll not found.",
      });
    }

    // Prevent updating to the same status
    if (payroll.status === status) {
      return res.status(409).json({
        success: false,
        message: `Payroll is already ${status}.`,
      });
    }

    // draft → processed
    if (payroll.status === "draft" && status === "processed") {
      payroll.status = status;
    }

    // processed → paid
    else if (payroll.status === "processed" && status === "paid") {
      payroll.status = status;
      payroll.paymentDate = new Date();
    }

    // Invalid transition
    else {
      return res.status(409).json({
        success: false,
        message: `Cannot change payroll status from ${payroll.status} to ${status}.`,
      });
    }

    await payroll.save();

    // Create notification only when salary is paid
    if (status === "paid") {
      await Notification.create({
        recipient: payroll.employee.user._id,
        title: "Salary Paid",
        message: `Your salary for ${payroll.month}/${payroll.year} has been paid.`,
        type: "payroll",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Payroll ${status} successfully.`,
      payroll,
    });
  } catch (error) {
    next(error);
  }
};
export const updatePayroll = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { basicSalary, allowances, deductions, remarks } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payroll ID.",
      });
    }

    const payroll = await Payroll.findById(id);

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: "Payroll not found.",
      });
    }

    if (payroll.status !== "draft") {
      return res.status(409).json({
        success: false,
        message: "Only draft payroll can be updated.",
      });
    }

    // At least one field must be provided
    if (
      basicSalary === undefined &&
      allowances === undefined &&
      deductions === undefined &&
      remarks === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "No fields provided for update.",
      });
    }

    if (basicSalary !== undefined && Number(basicSalary) < 0) {
      return res.status(400).json({
        success: false,
        message: "Basic salary cannot be negative.",
      });
    }

    if (allowances !== undefined && Number(allowances) < 0) {
      return res.status(400).json({
        success: false,
        message: "Allowances cannot be negative.",
      });
    }

    if (deductions !== undefined && Number(deductions) < 0) {
      return res.status(400).json({
        success: false,
        message: "Deductions cannot be negative.",
      });
    }

    const newBasicSalary = basicSalary !== undefined ? Number(basicSalary) : payroll.basicSalary;

    const newAllowances = allowances !== undefined ? Number(allowances) : payroll.allowances;

    const newDeductions = deductions !== undefined ? Number(deductions) : payroll.deductions;

    const newNetSalary = newBasicSalary + newAllowances - newDeductions;

    if (newNetSalary < 0) {
      return res.status(400).json({
        success: false,
        message: "Net salary cannot be negative.",
      });
    }

    payroll.basicSalary = newBasicSalary;
    payroll.allowances = newAllowances;
    payroll.deductions = newDeductions;
    payroll.netSalary = newNetSalary;

    if (remarks !== undefined) {
      payroll.remarks = String(remarks).trim();
    }

    await payroll.save();

    return res.status(200).json({
      success: true,
      message: "Payroll updated successfully.",
      payroll,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyPayrollSummary = async (req, res, next) => {
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

    const currentYear = new Date().getFullYear();

    const summary = await Payroll.aggregate([
      {
        $match: {
          employee: employee._id,
          year: currentYear,
        },
      },
      {
        $group: {
          _id: null,

          totalRecords: {
            $sum: 1,
          },

          totalBasicSalary: {
            $sum: "$basicSalary",
          },

          totalAllowances: {
            $sum: "$allowances",
          },

          totalDeductions: {
            $sum: "$deductions",
          },

          totalNetSalary: {
            $sum: "$netSalary",
          },

          draft: {
            $sum: {
              $cond: [{ $eq: ["$status", "draft"] }, 1, 0],
            },
          },

          processed: {
            $sum: {
              $cond: [{ $eq: ["$status", "processed"] }, 1, 0],
            },
          },

          paid: {
            $sum: {
              $cond: [{ $eq: ["$status", "paid"] }, 1, 0],
            },
          },
        },
      },
    ]);

    const result = summary[0] || {
      totalRecords: 0,
      totalBasicSalary: 0,
      totalAllowances: 0,
      totalDeductions: 0,
      totalNetSalary: 0,
      draft: 0,
      processed: 0,
      paid: 0,
    };

    delete result._id;

    return res.status(200).json({
      success: true,
      summary: {
        year: currentYear,
        ...result,
      },
    });
  } catch (error) {
    next(error);
  }
};
