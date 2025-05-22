import express from 'express';

import usersController from '../controllers/usersController';
import { authenticateToken } from '../middleware/authentificationMiddleware';
import { use } from 'passport';
import { createLimite, deleteLimite } from '../middleware/ratelimite_ip';
import { rateLimiter } from '../middleware/ratelimite';

const router = express.Router();

router.get('/', usersController.getUsersAsync);

router.get('/:id', usersController.getUsersByIdAsync);

router.post('/', createLimite, usersController.addUserAsync);

router.put('/:id', usersController.modifyUserAsync);

router.delete('/:id',deleteLimite, usersController.deleteUserAsync);

export default router;