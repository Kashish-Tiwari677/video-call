import httpStatus from "http-status";
import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { Meeting } from "../models/meeting.model.js";

/* ===================== LOGIN ===================== */
const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "Username and password are required" });
  }

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "User not found" });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ message: "Invalid username or password" });
    }

    // generate token
    const token = crypto.randomBytes(32).toString("hex");
    user.token = token;
    await user.save();

    return res.status(httpStatus.OK).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
      },
    });
  } catch (err) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: "Something went wrong", error: err.message });
  }
};

/* ===================== REGISTER ===================== */
const register = async (req, res) => {
  const { name, username, password } = req.body;

  if (!name || !username || !password) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "All fields are required" });
  }

  try {
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res
        .status(httpStatus.CONFLICT)
        .json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      username,
      password: hashedPassword,
    });

    await newUser.save();

    return res
      .status(httpStatus.CREATED)
      .json({ message: "User registered successfully" });
  } catch (err) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: "Something went wrong", error: err.message });
  }
};

/* ===================== AUTH MIDDLEWARE ===================== */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const user = await User.findOne({ token });

    if (!user) {
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ message: "Invalid token" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: "Authentication failed" });
  }
};

/* ===================== GET USER HISTORY ===================== */
const getUserHistory = async (req, res) => {
  try {
    const meetings = await Meeting.find({
      user_id: req.user.username,
    });

    return res.status(httpStatus.OK).json(meetings);
  } catch (err) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: "Something went wrong", error: err.message });
  }
};

/* ===================== ADD TO HISTORY ===================== */
const addToHistory = async (req, res) => {
  const { meeting_code } = req.body;

  if (!meeting_code) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "Meeting code required" });
  }

  try {
    const newMeeting = new Meeting({
      user_id: req.user.username,
      meetingCode: meeting_code,
    });

    await newMeeting.save();

    return res
      .status(httpStatus.CREATED)
      .json({ message: "Meeting added to history" });
  } catch (err) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: "Something went wrong", error: err.message });
  }
};

export {
  login,
  register,
  getUserHistory,
  addToHistory,
  authenticate,
};
