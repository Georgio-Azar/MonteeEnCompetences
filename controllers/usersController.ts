import {Request, Response} from 'express';
import fs from 'fs';
import crypto from 'crypto';

import usersModel from '../models/usersModel';
import { addUserSchema, modifyUserSchema } from '../schemas/usersSchemas';
import logger from '../logs/logger';
import { userToAdd, userToModify }  from '../types/User';
import { User } from '../models/User';
import userRepo from '../Repo/userRepo';
import { CreationAttributes } from 'sequelize';


async function getUsers (req : Request, res : Response) {
    logger.http(`${req.method} /users - ${req.ip}`);
    try {
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
            res.status(404).send('No users found');
        }
    }
    catch (err) {
        logger.error(err);
        console.error(err);
        res.status(500).send('Error reading file');
    }
}

async function getUsersById (req : Request, res : Response) {
    logger.http(`${req.method} /users${req.url} - ${req.ip}`);
    const id = req.params.id;
    try {
        const userFromDB = await userRepo.getUserByIdFromDB(id);
        if (userFromDB !== null) {
            res.send(`Nom: ${userFromDB.nom}, Prenom: ${userFromDB.prenom}, Age: ${userFromDB.age}, Mail : ${userFromDB.email}`);
        }
        else {
            res.status(404).send('No users found');
        }
    }
    catch (err) {
        logger.error(err);
        console.error(err);
        res.status(500).send('Error reading file');
    }
}

async function addUser (req : Request, res : Response) {
    logger.http(`${req.method} /users - ${req.ip}`);
    const newUser = req.body;
    const parsedUser = addUserSchema.safeParse(newUser);
    if (!parsedUser.success) {
        res.status(400).send(parsedUser.error.issues[0].message);
        return;
    }
    const validatedUser = parsedUser.data;
    try {
        validatedUser.id = crypto.randomUUID();
        let passwordError = usersModel.checkPassword(validatedUser.password);
        if (passwordError !== "") {
            res.status(400).send(passwordError);
            return;
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
        let newUser = await userRepo.addUserToDB(userInputToAdd);
        logger.info(`User ${newUser.nom} ${newUser.prenom} - ${newUser.id} - added successfully`);
        res.status(201).send('User added successfully');
    }
    catch (err) {
        logger.error(err);
        console.error(err);
        res.status(500).send('Error while adding user');
    }
}

async function modifyUser (req : Request, res : Response) {
    logger.http(`${req.method} /users${req.url} - ${req.ip}`);
    const id = req.params.id;
    const updatedUser = req.body;
    const parsedUser = modifyUserSchema.safeParse(updatedUser);
    if (!parsedUser.success) {
        res.status(400).send(parsedUser.error.format());
        return;
    }
    const validatedUser = parsedUser.data;
    try {
        if (validatedUser.password !== undefined) {
            let passwordError = usersModel.checkPassword(validatedUser.password);
            if (passwordError !== "") {
                res.status(400).send(passwordError);
                return;
            } 
            validatedUser.password = await usersModel.hashPassword(validatedUser.password);
        }
        let updatedUser = await userRepo.modifyUserInDB(id, validatedUser);
        if (updatedUser !== null) {
            logger.info(`User ${updatedUser.nom} ${updatedUser.prenom} - ${updatedUser.id} modified successfully`);
            res.send('User updated successfully');
        } else {
            res.status(404).send('User not found');
        }
    }
    catch (err) {
        console.error(err);
        logger.error(err);
        res.status(500).send('Error writing file');
    }
}

async function deleteUser (req : Request, res : Response) {
    logger.http(`${req.method} /users${req.url} - ${req.ip}`);
    const id = req.params.id;
    try {
        let promiseDelete = await userRepo.deleteUserInDB(id);
        if (promiseDelete !== null) {
            logger.info(`User with id ${id} deleted successfully`);
            res.send('User deleted successfully');
        } else {
            res.status(404).send('User not found');
        }
    }
    catch (err) {
        console.error(err);
        logger.error(err);
        res.status(500).send('Error writing file');
    }
}

export default {
    getUsers,
    getUsersById,
    addUser,
    modifyUser,
    deleteUser
};