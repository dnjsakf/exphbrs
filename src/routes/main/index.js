import { Router } from "express";

const router = Router();

router.get('/', (req, res)=>{
  res.status(200).render('main/index', {
    title: 'Express',
    items: 30
  });
});

export default router;