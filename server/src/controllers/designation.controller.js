import mongoose from "mongoose";
import Designation from "../models/Designation.model.js";
import Employee from "../models/Employee.model.js";

export const createDesignation = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(404).json({
        success: false,
        message: "Designation not found.",
      });
    }

    const existingDesignation = await Designation.findOne({ name });
    if (existingDesignation) {
      return res.status(409).json({
        success: false,
        message: "Designation already exists.",
      });
    }

    const designation = await Designation.create({ name });

    return res.status(201).json({
      success: true,
      message: "Designation created successfully.",
      designation,
    });
  } catch (error) {
    error(next);
  }
};

export const getAllDesignations = async (req, res, next) => {
  try {
    const designations = await Designation.find().sort({ name: 1 }).exec();
    if (designations.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No desgination found.",
      });
    }

    return res.status(200).json({
      success: true,
      count: designations.length,
      designations,
    });
  } catch (error) {
    error(next);
  }
};

export const getDesignationById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 1. Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid designation ID.",
      });
    }

    // 2. Find designation
    const designation = await Designation.findById(id);

    if (!designation) {
      return res.status(404).json({
        success: false,
        message: "Designation not found.",
      });
    }

    // 3. Return designation
    return res.status(200).json({
      success: true,
      designation,
    });
  } catch (error) {
    next(error);
  }
};

export const updateDesignation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const designation = await Designation.findById(id);

    if (!designation) {
      return res.status(404).json({
        success: false,
        message: "Designation not found.",
      });
    }

    if (name !== undefined) {
      designation.name = name.trim();
    }

    await designation.save();

    return res.status(200).json({
      success: true,
      message: "Designation updated successfully.",
      designation,
    });
  } catch (error) {
    next(error);
  }
};

export const updateDesignationStatus = async (req, res, next) => {
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

    const designation = await Designation.findById(id);

    if (!designation) {
      return res.status(404).json({
        success: false,
        message: "Designation not found.",
      });
    }

    if (designation.status === status) {
      return res.status(400).json({
        success: false,
        message: `Designation already set to ${status}`,
      });
    }

    designation.status = status;
    await designation.save();

    return res.status(200).json({
      message: `Designation set to ${status}.`,
      designation,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDesignation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const designation = await Designation.findById(id);
    if (!designation) {
      return res.status(404).json({
        success: false,
        message: "Designation not found.",
      });
    }

    const employee = await Employee.findOne({
      designation: designation._id,
    });

    if (employee) {
      return res.status(409).json({
        success: false,
        message: "Cannot delete already assigned designation.",
      });
    }

    await Designation.findByIdAndDelete(id);
    return res.status(200).json({
      success: true,
      message: "Designation deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};
