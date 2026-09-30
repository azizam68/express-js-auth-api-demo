import { describe, expect, it, beforeAll } from "vitest"
import request from "supertest"
import { getAuthenticatedAdmin, createAuthenticatedUser } from "../../tests/helpers/auth.js"
import app from "../../src/app.js"

describe("DELETE /api/users/:id", () => {
  let user;
  let accessToken;

  beforeAll(async () => {
    ({ user, accessToken } = await createAuthenticatedUser())
  })

  it("deletes an existing user", async () => {
    const email = `delete-${Date.now()}@example.com`

    const createResponse = await request(app)
      .post("/api/users")
      .send({
        email,
        password: "password123"
      })
      .set("Authorization", `Bearer ${accessToken}`)

    expect(createResponse.status).toBe(201)

    const userId = createResponse.body.id

    const response = await request(app)
      .delete(`/api/users/${userId}`)
      .set("Authorization", `Bearer ${accessToken}`)

    expect(response.status).toBe(204)

    const getResponse = await request(app)
      .get(`/api/users/${userId}`)
      .set("Authorization", `Bearer ${accessToken}`)

    expect(getResponse.status).toBe(404)
  })
})