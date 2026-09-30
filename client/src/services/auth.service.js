import api from "./api";
import { jwtDecode } from "jwt-decode";

export const loginUser = async (credentials) => {
  const response = await api.post("/auth/signin", credentials);

  const { token } = response.data;

  const decodedToken = jwtDecode(token);

  return {
    token,
    user: {
      _id: decodedToken.userId,
      role: decodedToken.role,
      name: decodedToken.name,
    },
  };
};
