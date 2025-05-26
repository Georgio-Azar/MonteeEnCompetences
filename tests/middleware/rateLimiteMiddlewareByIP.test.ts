import request from "supertest";
import express, { Request, Response } from "express";
import userRoutes from "../../routes/users";
import userRepo from "../../Repo/userRepo";
import { mock } from "node:test";

jest.mock("../../Repo/userRepo");
jest.mock("../../controllers/usersController", () => ({
  getUsersAsync: jest.fn((req, res) => res.send("Liste users")),
  getUsersByIdAsync: jest.fn((req, res) => res.send("User par ID")),
  addUserAsync: jest.fn((req, res) => res.send("Ajouté")),
  modifyUserAsync: jest.fn((req, res) => res.send("Modifié")),
  deleteUserAsync: jest.fn((req, res) => res.send("Supprimé")),
}));

describe("Test la rate limiter par IP", () => {
  const app = express();
  app.use(express.json());
  app.use(userRoutes);

  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("POST /users - accepte une requête", async () => {
    const res = await request(app).post("/").send({
      name: "Test User",
      email: "test@ikattan.com",
      password: "password123",
    });

    expect(res.status).toBe(200);
    expect(res.text).toBe("Ajouté");
  });

  it("POST /users - refuse après 10 requêtes (trop de requêtes)", async () => {
    for (let i = 0; i < 10; i++) {
      await request(app)
        .post("/")
        .send({
          name: `Test User ${i}`,
          email: `test${i}@ikattan.com`,
          password: "password123",
        });
    }
    const res = await request(app).post("/").send({
      name: "Test User 11",
      email: "lasttest@ikattan.com",
      password: "password123",
    });
    expect(res.status).toBe(429);
  });
});
