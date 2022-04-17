import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import UserModel from "./../models/user";

passport.use(
    "local",
    new LocalStrategy(
        {
            usernameField: "userId",
            passwordField: "userPwd"
        },
        async function(userId, userPwd, cb){
            try {
                const userModel = new UserModel();
                const user = await userModel.get({ userId: userId });
                if( user ){
                    const isValid = userModel.validPassword(userPwd, user.userPwd, user.userSalt);
                    if( isValid ){
                        return cb(null, user);
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

passport.deserializeUser(async (userId, cb)=>{
    try {
        const userModel = new UserModel();
        const user = await userModel.get({ userId: userId });
        delete user.userPwd;
        delete user.userSalt;
        return cb(null, user);

    } catch ( error ){
        return cb(err);
    }
})

export default passport;