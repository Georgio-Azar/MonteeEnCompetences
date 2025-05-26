import { RequestHandler } from "express";
import { HttpError } from "../classes/httpError";
import { getUserByEmailFromDB, getUserByIdFromDB } from "../Repo/userRepo";

type RateLimitData = {
  tokens: number;
  lastRefill: number;
};

const RATE_LIMIT: { [userId: string]: RateLimitData } = {};
const MAX_TOKENS = 20;
const REFILL_RATE = 5;

const COSTS: { [method: string]: number } = {
  LOGIN: 5,
  GET: 1,
  PUT: 2,
};

export const rateLimitMiddleware = (userId: string): RateLimitData => {
  const now = Date.now();

  if (!RATE_LIMIT[userId]) {
    RATE_LIMIT[userId] = {
      tokens: MAX_TOKENS,
      lastRefill: now,
    };
  }

  const rateData = RATE_LIMIT[userId];
  const minutesPassed = (now - rateData.lastRefill) / (60 * 1000);


    const tokensToAdd = Math.floor(minutesPassed * REFILL_RATE);
    rateData.tokens = Math.min(MAX_TOKENS, rateData.tokens + tokensToAdd);
    rateData.lastRefill = now;
  return rateData;
};

export const rateLimiter: RequestHandler = async (req, res, next) => {
  try {
    const connectedUser = req.params.id;

    if (!connectedUser) {
      res.setHeader("X-RateLimit-Remaining", 0);
      throw next(new HttpError("User not authenticated", 401));
    }

    const user = await getUserByIdFromDB(connectedUser);

    if (!user) {
      res.setHeader("X-RateLimit-Remaining", 0);
      throw next(new HttpError("User not found", 401));
    }

    const userId = user.id;
    const rateData = rateLimitMiddleware(userId);

    const method = req.method.toUpperCase();
    const cost = COSTS[method] ?? 1;

    if (rateData.tokens < cost) {
      res.setHeader("X-RateLimit-Remaining", rateData.tokens);
      throw next(new HttpError("Trop de requêtes, veuillez patienter.", 429));
    }

    rateData.tokens = Math.max(0, rateData.tokens - cost);
    console.log(
      `User ${userId} - Credit left: ${rateData.tokens} - Cost: ${cost} - Method: ${method}`
    );
    res.setHeader("X-RateLimit-Remaining", rateData.tokens);
    return next();
  } catch (err) {
    return next(err);
  }
};

export const loginRateLimiter: RequestHandler = async (req, res, next) => {
  try {
    const email = req.body?.email;
    if (!email) throw new HttpError("Email requis", 400);

    const user = await getUserByEmailFromDB(email);
    if (!user) throw new HttpError("User not found", 401);

    const rateData = rateLimitMiddleware(user.id);

    let method = req.method.toUpperCase();
    if (req.path === "/login") method = "LOGIN";

    const cost = COSTS[method] ?? 1;

    if (rateData.tokens < cost) {
      throw next(new HttpError("Trop de requêtes, veuillez patienter.", 429));
    }
    rateData.tokens = Math.max(0, rateData.tokens - cost);

    console.log(
      `User ${user.id} - Credit left: ${rateData.tokens} - Cost: ${cost} - Method: ${method}`
    );

    res.setHeader("X-RateLimit-Remaining", rateData.tokens);
    return next();
  } catch (err) {
    return next(err);
  }
};
