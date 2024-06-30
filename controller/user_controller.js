import { joiUserSchema } from "../model/validation_schema.js";
import users from './../model/user_schema.js';
import bcrypt from "bcrypt";
import { sendOTP } from "./Mailer.js";
import jwt from "jsonwebtoken"

const otpStore = new Map();

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from "fs";
import path from 'path';
import cloudinary from 'cloudinary';
import multer from 'multer';

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const uploadDirectory = path.resolve(__dirname, "upload");
const storage = multer.diskStorage({
    destination: uploadDirectory,
    filename: (req, file, cb) => {
        cb(null, Date.now() + file.originalname);
    }
});

const upload = multer({ storage });


//--------------------------------------------------REGISTER & LOGIN SECTION --------------------------------------------------//
export const userRegister = async (req, res) => {
  const { value, error } = joiUserSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      status: "error",
      message: error.details[0].message 
    });
  }

  const { name, email, phone, password } = value;

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

    const userData = { name, email, phone, password: hashedPassword };
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
      const { identifier, password } = req.body;
  
      let user;
      if (identifier.includes('@')) {
        user = await users.findOne({ email: identifier });
      } else {
        user = await users.findOne({ phone: identifier });
      }
  
      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "Invalid credentials",
        });
      }
  
      if (user.isBlocked) {
        return res.status(403).json({
          status: "error",
          message: "Your account has been temporarily blocked",
        });
      }
  
      const passwordMatch = await bcrypt.compare(password, user.password);
  
      if (!passwordMatch) {
        return res.status(401).json({
          status: "error",
          message: "Invalid password",
        });
      }
  
      const token = jwt.sign(
        { userId: user._id, identifier: identifier },
        process.env.USER_ACCESS_TOKEN_SECRET
      );
  
      return res.status(200).json({
        status: "success",
        message: "Login successful",
        token: token,
        user: {
          userId: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
      });
    } catch (error) {
      console.error("Login Error:", error);
      return res.status(500).json({
        status: "error",
        message: "An unexpected error occurred",
        error: error.message,
      });
    }
  };
  
  

  
  
//--------------------------------------------------PROFILE SECTION --------------------------------------------------//

  export const viewProfile = async (req, res) => {
    const userId = req.params.id;
  
    try {
      const user = await users.findById(userId);
  
      if (!user) {
        return res.status(404).json({
          message: 'user not found...!'
        });
      }
  
      return res.status(200).json({
        message: 'User profile fetched successfully',
        data: user
      });
    }
    catch (error) {
      console.error(error);
      return res.status(500).json({
        message: 'Internal server error'
      });
    }
  }

  export const editProfile = async (req, res) => {
    const userId = req.params.id;
    let imageUrl;

    try {
        upload.single('profileImg')(req, res, async (error) => {
            if (error instanceof multer.MulterError) {
                return res.status(400).json({
                    status: "error",
                    message: error.message
                });
            } else if (error) {
                return res.status(400).json({
                    status: "error",
                    message: error
                });
            }

            if (req.file) {
                const result = await cloudinary.uploader.upload(req.file.path, {
                    folder: "Profile-images"
                });
                imageUrl = result.secure_url;

                fs.unlink(req.file.path, (unlink_error) => {
                    if (unlink_error) {
                        console.log("Error deleting local file after uploading to Cloudinary");
                    }
                });

                // Update user with only profileImg
                const user = await users.findByIdAndUpdate(
                    userId,
                    { $set: { profileImg: imageUrl } },
                    { new: true }
                );

                if (!user) {
                    return res.status(404).json({
                        message: "User not found."
                    });
                }

                return res.status(200).json({
                    message: "Profile image updated successfully.",
                    data: {
                        name: user.name,
                        profileImage: user.profileImg
                    }
                });
            } else {
                return res.status(400).json({
                    message: "No image file provided."
                });
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error."
        });
    }
};
