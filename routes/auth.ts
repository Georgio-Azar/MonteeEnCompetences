import express from 'express';
import authController from '../controllers/authController';
import { rateLimiter } from '../middleware/ratelimite';

const router = express.Router();

router.post('/login', rateLimiter, authController.loginAsync);

export default router;