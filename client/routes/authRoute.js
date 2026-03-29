import express from "express";
import {
  registerController,
  loginController,
  forgotPasswordController,
  authController,
} from "../controllers/authController.js";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
import userModel from "../models/userModel.js";

//router object
const router = express.Router();

//routing
//REGISTER || POST
router.post("/register", registerController);

//LOGIN || POST
router.post("/login", loginController);

//Forgot password || POST
router.post("/forgot-password", forgotPasswordController);

//protected user route auth
router.get("/user-auth", requireSignIn, authController);

//protected Admin route auth
router.get("/admin-auth", requireSignIn, isAdmin, authController);

//make a user as an Admin
router.put("/make-admin/:id", requireSignIn, isAdmin, async (req, res) => {
  await userModel.findByIdAndUpdate(req.params.id, { role: 1 });
  res.send("User promoted to admin");
});

export default router;
