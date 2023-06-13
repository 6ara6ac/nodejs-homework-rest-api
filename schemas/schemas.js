const Joi = require("joi");
const emailRegexp = /^\w+([\\.-]?\w+)*@\w+([\\.-]?\w+)*(\.\w{2,3})+$/;



const addSchema = Joi.object({
    name: Joi.string().required().min(3).max(30),
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'co'] } }).required(),
    phone: Joi.string().required().min(3).max(30)
  })

  const registerSchema = Joi.object({
    email: Joi.string().pattern(emailRegexp).required(),
    password: Joi.string().min(6).required(),
})

const loginSchema = Joi.object({
  email: Joi.string().pattern(emailRegexp).required(),
  password: Joi.string().min(6).required(),
})
  
  const updateFavoriteSchema = Joi.object({
    favorite: Joi.boolean().required(),
  })

  const subscriptionSchema = Joi.object({
    subscription: Joi.string().valid('starter', 'business', 'pro').required()
  })

  const emailSchema = Joi.object({
    email: Joi.string().pattern(emailRegexp).required(),
   })
  
  const schemas = {
    addSchema,
    registerSchema,
    loginSchema,
    updateFavoriteSchema,
    subscriptionSchema,
    emailSchema
  }

  module.exports = schemas