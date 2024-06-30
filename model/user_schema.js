import mongoose from "mongoose";

const user_schema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profileImg: {type: String},
    isActive: {
        type: Boolean,
        default: true
    },

    isBlocked: {
        type: Boolean,
        default: false
    },
  });

const user_model = mongoose.model('users',user_schema)
export default user_model