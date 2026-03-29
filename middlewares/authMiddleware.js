import JWT from "jsonwebtoken";
import userModel from "../models/userModel.js";

// Middleware to check if user is signed in using JWT
export const requireSignIn = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).send({
        success: false,
        message: "Token missing",
      });
    }

    const decode = JWT.verify(token, process.env.JWT_SECRET);

    // Fetch user here
    const user = await userModel.findById(decode._id).select("-password");

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    // Attach full user
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).send({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

// Middleware to check if signed in user is an admin
export const isAdmin = (req, res, next) => {
  if (req.user.role !== 1) {
    return res.status(403).send({
      success: false,
      message: "Unauthorized Access",
    });
  }
  next();
};
