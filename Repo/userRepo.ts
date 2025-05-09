import { User, userToModify }  from '../types/User';
import db from '../database';

async function getUsersFromDB() : Promise<User[]> {
    return new Promise(async (resolve, reject) => {
        let users : User[] = await db.users.findAll();
        if (users) {
            resolve(users);
        } else {
            reject(new Error('No users found'));
        }
    });
}

async function getUserByIdFromDB(id : string) : Promise<User | null> {
    return new Promise(async (resolve, reject) => {
        let user : User | null = await db.users.findOne({ where: { id } });
        if (user) {
            resolve(user);
        } else {
            reject(new Error('User not found'));
        }
    });
}

async function addUserToDB(user : User) : Promise<User> {
    return new Promise(async (resolve, reject) => {
        try {
            const newUser : User = await db.users.create(user);
            resolve(newUser);
        } catch (error) {
            reject(error);
        }
    });
}

async function modifyUserInDB(id : string, user : userToModify) : Promise<User | null> {
    return new Promise(async (resolve, reject) => {
        try {
            const [updated] = await db.users.update(user, { where: { id } });
            if (updated) {
                const updatedUser : User | null = await db.users.findOne({ where: { id } });
                resolve(updatedUser);
            } else {
                resolve(null);
            }
        } catch (error) {
            reject(error);
        }
    });
}

async function deleteUserInDB(id : string) : Promise<void> {
    return new Promise(async (resolve, reject) => {
        try {
            const deleted = await db.users.destroy({ where: { id } });
            if (deleted) {
                resolve();
            } else {
                reject(new Error('User not found'));
            }
        } catch (error) {
            reject(error);
        }
    });
}

export default {
    getUsersFromDB,
    getUserByIdFromDB,
    addUserToDB,
    modifyUserInDB,
    deleteUserInDB
}