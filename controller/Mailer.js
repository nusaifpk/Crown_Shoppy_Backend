import nodemailer from "nodemailer";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOTP = async (email) => {
  const otp = crypto.randomInt(100000, 999999).toString();

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is ${otp}`,
    html: `<b>Your OTP code is ${otp}</b>`,
  };

  await transporter.sendMail(mailOptions);

  return otp;
};


// export const sendPasswordResetEmail = async (email, token) => {
//   const resetUrl = `http://yourfrontend.com/resetpassword?token=${token}&email=${email}`; // Update with your frontend reset URL

//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to: email,
//     subject: "Password Reset Request",
//     text: `Click this link to reset you password: ${resetUrl}`,
//     html: `<b>Click this link to reset you password: <a href="${resetUrl}">${resetUrl}</a></b>`,
//   };

//   await transporter.sendMail(mailOptions);
// };