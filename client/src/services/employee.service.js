import api from "@/services/api";

// ==========================================
// ADMIN / SUPER ADMIN
// Employee Management
// ==========================================

export const createEmployee = async (employeeData) => {
  const response = await api.post("/employees", employeeData);

  return response.data;
};

export const getAllEmployees = async (params = {}) => {
  const response = await api.get("/employees", {
    params,
  });

  return response.data;
};

export const getEmployeeById = async (employeeId) => {
  const response = await api.get(`/employees/${employeeId}`);

  return response.data;
};

export const updateEmployee = async (employeeId, employeeData) => {
  const response = await api.patch(`/employees/${employeeId}`, employeeData);

  return response.data;
};

export const updateEmploymentStatus = async (employeeId, status) => {
  const response = await api.patch(`/employees/${employeeId}/status`, {
    employmentStatus: status,
  });

  return response.data;
};

export const updateAccountStatus = async (employeeId, status) => {
  const response = await api.patch(`/employees/${employeeId}/account-status`, {
    status,
  });

  return response.data;
};

// ==========================================
// EMPLOYEE SELF-SERVICE
// ==========================================

export const getMyEmployeeProfile = async () => {
  const response = await api.get("/employees/me");

  return response.data;
};

export const updateMyEmployeeProfile = async (profileData) => {
  const response = await api.patch("/employees/me", profileData);

  return response.data;
};

export const changeMyPassword = async (passwordData) => {
  const response = await api.patch("/employees/me/password", passwordData);

  return response.data;
};

export const getMyEmployeeDashboard = async () => {
  const response = await api.get("/employees/me/dashboard");

  return response.data;
};
