/** @type {import("express").RequestHandler} */
module.exports = (req, res, next)=>{
    if(!req.user)
        return res.status(401).send("Access denied, not logged in.");
    if(!req.user.isAdmin)
        return res.status(403).send("Unauthorized.");
    
    next();
};