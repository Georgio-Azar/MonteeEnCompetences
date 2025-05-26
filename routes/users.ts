import express from 'express';

import usersController from '../controllers/usersController';
import { authenticateToken } from '../middleware/authentificationMiddleware';
import { rateLimiteMiddlewareByIP } from '../middleware/rateLimiteMiddlewareByIP';
import { rateLimiter } from '../middleware/rateLimiteMiddleware';

const router = express.Router();

router.get('/', usersController.getUsersAsync);

router.get('/:id', authenticateToken, rateLimiter, usersController.getUsersByIdAsync);

router.post('/', rateLimiteMiddlewareByIP, usersController.addUserAsync);

router.put('/:id', authenticateToken, rateLimiter, usersController.modifyUserAsync);

router.delete('/:id', authenticateToken, rateLimiteMiddlewareByIP, usersController.deleteUserAsync);

export default router;