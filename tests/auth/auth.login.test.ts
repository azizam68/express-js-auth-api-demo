// /test/auth/auth.login.test.ts
import { describe, it, expect } from "vitest"
import request from "supertest"
import app from "../../src/app.js"

describe("POST /api/auth/login", () => {
  it("returns an access token with valid credentials", async () => {
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
        password
      })

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty("accessToken")
    expect(response.body.accessToken).toEqual(expect.any(String))
  })
})