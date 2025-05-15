import { Request, Response, NextFunction } from "express";
import logger from "../logs/logger";

export const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
    res.on("finish", () => {
        logger.http(`${req.method} ${req.originalUrl} - ${req.ip}`);
        if (req.method !== "GET") {
        }
    });
    
    next();
}

export default loggerMiddleware;