import jwt from 'jsonwebtoken';
import { JwtPayload } from 'jsonwebtoken';
import { Request, Response } from 'express';

import { User } from '../models/User';

const ACCESS_SECRET = 'access-secret';

export function authenticateToken(req : Request, res : Response, next : Function) {    
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, ACCESS_SECRET, (err : Error | null, decoded ) => {
        if (err) return res.status(403).json({ message: 'Token invalide' });
    });
}