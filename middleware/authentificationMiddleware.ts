import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const ACCESS_SECRET = "access-secret";

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers["authorization"];
    const token = authHeader?.startsWith('Bearer ')
            ? authHeader.slice(7)
            : req.cookies?.accessToken;
    
    if (!token) {
        res.status(401).json({ message: 'Token manquant' });
        return;
    }

    jwt.verify(token, ACCESS_SECRET, (err : jwt.VerifyErrors | null, decoded : jwt.JwtPayload | string | undefined) => {
        if (err || typeof decoded !== 'object' || !("id" in decoded)) {
            res.status(403).json({ message: 'Token invalide' });
            return;
        }
        (req as any).user = decoded as { id: string} & jwt.JwtPayload;
        next();
    });
}