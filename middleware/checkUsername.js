const {User} = require("../models/User");

module.exports = async (req, res, next)=>{
    let username = req.username;
    let user = await User.findOne({username});
    if(user)
        return res.status(422).send("Username is already taken.");
    
    next();
}