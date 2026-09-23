import { describe, expect, it } from "vitest"
import request from "supertest"

import app from "../../src/app.js"

describe("POST /api/users", () => {
it("returns 400 when request data is invalid", async () => {
  const response = await request(app)
    .post("/api/users")
    .send({
      objectMissing: {
        unexpected: "data"
      }
    })

  expect(response.status).toBe(400)
})

  it("creates a user without exposing sensitive information", async () => {
    const email = `test-${Date.now()}@example.com`
    const password = "8characters"

    const response = await request(app)
      .post("/api/users")
      .send({
        email,
        password
      })

    expect(response.status).toBe(201)

    expect(response.body).toHaveProperty("id")
    expect(response.body).toHaveProperty("email", email)

    expect(response.body).not.toHaveProperty("passwordHash")
    expect(response.body).not.toHaveProperty("password_hash")
  })
})