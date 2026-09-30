import { describe, expect, it, beforeAll } from "vitest"
import request from "supertest"
import app from "../../src/app.js"
import { createAuthenticatedUser } from "../../tests/helpers/auth.js"

describe("PUT /api/users/:id", () => {
  let user;
  let accessToken;

  beforeAll(async () => {
    ({ user, accessToken } = await createAuthenticatedUser())
  })

  it("replaces a user without exposing sensitive information", async () => {
    const email = `put-${Date.now()}@example.com`

    const createResponse = await request(app)
      .post("/api/users")
      .send({
        email,
        password: "oldpassword"
      })
      .set("Authorization", `Bearer ${accessToken}`)

    expect(createResponse.status).toBe(201)

    const userId = createResponse.body.id

    const response = await request(app)
      .put(`/api/users/${userId}`)
      .send({
        email: `updated-${Date.now()}@example.com`,
        password: "newpassword",
        isActive: false
      })
      .set("Authorization", `Bearer ${accessToken}`)

    expect(response.status).toBe(200)

    expect(response.body).toHaveProperty("id", userId)
    expect(response.body).toHaveProperty("isActive", false)

    expect(response.body).not.toHaveProperty("password")
    expect(response.body).not.toHaveProperty("passwordHash")
    expect(response.body).not.toHaveProperty("password_hash")
  })
})