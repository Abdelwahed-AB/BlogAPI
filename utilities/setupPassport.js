const JwtStrategy = require("passport-jwt").Strategy;

let { User } = require("../models/User");

let options = {};
options.secretOrKey = process.env.JWTPK;
options.jwtFromRequest = (req)=>{
    return req.header("x-auth-token");
};

module.exports = (passport)=>{
    passport.use(new JwtStrategy(options, (jwt_payload, done)=>{
        User.findOne({_id: jwt_payload._id})
            .then(user=>{
                if(user)
                    return done(null, user);
                return done(null, false);
            })
            .catch(err=>{
                return done(err, false);
            })
    }));
}