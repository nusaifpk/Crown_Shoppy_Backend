import { joiUserSchema } from "../model/validation_schema.js";
import users from './../model/user_schema.js';
import bcrypt from "bcrypt";
import { sendOTP } from "./Mailer.js";
import jwt from "jsonwebtoken"

const otpStore = new Map();

export const userRegister = async (req, res) => {
  const { value, error } = joiUserSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      status: "error",
      message: error.details[0].message 
    });
  }

  const { name, email, password } = value;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        status: "error",
        message: "Email already taken." 
      });
    }

    const otp = await sendOTP(email);
    otpStore.set(email, otp);

    const userData = { name, email, password: hashedPassword };
    otpStore.set(email + "_data", userData);

    return res.status(200).json({
      status: "success", 
      message: "OTP sent to email. Please verify.",
    });
  } catch (err) {
    console.error("Error during user registration:", err);
    return res.status(500).json({ 
      status: "error",
      message: "Internal server error." 
    });
  }
};

export const verifyOTP = async (req, res) => {
    const { email, otp } = req.body;
    console.log("request.body = ",req.body);
    const storedOtp = otpStore.get(email);
    const userData = otpStore.get(email + "_data");

    console.log(`Received OTP verification request for ${email}`); 

    if (!storedOtp || storedOtp !== otp) {
      console.log(`Invalid OTP for ${email}`); 
      return res.status(400).json({
        status: "error",
        message: "Invalid or expired OTP."
      });
    }

    try {
      const newUser = new users(userData);
      await newUser.save();

      otpStore.delete(email);
      otpStore.delete(email + "_data");

      console.log(`User ${email} successfully registered`); 

      return res.status(201).json({
        status: "success",
        message: "User successfully registered.",
        data: newUser,
      });
    } catch (err) {
      console.error("Error during OTP verification:", err);
      return res.status(500).json({
        status: "error",
        message: "Internal server error."
      });
    }
  };

  export const userLogin = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      const user = await users.findOne({ email });
  
      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "invalid email...",
        });
      }
  
      if (user.isBlocked) {
        return res.status(403).json({
          status: "error",
          message: "Your account has been temporarly blocked...!"
        })
      }
  
      const passwordMatch = await bcrypt.compare(password, user.password);
  
      if (!passwordMatch) {
        return res.status(401).json({
          status: "error",
          message: "Invalid password...",
        });
      }
  
      const token = jwt.sign({ email },
        process.env.USER_ACCESS_TOKEN_SECRET,
      );
  
      return res.status(200).json({
        status: "success",
        message: "login successful",
        token: token,
        user: {
          userId: user._id,
          name: user.name,
          email: user.email,
        }
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        status: "error",
        message: "An unexpected error occurred",
        error: error.message
      });
    }
  }

  
  
