import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { getUserByEmailFromDB } from '../Repo/userRepo';
import bcrypt from 'bcryptjs';
import { HttpError } from '../classes/httpError';
import catchAsyncErrors from '../utils/errorUtils';

const ACCESS_SECRET = 'access-secret';
const REFRESH_SECRET = 'refresh-secret';

export async function login (req : Request, res : Response) {
    const user = req.body;
    console.log('body:', user);
    const userFromDB = await getUserByEmailFromDB(user.email);
    if (!userFromDB) {
        throw new HttpError('User not found', 401);
    }
    const isMatch = await bcrypt.compare(user.password, userFromDB.password);
    if (!isMatch) {
        throw new HttpError('Invalid password', 401);
    }

    const accesToken = jwt.sign({ email: user.email}, ACCESS_SECRET, { expiresIn: '45m' });
    const refreshToken = jwt.sign({ email: user.email}, REFRESH_SECRET, { expiresIn: '2d' });

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
    });
    res.cookie('accessToken', accesToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
    });

    console.log('Access token:', accesToken);
    console.log('Refresh token:', refreshToken);
    console.log('User:', user);
    res.status(200).send('User authenticated successfully');
    console.log('User authenticated successfully');
}
const loginAsync = catchAsyncErrors(login);

export default {
    loginAsync
}