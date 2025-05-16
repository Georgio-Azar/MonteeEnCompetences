import {Request, Response} from 'express';
import crypto from 'crypto';

import usersModel from '../utils/usersUtils';
import { addUserSchema, modifyUserSchema } from '../schemas/usersSchemas';
import logger from '../logs/logger';
import { User } from '../models/User';
import userRepo from '../Repo/userRepo';
import { CreationAttributes } from 'sequelize';
import { HttpError } from '../classes/httpError';
import catchAsyncErrors from '../utils/errorUtils';
import UserDTO from '../dto/userDTO';


async function getUsers (req : Request, res : Response) {
    const usersFromDB = await userRepo.getUsersFromDB();
    if (usersFromDB.length > 0) {
        let usersDTO = usersFromDB.map((user : User) => {
            return new UserDTO(user.id, user.nom, user.prenom, user.age, user.email);
        });
        res.send(usersDTO);
    }
    else {
        throw new HttpError('No users found', 404);
    }
}

const getUsersAsync = catchAsyncErrors(getUsers);

async function getUsersById (req : Request, res : Response) {
    const id = req.params.id;
    const userFromDB = await userRepo.getUserByIdFromDB(id);
    if (userFromDB !== null) {
        let userDTO = new UserDTO(userFromDB.id, userFromDB.nom, userFromDB.prenom, userFromDB.age, userFromDB.email);
        res.send(userDTO);
    }
    else {
        throw new HttpError('User not found', 404);
    }
}
const getUsersByIdAsync = catchAsyncErrors(getUsersById);

async function addUser (req : Request, res : Response) {
    const userInput = req.body;
    const parsedUser = addUserSchema.safeParse(userInput);
    if (!parsedUser.success) {
        throw new HttpError(parsedUser.error.message, 400);
    }
    const validatedUser = parsedUser.data;
    let cryptoId = crypto.randomUUID();
    let passwordError = usersModel.checkPassword(validatedUser.password);
    if (passwordError !== "") {
        throw new HttpError(passwordError, 400);
    } 
    validatedUser.password = await usersModel.hashPassword(validatedUser.password);
    let userInputToAdd : CreationAttributes<User> = {
        id: cryptoId,
        nom: validatedUser.nom,
        prenom: validatedUser.prenom,
        age: validatedUser.age,
        email: validatedUser.email,
        password: validatedUser.password
    };
    let createdUser = await userRepo.addUserToDB(userInputToAdd);
    logger.info(`User ${createdUser.nom} ${createdUser.prenom} - ${createdUser.id} - added successfully`);
    res.status(201).send('User added successfully');
}
const addUserAsync = catchAsyncErrors(addUser);

async function modifyUser (req : Request, res : Response) {
    const id = req.params.id;
    const userInput = req.body;
    const parsedUser = modifyUserSchema.safeParse(userInput);
    if (!parsedUser.success) {
        throw new HttpError(parsedUser.error.issues[0].message, 400);
    }
    const validatedUser = parsedUser.data;
    if (validatedUser.password !== undefined) {
        let passwordError = usersModel.checkPassword(validatedUser.password);
        if (passwordError !== "") {
            throw new HttpError(passwordError, 400);
        } 
        validatedUser.password = await usersModel.hashPassword(validatedUser.password);
    }
    let updatedUser = await userRepo.modifyUserInDB(id, validatedUser);
    if (updatedUser !== null) {
        logger.info(`User ${updatedUser.nom} ${updatedUser.prenom} - ${updatedUser.id} modified successfully`);
        res.send('User updated successfully');
    } else {
        throw new HttpError('User not found', 404);
    }
}
const modifyUserAsync = catchAsyncErrors(modifyUser);

async function deleteUser (req : Request, res : Response) {
    const id = req.params.id;
    let promiseDelete = await userRepo.deleteUserInDB(id);
    if (promiseDelete !== null) {
        logger.info(`User with id ${id} deleted successfully`);
        res.send('User deleted successfully');
    } else {
        throw new HttpError('User not found', 404);
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