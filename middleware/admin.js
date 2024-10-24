const JWT = require("jsonwebtoken");
const { JWT_ADMIN_PASSWORD } = require("../config");

function adminMiddleware(req, res, next) {
  const token = req.headers.token;

  if (!token) {
    return res.status(401).json({
      message: "Authorization token is missing",
    });
  }

  try {
    const decoded = JWT.verify(token, JWT_ADMIN_PASSWORD);
    req.adminId = decoded._id;
    next();
  } catch (err) {
    return res.status(401).json({
      message: "Invalid or expired token",
      error: err.message,
    });
  }
  next();
}

module.exports = adminMiddleware;
