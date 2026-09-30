// /tests/users/users.get.test.ts
import { beforeAll, describe, expect, it } from "vitest"
import request from "supertest"
import app from "../../src/app.js"
import { createAuthenticatedUser } from "../../tests/helpers/auth.js"

describe("GET /api/users", () => {
  
  let accessToken :string;
  let user :object;

  beforeAll(async () => {
    ({ user, accessToken } = await createAuthenticatedUser());
  })

  it("returns a list of users", async () => {
    const response = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${accessToken}`)
    expect(response.status).toBe(200)
    expect(response.body).toBeInstanceOf(Array)
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
