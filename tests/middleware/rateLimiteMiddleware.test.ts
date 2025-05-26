import request from "supertest";
import express, { Request, Response } from "express";
import userRepo from "../../Repo/userRepo";
import userRoutes from "../../routes/users";
import authRoutes from "../../routes/auth";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
import authController from "../../controllers/authController";

jest.mock("bcryptjs");

jest.mock("../../Repo/userRepo");
jest.mock("../../controllers/authController", () => ({
  __esModule: true,
  default: {
    loginAsync: jest.fn(),
  },
}));

jest.mock("../../controllers/usersController", () => ({
  getUsersAsync: jest.fn((req, res) => res.send("Liste users")),
  getUsersByIdAsync: jest.fn((req, res) => res.send("User par ID")),
  addUserAsync: jest.fn((req, res) => res.send("Ajouté")),
  modifyUserAsync: jest.fn((req, res) => res.send("Modifié")),
  deleteUserAsync: jest.fn((req, res) => res.send("Supprimé")),
}));

const mockUser = { id: "user123", email: "test@example.com" };

describe("LOGIN : Test la rate limiter de login", () => {
  const app = express();
  app.use(bodyParser.json());
  app.use(authRoutes);

  beforeEach(() => {
    jest.clearAllMocks();
    (userRepo.getUserByEmailFromDB as jest.Mock).mockResolvedValue(mockUser);
    (authController.loginAsync as jest.Mock).mockImplementation(
      (req: Request, res: Response) => {
        res.status(200).send("Login réussi");
      }
    );
  });

  it("POST /login - accepte la connexion avec email valide et consommer 5 token", async () => {
    const res = await request(app)
      .post("/login")
      .send({ email: mockUser.email });

    expect(res.status).toBe(200);
    expect(res.text).toBe("Login réussi");
    expect(res.headers["x-ratelimit-remaining"]).toEqual("15");
  });

  it("POST /login - refuse après 5 tentatives (trop de requêtes)", async () => {
    for (let i = 0; i < 4; i++) {
      await request(app).post("/login").send({ email: mockUser.email });
    }
    const res = await request(app)
      .post("/login")
      .send({ email: mockUser.email });
    expect(res.status).toBe(429);
  });

  it("POST /login - erreur 400 si email manquant", async () => {
    const res = await request(app).post("/login").send({});
    expect(res.status).toBe(400);
    expect(res.text).toMatch(/Email requis/);
  });

  it("POST /login - erreur 401 si utilisateur non trouvé", async () => {
    (userRepo.getUserByEmailFromDB as jest.Mock).mockResolvedValue(null);
    const res = await request(app)
      .post("/login")
      .send({ email: "notfound@example.com" });

    expect(res.status).toBe(401);
    expect(res.text).toMatch(/User not found/);
  });
});

const mockUserPut = { id: "userput", email: "testput@ikattan.com" };

describe("Test rateLimite PUT /:id", () => {
  const app = express();
  app.use(bodyParser.json());

  app.use("/", userRoutes);

  beforeEach(() => {
    jest.clearAllMocks();
    (userRepo.getUserByIdFromDB as jest.Mock).mockResolvedValue(mockUserPut);
  });

  const tokenPut = jwt.sign({ id: "userput" }, "access-secret", {
    expiresIn: "1h",
  });

  it("PUT autorisé avec token JWT valide", async () => {
    const res = await request(app)
      .put("/userput")
      .set("Authorization", `Bearer ${tokenPut}`)
      .send({ name: "test" });

    expect(res.status).toBe(200);
    expect(res.text).toBe("Modifié");
    expect(res.headers["x-ratelimit-remaining"]).toEqual("18");
  });

  it("PUT bloqué après trop de requêtes", async () => {
    for (let i = 0; i < 10; i++) {
      await request(app)
        .put("/userput")
        .set("Authorization", `Bearer ${tokenPut}`)
        .send({ name: "test" });
    }
    const res = await request(app)
      .put("/userput")
      .set("Authorization", `Bearer ${tokenPut}`)
      .send({ name: "limite" });

    expect(res.headers["x-ratelimit-remaining"]).toEqual("0");
    expect(res.status).toBe(429);
  });

  it("Refus sans token", async () => {
    const res = await request(app).put("/user123").send({ name: "test" });
    expect(res.status).toBe(401);
  });
});
const mockUserGet = { id: "userGet", email: "testget@ikattan.com" };
describe("Test rateLimite GET /:id", () => {
  const app = express();
  app.use(bodyParser.json());

  app.use("/", userRoutes);

  beforeEach(() => {
    jest.clearAllMocks();
    (userRepo.getUserByIdFromDB as jest.Mock).mockResolvedValue(mockUserGet);
  });

  const newtoken = jwt.sign({ id: "userGet" }, "access-secret", {
    expiresIn: "1h",
  });

  it("GET autorisé avec token JWT valide", async () => {
    const res = await request(app)
      .get("/userGet")
      .set("Authorization", `Bearer ${newtoken}`);

    expect(res.status).toBe(200);
    expect(res.headers["x-ratelimit-remaining"]).toEqual("19");
  });

  it("GET bloqué après trop de requêtes", async () => {
    for (let i = 0; i < 25; i++) {
      await request(app)
        .get("/userGet")
        .set("Authorization", `Bearer ${newtoken}`);
    }
    const res = await request(app)
      .get("/userGet")
      .set("Authorization", `Bearer ${newtoken}`);

    expect(res.status).toBe(429);
    expect(res.headers["x-ratelimit-remaining"]).toEqual("0");
  });

  it("Refus sans token", async () => {
    const res = await request(app).get("/userGet");
    expect(res.status).toBe(401);
  });
  it("Refus token invalide", async () => {
    const res = await request(app)
      .get("/userGet")
      .set("Authorization", `Bearer invalidtoken`);
    expect(res.status).toBe(403);
  });

  it("refus user non trouvé", async () => {
    (userRepo.getUserByIdFromDB as jest.Mock).mockResolvedValue(null);
    const res = await request(app)
      .get("/userGet")
      .set("Authorization", `Bearer ${newtoken}`);
    expect(res.status).toBe(401);
  });
});
