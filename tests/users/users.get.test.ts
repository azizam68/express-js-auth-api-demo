// /tests/users/users.get.test.ts
import { beforeAll, describe, expect, it } from "vitest"
import request from "supertest"
import app from "../../src/app.js"
import { createAuthenticatedUser, getAuthenticatedAdmin } from "../../tests/helpers/auth.js"

describe("GET /api/users", () => {

  let accessToken: string;
  let user: object;

  beforeAll(async () => {
    ({ user, accessToken } = await createAuthenticatedUser());
  })

  it("return 401 without a JWT", async () => {

    const response = await request(app).get("/api/users")
    expect(response.status).toBe(401)

  })

  it("return 200 for an authenticated user", async () => {

    const response = await request(app).get("/api/users")
    .set("Authorization", `Bearer ${accessToken}`)
    expect(response.status).toBe(200)
    expect(response.body).toBeInstanceOf(Array)
  })

  it("return 200 with a valid JWT when user has the admin role", async () => {

    const admin = await getAuthenticatedAdmin()
    const response = await request(app).get("/api/users")
    .set("Authorization", `Bearer ${admin.accessToken}`)
    expect(response.status).toBe(200)
  })

  it("does not expose sensitive information", async () => {
    const response = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${accessToken}`)

    expect(response.status).toBe(200)

    for (const user of response.body) {
      expect(user).not.toHaveProperty("passwordHash")
      expect(user).not.toHaveProperty("password_hash")
    }
  })
})
