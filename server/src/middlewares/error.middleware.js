export const errorMiddleware = (err, req, res, next) => {
  console.error(err);

  // MongoDB duplicate key error
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "Email already exists.",
    });
  }

  // JWT token expired
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token has expired. Please login again.",
    });
  }

  // JWT token invalid
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid authentication token.",
    });
  }

  // JWT token not active yet
  if (err.name === "NotBeforeError") {
    return res.status(401).json({
      success: false,
      message: "Authentication token is not active yet.",
    });
  }

  // Unknown/unhandled error
  res.status(500).json({
    success: false,
    message: "Internal server error.",
  });
};
