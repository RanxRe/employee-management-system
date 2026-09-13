import mongoose from "mongoose";
import bcrypt from "bcrypt";
import Employee from "../models/Employee.model.js";
import User from "../models/User.model.js";

const allowedEmploymentStatuses = ["pending", "active", "rejected", "terminated", "resigned"];

export const createEmployee = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    const { name, email, password, employeeId, department, designation, joiningDate } = req.body;

    // 1. Validate required fields
    if (
      !name ||
      !email ||
      !password ||
      !employeeId ||
      !department ||
      !designation ||
      !joiningDate
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields.",
      });
    }

    // 2. Validate password
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password length must be 8 or more.",
      });
    }

    // 3. Check whether email already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "A user with this email already exists.",
      });
    }

    // 4. Check whether employeeId already exists
    const existingEmployee = await Employee.findOne({ employeeId });

    if (existingEmployee) {
      return res.status(409).json({
        success: false,
        message: "Employee ID already exists.",
      });
    }

    // 5. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 6. Start transaction
    session.startTransaction();

    // 7. Create User
    const [user] = await User.create(
      [
        {
          name,
          email,
          password: hashedPassword,
          role: "employee",
          status: "active",
        },
      ],
      { session },
    );

    // 8. Create Employee
    const [employee] = await Employee.create(
      [
        {
          user: user._id,
          employeeId,
          department,
          designation,
          joiningDate,
          employmentStatus: "pending",
        },
      ],
      { session },
    );

    // 9. Commit transaction
    await session.commitTransaction();

    return res.status(201).json({
      success: true,
      message: "Employee created successfully.",
      employee,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    await session.endSession();
  }
};

export const getAllEmployee = async (req, res, next) => {
  try {
    const employees = await Employee.find().populate("user", "-password").exec();
    if (!employees.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }
    return res.status(200).json({
      success: true,
      employees,
    });
  } catch (error) {
    next(error);
  }
};

export const getEmployeeById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findById(id).populate("user", "-password").exec();

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }
    return res.status(200).json({
      success: true,
      employee,
    });
  } catch (error) {
    next(error);
  }
};

export const updateEmploymentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { employmentStatus } = req.body;

    // 1. Validate employee ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid employee ID.",
      });
    }

    // 2. Validate status is provided
    if (!employmentStatus) {
      return res.status(400).json({
        success: false,
        message: "Employment status is required.",
      });
    }

    // 3. Validate status value
    if (!allowedEmploymentStatuses.includes(employmentStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid employment status.",
      });
    }

    // 4. Find employee
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }

    // 5. Don't allow updating to the same status
    if (employee.employmentStatus === employmentStatus) {
      return res.status(400).json({
        success: false,
        message: `Employee is already ${employmentStatus}.`,
      });
    }

    // 6. Define allowed transitions
    const allowedTransitions = {
      pending: ["active", "rejected"],
      active: ["terminated", "resigned"],
      rejected: [],
      terminated: [],
      resigned: [],
    };

    const currentStatus = employee.employmentStatus;

    if (!allowedTransitions[currentStatus].includes(employmentStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change employment status from ${currentStatus} to ${employmentStatus}.`,
      });
    }

    // 7. Update status
    employee.employmentStatus = employmentStatus;
    await employee.save();

    return res.status(200).json({
      success: true,
      message: "Employment status updated.",
      employee,
    });
  } catch (error) {
    next(error);
  }
};

export const updateEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { department, designation, joiningDate } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid employee ID.",
      });
    }
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }

    if (department !== undefined) {
      employee.department = department;
    }
    if (designation !== undefined) {
      employee.designation = designation;
    }
    if (joiningDate !== undefined) {
      employee.joiningDate = joiningDate;
    }

    await employee.save();
    return res.status(200).json({
      success: true,
      message: "Employee updated successfully.",
      employee,
    });
  } catch (error) {
    next(error);
  }
};
