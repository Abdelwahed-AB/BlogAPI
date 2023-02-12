const passport = require("passport");
const {User} = require("../models/User");

exports.get_users = async (req, res) =>{
    let users = await User.find({});
    res.json(users);
};

exports.get_user = async (req, res) =>{
    let user = await User.findById(req.params.id);
    if(!user)
    return res.status(404).send("User not found.");
    res.json(user);
};

exports.create_user = async (req, res) =>{
    let user = new User(req.body);
    await user.encryptPassword();
    await user.save();
    res.json(user);
};

exports.update_user = async (req, res) =>{
    let user = User.findById(req.params.id);
    if(!user)
        return res.status(404).send(`User with id ${req.params.id} not found.`);
    
    user.username = req.body.username;
    user.password = req.body.password;
    
    await user.encryptPassword();
    await user.save();
    
    res.json(user);
};

exports.delete_user = async (req, res) =>{
    let user = await User.findByIdAndRemove(req.params.id);
    if(!user)
        return res.status(404).send(`User with id ${req.params.id} not found.`);
    
    res.json(user);
};
/** @type {import("express").RequestHandler} */
exports.login_user = (req, res)=>{
    passport.authenticate("local", {session: false}, (err, user)=>{
        if(err || !user)
            return res.status(400).send("Couldn't login.");
        req.login(err, {session: false}, (err)=>{
            if(err)
                return res.status(500).send("Couldn't login.");

            const token = user.generateAuthToken();
            return res.json({token});
        });
    })(req, res);
}