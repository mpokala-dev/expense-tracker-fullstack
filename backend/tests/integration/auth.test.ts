import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../src/app";
import "./setup";

// Integration tests hit the real Express app (routing → middleware → controller → service).
// The only thing mocked is the database — replaced by mongodb-memory-server.
// This gives us confidence the full HTTP stack works together correctly.

const validUser = {
  name: "Madhuri Test",
  email: "madhuri@test.com",
  password: "password123",
};

describe("POST /api/auth/register", () => {
  it("registers a new user and returns a token", async () => {
    const res = await request(app).post("/api/auth/register").send(validUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe(validUser.email);
    expect(res.body.data.user.password).toBeUndefined(); // never returned
  });

  it("returns 409 when email already exists", async () => {
    await request(app).post("/api/auth/register").send(validUser);
    const res = await request(app).post("/api/auth/register").send(validUser);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/already in use/i);
  });

  it("returns 400 when name is missing", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "test@test.com", password: "password123" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
  });

  it("returns 400 when email is invalid", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Test", email: "not-an-email", password: "password123" });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it("returns 400 when password is too short", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Test", email: "test@test.com", password: "abc" });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });
});

describe("POST /api/auth/login", () => {
  // Register a user before each login test
  async function registerUser() {
    const res = await request(app).post("/api/auth/register").send(validUser);
    return res.body.data.token as string;
  }

  it("logs in with correct credentials and returns a token", async () => {
    await registerUser();

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: validUser.email, password: validUser.password });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe(validUser.email);
  });

  it("returns 401 for wrong password", async () => {
    await registerUser();

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: validUser.email, password: "wrongpassword" });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("returns 401 for non-existent email", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@test.com", password: "password123" });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("returns 400 when email is missing", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ password: "password123" });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });
});
