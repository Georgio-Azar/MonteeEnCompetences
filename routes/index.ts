import express from 'express';

import indexController from '../controllers/indexController';
import { rateLimiter } from '../middleware/ratelimite';

const router = express.Router();

router.get('/', rateLimiter, indexController.indexWelcome);

export default router;