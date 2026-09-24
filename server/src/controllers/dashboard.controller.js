import Employee from "../models/Employee.model.js";
import Attendance from "../models/Attendence.model.js";
import Leave from "../models/Leave.model.js";
import Payroll from "../models/Payroll.model.js";

export const getDashboardStats = async (req, res, next) => {
  try {
    // -------------------------
    // Employee statistics
    // -------------------------

    const totalEmployees = await Employee.countDocuments();

    const activeEmployees = await Employee.countDocuments({
      employmentStatus: "active",
    });

    const pendingEmployees = await Employee.countDocuments({
      employmentStatus: "pending",
    });

    const terminatedEmployees = await Employee.countDocuments({
      employmentStatus: "terminated",
    });

    const resignedEmployees = await Employee.countDocuments({
      employmentStatus: "resigned",
    });

    // -------------------------
    // Leave statistics
    // -------------------------

    const pendingLeaves = await Leave.countDocuments({
      status: "pending",
    });

    const approvedLeaves = await Leave.countDocuments({
      status: "approved",
    });

    const rejectedLeaves = await Leave.countDocuments({
      status: "rejected",
    });

    // -------------------------
    // Payroll statistics
    // -------------------------

    const draftPayrolls = await Payroll.countDocuments({
      status: "draft",
    });

    const processedPayrolls = await Payroll.countDocuments({
      status: "processed",
    });

    const paidPayrolls = await Payroll.countDocuments({
      status: "paid",
    });

    const payrollSummary = await Payroll.aggregate([
      {
        $group: {
          _id: null,
          totalBasicSalary: { $sum: "$basicSalary" },
          totalAllowances: { $sum: "$allowances" },
          totalDeductions: { $sum: "$deductions" },
          totalNetSalary: { $sum: "$netSalary" },
        },
      },
    ]);

    const salarySummary = payrollSummary[0] || {
      totalBasicSalary: 0,
      totalAllowances: 0,
      totalDeductions: 0,
      totalNetSalary: 0,
    };

    // -------------------------
    // Today's attendance
    // -------------------------

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const presentToday = await Attendance.countDocuments({
      date: {
        $gte: startOfToday,
        $lte: endOfToday,
      },
      status: "present",
    });

    const absentToday = await Attendance.countDocuments({
      date: {
        $gte: startOfToday,
        $lte: endOfToday,
      },
      status: "absent",
    });

    const halfDayToday = await Attendance.countDocuments({
      date: {
        $gte: startOfToday,
        $lte: endOfToday,
      },
      status: "half_day",
    });

    const leaveToday = await Attendance.countDocuments({
      date: {
        $gte: startOfToday,
        $lte: endOfToday,
      },
      status: "leave",
    });

    return res.status(200).json({
      success: true,

      employees: {
        total: totalEmployees,
        active: activeEmployees,
        pending: pendingEmployees,
        terminated: terminatedEmployees,
        resigned: resignedEmployees,
      },

      attendance: {
        presentToday,
        absentToday,
        halfDayToday,
        leaveToday,
      },

      leaves: {
        pending: pendingLeaves,
        approved: approvedLeaves,
        rejected: rejectedLeaves,
      },

      payroll: {
        draft: draftPayrolls,
        processed: processedPayrolls,
        paid: paidPayrolls,

        totalBasicSalary: salarySummary.totalBasicSalary,
        totalAllowances: salarySummary.totalAllowances,
        totalDeductions: salarySummary.totalDeductions,
        totalNetSalary: salarySummary.totalNetSalary,
      },
    });
  } catch (error) {
    next(error);
  }
};
