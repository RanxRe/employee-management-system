import api from "@/services/api";

// ==========================================
// ADMIN / SUPER ADMIN
// ==========================================

// Create attendance manually
export const createAttendance = async (attendanceData) => {
  const response = await api.post("/attendances", attendanceData);

  return response.data;
};

// Get all attendance records
export const getAllAttendance = async (params = {}) => {
  const response = await api.get("/attendances", {
    params,
  });

  return response.data;
};

// Get attendance by ID
export const getAttendanceById = async (attendanceId) => {
  const response = await api.get(`/attendances/${attendanceId}`);

  return response.data;
};

// Update attendance
export const updateAttendance = async (attendanceId, attendanceData) => {
  const response = await api.patch(`/attendances/${attendanceId}`, attendanceData);

  return response.data;
};

// ==========================================
// EMPLOYEE
// ==========================================

// Get my attendance history
export const getMyAttendance = async (params = {}) => {
  const response = await api.get("/attendances/my", {
    params,
  });

  return response.data;
};

// Get my attendance summary
export const getMyAttendanceSummary = async () => {
  const response = await api.get("/attendances/my/summary");

  return response.data;
};

// Employee check-in
export const checkIn = async (attendanceData) => {
  const formData = new FormData();

  Object.entries(attendanceData).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });

  const response = await api.post("/attendances/check-in", formData);

  return response.data;
};

// Employee check-out
export const checkOut = async (checkoutData = {}) => {
  const response = await api.patch("/attendances/check-out", checkoutData);

  return response.data;
};
