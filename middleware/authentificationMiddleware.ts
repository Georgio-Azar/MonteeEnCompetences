import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload, VerifyErrors} from "jsonwebtoken";

const ACCESS_SECRET = "access-secret";

export interface AuthenticatedRequest extends Request {
    user?: { id: string } & JwtPayload;
}

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers["authorization"];
    const token = authHeader?.startsWith('Bearer ')
            ? authHeader.slice(7)
            : req.cookies?.accessToken;
    
    if (!token) {
        return res.status(401).json({ message: 'Token manquant' });
    }

    jwt.verify(token, ACCESS_SECRET, (err : VerifyErrors | null, decoded : JwtPayload | string | undefined) => {
        if (err) {
            return res.status(403).json({ message: 'Token invalide' });
        }
        req.user = decoded as { id: string};
        next();
    });
}