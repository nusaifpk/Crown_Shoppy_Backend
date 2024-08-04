import express from "express"
import { addCategory, addProduct, adminLogin, blockUser, deleteCategory, editCategory, unBlockUser, viewCategory, viewProduct, viewUser, viewUserById } from "../controller/admin_controller.js"
import imageUpload from "../middleware/imageUpload/imageUpload.js"

const admin_router = express.Router()
.post('/login',adminLogin)



.get('/user',viewUser)
.get('/user/:id',(viewUserById))
.put('/user/block/:id',(blockUser))
.put('/user/unblock/:id',(unBlockUser))
.post('/product',imageUpload,(addProduct))
.get('/product',(viewProduct))
.post('/categories',(addCategory))
.get('/categories',(viewCategory))
.put('/categories/:id',(editCategory))
.delete('/categories/:id',(deleteCategory))

export default admin_router