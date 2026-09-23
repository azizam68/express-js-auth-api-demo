import { describe, expect, it } from "vitest"
import request from "supertest"

import app from "../../src/app.js"

describe("GET /api/users", () => {
  it("returns a list of users", async () => {
    const response = await request(app)
      .get("/api/users")

    expect(response.status).toBe(200)
    expect(response.body).toBeInstanceOf(Array)
  })

  it("does not expose sensitive information", async () => {
    const response = await request(app)
      .get("/api/users")

    expect(response.status).toBe(200)

    for (const user of response.body) {
      expect(user).not.toHaveProperty("passwordHash")
      expect(user).not.toHaveProperty("password_hash")
    }
  })
})
