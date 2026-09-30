// /test/auth/auth.register.test.ts
import { describe, it, expect, beforeEach } from "vitest"
import request from "supertest"
import app from "../../src/app.js"
import { createAuthenticatedUser } from "../../tests/helpers/auth.js"

describe("User registration process", () => {

  let accessToken: string;
  let user: object;

  beforeEach(async () => {
    ({ user, accessToken } = await createAuthenticatedUser());
  })

  it("returns 409 when email already exists", async () => {
    const email = `duplicate-${Date.now()}@example.com`
    const password = "Password123!"

    const firstResponse = await request(app)
      .post("/api/auth/register")
      .send({
        email,
        password,
        passwordConfirm: password
      })

    expect(firstResponse.status).toBe(201)

    const secondResponse = await request(app)
      .post("/api/auth/register")
      .send({
        email,
        password,
        passwordConfirm: password
      })

    expect(secondResponse.status).toBe(409)
  })
  it("returns 400 when email is invalid", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        email: "not-an-email",
        password: "Password123!",
        passwordConfirm: "Password123!"
      })

    expect(response.status).toBe(400)
  })
  it("returns 400 when password is too short", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        email: `test-${Date.now()}@example.com`,
        password: "123",
        passwordConfirm: "123"
      })

    expect(response.status).toBe(400)
  })
  it("returns 400 when passwords do not match", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        email: `test-${Date.now()}@example.com`,
        password: "Password123!",
        passwordConfirm: "Different123!"
      })

    expect(response.status).toBe(400)
  })
  it("registers a user with valid credentials", async () => {
    const email = `test-${Date.now()}@example.com`
    const password = "Password123!"

    const createResponse = await request(app)
      .post("/api/auth/register")
      .send({
        email,
        password,
        passwordConfirm: password
      })

    expect(createResponse.status).toBe(201);
    expect(createResponse.body).toHaveProperty("id")
    expect(createResponse.body).toHaveProperty("email", email)
    expect(createResponse.body).not.toHaveProperty("password")
    expect(createResponse.body).not.toHaveProperty("passwordHash")
    expect(createResponse.body).not.toHaveProperty("password_hash")
    //expect(createResponse.body).toHaveProperty("isActive", false)
  })
});