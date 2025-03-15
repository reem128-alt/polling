
const errorHandler = require("../middleware/error");

const login = async (req, res, next) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return next(errorHandler(400, "Please enter both username and password"));
  }
  
  try {
    // Check for hardcoded credentials
    if (username === "admin" && password === "admin") {
      
      return res.status(200).json({
        success: true,
        message: "Logged in successfully",
        user: {
          username: "admin",
          admin: true
        }
      });
    } else {
      return next(errorHandler(401, "Invalid credentials"));
    }
  } catch (err) {
    next(err);
  }
};

module.exports = { login };
