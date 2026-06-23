import { Router } from "express";
import {
  otpVerification,
  userLogin,
  userRegister,
  getAllUsers,
  logoutUser,
} from "../controller/user.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const userRoute = Router();

userRoute.post("/register", userRegister);
userRoute.post("/login", userLogin);
userRoute.post("/verify-otp", otpVerification);
userRoute.get("/auth-check", authMiddleware, (req, res) =>
  res.status(200).json({ success: true, message: "User Authorised" }),
);
userRoute.get("/chat-users", authMiddleware, getAllUsers);
userRoute.post("/logout", authMiddleware, logoutUser);

export default userRoute;
