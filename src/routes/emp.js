import { Router } from 'express';
const router = Router();
import {  create, get } from "../services/emp.service.js";


router.post('/', create);

router.get('/', get);

export default router;