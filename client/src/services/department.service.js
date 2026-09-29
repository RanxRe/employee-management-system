import api from "@/services/api";

// Get all departments
export const getAllDepartments = async (params = {}) => {
  const response = await api.get("/departments", {
    params,
  });

  return response.data;
};

// Get department by ID
export const getDepartmentById = async (departmentId) => {
  const response = await api.get(`/departments/${departmentId}`);

  return response.data;
};

// Create department
export const createDepartment = async (departmentData) => {
  const response = await api.post("/departments", departmentData);

  return response.data;
};

// Update department
export const updateDepartment = async (departmentId, departmentData) => {
  const response = await api.patch(`/departments/${departmentId}`, departmentData);

  return response.data;
};

// Update department status
export const updateDepartmentStatus = async (departmentId, status) => {
  const response = await api.patch(`/departments/${departmentId}/status`, {
    status,
  });

  return response.data;
};
