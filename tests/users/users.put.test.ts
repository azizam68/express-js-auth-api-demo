import { describe, expect, it } from "vitest"
import request from "supertest"

import app from "../../src/app.js"

describe("PUT /api/users/:id", () => {
  it("replaces a user without exposing sensitive information", async () => {
    const email = `put-${Date.now()}@example.com`

    const createResponse = await request(app)
      .post("/api/users")
      .send({
        email,
        password: "oldpassword"
      })

    expect(createResponse.status).toBe(201)

    const userId = createResponse.body.id

    const response = await request(app)
      .put(`/api/users/${userId}`)
      .send({
        email: `updated-${Date.now()}@example.com`,
        password: "newpassword",
        isActive: false
      })

    expect(response.status).toBe(200)

    expect(response.body).toHaveProperty("id", userId)
    expect(response.body).toHaveProperty("isActive", false)

    expect(response.body).not.toHaveProperty("password")
    expect(response.body).not.toHaveProperty("passwordHash")
    expect(response.body).not.toHaveProperty("password_hash")
  })
})