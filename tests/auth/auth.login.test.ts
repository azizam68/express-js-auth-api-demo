// /test/auth/auth.login.test.ts
import { describe, it, beforeAll, expect } from "vitest"
import request from "supertest"
import app from "../../src/app.js"
import jwt from "jsonwebtoken"
import { createAuthenticatedUser } from "../../tests/helpers/auth.js"

describe("POST /api/auth/login", () => {
  let user;
  let accessToken:string;

  beforeAll(async () => {
    ({ user, accessToken } = await createAuthenticatedUser())
  })

  it("returns 400 body invalide", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        "email": "mail@not-in-db.com",
        "passwordHash": "not the password"
      })

    expect(response.status).toBe(400)
    expect(response.body.error).toEqual("Invalid auth")
  });

  it("returns 401 for email inexistant", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        "email": "mail@not-in-db.com",
        "password": "not the password"
      })

    expect(response.status).toBe(401)
    expect(response.body.error).toEqual("Invalid credentials")
  });

  it("returns 401 with invalid credentials", async () => {
    const email = 'admin@example.com'

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
      .set("Authorization", `Bearer ${accessToken}`)

    expect(createResponse.status).toBe(201)

    const userId = createResponse.body.id

    const updateResponse = await request(app)
      .put(`/api/users/${userId}`)
      .send({
        email,
        password,
        isActive: false
      })
      .set("Authorization", `Bearer ${accessToken}`)

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
    
    const payload = jwt.decode(accessToken)

    expect(payload).toBeTypeOf("object")
    expect(payload).not.toBeNull()

    expect(payload).toHaveProperty("sub", user.id)
    expect(payload).toHaveProperty("iat")
    expect(payload).toHaveProperty("exp")
  })

  it("returns a signed JWT", async () => {
    expect(() => {
      jwt.verify(accessToken, process.env.JWT_SECRET!)
    }).not.toThrow()
  })
});