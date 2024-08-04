import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
    name: String,
    category: String,
    price: Number,
    images: [{
        type: String
    }],
},{ timestamps: true })

const productModel = mongoose.model('products', productSchema)
export default productModel   
