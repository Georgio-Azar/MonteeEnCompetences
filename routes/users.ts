import express from 'express';

import usersController from '../controllers/usersController';
import { authenticateToken } from '../middleware/authentificationMiddleware';
import { use } from 'passport';

const router = express.Router();

router.get('/', usersController.getUsersAsync);

router.get('/:id', authenticateToken, usersController.getUsersByIdAsync);

router.post('/', usersController.addUserAsync);

router.put('/:id', authenticateToken, usersController.modifyUserAsync);

router.delete('/:id', authenticateToken, usersController.deleteUserAsync);

export default router;