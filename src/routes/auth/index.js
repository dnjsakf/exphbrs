import passport from "passport";
import { Router } from "express";
import UserModel from "../../models/user";

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
        if( err ){
            next(err);
        }
    }
);

router.get("/register", (req, res)=>{
    res.status(200).render("auth/register");
});
router.post("/register", async (req, res)=>{
    const regData = Object.assign({}, req.body);
    const userModel = new UserModel();
    const user = await userModel.get(regData);
    if( user ){
        return res.send({
            "success": false,
            "message": "이미 사용중인 사용자입니다."
        });
    }
    const [ hash, salt ] = userModel.genPassword(regData.userPwd);
    regData.userPwd = hash;
    regData.userSalt = salt;
    
    const result = await userModel.insert(regData);

    res.redirect('/auth/login');
});

router.post("/dupl", async (req,res)=>{
    const userModel = new UserModel();
    const user = await userModel.get(req.body);
    if( user ){
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