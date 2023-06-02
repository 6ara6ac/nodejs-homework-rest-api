
const { Contact } = require('../models')
const { HttpError, ctrlWrapper } = require('../helpers') 



const getAll = async (req, res) => {
    const {_id: owner} = req.user;
    const {page = 1, limit = 10, favorite} = req.query;
    const skip = (page - 1) * limit;
    const data = await Contact.find({owner}, "-createdAt -updatedAt", {skip, limit}).populate("owner", "email");
    
    if(favorite){
      res.json(data.filter(el => el.favorite === JSON.parse(favorite)));
    }
    else{
      res.json(data);
    }
  }
  
  const getById = async(req, res) => {
    const {id} = req.params;
    const data = await Contact.findById(id)
    if(!data){
        throw new HttpError(404, "Not found");
    }
    res.json(data);
  }

  const add = async(req, res) => {
    const {_id: owner} = req.user;
   const data = await Contact.create({...req.body, owner})
   res.status(201).json(data);
  }

  const updateById = async(req,res) => {
    const { id } = req.params;
    const data = await Contact.findByIdAndUpdate(id, req.body, {new: true});
    if(!data){
      throw new HttpError(404, "Not found");
  }
    res.json(data);
  }

  const deleteById = async(req,res) => {
    const { id } = req.params;
    const data = await Contact.findByIdAndRemove(id)
    if(!data){
      throw new HttpError(404, "Not found");
  }
    res.json({
      message: "Delete success"
    });
  }

  const updateFavorite = async (req, res) => {
    const { id } = req.params;
    const data = await Contact.findByIdAndUpdate(id, req.body, {new: true})
    if (!data) {
      throw new HttpError(404, "Not found");
  }
    res.json(data);
  }

  const filterByFavorite = async(req, res) => {
    const {favorite} = req.user
    const data = await Contact.find({favorite});
    res.json(data);
  }

  module.exports = {
    getAll: ctrlWrapper(getAll),
    getById: ctrlWrapper(getById),
    add: ctrlWrapper(add),
    updateById: ctrlWrapper(updateById),
    deleteById: ctrlWrapper(deleteById),
    updateFavorite: ctrlWrapper(updateFavorite),
    fiterByFavorite: ctrlWrapper(filterByFavorite)
  }