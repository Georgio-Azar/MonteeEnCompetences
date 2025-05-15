import { Request, Response, NextFunction } from "express";

import logger from "../logs/logger";
import { HttpError } from "../classes/httpError";

export const errorMiddleware = (
    err : HttpError,
    req : Request,
    res : Response,
    next : NextFunction
) => {
    logger.error(`Error: ${err.message} - ${err.statusCode}`);
    
    res.status(err.statusCode || 500).send(err.message || "Internal Server Error");

    next();
}

export default errorMiddleware;