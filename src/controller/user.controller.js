import { User } from "../model/user.model.js";
import {
  checkPass,
  generateJWT,
  hashedPass,
  sendOtpOnMail,
} from "../utils/helperFunctions.js";

export const userRegister = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Every field is required" });
    }
    const isUserExist = await User.findOne({ email: email.toLowerCase() });

    if (isUserExist && isUserExist.isVerified) {
      return res
        .status(409)
        .json({ success: false, message: "User already exists" });
    }
    const otp = Math.floor(1000 + Math.random() * 9999).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    if (isUserExist && !isUserExist.isVerified) {
      isUserExist.otp = otp;
      isUserExist.otpExpiry = otpExpiry;

      await isUserExist.save();
    } else {
      const newUser = new User({
        name,
        email: email.toLowerCase(),
        password: await hashedPass(password),
        otp,
        otpExpiry,
      });

      await newUser.save();
    }
    await sendOtpOnMail(otp, email);
    res
      .status(200)
      .json({ success: true, message: "Otp sent. Please verify." });
  } catch (error) {
    next(error);
  }
};

export const otpVerification = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Missing data." });
    }
    const isUser = await User.findOne({ email: email.toLowerCase() });
    if (!isUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const token = generateJWT(isUser._id);

    if (isUser.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    isUser.otp = null;
    isUser.isVerified = true;
    isUser.otpExpiry = null;
    await isUser.save();

    return res
      .status(200)
      .cookie("accessToken", token, {
        httpOnly: true,
        // secure:true,
        // sameSite:"strict",
        maxAge: 60 * 60 * 1000,
      })
      .json({
        success: true,
        message: "OTP verified.",
        userData: { email, name: isUser.name },
      });
  } catch (error) {
    next(error);
  }
};

export const userLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Every field is required." });
    }
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    } else if (user && !user.isVerified) {
      return res.status(401).json({ status: false, message: "Unauthorised" });
    }
    const isValidPass = await checkPass(password, user.password);

    if (!isValidPass) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = generateJWT(user._id);

    return res
      .status(200)
      .cookie("accessToken", token, {
        httpOnly: true,
        // secure:true,
        // sameSite:"strict",
        maxAge: 60 * 60 * 1000,
      })
      .json({
        success: true,
        message: "Login successful",
        userData: { name: user.name, email: user.email },
      });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;
    const users = await User.find(
      { _id: { $ne: currentUserId } },
      "-password -otp",
    );

    if (!users) {
      return res
        .status(404)
        .json({ success: false, message: "Users not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Users fetched successfully.", users });
  } catch (error) {
    next(error);
  }
};

export const logoutUser = async (req, res, next) => {
  res.clearCookie("accessToken");

  return res.status(200).json({ success: true, message: "User loggedOut" });
};
