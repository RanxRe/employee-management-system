import mongoose from "mongoose";
import Employee from "../models/Employee.model.js";
import Attendance from "../models/Attendence.model.js";

const getStartOfDay = (date) => {
  const day = new Date(date);

  day.setHours(0, 0, 0, 0);

  return day;
};

export const createAttendance = async (req, res, next) => {
  try {
    const { employee, date, checkIn, checkOut, status, remarks } = req.body;

    if (!employee || !date) {
      return res.status(400).json({
        success: false,
        message: "Employee and date are required.",
      });
    }

    //validate employee ID
    if (!mongoose.Types.ObjectId.isValid(employee)) {
      return res.status(400).json({
        success: false,
        message: "invalid employee ID.",
      });
    }

    const existingEmployee = await Employee.findById(employee);
    if (!existingEmployee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }

    //check duplicate attendance
    const attendanceDate = getStartOfDay(date);
    const existingAttendance = await Attendance.findOne({ employee, date: attendanceDate });
    if (existingAttendance) {
      return res.status(409).json({
        success: false,
        message: "Attendance already exists for this employee on this date.",
      });
    }

    //Create attendance
    const attendance = await Attendance.create({
      employee,
      date: getStartOfDay(date),
      checkIn,
      checkOut,
      status,
      remarks,
    });

    return res.status(201).json({
      success: true,
      message: "Attendance created successfully",
      attendance,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllAttendance = async (req, res, next) => {
  try {
    const { employee, date, from, to } = req.query;
    const filter = {};
    if (employee) {
      if (!mongoose.Types.ObjectId.isValid(employee))
        return res.status(400).json({
          success: false,
          message: "Invalid employee ID",
        });
      filter.employee = employee;
    }

    if (date) {
      const startOfDay = new Date(date);
      const endOfDay = new Date(date);

      if (isNaN(startOfDay.getTime()) || isNaN(endOfDay.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid date.",
        });
      }

      startOfDay.setHours(0, 0, 0, 0);
      endOfDay.setHours(23, 59, 59, 999);

      filter.date = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
    }

    if (from || to) {
      const startDate = from ? new Date(from) : null;
      const endDate = to ? new Date(to) : null;

      if ((startDate && isNaN(startDate.getTime())) || (endDate && isNaN(endDate.getTime()))) {
        return res.status(400).json({
          success: false,
          message: "Invalid date range.",
        });
      }

      if (startDate) {
        startDate.setHours(0, 0, 0, 0);
      }

      if (endDate) {
        endDate.setHours(23, 59, 59, 999);
      }

      filter.date = {};

      if (startDate) {
        filter.date.$gte = startDate;
      }

      if (endDate) {
        filter.date.$lte = endDate;
      }
    }

    const attendance = await Attendance.find(filter)
      .populate({ path: "employee", populate: { path: "user", select: "-password" } })
      .sort({ date: -1 })
      .exec();

    if (attendance.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No attendance records found.",
      });
    }

    return res.status(200).json({
      success: true,
      count: attendance.length,
      attendance,
    });
  } catch (error) {
    next(error);
  }
};

export const getAttendanceById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 1. Validate attendance ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid attendance ID.",
      });
    }

    // 2. Find attendance
    const attendance = await Attendance.findById(id)
      .populate({
        path: "employee",
        populate: {
          path: "user",
          select: "-password",
        },
      })
      .exec();

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found.",
      });
    }

    return res.status(200).json({
      success: true,
      attendance,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAttendance = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { date, checkIn, checkOut, status, remarks } = req.body;

    // 1. Validate attendance ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid attendance ID.",
      });
    }

    // 2. Find attendance
    const attendance = await Attendance.findById(id);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found.",
      });
    }

    // 3. Update fields only if provided
    if (date !== undefined) {
      attendance.date = date;
    }

    if (checkIn !== undefined) {
      attendance.checkIn = checkIn;
    }

    if (checkOut !== undefined) {
      attendance.checkOut = checkOut;
    }

    if (status !== undefined) {
      attendance.status = status;
    }

    if (remarks !== undefined) {
      attendance.remarks = remarks.trim();
    }

    // 4. Save
    await attendance.save();

    return res.status(200).json({
      success: true,
      message: "Attendance updated successfully.",
      attendance,
    });
  } catch (error) {
    next(error);
  }
};

export const checkIn = async (req, res, next) => {
  try {
    // 1. Find employee using logged-in user's ID
    const employee = await Employee.findOne({
      user: req.user._id,
    });

    if (employee.employmentStatus !== "active") {
      return res.status(403).json({
        success: false,
        message: "Your employment status does not allow attendance marking.",
      });
    }

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee profile not found.",
      });
    }

    // 2. Get today's date
    const now = new Date();

    const startOfDay = getStartOfDay(now);

    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    // 3. Check today's attendance
    const existingAttendance = await Attendance.findOne({
      employee: employee._id,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    if (existingAttendance) {
      return res.status(409).json({
        success: false,
        message: "Attendance already marked for today.",
      });
    }

    // 4. Create attendance
    const attendance = await Attendance.create({
      employee: employee._id,
      date: startOfDay,
      checkIn: now,
      status: "present",
    });

    return res.status(201).json({
      success: true,
      message: "Check-in successful.",
      attendance,
    });
  } catch (error) {
    next(error);
  }
};

export const checkOut = async (req, res, next) => {
  try {
    // 1. Find employee using logged-in user's ID
    const employee = await Employee.findOne({
      user: req.user._id,
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee profile not found.",
      });
    }

    // 2. Find today's attendance
    const now = new Date();

    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const attendance = await Attendance.findOne({
      employee: employee._id,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    // 3. No check-in
    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "No attendance found for today. Please check in first.",
      });
    }

    // 4. Already checked out
    if (attendance.checkOut) {
      return res.status(409).json({
        success: false,
        message: "You have already checked out today.",
      });
    }

    // 5. Check out
    attendance.checkOut = now;

    await attendance.save();

    return res.status(200).json({
      success: true,
      message: "Check-out successful.",
      attendance,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyAttendance = async (req, res, next) => {
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

    const attendance = await Attendance.find({ employee: employee._id }).sort({ date: -1 }).exec();
    if (attendance.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No attendance record found.",
      });
    }

    return res.status(200).json({
      success: true,
      count: attendance.length,
      attendance,
    });
  } catch (error) {
    next(error);
  }
};
