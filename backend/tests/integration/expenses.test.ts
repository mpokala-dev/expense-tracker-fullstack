import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../src/app";
import "./setup";

const validUser = {
  name: "Madhuri Test",
  email: "madhuri@test.com",
  password: "password123",
};

const validExpense = {
  title: "Coffee",
  amount: 3.50,
  category: "food",
  date: "2024-01-15",
  notes: "Morning coffee",
};

// Helper — registers a user and returns their JWT token.
// Used in every test that needs an authenticated request.
async function getAuthToken(): Promise<string> {
  const res = await request(app).post("/api/auth/register").send(validUser);
  return res.body.data.token as string;
}

describe("GET /api/expenses", () => {
  it("returns empty array when user has no expenses", async () => {
    const token = await getAuthToken();

    const res = await request(app)
      .get("/api/expenses")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([]);
  });

  it("returns 401 without a token", async () => {
    const res = await request(app).get("/api/expenses");
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("returns 401 with an invalid token", async () => {
    const res = await request(app)
      .get("/api/expenses")
      .set("Authorization", "Bearer invalid-token-string");

    expect(res.status).toBe(401);
  });
});

describe("POST /api/expenses", () => {
  it("creates an expense and returns it", async () => {
    const token = await getAuthToken();

    const res = await request(app)
      .post("/api/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send(validExpense);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe("Coffee");
    expect(res.body.data.amount).toBe(3.50);
    expect(res.body.data.category).toBe("food");
    expect(res.body.data._id).toBeDefined();
    // userId must never be someone else's — it's taken from JWT, not request body
    expect(res.body.data.userId).toBeDefined();
  });

  it("returns 400 when title is missing", async () => {
    const token = await getAuthToken();

    const res = await request(app)
      .post("/api/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send({ amount: 10, category: "food", date: "2024-01-15" });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it("returns 400 when amount is zero", async () => {
    const token = await getAuthToken();

    const res = await request(app)
      .post("/api/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send({ ...validExpense, amount: 0 });

    expect(res.status).toBe(400);
  });

  it("returns 400 when category is invalid", async () => {
    const token = await getAuthToken();

    const res = await request(app)
      .post("/api/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send({ ...validExpense, category: "invalid-category" });

    expect(res.status).toBe(400);
  });

  it("returns 401 without a token", async () => {
    const res = await request(app).post("/api/expenses").send(validExpense);
    expect(res.status).toBe(401);
  });
});

describe("PUT /api/expenses/:id", () => {
  it("updates an expense and returns the updated version", async () => {
    const token = await getAuthToken();

    // Create first
    const created = await request(app)
      .post("/api/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send(validExpense);

    const id = created.body.data._id as string;

    // Then update
    const res = await request(app)
      .put(`/api/expenses/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Latte", amount: 4.50 });

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe("Latte");
    expect(res.body.data.amount).toBe(4.50);
    expect(res.body.data.category).toBe("food"); // unchanged
  });

  it("returns 404 when expense does not exist", async () => {
    const token = await getAuthToken();

    const res = await request(app)
      .put("/api/expenses/000000000000000000000001")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Updated" });

    expect(res.status).toBe(404);
  });

  it("cannot update another user's expense", async () => {
    // User A creates an expense
    const tokenA = await getAuthToken();
    const created = await request(app)
      .post("/api/expenses")
      .set("Authorization", `Bearer ${tokenA}`)
      .send(validExpense);

    const id = created.body.data._id as string;

    // User B tries to update it
    const tokenB = await request(app)
      .post("/api/auth/register")
      .send({ name: "User B", email: "userb@test.com", password: "password123" });

    const res = await request(app)
      .put(`/api/expenses/${id}`)
      .set("Authorization", `Bearer ${tokenB.body.data.token}`)
      .send({ title: "Hacked" });

    expect(res.status).toBe(404); // not found for this user — not 403, to avoid leaking existence
  });
});

describe("DELETE /api/expenses/:id", () => {
  it("deletes an expense successfully", async () => {
    const token = await getAuthToken();

    const created = await request(app)
      .post("/api/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send(validExpense);

    const id = created.body.data._id as string;

    const res = await request(app)
      .delete(`/api/expenses/${id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify it's gone
    const check = await request(app)
      .get("/api/expenses")
      .set("Authorization", `Bearer ${token}`);

    expect(check.body.data).toHaveLength(0);
  });

  it("returns 404 when expense does not exist", async () => {
    const token = await getAuthToken();

    const res = await request(app)
      .delete("/api/expenses/000000000000000000000001")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  it("cannot delete another user's expense", async () => {
    const tokenA = await getAuthToken();
    const created = await request(app)
      .post("/api/expenses")
      .set("Authorization", `Bearer ${tokenA}`)
      .send(validExpense);

    const id = created.body.data._id as string;

    const tokenB = await request(app)
      .post("/api/auth/register")
      .send({ name: "User B", email: "userb@test.com", password: "password123" });

    const res = await request(app)
      .delete(`/api/expenses/${id}`)
      .set("Authorization", `Bearer ${tokenB.body.data.token}`);

    expect(res.status).toBe(404);
  });
});
