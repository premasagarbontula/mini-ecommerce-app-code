import { comparePassword, hashPassword } from "../helpers/authHelper.js";
import userModel from "../models/userModel.js";
import JWT from "jsonwebtoken";

export const registerController = async (req, res) => {
  try {
    const { name, email, password, phone, address, answer } = req.body;

    //Missing Credentials
    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Name is required" });
    }
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }
    if (!password) {
      return res
        .status(400)
        .json({ success: false, message: "Password is required" });
    }
    if (!phone) {
      return res
        .status(400)
        .json({ success: false, message: "Phone number is required" });
    }
    if (!address) {
      return res
        .status(400)
        .json({ success: false, message: "Address is required" });
    }
    if (!answer) {
      return res
        .status(400)
        .json({ success: false, message: "Answer is required" });
    }

    // user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already registered. Please login.",
      });
    }

    // Create new user
    const hashedPassword = await hashPassword(password);

    const user = await new userModel({
      name,
      email,
      phone,
      address,
      password: hashedPassword,
      answer,
    }).save();

    // successful registration
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Error in registration",
      error: error.message,
    });
  }
};

export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Missing credentials
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and Password are required",
      });
    }

    // User not found
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Password mismatch
    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate JWT token
    const token = JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Successful login
    // Send token in cookie
    res
      .cookie("token", token, {
        httpOnly: true, // prevents JS access (security)
        secure: false, // true in production (HTTPS)
        sameSite: "Strict", // CSRF protection
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .status(200)
      .json({
        success: true,
        message: "Login successful",
        user: {
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          role: user.role,
        },
      });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error in login",
      error: error.message,
    });
  }
};

export const forgotPasswordController = async (req, res) => {
  try {
    const { email, answer, newPassword } = req.body;

    // Validate required fields
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }
    if (!answer) {
      return res
        .status(400)
        .json({ success: false, message: "Answer is required" });
    }
    if (!newPassword) {
      return res
        .status(400)
        .json({ success: false, message: "New Password is required" });
    }

    // Find user with matching email and security answer
    const user = await userModel.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Email not found" });
    }

    if (user.answer !== answer) {
      return res
        .status(400)
        .json({ success: false, message: "Incorrect answer" });
    }

    const isSamePassword = await comparePassword(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "New password cannot be the same as the old password",
      });
    }
    // Hash new password securely
    const hashed = await hashPassword(newPassword);

    // Update password in DB
    await userModel.findByIdAndUpdate(user._id, { password: hashed });

    // Send success response
    return res.status(200).json({
      success: true,
      message: "Password Reset Successful",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);

    // Internal Server Error for unexpected issues
    return res.status(500).json({
      success: false,
      message: "Something went wrong on the server",
      error: error.message,
    });
  }
};

export const authController = (req, res) => {
  res.status(200).send({
    ok: true,
    user: req.user,
  });
};
