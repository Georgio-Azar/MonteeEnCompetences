import { User } from '../models/User';
import { userToModify } from '../types/User';
import { CreationAttributes } from 'sequelize';
import { HttpError } from '../classes/httpError';

export async function getUsersFromDB(): Promise<User[]> {
    const users = await User.findAll();
    if (!users.length) throw new HttpError('No users found', 404);
    return users;
}

export async function getUserByIdFromDB(id: string): Promise<User | null> {
    const user = await User.findOne({ where: { id } });
    if (!user) throw new HttpError('User not found', 404);
    return user;
}

export async function addUserToDB(user: CreationAttributes<User>): Promise<User> {
    return await User.create(user);
}

export async function modifyUserInDB(id: string, user: userToModify): Promise<User | null> {
    const [updated] = await User.update(user, { where: { id } });
    if (!updated) return null;
    return await User.findOne({ where: { id } });
}

export async function deleteUserInDB(id: string): Promise<void> {
    const deleted = await User.destroy({ where: { id } });
    if (!deleted) throw new HttpError('User not found', 404);
}

export async function getUserByEmailFromDB(email: string): Promise<User | null> {
    const user = await User.findOne({ where: { email } });
    if (!user) throw new HttpError('User not found', 404);
    return user;
}

export default {
    getUsersFromDB,
    getUserByIdFromDB,
    addUserToDB,
    modifyUserInDB,
    deleteUserInDB,
    getUserByEmailFromDB
}
