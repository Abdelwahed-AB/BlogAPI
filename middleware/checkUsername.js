const {User} = require("../models/User");

/**
 * Middleware used to verify if username is already taken.
 * @param { Object } req 
 * @param { Object } res 
 * @param { Function } next 
 */
module.exports = async (req, res, next)=>{
    let username = req.body.username;
    let user = await User.findOne({username});

    if(req.method === "PUT"){
        console.log(user);
        if(user && user._id.toHexString() === req.params.id) //* Same user => user has not updated his name
            return next();
    }
    if(user)
        return res.status(422).send("Username is already taken.");
    
    next();
}