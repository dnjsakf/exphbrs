import { Router } from "express";

const router = Router();

router.get('/', (req, res)=>{
  console.log( req.user );
  res.status(200).render('main/index', {
    title: 'Express',
    items: 30,
    isAuth: req.isAuthenticated(),
    user: req.user
  });
});

export default router;