import api from "@/services/api";

// ==========================================
// ADMIN / SUPER ADMIN
// ==========================================

export const createLeaveBalance = async (balanceData) => {
  const response = await api.post("/leave-balances", balanceData);

  return response.data;
};

export const getAllLeaveBalances = async (params = {}) => {
  const response = await api.get("/leave-balances", {
    params,
  });

  return response.data;
};

// ==========================================
// EMPLOYEE
// ==========================================

export const getMyLeaveBalances = async (params = {}) => {
  const response = await api.get("/leave-balances/my", {
    params,
  });

  return response.data;
};
