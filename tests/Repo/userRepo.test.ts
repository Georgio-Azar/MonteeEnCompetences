import userRepo from "../../Repo/userRepo";
import { Sequelize } from "sequelize-typescript";
import { User } from "../../models/User";

let sequelize: Sequelize;
beforeAll(async () => {
    sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: ':memory:',
        logging: false,
    });

    sequelize.addModels([User]);

    await sequelize.sync();
    await User.bulkCreate([
        {
            id: '1',
            nom: 'Jean',
            prenom: 'Dupont',
            age: 30,
            email: 'jean.dupont@example.com',
            password: 'SecureP@ssword123',
            credit: 20,
            creditLastUpdated: new Date(),
        }
    ]);
})

afterAll(async () => {
  await sequelize.close();
});

describe("userRepo", () => {
    it ("should return all users", async() => {
        const users = await userRepo.getUsersFromDB();
        expect(users).toBeDefined();
        expect(users.length).toBeGreaterThan(0);
    })

    it ("should return that no users were found", async() => {
        await User.destroy({ where: {} });
        await expect(userRepo.getUsersFromDB()).rejects.toThrow('No users found');
    })

    it ("should return a user by id", async() => {
        await User.bulkCreate([
        {
            id: '1',
            nom: 'Jean',
            prenom: 'Dupont',
            age: 30,
            email: 'jean.dupont@example.com',
            password: 'SecureP@ssword123',
            credit: 20,
            creditLastUpdated: new Date(),
        }
    ]);
        const user = await userRepo.getUserByIdFromDB('1');
        expect(user).toBeDefined();
        expect(user?.id).toBe('1');
    })

    it ("should return that no user was found", async() => {
        await expect(userRepo.getUserByIdFromDB('999')).rejects.toThrow('User not found');
    

        const newUser = {
            id: '2',
            nom: 'Marie',
            prenom: 'Curie',
            age: 35,
            email: 'Marie.Curie@gmail.com',
            password: 'Mcp@ssw0rd123',
            credit: 20,
            creditLastUpdated: new Date(),
        };
        const user = await userRepo.addUserToDB(newUser);
        expect(user).toBeDefined();
        expect(user.id).toBe('2');
        expect(user.nom).toBe('Marie');
        expect(user.prenom).toBe('Curie');
        expect(user.age).toBe(35);
        expect(user.email).toBe('Marie.Curie@gmail.com');
        expect(user.password).toBe('Mcp@ssw0rd123');
    })

    it ("should modify a user in the database", async() => {
        const userToModify = {
            age: 36,
            email: 'MarieCury@gmail.com',
        }
        const user = await userRepo.modifyUserInDB('2', userToModify);
        expect(user).toBeDefined();
        expect(user?.id).toBe('2');
        expect(user?.nom).toBe('Marie');
        expect(user?.prenom).toBe('Curie');
        expect(user?.age).toBe(36);
        expect(user?.email).toBe('MarieCury@gmail.com');
        expect(user?.password).toBe('Mcp@ssw0rd123');
    })

    it ("should return that no user was found to modify", async() => {
        const userToModify = {
            age: 36,
            email: 'MarieCury@gmail.com',
        }
        await expect(userRepo.modifyUserInDB('999', userToModify)).resolves.toBeNull();
    })

    it ("should delete a user from the database", async() => {
        await userRepo.deleteUserInDB('2');
        const users = await userRepo.getUsersFromDB();
        expect(users.length).toBe(1);
    })

    it ("should return that no user was found to delete", async() => {
        await expect(userRepo.deleteUserInDB('999')).rejects.toThrow('User not found');
    })

    it ("should return a user by email", async() => {
        const user = await userRepo.getUserByEmailFromDB('jean.dupont@example.com');
        expect(user).toBeDefined();
        expect(user?.id).toBe('1');
        expect(user?.nom).toBe('Jean');
        expect(user?.prenom).toBe('Dupont');
        expect(user?.age).toBe(30);
        expect(user?.email).toBe('jean.dupont@example.com');
        expect(user?.password).toBe('SecureP@ssword123');
    })

    it ("should return that no user was found by email", async() => {
        await expect(userRepo.getUserByEmailFromDB('j@mail.com')).rejects.toThrow('User not found');
    })
})