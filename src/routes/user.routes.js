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

userRoute.post("/user/register", userRegister);
userRoute.post("/user/login", userLogin);
userRoute.post("/user/verify-otp", otpVerification);
userRoute.get("/user/auth-check", authMiddleware, (req, res) =>
  res.status(200).json({ success: true, message: "User Authorised" }),
);
userRoute.get("/user/chat-users", authMiddleware, getAllUsers);
userRoute.post("/user/logout", authMiddleware, logoutUser);

export default userRoute;
