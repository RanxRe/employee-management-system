import api from "@/services/api";

// ==========================================
// ADMIN / SUPER ADMIN
// ==========================================

export const getAllLeaves = async () => {
  const response = await api.get("/leaves");

  return response.data;
};

export const getLeaveById = async (leaveId) => {
  const response = await api.get(`/leaves/${leaveId}`);

  return response.data;
};

export const updateLeaveStatus = async (leaveId, status, reviewComment = "") => {
  const response = await api.patch(`/leaves/${leaveId}/status`, {
    status,
    reviewComment,
  });

  return response.data;
};

// ==========================================
// EMPLOYEE
// ==========================================

export const createLeave = async (leaveData) => {
  const response = await api.post("/leaves", leaveData);

  return response.data;
};

export const getMyLeaves = async () => {
  const response = await api.get("/leaves/my");

  return response.data;
};

export const getMyLeaveSummary = async () => {
  const response = await api.get("/leaves/my/summary");

  return response.data;
};

export const updateMyLeave = async (leaveId, leaveData) => {
  const response = await api.patch(`/leaves/${leaveId}`, leaveData);

  return response.data;
};
