import {Request, Response} from 'express';

import logger from '../logs/logger';
import catchAsyncErrors from '../utils/errorUtils';
import userService from '../service/userService';


async function getUsers (req : Request, res : Response) {
   const usersDTO = await userService.getUsersService();
   res.send(usersDTO);
}

const getUsersAsync = catchAsyncErrors(getUsers);

async function getUsersById (req : Request, res : Response) {
    
    const userId = (req as any).user?.id;
    console.log(userId);
    const id = req.params.id;
    const userDTO = await userService.getUsersByIdService(id);
    res.send(userDTO);
}
const getUsersByIdAsync = catchAsyncErrors(getUsersById);

async function addUser (req : Request, res : Response) {
    const userInput = req.body;
    const createdUser = await userService.addUserService(userInput);
    logger.info(`User ${createdUser.nom} ${createdUser.prenom} - ${createdUser.id} - added successfully`);
    res.status(201).send('User added successfully');
}
const addUserAsync = catchAsyncErrors(addUser);

async function modifyUser (req : Request, res : Response) {
    const id = req.params.id;
    const userInput = req.body;
    const updatedUser = await userService.modifyUserService(id, userInput);
    logger.info(`User ${updatedUser.nom} ${updatedUser.prenom} - ${updatedUser.id} modified successfully`);
    res.send('User updated successfully');
}

const modifyUserAsync = catchAsyncErrors(modifyUser);

async function deleteUser (req : Request, res : Response) {
    const id = req.params.id;
    const deletedUser = await userService.deleteUserService(id);
    if (deletedUser) {
        logger.info(`User with id ${id} deleted successfully`);
        res.send('User deleted successfully');
    }
}
const deleteUserAsync = catchAsyncErrors(deleteUser);

export default {
    getUsersAsync,
    getUsersByIdAsync,
    addUserAsync,
    modifyUserAsync,
    deleteUserAsync
};