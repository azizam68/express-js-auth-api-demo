import { describe, expect, it } from "vitest"
import request from "supertest"

import app from "../../src/app.js"

describe("PATCH /api/users/:id", () => {
  it("updates the password without exposing sensitive information", async () => {
    const email = `patch-${Date.now()}@example.com`

    const createResponse = await request(app)
      .post("/api/users")
      .send({
        email,
        password: "oldpassword"
      })

    expect(createResponse.status).toBe(201)

    const userId = createResponse.body.id

    const response = await request(app)
      .patch(`/api/users/${userId}`)
      .send({
        password: "newpassword"
      })

    expect(response.status).toBe(200)

    expect(response.body).toHaveProperty("id", userId)
    expect(response.body).toHaveProperty("email", email)

    expect(response.body).not.toHaveProperty("password")
    expect(response.body).not.toHaveProperty("passwordHash")
    expect(response.body).not.toHaveProperty("password_hash")
  })
})