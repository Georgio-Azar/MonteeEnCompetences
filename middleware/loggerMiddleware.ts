import { Request, Response, NextFunction } from "express";
import logger from "../logs/logger";

export const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
    res.on("finish", () => {
        logger.http(`${req.method} ${req.originalUrl} - ${req.ip}`);
        if (req.method !== "GET") {
        }
    });
    res.on("error", (err) => {
        logger.error(`Error: ${err}`);
        console.log(`Error: ${err}`);
    });
    
    next();
}

export default loggerMiddleware;