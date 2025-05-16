import { Request, Response } from 'express';
import catchAsyncErrors from '../utils/errorUtils';
import authService from '../service/authService';


export async function login (req : Request, res : Response) {
    const user = req.body;
    console.log('body:', user);
    const { accesToken, refreshToken } = await authService.loginService(user);
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