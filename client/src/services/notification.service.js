import api from "@/services/api";

// ==========================================
// EMPLOYEE
// ==========================================

export const getMyNotifications = async () => {
  const response = await api.get("/notifications/my");
  return response.data;
};

export const getUnreadNotifications = async () => {
  const response = await api.get("/notifications/unread");
  return response.data;
};

export const getMyNotificationSummary = async () => {
  const response = await api.get("/notifications/my/summary");
  return response.data;
};

export const markNotificationAsRead = async (notificationId) => {
  const response = await api.patch(`/notifications/${notificationId}/read`);
  return response.data;
};
