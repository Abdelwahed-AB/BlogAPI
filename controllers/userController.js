const {User} = require("../models/User");

exports.get_users = async (req, res) =>{
    let users = await User.find({});
    res.json(users);
};

/** @type {import("express").RequestHandler} */
exports.get_user = async (req, res) =>{
    let user = await User.findById(req.params.id);
    if(!user)
        return res.status(404).send("User not found.");
    res.json(user);
};

exports.create_user = () =>{/* TBD */};

exports.update_user = () =>{/* TBD */};

exports.delete_user = () =>{/* TBD */};

exports.login_user = (req, res) => {
    //TODO: authenticate the user and return jwt token
};