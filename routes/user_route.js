import express from "express"
import { editProfile, userLogin, userRegister, verifyOTP, viewCategory, viewProduct, viewProductById, viewProfile } from "../controller/user_controller.js"

const user_router = express.Router()
.post('/register',userRegister)
.post('/verify',verifyOTP)
.post('/login',userLogin)
.get('/product',viewProduct)
.get('/product/:id',viewProductById)
.get('/categories',viewCategory)

.get('/profile/:id',viewProfile)
.put('/profile/:id', editProfile)

export default user_router