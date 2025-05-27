import {
  rateLimitMiddleware,
  rateLimiter,
  loginRateLimiter
} from "../../middleware/rateLimiteMiddleware"; // adapte le chemin si besoin

import { getUserByIdFromDB, getUserByEmailFromDB, modifyUserInDB } from '../../Repo/userRepo';
import { HttpError } from "../../classes/httpError";

jest.mock('../../Repo/userRepo');

const mockUser = {
  id: 'user-123',
  credit: 10,
  creditLastUpdated: new Date(Date.now() - 2 * 60 * 1000).toISOString() // 2 minutes ago
};

describe('rateLimitMiddleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getUserByIdFromDB as jest.Mock).mockResolvedValue({ ...mockUser });
    (modifyUserInDB as jest.Mock).mockResolvedValue(null);
  });

  it('should refill tokens and update user in DB', async () => {
    const result = await rateLimitMiddleware(mockUser.id);

    expect(getUserByIdFromDB).toHaveBeenCalledWith(mockUser.id);
    expect(modifyUserInDB).toHaveBeenCalled();
    expect(result.tokens).toBeLessThanOrEqual(20);
    expect(result.lastRefill).toBeLessThanOrEqual(Date.now());
  });

  it('should throw error if user not found', async () => {
    (getUserByIdFromDB as jest.Mock).mockResolvedValue(null);

    await expect(rateLimitMiddleware('invalid-id')).rejects.toThrow(HttpError);
  });
});

describe('rateLimiter middleware', () => {
  const mockReq: any = {
    params: { id: mockUser.id },
    method: 'GET',
    path: '/',
    headers: {},
    setHeader: jest.fn()
  };
  const mockRes: any = {
    setHeader: jest.fn()
  };
  const mockNext = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (getUserByIdFromDB as jest.Mock).mockResolvedValue({ ...mockUser });
    (modifyUserInDB as jest.Mock).mockResolvedValue(null);
  });

  it('should call next if user has enough credits', async () => {
    await rateLimiter(mockReq, mockRes, mockNext);

    expect(mockRes.setHeader).toHaveBeenCalledWith("X-RateLimit-Remaining", expect.any(Number));
    expect(mockNext).toHaveBeenCalledWith();
  });

  it('should return error if no user id', async () => {
    mockReq.params.id = null;

    await rateLimiter(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(HttpError));
  });

  it('should return 429 if not enough tokens', async () => {
    (getUserByIdFromDB as jest.Mock).mockResolvedValue({ ...mockUser, credit: 0 });

    await rateLimiter(mockReq, mockRes, mockNext);

    expect(mockRes.setHeader).toHaveBeenCalledWith("X-RateLimit-Remaining", 0);
    expect(mockNext).toHaveBeenCalledWith(expect.any(HttpError));
  });
});

describe('loginRateLimiter middleware', () => {
  const mockReq: any = {
    body: { email: 'test@example.com' },
    method: 'POST',
    path: '/login',
    setHeader: jest.fn()
  };
  const mockRes: any = {
    setHeader: jest.fn()
  };
  const mockNext = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (getUserByEmailFromDB as jest.Mock).mockResolvedValue({ ...mockUser });
    (modifyUserInDB as jest.Mock).mockResolvedValue(null);
  });

  it('should call next if login credits are enough', async () => {
    await loginRateLimiter(mockReq, mockRes, mockNext);

    expect(mockRes.setHeader).toHaveBeenCalledWith("X-RateLimit-Remaining", expect.any(Number));
    expect(mockNext).toHaveBeenCalledWith();
  });

  it('should throw error if email missing', async () => {
    mockReq.body.email = undefined;

    await loginRateLimiter(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(HttpError));
  });

  it('should return 429 if not enough login tokens', async () => {
    (getUserByEmailFromDB as jest.Mock).mockResolvedValue({ ...mockUser, credit: 0 });

    await loginRateLimiter(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(HttpError));
  });

  it('should return 401 if user not found in DB', async () => {
    const mockReq: any = {
      params: { id: 'invalid-id' },
      method: 'GET',
      setHeader: jest.fn()
    };
    const mockRes: any = {
      setHeader: jest.fn()
    };
    const mockNext = jest.fn();

    (getUserByIdFromDB as jest.Mock).mockResolvedValue(null); // simulate user not found

    await rateLimiter(mockReq, mockRes, mockNext);

    expect(mockRes.setHeader).toHaveBeenCalledWith("X-RateLimit-Remaining", 0);
    expect(mockNext).toHaveBeenCalledWith(expect.any(HttpError));

    const err = mockNext.mock.calls[0][0];
    expect(err).toBeInstanceOf(HttpError);
    expect(err.statusCode).toBe(401);
    expect(err.message).toBe("User not found");
  });

  it('should return 429 if user has not enough tokens', async () => {
    const mockUserId = 'user-123';

    const mockReq: any = {
      params: { id: mockUserId },
      method: 'GET',
      setHeader: jest.fn()
    };
    const mockRes: any = {
      setHeader: jest.fn()
    };
    const mockNext = jest.fn();

    // Simule un utilisateur valide
    (getUserByIdFromDB as jest.Mock).mockResolvedValue({ id: mockUserId });

    // Simule des crédits insuffisants
    jest.spyOn(require("../../middleware/rateLimiteMiddleware"), "rateLimitMiddleware").mockResolvedValue({
      tokens: 0,
      lastRefill: Date.now()
    });

    await rateLimiter(mockReq, mockRes, mockNext);

    expect(mockRes.setHeader).toHaveBeenCalledWith("X-RateLimit-Remaining", 0);
    expect(mockNext).toHaveBeenCalledWith(expect.any(HttpError));

    const err = mockNext.mock.calls[0][0];
    expect(err).toBeInstanceOf(HttpError);
    expect(err.statusCode).toBe(429);
    expect(err.message).toBe("Trop de requêtes, veuillez patienter.");
  });

  it('should throw 401 if user is not found by email', async () => {
    const mockReq: any = {
      body: { email: 'nonexistent@example.com' },
      method: 'POST',
      path: '/login',
    };
    const mockRes: any = {
      setHeader: jest.fn(),
    };
    const mockNext = jest.fn();

    (getUserByEmailFromDB as jest.Mock).mockResolvedValue(undefined); // simulate not found

    await loginRateLimiter(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(HttpError));

    const error = mockNext.mock.calls[0][0];
    expect(error).toBeInstanceOf(HttpError);
    expect(error.statusCode).toBe(401);
    expect(error.message).toBe("User not found");
  });

  it('should throw 429 if user does not have enough tokens for login', async () => {
    const mockUser = { id: 'user-456', email: 'user@example.com' };

    const mockReq: any = {
      body: { email: mockUser.email },
      method: 'POST',
      path: '/login',
    };
    const mockRes: any = {
      setHeader: jest.fn(),
    };
    const mockNext = jest.fn();

    (getUserByEmailFromDB as jest.Mock).mockResolvedValue(mockUser);
    (rateLimitMiddleware as jest.Mock).mockResolvedValue({
      tokens: 4, // less than LOGIN cost (5)
      lastRefill: Date.now(),
    });

    await loginRateLimiter(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(HttpError));
    const error = mockNext.mock.calls[0][0];
    expect(error).toBeInstanceOf(HttpError);
    expect(error.statusCode).toBe(429);
    expect(error.message).toBe("Trop de requêtes, veuillez patienter.");
  });
});
