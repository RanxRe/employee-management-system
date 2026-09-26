import api from "./api";

export const loginUser = async (credentials) => {
  const response = await api.post("/auth/signin", credentials);

  return response.data;
};
