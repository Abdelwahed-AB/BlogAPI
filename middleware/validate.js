module.exports = function(validator){
    return (req, res, next)=>{
        let err = validator(req.body);
        if(err)
            return res.status(400).send(err.details[0]);
        next();
    }
}