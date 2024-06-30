import express from "express"
import { userLogin, userRegister, verifyOTP } from "../controller/user_controller.js"

const user_router = express.Router()
.post('/register',userRegister)
.post('/verify',verifyOTP)
.post('/login',userLogin)

export default user_router