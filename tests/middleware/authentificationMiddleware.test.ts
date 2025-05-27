import { authenticateToken } from '../../middleware/authentificationMiddleware'; // adaptez le chemin si besoin
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

jest.mock('jsonwebtoken');

const mockJwt = jwt as jest.Mocked<typeof jwt>;

describe('authenticateToken middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = {
      headers: {},
      cookies: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  it('should return 401 if no token is provided', () => {
    authenticateToken(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Token manquant' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 403 if token is invalid', () => {
    mockReq.headers = {
      authorization: 'Bearer invalid.token',
    };
    mockJwt.verify.mockImplementation((token, secret, callback) => {
      if (typeof callback === 'function') {
        (callback as jwt.VerifyCallback)(new Error('invalid token') as jwt.VerifyErrors, undefined);
      }
    });

    authenticateToken(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Token invalide' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 403 if decoded token is not an object with id', () => {
    mockReq.headers = {
      authorization: 'Bearer fake.token',
    };
    mockJwt.verify.mockImplementation((token, secret, callback) => {
      if (typeof callback === 'function') {
        (callback as jwt.VerifyCallback)(null, "notAnObject");
      }
    });

    authenticateToken(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Token invalide' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should attach user and call next() for valid token', () => {
    mockReq.headers = {
      authorization: 'Bearer valid.token',
    };
    const decoded = { id: 'user123', iat: 12345 };

    mockJwt.verify.mockImplementation((token, secret, callback) => {
      if (typeof callback === 'function') {
        (callback as jwt.VerifyCallback)(null, decoded);
      }
    });

    authenticateToken(mockReq as Request, mockRes as Response, mockNext);

    expect((mockReq as any).user).toEqual(decoded);
    expect(mockNext).toHaveBeenCalled();
  });

  it('should extract token from cookies if not in Authorization header', () => {
    mockReq.cookies = {
      accessToken: 'cookie.token',
    };
    const decoded = { id: 'user456', iat: 54321 };

    mockJwt.verify.mockImplementation((token, secret, callback) => {
      if (typeof callback === 'function') {
        (callback as jwt.VerifyCallback)(null, decoded);
      }
    });

    authenticateToken(mockReq as Request, mockRes as Response, mockNext);

    expect((mockReq as any).user).toEqual(decoded);
    expect(mockNext).toHaveBeenCalled();
  });
});
