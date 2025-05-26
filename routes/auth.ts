import express from 'express';
import authController from '../controllers/authController';
import { loginRateLimiter } from '../middleware/rateLimiteMiddleware';

const router = express.Router();

router.post('/login',loginRateLimiter, authController.loginAsync);

export default router;