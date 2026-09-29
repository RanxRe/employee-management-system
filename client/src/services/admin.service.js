import api from "./api";

export const getMyAdminProfile = async () => {
  const response = await api.get("/admins/me");

  const user = response.data.user;

  //   return {
  //     id: user._id,
  //     name: user.name,
  //     email: user.email,
  //     role: user.role,
  //     status: user.status,
  //     createdAt: user.createdAt,
  //     updatedAt: user.updatedAt,
  //   };
  return user;
};
