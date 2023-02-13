const passport = require("passport");
const {User} = require("../models/User");
const _ = require("lodash");

let publicVals = ["username", "_id"]
exports.get_users = async (req, res) =>{
    let users = await User.find({});
    let filterdUsers = users.map((user)=>_.pick(user, publicVals));
    res.json(filterdUsers);
};

exports.get_user = async (req, res) =>{
    let user = await User.findById(req.params.id);
    if(!user)
        return res.status(404).send("User not found.");
    res.json(_.pick(user, publicVals));
};

exports.create_user = async (req, res) =>{
    let user = new User(req.body);
    await user.encryptPassword();
    await user.save();

    res.json(_.pick(user, publicVals));
};

exports.update_user = async (req, res) =>{
    let user = User.findById(req.params.id);
    if(!user)
        return res.status(404).send(`User with id ${req.params.id} not found.`);
    
    user.username = req.body.username;
    user.password = req.body.password;
    
    await user.encryptPassword();
    await user.save();
    
    res.json(_.pick(user, publicVals));
};

exports.delete_user = async (req, res) =>{
    let user = await User.findByIdAndRemove(req.params.id);
    if(!user)
        return res.status(404).send(`User with id ${req.params.id} not found.`);
    
    res.json(_.pick(user, publicVals));
};
/** @type {import("express").RequestHandler} */
exports.login_user = (req, res)=>{
    passport.authenticate("local", {session: false}, (err, user, msg)=>{
        if(err || !user)
            return res.status(400).send(msg);
        req.login(err, {session: false}, (err)=>{
            if(err)
                return res.status(500).send("Invalid username or password.");

            const token = user.generateAuthToken();
            return res.json({token});
        });
    })(req, res);
}