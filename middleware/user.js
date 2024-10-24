const JWT = require("jsonwebtoken");
const { JWT_USER_PASSWORD } = require("../config");

function userMiddleware(req, res, next) {
  const token = req.headers.token;

  if (!token) {
    return res.status(401).json({
      message: "Authorization token is missing",
    });
  }

  try {
    const decoded = JWT.verify(token, JWT_USER_PASSWORD);

    req.userId = decoded._id;

    next();
  } catch (err) {
    return res.status(401).json({
      message: "Invalid or expired token",
      error: err.message,
    });
  }

  next();
}

module.exports = userMiddleware;
