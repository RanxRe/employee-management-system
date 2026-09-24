import mongoose from "mongoose";
import bcrypt from "bcrypt";
import Employee from "../models/Employee.model.js";
import User from "../models/User.model.js";

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
    const employees = await Employee.find()
      .populate("user", "-password")
      .populate("department")
      .populate("designation")
      .exec();
    if (employees.length === 0) {
      return res.status(404).json({
        success: false,
        message: "no employees found.",
      });
    }
    return res.status(200).json({
      success: true,
      count: employees.length,
      employees,
    });
  } catch (error) {
    next(error);
  }
};

export const getEmployeeById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid employee ID.",
      });
    }
    const employee = await Employee.findById(id)
      .populate("user", "-password")
      .populate("department")
      .populate("designation")
      .exec();

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
    const allowedEmploymentStatuses = ["pending", "active", "rejected", "terminated", "resigned"];
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

export const updateAccountStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // 1. Validate Employee ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid employee ID.",
      });
    }

    // 2. Validate status
    const allowedAccountStatuses = ["active", "inactive", "suspended"];

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Account status is required.",
      });
    }

    if (!allowedAccountStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid account status.",
      });
    }

    // 3. Find Employee
    const employee = await Employee.findById(id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }

    // 4. Find the associated User
    const user = await User.findById(employee.user);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Associated user account not found.",
      });
    }

    // 5. Check if status is already the same
    if (user.status === status) {
      return res.status(400).json({
        success: false,
        message: `Account is already ${status}.`,
      });
    }

    // 6. Update User status
    user.status = status;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Account status updated successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        status: user.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMyProfile = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({
      user: req.user._id,
    })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate("department")
      .populate("designation")
      .exec();

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee profile not found.",
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

export const updateMyProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;

    if (name === undefined && email === undefined) {
      return res.status(400).json({
        success: false,
        message: "Name or email is required.",
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

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Name cannot be empty.",
        });
      }

      user.name = name.trim();
    }

    if (email !== undefined) {
      const normalizedEmail = email.toLowerCase().trim();

      if (!normalizedEmail) {
        return res.status(400).json({
          success: false,
          message: "Email cannot be empty.",
        });
      }

      const existingUser = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: req.user._id },
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Email already exists.",
        });
      }

      user.email = normalizedEmail;
    }

    await user.save();

    const updatedEmployee = await Employee.findById(employee._id)
      .populate({
        path: "user",
        select: "-password",
      })
      .populate("department")
      .populate("designation");

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      employee: updatedEmployee,
    });
  } catch (error) {
    next(error);
  }
};

export const changeMyPassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required.",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters long.",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    next(error);
  }
};
