import api from "@/services/api";

export const getAllDesignations = async (params = {}) => {
  const response = await api.get("/designations", {
    params,
  });

  return response.data;
};
