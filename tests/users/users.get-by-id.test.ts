import { describe, expect, it } from "vitest"
import request from "supertest"

import app from "../../src/app.js"

describe("GET /api/users/:id", () => {
  it("returns a user", async () => {
    const email = `test-${Date.now()}@example.com`
    const password = "8characters"

    const _ = await request(app)
      .post("/api/users")
      .send({
        email,
        password
      })



    const listResponse = await request(app)
      .get("/api/users")

    expect(listResponse.status).toBe(200)
    expect(listResponse.body).toBeInstanceOf(Array)

    const user = listResponse.body[0]

    const response = await request(app)
      .get(`/api/users/${user.id}`)

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty("id", user.id)
    expect(response.body).toHaveProperty("email")
  })

  it("does not expose sensitive information", async () => {
    const listResponse = await request(app)
      .get("/api/users")

    expect(listResponse.status).toBe(200)
    expect(listResponse.body).toBeInstanceOf(Array)

    const user = listResponse.body[0]

    const response = await request(app)
      .get(`/api/users/${user.id}`)

    expect(response.status).toBe(200)
    expect(response.body).not.toHaveProperty("passwordHash")
    expect(response.body).not.toHaveProperty("password_hash")
  })
})