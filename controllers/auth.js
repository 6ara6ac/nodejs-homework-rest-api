const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const gravatar = require('gravatar')
const path = require('path')
const fs = require('fs/promises')
const Jimp = require("jimp");


const {User} = require("../models");
const { HttpError, ctrlWrapper } = require('../helpers') 

const {SECRET_KEY} = process.env;

const avatarsDir = path.join(__dirname, '../',"public", "avatars")

const register = async(req, res) => {
    const {email, password} = req.body;
    const user = await User.findOne({email})

    if (user){
        throw new HttpError(409, "Email already in use")
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const avatarURL = gravatar.url(email)

    const newUser = await User.create({...req.body, password: hashPassword, avatarURL})

    res.status(201).json({
        email: newUser.email,
        avatar: newUser.avatarURL
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

  const updateAvatar = async (req,res)=> {
   const {_id} = req.user;
    const {path: tempUpload, originalname} = req.file;
    const filename = `${_id}_${originalname}`;
    const resultUpload = path.join(avatarsDir, filename);

    // await Jimp.read(tempUpload)
    // .then(img => img.resize(250, 250).write(filename))
    // .catch((err) => console.log(err));

    await Jimp.read(tempUpload)
    .then(img => img.resize(250, 250).write(tempUpload))
    .catch((err) => console.log(err));

    await fs.rename(tempUpload, resultUpload);
    const avatarURL = path.join("avatars", filename);
    await User.findByIdAndUpdate(_id, {avatarURL});

    res.json({
        avatarURL,
    })
  }



module.exports = {
    register: ctrlWrapper(register),
    login: ctrlWrapper(login),
    getCurrent: ctrlWrapper(getCurrent),
    logout: ctrlWrapper(logout),
    changeSubscription: ctrlWrapper(changeSubscription),
    updateAvatar: ctrlWrapper(updateAvatar)
}
