import userRepo from "../Repo/userRepo";
import UserDTO from "../dto/userDTO";
import { HttpError } from "../classes/httpError";
import { addUserSchema, modifyUserSchema } from "../schemas/usersSchemas";
import usersUtil from "../utils/usersUtils";
import crypto from "crypto";
import { CreationAttributes } from "sequelize";
import { User } from "../models/User";

async function getUsersService() {
    const usersFromDB = await userRepo.getUsersFromDB();
    if (usersFromDB.length > 0) {
        let usersDTO = usersFromDB.map((user) => {
            return new UserDTO(user.id, user.nom, user.prenom, user.age, user.email, user.credit, user.creditLastUpdated);
        });
        return usersDTO;
    }
    else {
        throw new HttpError('No users found', 404);
    }   
}

async function getUsersByIdService(id: string) {
    const userFromDB = await userRepo.getUserByIdFromDB(id);
    if (userFromDB !== null) {
        let userDTO = new UserDTO(userFromDB.id, userFromDB.nom, userFromDB.prenom, userFromDB.age, userFromDB.email, userFromDB.credit);
        return userDTO;
    }
    else {
        throw new HttpError('User not found', 404);
    }
}

async function addUserService(userInput: any) {
    const parsedUser = addUserSchema.safeParse(userInput);
    if (!parsedUser.success) {
        throw new HttpError(parsedUser.error.message, 400);
    }
    const validatedUser = parsedUser.data;
    let cryptoId = crypto.randomUUID();
    let passwordError = usersUtil.checkPassword(validatedUser.password);
    if (passwordError !== "") {
        throw new HttpError(passwordError, 400);
    }
    let hashedPassword = await usersUtil.hashPassword(validatedUser.password);
    let userInputToAdd: CreationAttributes<User> = {
        id: cryptoId,
        nom: validatedUser.nom,
        prenom: validatedUser.prenom,
        age: validatedUser.age,
        email: validatedUser.email,
        password: hashedPassword,
        credit: 20,
        creditLastUpdated: new Date()
    };
    let createdUser = await userRepo.addUserToDB(userInputToAdd);
    if (createdUser) {
        return new UserDTO(createdUser.id, createdUser.nom, createdUser.prenom, createdUser.age, createdUser.email, createdUser.credit, createdUser.creditLastUpdated);
    }
    else {
        throw new HttpError('User not created', 500);
    }
}

async function modifyUserService(id: string, userInput: any) {
    const parsedUser = modifyUserSchema.safeParse(userInput);
    if (!parsedUser.success) {
        throw new HttpError(parsedUser.error.message, 400);
    }
    const validatedUser = parsedUser.data;
    if (validatedUser.password !== undefined) {
        let passwordError = usersUtil.checkPassword(validatedUser.password);
        if (passwordError !== "") {
            throw new HttpError(passwordError, 400);
        } 
        validatedUser.password = await usersUtil.hashPassword(validatedUser.password);
    }
    let updatedUser = await userRepo.modifyUserInDB(id, validatedUser);
    if (updatedUser !== null) {
        return new UserDTO(updatedUser.id, updatedUser.nom, updatedUser.prenom, updatedUser.age, updatedUser.email, updatedUser.credit, updatedUser.creditLastUpdated);
    } else {
        throw new HttpError('User not found', 404);
    }
}

async function deleteUserService(id: string) : Promise<boolean> {
    let promiseDelete = await userRepo.deleteUserInDB(id);
    if (promiseDelete !== null) {
        return true;
    } else {
        throw new HttpError('User not found', 404);
    }
}

export default {
    getUsersService,
    getUsersByIdService,
    addUserService,
    modifyUserService,
    deleteUserService
}