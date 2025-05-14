import express from 'express';

import usersController from '../controllers/usersController';

const router = express.Router();

router.get('/', usersController.getUsers);

router.get('/:id', usersController.getUsersById);

router.post('/', usersController.addUser);

router.put('/:id', usersController.modifyUser);

router.delete('/:id', usersController.deleteUser);

export default router;