import { User } from '../models/User';
import { userToModify } from '../types/User';
import { CreationAttributes } from 'sequelize';

export async function getUsersFromDB(): Promise<User[]> {
    const users = await User.findAll();
    if (!users.length) throw new Error('No users found');
    return users;
}

export async function getUserByIdFromDB(id: string): Promise<User | null> {
    const user = await User.findOne({ where: { id } });
    if (!user) throw new Error('User not found');
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
    if (!deleted) throw new Error('User not found');
}

export async function getUserByEmailFromDB(email: string): Promise<User | null> {
    const user = await User.findOne({ where: { email } });
    if (!user) throw new Error('User not found');
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
