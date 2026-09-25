import mongoose from "mongoose";
import Employee from "../models/Employee.model.js";
import Attendance from "../models/Attendence.model.js";
import cloudinary from "../config/cloudinary.js";
import { calculateDistance } from "../utils/distance.js";
import { ENV } from "../utils/env.js";

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

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee profile not found.",
      });
    }

    if (employee.employmentStatus !== "active") {
      return res.status(403).json({
        success: false,
        message: "Your employment status does not allow attendance marking.",
      });
    }

    const rawLatitude = req.body.latitude;
    const rawLongitude = req.body.longitude;
    const rawAccuracy = req.body.accuracy;

    // --------------------------------
    // 1. Check GPS fields exist
    // --------------------------------

    if (rawLatitude === undefined || rawLongitude === undefined) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required.",
      });
    }

    if (rawAccuracy === undefined) {
      return res.status(400).json({
        success: false,
        message: "GPS accuracy is required.",
      });
    }

    // --------------------------------
    // 2. Convert multipart/form-data values
    // --------------------------------

    const latitude = Number(rawLatitude);
    const longitude = Number(rawLongitude);
    const accuracy = Number(rawAccuracy);

    // --------------------------------
    // 3. Validate GPS numbers
    // --------------------------------

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude must be valid numbers.",
      });
    }

    if (!Number.isFinite(accuracy) || accuracy <= 0) {
      return res.status(400).json({
        success: false,
        message: "GPS accuracy must be a positive number.",
      });
    }

    // --------------------------------
    // 4. Validate coordinate ranges
    // --------------------------------

    if (latitude < -90 || latitude > 90) {
      return res.status(400).json({
        success: false,
        message: "Invalid latitude.",
      });
    }

    if (longitude < -180 || longitude > 180) {
      return res.status(400).json({
        success: false,
        message: "Invalid longitude.",
      });
    }

    // --------------------------------
    // 5. Validate GPS accuracy limit
    // --------------------------------

    if (accuracy > ENV.MAX_GPS_ACCURACY_METERS) {
      return res.status(403).json({
        success: false,
        message: "GPS accuracy is too low for attendance verification.",
        accuracy,
        maximumAllowedAccuracy: ENV.MAX_GPS_ACCURACY_METERS,
      });
    }

    // --------------------------------
    // 3. Validate selfie
    // --------------------------------

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Selfie image is required for check-in.",
      });
    }

    // --------------------------------
    // 4. Check geofence
    // --------------------------------

    const distanceFromOffice = calculateDistance(
      ENV.OFFICE_LATITUDE,
      ENV.OFFICE_LONGITUDE,
      latitude,
      longitude,
    );

    if (distanceFromOffice > ENV.OFFICE_RADIUS_METERS) {
      return res.status(403).json({
        success: false,
        message: "You are outside the allowed office location.",
        distanceFromOffice: Math.round(distanceFromOffice),
        allowedRadius: ENV.OFFICE_RADIUS_METERS,
      });
    }

    // --------------------------------
    // 5. Check today's attendance
    // --------------------------------

    const now = new Date();

    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

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

    // --------------------------------
    // 6. Upload selfie to Cloudinary
    // --------------------------------

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "ems/attendance/selfies",
          resource_type: "image",
        },
        (error, result) => {
          if (error) {
            console.log("========== CLOUDINARY ERROR ==========");
            console.log("message:", error.message);
            console.log("http_code:", error.http_code);
            console.log("name:", error.name);
            console.log("error object:", error);
            reject(error);
          } else {
            resolve(result);
          }
        },
      );

      stream.end(req.file.buffer);
    });

    // --------------------------------
    // 7. Create attendance
    // --------------------------------

    const attendance = await Attendance.create({
      employee: employee._id,

      date: now,

      checkIn: now,

      status: "present",

      location: {
        latitude,
        longitude,
        accuracy,
        distanceFromOffice: Math.round(distanceFromOffice * 100) / 100,
        verified: true,
      },

      selfie: {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        capturedAt: now,
        verified: false,
      },
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

    if (employee.employmentStatus !== "active") {
      return res.status(403).json({
        success: false,
        message: "Your employment status does not allow attendance marking.",
      });
    }

    // -----------------------------
    // 1. Get GPS data
    // -----------------------------

    const rawLatitude = req.body.latitude;
    const rawLongitude = req.body.longitude;
    const rawAccuracy = req.body.accuracy;

    if (rawLatitude === undefined || rawLongitude === undefined) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required.",
      });
    }

    if (rawAccuracy === undefined) {
      return res.status(400).json({
        success: false,
        message: "GPS accuracy is required.",
      });
    }

    const latitude = Number(rawLatitude);
    const longitude = Number(rawLongitude);
    const accuracy = Number(rawAccuracy);

    // -----------------------------
    // 2. Validate GPS values
    // -----------------------------

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude must be valid numbers.",
      });
    }

    if (!Number.isFinite(accuracy) || accuracy <= 0) {
      return res.status(400).json({
        success: false,
        message: "GPS accuracy must be a positive number.",
      });
    }

    if (latitude < -90 || latitude > 90) {
      return res.status(400).json({
        success: false,
        message: "Invalid latitude.",
      });
    }

    if (longitude < -180 || longitude > 180) {
      return res.status(400).json({
        success: false,
        message: "Invalid longitude.",
      });
    }

    // -----------------------------
    // 3. Validate GPS accuracy
    // -----------------------------

    if (accuracy > ENV.MAX_GPS_ACCURACY_METERS) {
      return res.status(403).json({
        success: false,
        message: "GPS accuracy is too low for attendance verification.",
        accuracy,
        maximumAllowedAccuracy: ENV.MAX_GPS_ACCURACY_METERS,
      });
    }

    // -----------------------------
    // 4. Calculate distance
    // -----------------------------

    const distanceFromOffice = calculateDistance(
      ENV.OFFICE_LATITUDE,
      ENV.OFFICE_LONGITUDE,
      latitude,
      longitude,
    );

    // -----------------------------
    // 5. Geofence validation
    // -----------------------------

    if (distanceFromOffice > ENV.OFFICE_RADIUS_METERS) {
      return res.status(403).json({
        success: false,
        message: "You are outside the allowed office location.",
        distanceFromOffice: Math.round(distanceFromOffice),
        allowedRadius: ENV.OFFICE_RADIUS_METERS,
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

    // -----------------------------
    // 5. Save checkout + GPS data
    // -----------------------------
    attendance.checkOut = now;

    attendance.checkOutLocation = {
      latitude,
      longitude,
      accuracy,
      distanceFromOffice: Math.round(distanceFromOffice * 100) / 100,
      verified: true,
    };

    await attendance.save();

    // -----------------------------
    // 9. Response
    // -----------------------------

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

    const { from, to } = req.query;

    const filter = {
      employee: employee._id,
    };

    // --------------------------------
    // From date
    // --------------------------------

    if (from) {
      const fromDate = new Date(from);

      if (Number.isNaN(fromDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid from date.",
        });
      }

      fromDate.setHours(0, 0, 0, 0);

      filter.date = {
        $gte: fromDate,
      };
    }

    // --------------------------------
    // To date
    // --------------------------------

    if (to) {
      const toDate = new Date(to);

      if (Number.isNaN(toDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid to date.",
        });
      }

      toDate.setHours(23, 59, 59, 999);

      filter.date = {
        ...(filter.date || {}),
        $lte: toDate,
      };
    }

    // --------------------------------
    // Validate date range
    // --------------------------------

    if (filter.date?.$gte && filter.date?.$lte) {
      if (filter.date.$gte > filter.date.$lte) {
        return res.status(400).json({
          success: false,
          message: "From date cannot be after to date.",
        });
      }
    }

    const attendance = await Attendance.find(filter).sort({ date: -1 }).exec();

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

export const getMyAttendanceSummary = async (req, res, next) => {
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

    const attendance = await Attendance.find({
      employee: employee._id,
    }).select("status checkIn checkOut");

    if (attendance.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No attendance record found.",
      });
    }

    let present = 0;
    let absent = 0;
    let halfDay = 0;
    let leave = 0;
    let totalHoursWorked = 0;

    for (const record of attendance) {
      if (record.status === "present") {
        present++;
      } else if (record.status === "absent") {
        absent++;
      } else if (record.status === "half_day") {
        halfDay++;
      } else if (record.status === "leave") {
        leave++;
      }

      if (record.checkIn && record.checkOut) {
        const millisecondsWorked =
          new Date(record.checkOut).getTime() - new Date(record.checkIn).getTime();

        if (millisecondsWorked > 0) {
          totalHoursWorked += millisecondsWorked / (1000 * 60 * 60);
        }
      }
    }

    return res.status(200).json({
      success: true,
      summary: {
        totalRecords: attendance.length,
        present,
        absent,
        halfDay,
        leave,
        totalHoursWorked: Math.round(totalHoursWorked * 100) / 100,
      },
    });
  } catch (error) {
    next(error);
  }
};
