import api from "@/services/api";

// ==========================================
// ADMIN / SUPER ADMIN
// ==========================================

export const createPayroll = async (payrollData) => {
  const response = await api.post("/payroll", payrollData);

  return response.data;
};

export const getAllPayroll = async (params = {}) => {
  const response = await api.get("/payroll", {
    params,
  });

  return response.data;
};

export const getPayrollById = async (payrollId) => {
  const response = await api.get(`/payroll/${payrollId}`);

  return response.data;
};

export const updatePayroll = async (payrollId, payrollData) => {
  const response = await api.patch(`/payroll/${payrollId}`, payrollData);

  return response.data;
};

export const updatePayrollStatus = async (payrollId, status) => {
  const response = await api.patch(`/payroll/${payrollId}/status`, {
    status,
  });

  return response.data;
};

// ==========================================
// EMPLOYEE
// ==========================================

export const getMyPayroll = async (params = {}) => {
  const response = await api.get("/payroll/my", {
    params,
  });

  return response.data;
};

export const getMyPayrollSummary = async () => {
  const response = await api.get("/payroll/my/summary");

  return response.data;
};
