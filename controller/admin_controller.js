import jwt from "jsonwebtoken"
import users from "../model/user_schema.js"
import { joiProductSchema } from "../model/validation_schema.js"
import products from "../model/product_schema.js"
import category from "../model/category_schema.js"


export const adminLogin = async (req, res) => {
    const { username, password } = req.body

    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {

        const token = jwt.sign({ username }, process.env.ADMIN_ACCESS_TOKEN_SECRET)

        return res.status(200).json({
            status: "success",
            message: "admin logged in successfully",
            token: token
        })
    }
    else {
        return res.status(401).json({
            status: "error",
            message: "invalid admin credentials...!"
        })
    }
}

export const viewUser = async (req,res) => {
    const all_users = await users.find()
    const all_user_count = await users.countDocuments()

    if(all_user_count === 0){
        return res.status(404).json({
            status:"error",
            message:"no users found...!"
        })
    }
    else{
        return res.status(200).json({
            status: "success",
            message: "users fetched successfully",
            data: all_users,
            dataCount: all_user_count
        })
    }
}

export const viewUserById = async (req, res) => {
    const userId = req.params.id;
    const user = await users.findById(userId)

    if (!user) {
        return res.status(404).json({
            status: "error",
            message: "user not found...!"
        })
    }
    else {
        return res.status(200).json({
            status: "success",
            message: "fetched user by id",
            data: user
        })
    }
}

export const blockUser = async (req, res) => {
    try {
        const userId = req.params.id
        const user = await users.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (user.isBlocked) {
            return res.status(400).json({
                message: "User is already blocked"
            });
        }

        user.isBlocked = true;
        await user.save();

        return res.status(200).json({
            message: "User is blocked! 🔒",
            data: user
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error"
        })
    }
}

export const unBlockUser = async (req, res) => {
    try {
        const userId = req.params.id
        const user = await users.findById(userId);

        if (!user) {
            return res.status(404).json({
                status: "error",
                message: "User not found"
            });
        }

        if (!user.isBlocked) {
            return res.status(400).json({
                error: "error",
                message: "User is not blocked"
            });
        }

        user.isBlocked = false;
        await user.save();

        return res.status(200).json({
            status: "success",
            message: "User is unblocked 🔓",
            data: user
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error"
        })
    }
}

export const addProduct = async (req, res) => {
    const { value, error } = joiProductSchema.validate(req.body)
    const { name, category, price, images } = value
    console.log(value);

    if (error) {
        return res.status(400).json({
            error: error.details[0].message
        })
    }
    else {
        const product_data = await products.create({
            name,
            category,
            price,
            images,
        })

        return res.status(201).json({
            status: "success",
            message: "product added successfully",
            data: product_data
        })
    }
}

export const viewProduct = async (req, res) => {
    const allProducts = await products.find()
    const allProducts_count = await products.countDocuments()

    if (!allProducts) {
        return res.status(404).json({
            status: "error",
            message: "products not found...!"
        })
    }
    else {
        return res.status(200).json({
            status: "success",
            message: "fetched property data",
            data: allProducts,
            dataCount: allProducts_count
        })
    }
}



//--------------------------------------------------CATEGORY MANAGEMENT --------------------------------------------------//

export const addCategory = async (req,res) => {
    const { name } = req.body

    const existingCategory = await category.findOne({ name })
    if(existingCategory){
        return res.status(400).json({
            status:"error",
            message:"category already added"
        })
    }
    const categories = new category({name})
    await categories.save()

    

    return res.status(200).json({
        status:"success",
        message:"category added successfully",
        data:categories
    })
}

export const viewCategory = async (req,res) => {
    const categories = await category.find()

    if(categories === ''){
        return res.status(200).json({
            status:"success",
            message:"categories is empty"
        })
    }

    return res.status(200).json({
        status:"success",
        message:"fetched categories successfully",
        data:categories
    })
}

export const editCategory = async (req,res) => {
    const categoryId  = req.params.id;
    const { name } = req.body; 
  
  try {
    const updatedCategory = await category.findByIdAndUpdate(categoryId, { name }, { new: true });

    if (!updatedCategory) {
      return res.status(404).json({
        status: "error",
        message: "Category not found"
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Category updated successfully",
      data: updatedCategory
    });

  } 
  catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Internal server error"
    });
  }
}

export const deleteCategory = async (req,res) => {
    const categoryId = req.params.id

  try {
    const deletedCategory = await category.findByIdAndDelete(categoryId);

    if (!deletedCategory) {
      return res.status(404).json({
        status: "error",
        message: "Category not found"
      });
    }
    return res.status(200).json({
      status: "success",
      message: "Category deleted successfully",
      data: deletedCategory
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error"
    });
  }
}