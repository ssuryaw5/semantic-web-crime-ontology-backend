import { Router } from 'express';
import { getData } from '../controllers/user.controller.js';

const router = Router();


// public routes
router.route('/').post(getData);

export default router;