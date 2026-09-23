import { describe, expect, it } from "vitest"
import request from "supertest"
import app from "../src/app.js"

describe("API", () => {
  it("should be defined", () => {
    expect(app).toBeDefined()
  })
})

describe("GET /api/users", () => {
  it("should return a list of users", async () => {
    const response = await request(app)
      .get("/api/users")

    expect(response.status).toBe(200)
    expect(response.body).toBeInstanceOf(Array)
  })
})