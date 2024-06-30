import express from "express"
import { adminLogin } from "../controller/admin_controller.js"

const admin_router = express.Router()
.post('/login',adminLogin)

export default admin_router