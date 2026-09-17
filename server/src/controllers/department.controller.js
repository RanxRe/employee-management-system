import mongoose from "mongoose";
import Department from "../models/Department.model.js";

export const createDepartment = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    //1. Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Department name is required.",
      });
    }

    //2. Check duplicate departments
    const existingDepartment = await Department.findOne({ name });
    if (existingDepartment) {
      return res.status(409).json({
        success: false,
        message: "Department already exists.",
      });
    }

    //3. Create department
    const department = await Department.create({
      name,
      description,
    });

    return res.status(201).json({
      success: true,
      message: "Department created successfully.",
      department,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find().sort({ name: 1 }).exec();

    if (departments.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No department found.",
      });
    }

    return res.status(200).json({
      success: true,
      count: departments.length,
      departments,
    });
  } catch (error) {
    next(error);
  }
};

export const getDepartmentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 1. Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid department ID.",
      });
    }

    // 2. Find department
    const department = await Department.findById(id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found.",
      });
    }

    // 3. Return department
    return res.status(200).json({
      success: true,
      department,
    });
  } catch (error) {
    next(error);
  }
};

export const updateDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const department = await Department.findById(id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found.",
      });
    }

    if (name !== undefined) {
      department.name = name.trim();
    }
    if (description !== undefined) {
      department.description = description.trim();
    }

    await department.save();

    return res.status(200).json({
      success: true,
      message: "Department updated successfully.",
      department,
    });
  } catch (error) {
    next(error);
  }
};

export const updateDepartmentStatus = async (req, res, next) => {
  try {
    const allowedStatuses = ["active", "inactive"];
    const { id } = req.params;
    const { status } = req.body;

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Status must be active or inactive.",
      });
    }

    const department = await Department.findById(id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found.",
      });
    }

    if (department.status === status) {
      return res.status(400).json({
        success: false,
        message: `Department already set to ${status}`,
      });
    }

    department.status = status;
    await department.save();

    return res.status(200).json({
      message: `Department set to ${status}.`,
      department,
    });
  } catch (error) {
    next(error);
  }
};
