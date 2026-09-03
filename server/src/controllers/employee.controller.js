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

// import Employee from "../models/Employee.model.js";
// export const createEmployeeTest = async (req, res, next) => {
//   try {
//     const { user, employeeId, department, designation, joiningDate } = req.body;

//     const employee = new Employee({
//       user,
//       employeeId,
//       department,
//       designation,
//       joiningDate,
//     });

//     await employee.save();

//     return res.status(201).json({
//       success: true,
//       message: "Employee created successfully.",
//       employee,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// export const getEmployeeTest = async (req, res, next) => {
//   try {
//     const employee = await Employee.findById(req.params.id).populate("user", "-password").exec();

//     if (!employee) {
//       return res.status(404).json({
//         success: false,
//         message: "Employee not found.",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       employee,
//     });
//   } catch (error) {
//     next(error);
//   }
// };
