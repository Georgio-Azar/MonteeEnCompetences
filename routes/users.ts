import express from 'express';

import usersController from '../controllers/usersController.ts';

const router = express.Router();

router.get('/', usersController.getUsers);

router.get('/:id', usersController.getUsersById);

router.post('/', express.json(), usersController.addUser);

router.put('/:id', express.json(), usersController.modifyUser);

router.delete('/:id', usersController.deleteUser);

export default router;