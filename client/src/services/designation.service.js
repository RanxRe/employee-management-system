import api from "@/services/api";

// Get all designations
export const getAllDesignations = async (params = {}) => {
  const response = await api.get("/designations", {
    params,
  });

  return response.data;
};

// Get designation by ID
export const getDesignationById = async (designationId) => {
  const response = await api.get(`/designations/${designationId}`);

  return response.data;
};

// Create designation
export const createDesignation = async (designationData) => {
  const response = await api.post("/designations", designationData);

  return response.data;
};

// Update designation
export const updateDesignation = async (designationId, designationData) => {
  const response = await api.patch(`/designations/${designationId}`, designationData);

  return response.data;
};

// Update designation status
export const updateDesignationStatus = async (designationId, status) => {
  const response = await api.patch(`/designations/${designationId}/status`, {
    status,
  });

  return response.data;
};
