import { describe, expect, it, beforeAll } from "vitest"
import request from "supertest"
import { getAuthenticatedAdmin, createAuthenticatedUser } from "../../tests/helpers/auth.js"

import app from "../../src/app.js"

describe("GET /api/users/:id", () => {
  let user;
  let accessToken;

  beforeAll(async () => {
    ({ user, accessToken } = await createAuthenticatedUser())
  })
  
  it("returns a user", async () => {
    const email = `test-${Date.now()}@example.com`
    const password = "8characters"

    const _ = await request(app)
      .post("/api/users")
      .send({
        email,
        password
      })
      .set("Authorization", `Bearer ${accessToken}`)

    const listResponse = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${accessToken}`)

    expect(listResponse.status).toBe(200)
    expect(listResponse.body).toBeInstanceOf(Array)

    const user = listResponse.body[0]

    const response = await request(app)
      .get(`/api/users/${user.id}`)
      .set("Authorization", `Bearer ${accessToken}`)

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty("id", user.id)
    expect(response.body).toHaveProperty("email")
  })

  it("does not expose sensitive information", async () => {
    const listResponse = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${accessToken}`)

    expect(listResponse.status).toBe(200)
    expect(listResponse.body).toBeInstanceOf(Array)

    const user = listResponse.body[0]

    const response = await request(app)
      .get(`/api/users/${user.id}`)
      .set("Authorization", `Bearer ${accessToken}`)

    expect(response.status).toBe(200)
    expect(response.body).not.toHaveProperty("passwordHash")
    expect(response.body).not.toHaveProperty("password_hash")
  })
})