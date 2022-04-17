import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import User from "./../models/user";

passport.use(
    "local",
    new LocalStrategy(
        {
            usernameField: "userId",
            passwordField: "userPwd"
        },
        async function(userId, userPwd, cb){
            try {
                const user = new User();
                const data = await user.get({ userId: userId });
                if( data ){
                    const isValid = user.validPassword(userPwd, data.userPwd, data.userSalt);
                    if( isValid ){
                        return cb(null, data);
                    }
                    console.log("Invalid password");
                } else {
                    console.log("Not found user");
                }
                return cb(null, false);
            } catch ( error ){
                return cb(error);
            }
        }
    )
);

passport.serializeUser((user, cb)=>{
    return cb(null, user.userId);
});

passport.deserializeUser((userId, cb)=>{
    try {
        const user = new User();
        const data = user.get({ userId: userId });
        return cb(null, data);

    } catch ( error ){
        return cb(err);
    }
})

export default passport;