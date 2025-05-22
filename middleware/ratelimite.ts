import { Request, Response, NextFunction, RequestHandler } from "express";
import { HttpError } from "../classes/httpError";
import { getUserByEmailFromDB } from "../Repo/userRepo";
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

export const rateLimiter: RequestHandler = async (req, res, next) => {
  const userbody = req.body;
  const user = await getUserByEmailFromDB(userbody.email);

  if (!user) throw new HttpError("User not found, please login", 401);

  const userId = user.id;
  const now = Date.now();
  const userCredit = user.credit;

  const rateData = RATE_LIMIT[userId];
  const minutesPassed = (now - rateData.lastRefill) / (60 * 1000);

  // Recharge les tokens
  if (minutesPassed >= 1) {
    const tokensToAdd = Math.floor(minutesPassed * REFILL_RATE);
    rateData.tokens = Math.min(MAX_TOKENS, rateData.tokens + tokensToAdd);
    rateData.lastRefill = now;
  }

  // Détermine le coût
  let method = req.method;

  if (req.path === "/login") {
    method = "LOGIN";
  }

  const cost = COSTS[method];

  if (rateData.tokens < cost) {
    res.status(429).json({
      message: "Trop de requêtes, veuillez patienter.",
      remainingTokens: rateData.tokens,
    });
    return;
  }

  // Décompte des crédits
  rateData.tokens -= cost;
  console.log(
    `User ${userId} - Credit left: ${rateData.tokens} - Cost: ${cost} - Method: ${method} - UserCost: ${user.credit}`
  );
  next();
};
