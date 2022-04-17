import passport from "passport";
import { Router } from "express";
import User from "../../models/user";

const router = Router();

router.get("/login", (req, res)=>{
    res.status(200).render("auth/login");
});
router.post("/login", 
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/auth/login"
    }),
    (err, req, res, next)=>{
        console.log( err );
        if( err ) {
            next(err);
        }
        console.log("You are logged in!");
    }
);

router.get("/register", (req, res)=>{
    res.status(200).render("auth/register");
});
router.post("/register", async (req, res)=>{
    const regData = Object.assign({}, req.body);
    const user = new User();
    const data = await user.get(regData);
    if( data ){
        return res.send({
            "success": false,
            "message": "이미 사용중인 사용자입니다."
        });
    }
    const [ hash, salt ] = user.genPassword(regData.userPwd);
    regData.userPwd = hash;
    regData.userSalt = salt;
    
    const result = await user.insert(regData);

    res.redirect('/auth/login');
});

router.post("/dupl", async (req,res)=>{
    console.log( req.body );
    const user = new User();
    const data = await user.get(req.body);
    if( data ){
        res.send({
            "success": false,
            "message": "이미 사용중인 사용자입니다."
        });
    } else {
        res.send({
            "success": true,
            "message": null
        });
    }
});

export default router;