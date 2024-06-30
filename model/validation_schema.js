import Joi from "joi";

export const joiUserSchema = Joi.object({
    name: Joi.string(),
    email: Joi.string().email(),
    password: Joi.string(),
    confirmPassword: Joi.any().valid(Joi.ref('password')).messages({'any.only': 'Passwords do not match'})
})