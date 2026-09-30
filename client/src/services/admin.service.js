import api from "@/services/api";

// ==========================================
// SUPER ADMIN — ADMIN MANAGEMENT
// ==========================================

export const getAllAdmins = async () => {
  const response = await api.get("/admins");

  return response.data;
};

export const createAdmin = async (adminData) => {
  const response = await api.post("/admins", adminData);

  return response.data;
};

export const getAdminById = async (adminId) => {
  const response = await api.get(`/admins/${adminId}`);

  return response.data;
};

export const updateAdmin = async (adminId, adminData) => {
  const response = await api.patch(`/admins/${adminId}`, adminData);

  return response.data;
};

export const updateAdminStatus = async (adminId, status) => {
  const response = await api.patch(`/admins/${adminId}/status`, {
    status,
  });

  return response.data;
};

export const updateAdminPassword = async (adminId, newPassword) => {
  const response = await api.patch(`/admins/${adminId}/password`, {
    newPassword,
  });

  return response.data;
};

// ==========================================
// MY PROFILE
// ==========================================

export const getMyAdminProfile = async () => {
  const response = await api.get("/admins/me");

  const user = response.data.user;

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

export const changeMyPassword = async (currentPassword, newPassword) => {
  const response = await api.patch("/admins/me/password", {
    currentPassword,
    newPassword,
  });

  return response.data;
};
