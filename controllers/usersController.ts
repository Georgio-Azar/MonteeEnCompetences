import {Request, Response} from 'express';
import fs from 'fs';
import crypto from 'crypto';

import usersModel from '../models/usersModel';
import { addUserSchema, modifyUserSchema } from '../schemas/usersSchemas';
import logger from '../logs/logger';
import  User  from '../types/User';


function getUsers (req : Request, res : Response) {
    logger.http(`${req.method} /users - ${req.ip}`);
    try {
        console.log('Reading file...');
        const data = fs.readFileSync('utilisateurs.json', 'utf8');
        console.log('File read successfully');
        const users : User[] = JSON.parse(data);
        let result = "";
        users.forEach((user : User) => {
            result += (`Nom: ${user.nom}, Prenom: ${user.prenom}, Age: ${user.age}, Mail : ${user.email}`);
            result += "<br>";
        }); 
        res.send(result);
    }
    catch (err) {
        logger.error(err);
        console.error(err);
        res.status(500).send('Error reading file');
    }
}

function getUsersById (req : Request, res : Response) {
    logger.http(`${req.method} /users${req.url} - ${req.ip}`);
    const id = req.params.id;
    try {
        console.log('Reading file...');
        const data = fs.readFileSync('utilisateurs.json', 'utf8');
        console.log('File read successfully');
        const users : User[] = JSON.parse(data);
        const user = users.find(user => String(user.id) === id);
        if (user) {
            res.send(`Nom: ${user.nom}, Prenom: ${user.prenom}, Age: ${user.age}, Mail : ${user.email}`);
        } else {
            res.status(404).send('User not found');
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
        res.status(400).send(parsedUser.error.format());
        return;
    }
    const validatedUser = parsedUser.data;
    try {
        console.log('Reading file...');
        const data = fs.readFileSync('utilisateurs.json', 'utf8');
        console.log('File read successfully');
        const users : User[]= JSON.parse(data);
        validatedUser.id = crypto.randomUUID();
        if (users.find(user => user.email === validatedUser.email)) {
            res.status(400).send('Email already exists');
            return;
        }
        let passwordError = usersModel.checkPassword(validatedUser.password);
        if (passwordError !== "") {
            res.status(400).send(passwordError);
            return;
        } 
        validatedUser.password = await usersModel.hashPassword(validatedUser.password);
        let userToAdd : User = {
            id: validatedUser.id,
            nom: validatedUser.nom,
            prenom: validatedUser.prenom,
            age: validatedUser.age,
            email: validatedUser.email,
            password: validatedUser.password
        };
        users.push(userToAdd);
        fs.writeFileSync('utilisateurs.json', JSON.stringify(users, null, 2));
        logger.info(`User ${validatedUser.nom} ${validatedUser.prenom} added successfully`);
        res.status(201).send('User added successfully');
    }
    catch (err) {
        logger.error(err);
        console.error(err);
        res.status(500).send('Error writing file');
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
        console.log('Reading file...');
        const data = fs.readFileSync('utilisateurs.json', 'utf8');
        console.log('File read successfully');
        const users : User[] = JSON.parse(data);
        if (validatedUser.password !== undefined) {
            let passwordError = usersModel.checkPassword(validatedUser.password);
            if (passwordError !== "") {
                res.status(400).send(passwordError);
                return;
            } 
            validatedUser.password = await usersModel.hashPassword(validatedUser.password);
        }
        if (validatedUser.email !== undefined) {
            if (users.find(user => user.email === validatedUser.email)) {
                res.status(400).send('Email already exists');
                return;
            }
        }
        const userIndex = users.findIndex(user => user.id == id);
        if (userIndex !== -1) {
            users[userIndex] = { ...users[userIndex], ...validatedUser };
            fs.writeFileSync('utilisateurs.json', JSON.stringify(users, null, 2));
            logger.info(`User ${validatedUser.nom} ${validatedUser.prenom} modified successfully`);
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

function deleteUser (req : Request, res : Response) {
    logger.http(`${req.method} /users${req.url} - ${req.ip}`);
    const id = req.params.id;
    try {
        console.log('Reading file...');
        const data = fs.readFileSync('utilisateurs.json', 'utf8');
        console.log('File read successfully');
        const users : User[] = JSON.parse(data);
        const userIndex = users.findIndex(user => user.id == id);
        if (userIndex !== -1) {
            users.splice(userIndex, 1);
            fs.writeFileSync('utilisateurs.json', JSON.stringify(users, null, 2));
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