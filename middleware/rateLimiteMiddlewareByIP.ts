import rateLimit from "express-rate-limit";
import { HttpError } from "../classes/httpError";

export const rateLimiteMiddlewareByIP = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 requests per windowMs
  handler: (req, res, next) => {
    next(
      new HttpError(
        "too many requests, please try again later",
        429
      )
    );
  },
});
