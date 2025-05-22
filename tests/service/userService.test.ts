import userRepo from "../../Repo/userRepo";
import { User } from "../../models/User";
import userService from "../../service/userService";
import UserDTO from "../../dto/userDTO";
import { addUserSchema, modifyUserSchema } from "../../schemas/usersSchemas";
import usersUtil from "../../utils/usersUtils";
import { ZodError } from "zod";
import { HttpError } from "../../classes/httpError";
import usersUtils from "../../utils/usersUtils";

describe('userService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should get all users', async () => {
        const mockUsers: User[] = [
            {
                id: "d14132fb-58f0-4d67-aa23-880142c2ca2f", nom: "Jean",
                prenom: "Andre", age: 10, email: "Jean.Andre@mail.com", password: "Mcp@ssw0rd123"
            } as User,
            {
                id: "d32c3d6a-1b28-42dc-bf88-e74e8f13a339", nom: "Martin",
                prenom: "Dupont", age: 20, email: "Martin.Dupont@gmail.com", password: "Mcp@ssw0rd123"
            } as User,
            {
                id: "b5724cb9-b0e1-4279-9c3e-ebfc332fe2ef", nom: "Marie",
                prenom: "Dupuis", age: 30, email: "Marie.Dupuis@gmail.com", password: "Mcp@ssw0rd123"
            } as User
        ]

        jest.spyOn(userRepo, 'getUsersFromDB').mockResolvedValue(mockUsers);

        const result = await userService.getUsersService();
        expect(result).toEqual(mockUsers.map((user) => {
            return new UserDTO(user.id, user.nom, user.prenom, user.age, user.email, user.credit);
        }));
    });

    it('should throw HttpError if no users found', async () => {
        jest.spyOn(userRepo, 'getUsersFromDB').mockResolvedValue([]);

        const result = userService.getUsersService();
        await expect(result).rejects.toThrow('No users found');
    })

    it('should get user by id', async () => {
        const mockUser: User = {
            id: "d14132fb-58f0-4d67-aa23-880142c2ca2f", nom: "Jean",
            prenom: "Andre", age: 10, email: "Jean.Andre@gmail.com", password: "Mcp@ssw0rd123"
        } as User;

        jest.spyOn(userRepo, 'getUserByIdFromDB').mockResolvedValue(mockUser);
        const result = await userService.getUsersByIdService(mockUser.id);
        expect(result).toEqual(new UserDTO(mockUser.id, mockUser.nom, mockUser.prenom, mockUser.age, mockUser.email, mockUser.credit));
    });

    it('should throw HttpError if user not found', async () => {
        const mockId = "d14132fb-58f0-4d67-aa23-880142c2ca2f";
        jest.spyOn(userRepo, 'getUserByIdFromDB').mockResolvedValue(null);

        const result = userService.getUsersByIdService(mockId);
        await expect(result).rejects.toThrow('User not found');
    });

    it('should add user', async () => {
        const mockUserInput = {
            nom: "Jean",
            prenom: "Andre",
            age: 10,
            email: "Jean.Andre@gmail.com",
            password: "Mcp@ssw0rd123"
        };

        const mockHashedPassword = '$hashedPassword123';

        const mockUser: User = {
            id: "d14132fb-58f0-4d67-aa23-880142c2ca2f",
            nom: mockUserInput.nom,
            prenom: mockUserInput.prenom,
            age: mockUserInput.age,
            email: mockUserInput.email,
            password: mockHashedPassword
        } as User;

        jest.spyOn(addUserSchema, 'safeParse').mockReturnValue({ success: true, data: mockUserInput });
        jest.spyOn(usersUtil, 'checkPassword').mockReturnValue("");
        //jest.spyOn(usersUtil, 'hashPassword').mockResolvedValue(mockHashedPassword);
        jest.spyOn(userRepo, 'addUserToDB').mockResolvedValue(mockUser);

        const result = await userService.addUserService(mockUserInput);

        expect(result).toEqual(new UserDTO(mockUser.id, mockUser.nom, mockUser.prenom, mockUser.age, mockUser.email, mockUser.credit));
        expect(addUserSchema.safeParse).toHaveBeenCalledWith(mockUserInput);
        expect(usersUtil.checkPassword).toHaveBeenCalledWith(mockUserInput.password);
        //expect(usersUtil.hashPassword).toHaveBeenCalledWith(mockUserInput.password);
        expect(userRepo.addUserToDB).toHaveBeenCalledWith({
            id: expect.any(String),
            credit: 20,
            nom: mockUserInput.nom,
            prenom: mockUserInput.prenom,
            age: mockUserInput.age,
            email: mockUserInput.email,
            password: expect.stringMatching(/^\$2[aby]\$.{56}$/)
        });
        expect(userRepo.addUserToDB).toHaveBeenCalledTimes(1);
    });

    it ('should throw HttpError if user not created', async () => {
        const mockUserInput = {
            nom: "Jean",
            prenom: "Andre",
            age: 10,
            email: "Jean.Andre@gmail.com",
            password: "Mcp@ssw0rd123"
        };
        const mockHashedPassword = '$hashedPassword123';

        jest.spyOn(addUserSchema, 'safeParse').mockReturnValue({ success: true, data: mockUserInput });
        jest.spyOn(usersUtil, 'checkPassword').mockReturnValue("");
        //jest.spyOn(usersUtil, 'hashPassword').mockResolvedValue(mockHashedPassword);
        jest.spyOn(userRepo, 'addUserToDB').mockResolvedValue(null as unknown as User);
        const result = userService.addUserService(mockUserInput);
        await expect(result).rejects.toThrow('User not created');
        expect(addUserSchema.safeParse).toHaveBeenCalledWith(mockUserInput);
        expect(usersUtil.checkPassword).toHaveBeenCalledWith(mockUserInput.password);
        //expect(usersUtil.hashPassword).toHaveBeenCalledWith(mockUserInput.password);
        expect(userRepo.addUserToDB).toHaveBeenCalledWith({
            id: expect.any(String),
            credit: 20,
            nom: mockUserInput.nom,
            prenom: mockUserInput.prenom,
            age: mockUserInput.age,
            email: mockUserInput.email,
            password: expect.stringMatching(/^\$2[aby]\$.{56}$/)
        });
        expect(userRepo.addUserToDB).toHaveBeenCalledTimes(1);
    });

    it ('should throw HttpError if password is not valid', async () => {
        const mockUserInput = {
            nom: "Jean",
            prenom: "Andre",
            age: 10,
            email: "Jean.Andre@gmail.com",
            password: "longpassword"
        };

        jest.spyOn(addUserSchema, 'safeParse').mockReturnValue({ success: true, data: mockUserInput });
        jest.spyOn(usersUtil, 'checkPassword').mockReturnValue('Password must contain at least one special character');
        const result = userService.addUserService(mockUserInput);
        await expect(result).rejects.toThrow('Password must contain at least one special character');
        expect(addUserSchema.safeParse).toHaveBeenCalledWith(mockUserInput);
        expect(usersUtil.checkPassword).toHaveBeenCalledWith(mockUserInput.password);
        //expect(usersUtil.hashPassword).not.toHaveBeenCalled();
        expect(userRepo.addUserToDB).not.toHaveBeenCalled();
    });

    it ('should throw HttpError if user input is not valid', async() => {
        const mockUserInput = {
            nom: "Jean",
            prenom: "Andre",
            age: 10,
            email: "Jean",
            password: "Mcp@ssw0rd123"
        };

        const mockZodError = new ZodError([
            {
                message: 'Invalid email format',
                path: ['email'],
                code: 'custom'
            }
        ]);

        jest.spyOn(addUserSchema, 'safeParse').mockReturnValue({
            success: false as const,
            error: mockZodError
        });
        const result = userService.addUserService(mockUserInput);
        await expect(result).rejects.toThrow('Invalid email format');
        expect(addUserSchema.safeParse).toHaveBeenCalledWith(mockUserInput);
        expect(usersUtil.checkPassword).not.toHaveBeenCalled();
        //expect(usersUtil.hashPassword).not.toHaveBeenCalled();
        expect(userRepo.addUserToDB).not.toHaveBeenCalled();
    });

    it('should modify user', async () => {
        const mockId = "d14132fb-58f0-4d67-aa23-880142c2ca2f";
        const mockUserInput = {
            password: "Mcp&ssw0rd123",
        };
        const expectedHashedPassword  = {password : expect.stringMatching(/^\$2[aby]\$.{56}$/)};
        const mockUpdatedUser: User = {
            id: mockId,
            nom: "Jean",
            prenom: "Andre",
            age: 10,
            email: "Jean.Andre@gmail.com",
            password: expect.stringMatching(/^\$2[aby]\$.{56}$/)
        } as User;

        jest.spyOn(userRepo, 'modifyUserInDB').mockResolvedValue(mockUpdatedUser);
        jest.spyOn(usersUtils, 'checkPassword').mockReturnValue("");
        const result = await userService.modifyUserService(mockId, mockUserInput);
        expect(result).toEqual(new UserDTO(mockUpdatedUser.id, mockUpdatedUser.nom, mockUpdatedUser.prenom, mockUpdatedUser.age, mockUpdatedUser.email, mockUpdatedUser.credit));
        expect(userRepo.modifyUserInDB).toHaveBeenCalledWith(mockId, expectedHashedPassword);
        expect(userRepo.modifyUserInDB).toHaveBeenCalledTimes(1);
    });

    it('should throw HttpError if user not found', async () => {
        const mockId = "d14132fb-58f0-4d67-aa23-880142c2ca2f";
        const mockUserInput = {
            nom: "Jean"
        };
        jest.spyOn(userRepo, 'modifyUserInDB').mockResolvedValue(null as unknown as User);
        const result = userService.modifyUserService(mockId, mockUserInput);
        await expect(result).rejects.toThrow('User not found');
        expect(userRepo.modifyUserInDB).toHaveBeenCalledWith(mockId, mockUserInput);
        expect(userRepo.modifyUserInDB).toHaveBeenCalledTimes(1);
    });

    it ('should throw HttpError if user input is not valid', async() => {
        const mockId = "d14132fb-58f0-4d67-aa23-880142c2ca2f";
        const mockUserInput = {
            nom: "Jean",
            prenom: "Andre",
            age: 10,
            email: "Jean",
            password: "Mcp@ssw0rd123"
        };

        const mockZodError = new ZodError([
            {
                validation: "email",
                code: "invalid_string",
                message: "Invalid email",
                path: [
                    "email" 
                ]
            }
        ]);
        jest.spyOn(modifyUserSchema, 'safeParse').mockReturnValue({
            success: false as const,
            error: mockZodError
        });
        const result = userService.modifyUserService(mockId, mockUserInput);
        await expect(result).rejects.toThrow(mockZodError);
        expect(modifyUserSchema.safeParse).toHaveBeenCalledWith(mockUserInput);
        expect(usersUtil.checkPassword).not.toHaveBeenCalled();
        //expect(usersUtil.hashPassword).not.toHaveBeenCalled();
        expect(userRepo.modifyUserInDB).not.toHaveBeenCalled();
    });

    it ('should throw HttpError if password is not valid', async () => {
        const mockId = "d14132fb-58f0-4d67-aa23-880142c2ca2f";
        const mockUserInput = {
            password: "longpassword"
        };

        jest.spyOn(modifyUserSchema, 'safeParse').mockReturnValue({ success: true, data: mockUserInput });
        jest.spyOn(usersUtil, 'checkPassword').mockReturnValue('Password must contain at least one special character');
        const result = userService.modifyUserService(mockId, mockUserInput);
        await expect(result).rejects.toThrow('Password must contain at least one special character');
        expect(modifyUserSchema.safeParse).toHaveBeenCalledWith(mockUserInput);
        expect(usersUtil.checkPassword).toHaveBeenCalledWith(mockUserInput.password);
        //expect(usersUtil.hashPassword).not.toHaveBeenCalled();
        expect(userRepo.modifyUserInDB).not.toHaveBeenCalled();
    })

    it('should return true if user is deleted', async () => {
        const mockId = '123e4567-e89b-12d3-a456-426614174000';


        // Arrange
        jest.spyOn(userRepo, 'deleteUserInDB').mockResolvedValue(undefined);

        // Act
        const result = await userService.deleteUserService(mockId);

        // Assert
        expect(result).toBe(true);
        expect(userRepo.deleteUserInDB).toHaveBeenCalledWith(mockId);
    });

    it('should throw HttpError if user not found', async () => {
        const mockId = '123e4567-e89b-12d3-a456-426614174000';
        // Arrange
        jest.spyOn(userRepo, 'deleteUserInDB').mockResolvedValue(null as unknown as Promise<void>);

        // Act
        const result = userService.deleteUserService(mockId);

        // Assert
        await expect(result).rejects.toThrow(HttpError);
        await expect(result).rejects.toThrow('User not found');
        expect(userRepo.deleteUserInDB).toHaveBeenCalledWith(mockId);
    });
})