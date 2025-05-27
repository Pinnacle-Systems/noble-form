import { Router } from 'express';

import { get, getBuyer, getCompCodeData, getMonthData } from '../services/commonMasters.service.js';

const router = Router();

router.get('/', get);

router.get('/getBuyer', getBuyer)

router.get('/getMonth', getMonthData)

router.get('/getCompCodeData', getCompCodeData)
export default router;