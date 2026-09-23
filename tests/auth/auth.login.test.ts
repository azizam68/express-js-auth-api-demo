// /test/auth/auth.login.test.ts
import { describe, it, expect } from "vitest"
import request from "supertest"
import app from "../../src/app.js"
import jwt from "jsonwebtoken"

describe("POST /api/auth/login", () => {
  it("returns 400 body invalide", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        "email":"mail@not-in-db.com",
        "passwordHash": "not the password"
      })

    expect(response.status).toBe(400)
    expect(response.body.error).toEqual("Invalid auth")
  });

  it("returns 401 for email inexistant", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        "email":"mail@not-in-db.com",
        "password": "not the password"
      })

    expect(response.status).toBe(401)
    expect(response.body.error).toEqual("Invalid credentials")
  });

  it("returns 401 with invalid credentials", async () => {
    const email = `admin-${Date.now()}@auth.com`
    const password = "Admin123!";
    const _ = await request(app)
      .post("/api/users")
      .send({
      email,
      password
    })

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email,
        "password": "not the password"
      })

    expect(response.status).toBe(401)
    expect(response.body.error).toEqual("Invalid credentials")
  });

it("returns 401 when user is inactive", async () => {
  const email = `inactive-${Date.now()}@auth.com`
  const password = "Admin123!"

  const createResponse = await request(app)
    .post("/api/users")
    .send({
      email,
      password
    })

  expect(createResponse.status).toBe(201)

  const userId = createResponse.body.id

  const updateResponse = await request(app)
    .put(`/api/users/${userId}`)
    .send({
      email,
      password,
      isActive: false
    })

  expect(updateResponse.status).toBe(200)

  const response = await request(app)
    .post("/api/auth/login")
    .send({
      email,
      password
    })

  expect(response.status).toBe(401)
})
it("returns a valid JWT containing the user id", async () => {
  const email = `jwt-${Date.now()}@auth.com`
  const password = "Admin123!"

  const createResponse = await request(app)
    .post("/api/users")
    .send({
      email,
      password
    })

  expect(createResponse.status).toBe(201)

  const userId = createResponse.body.id

  const loginResponse = await request(app)
    .post("/api/auth/login")
    .send({
      email,
      password
    })

  expect(loginResponse.status).toBe(200)

  const { accessToken } = loginResponse.body

  const payload = jwt.decode(accessToken)

  expect(payload).toBeTypeOf("object")
  expect(payload).not.toBeNull()

  expect(payload).toHaveProperty("sub", userId)
  expect(payload).toHaveProperty("iat")
  expect(payload).toHaveProperty("exp")
})
it("returns a signed JWT", async () => {
  const email = `signed-${Date.now()}@auth.com`
  const password = "Admin123!"

  const createResponse = await request(app)
    .post("/api/users")
    .send({
      email,
      password
    })

  expect(createResponse.status).toBe(201)

  const loginResponse = await request(app)
    .post("/api/auth/login")
    .send({
      email,
      password
    })

  expect(loginResponse.status).toBe(200)

  const { accessToken } = loginResponse.body

  expect(() => {
    jwt.verify(accessToken, process.env.JWT_SECRET!)
  }).not.toThrow()
})
});