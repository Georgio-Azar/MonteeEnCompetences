import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { User } from '../models/User';
import { getUserByEmailFromDB } from '../Repo/userRepo';
import bcrypt from 'bcryptjs';

const ACCESS_SECRET = 'access-secret';
const REFRESH_SECRET = 'refresh-secret';

export async function login (req : Request, res : Response) {
    const user = req.body;
    console.log('body:', user);

    /*try {
        const userFromDB = await getUserByEmailFromDB(user.email);
        if (!userFromDB) {
            return res.status(401).send('User not found');
        }
        const isMatch = await bcrypt.compare(userFromDB.password, user.password); 
        if (!isMatch) {
            return res.status(401).send('Invalid password');
        }
        console.log('User authenticated successfully');
    }
    catch (error) {
        res.status(400).send('login error');
    }*/
    try {
        const userFromDB = await getUserByEmailFromDB(user.email);
        if (!userFromDB) {
            res.status(401).send('User not found');
            return;
        }
        const isMatch = await bcrypt.compare(user.password, userFromDB.password);
        if (!isMatch) {
            res.status(401).send('Invalid password');
            return;
        }
        console.log('User authenticated successfully');
    }
    catch (error) {
        res.status(400).send('login error');
        return;
    }

    const accesToken = jwt.sign({ email: user.email}, ACCESS_SECRET, { expiresIn: '45m' });
    const refreshToken = jwt.sign({ email: user.email}, REFRESH_SECRET, { expiresIn: '2d' });

    res.cookie('refreshToken', refreshToken, {
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

export default {
    login
}