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


async function getUsers (req : Request, res : Response) {
    const usersFromDB = await userRepo.getUsersFromDB();
    if (usersFromDB.length > 0) {
        let result = "";
        usersFromDB.forEach((user : User) => {
            result += (`Nom: ${user.nom}, Prenom: ${user.prenom}, Age: ${user.age}, Mail : ${user.email}, ID: ${user.id}`);
            result += "<br>";
        });
        res.send(result);
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
        res.send(`Nom: ${userFromDB.nom}, Prenom: ${userFromDB.prenom}, Age: ${userFromDB.age}, Mail : ${userFromDB.email}`);
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
    validatedUser.id = crypto.randomUUID();
    let passwordError = usersModel.checkPassword(validatedUser.password);
    if (passwordError !== "") {
        throw new HttpError(passwordError, 400);
    } 
    validatedUser.password = await usersModel.hashPassword(validatedUser.password);
    let userInputToAdd : CreationAttributes<User> = {
        id: validatedUser.id,
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
        res.status(404).send('User not found');
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