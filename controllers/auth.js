const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const {User} = require("../models");
const { HttpError, ctrlWrapper } = require('../helpers') 

const {SECRET_KEY} = process.env;

const register = async(req, res) => {
    const {email, password} = req.body;
    const user = await User.findOne({email})

    if (user){
        throw new HttpError(409, "Email already in use")
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({...req.body, password: hashPassword})

    res.status(201).json({
        email: newUser.email,
    })
}

const login = async(req, res) => {
    const {email, password} = req.body;
    const user = await User.findOne({email})
    if(!user){
        throw HttpError (401, "Email or password invalid")
    }
    const passwordCompare = await bcrypt.compare(password, user.password)
    if(!passwordCompare){
        throw new HttpError (401, "Email or password invalid")
    }

    const payload = {
        id:user._id
    }

    const token = jwt.sign(payload, SECRET_KEY, {expiresIn:"23h"})
    await User.findOneAndUpdate(user._id, {token})

    res.json({
        token,
    })
}

const getCurrent = async(req, res) => {
    const {email, subscription} = req.user;

    console.log(subscription)

    res.json({
        email,
        subscription
    })
}

const logout = async(req, res)=> {
    const {_id} = req.user;
    await User.findByIdAndUpdate(_id, {token:""})
    res.json({
        message: "Logout success"
    })
} 

const changeSubscription = async (req, res, next) => {
    const {id} = req.user
    const data = await User.findByIdAndUpdate(id, req.body)
    if (!data) {
        throw new HttpError(404, "Not found");
    }
    res.json(data);
  };

module.exports = {
    register: ctrlWrapper(register),
    login: ctrlWrapper(login),
    getCurrent: ctrlWrapper(getCurrent),
    logout: ctrlWrapper(logout),
    changeSubscription: ctrlWrapper(changeSubscription)
}
