import userRepo from "../../Repo/userRepo";
import authService from "../../service/authService";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { HttpError } from "../../classes/httpError";
import { User } from "../../models/User";

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
    const mockUserInput = {
        email: 'test@example.com',
        password: 'Test@1234'
    };

    const mockUserFromDB = {
        id: "d14132fb-58f0-4d67-aa23-880142c2ca2f",
        nom: "TestNom",
        prenom: "TestPrenom",
        age: 30,
        email: 'test@example.com',
        password: 'hashedPassword'
    } as User;

    const ACCESS_TOKEN = 'access_token_example';
    const REFRESH_TOKEN = 'refresh_token_example';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return access and refresh tokens if credentials are valid', async () => {
        jest.spyOn(userRepo, 'getUserByEmailFromDB').mockResolvedValue(mockUserFromDB);
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);
        (jwt.sign as jest.Mock)
            .mockImplementationOnce(() => ACCESS_TOKEN)
            .mockImplementationOnce(() => REFRESH_TOKEN);

        const result = await authService.loginService(mockUserInput);

        expect(result).toEqual({ accesToken: ACCESS_TOKEN, refreshToken: REFRESH_TOKEN });
        expect(userRepo.getUserByEmailFromDB).toHaveBeenCalledWith(mockUserInput.email);
        expect(bcrypt.compare).toHaveBeenCalledWith(mockUserInput.password, mockUserFromDB.password);
        expect(jwt.sign).toHaveBeenCalledTimes(2);
    });

    it('should throw HttpError if user is not found', async () => {
        jest.spyOn(userRepo, 'getUserByEmailFromDB').mockResolvedValue(null);

        const result = authService.loginService(mockUserInput);

        await expect(result).rejects.toThrow(HttpError);
        await expect(result).rejects.toThrow('User not found');
        expect(userRepo.getUserByEmailFromDB).toHaveBeenCalledWith(mockUserInput.email);
    });

    it('should throw HttpError if password is incorrect', async () => {
        jest.spyOn(userRepo, 'getUserByEmailFromDB').mockResolvedValue(mockUserFromDB);
        (bcrypt.compare as jest.Mock).mockResolvedValue(false);

        const result = authService.loginService(mockUserInput);

        await expect(result).rejects.toThrow(HttpError);
        await expect(result).rejects.toThrow('Invalid password');
        expect(bcrypt.compare).toHaveBeenCalledWith(mockUserInput.password, mockUserFromDB.password);
    });
})