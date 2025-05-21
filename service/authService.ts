import userRepo from "../Repo/userRepo";
import { HttpError } from "../classes/httpError";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const ACCESS_SECRET = 'access-secret';
const REFRESH_SECRET = 'refresh-secret';

async function loginService (userData : any) {
    const userFromDB = await userRepo.getUserByEmailFromDB(userData.email);
    if (!userFromDB) {
        throw new HttpError('User not found', 401);
    }
    const isMatch = await bcrypt.compare(userData.password, userFromDB.password);
    if (!isMatch) {
        throw new HttpError('Invalid password', 401);
    }
    
    const accesToken = jwt.sign({ id: userFromDB.id}, ACCESS_SECRET, { expiresIn: '45m' });
    const refreshToken = jwt.sign({ id: userFromDB.id}, REFRESH_SECRET, { expiresIn: '2d' });

    return { accesToken, refreshToken };
}   

export default {
    loginService
};