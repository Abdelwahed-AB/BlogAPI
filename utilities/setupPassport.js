const JwtStrategy = require("passport-jwt").Strategy;
const LocalStrategy = require("passport-local").Strategy;

let { User } = require("../models/User");

let jwtOptions = {
    secretOrKey : process.env.JWTPK,
    jwtFromRequest : (req)=>{
        return req.header("x-auth-token");
    },
};

module.exports = (passport)=>{

    passport.use(new LocalStrategy(
        function(username, password, done){
            User.findOne({username: username}).then(async (user) =>{
                if(!user)
                    return done(null, false);
                let passCheck = await user.verifyPassword(password);
                if(!passCheck)
                    return done(null, false);
                
                return done(null, user);
            }).catch(err=>{
                return done(err, false);
            });
        }
    ))

    passport.use(new JwtStrategy(jwtOptions, (jwt_payload, done)=>{
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