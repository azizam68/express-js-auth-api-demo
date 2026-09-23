import { describe, expect, it } from "vitest"
import request from "supertest"

import app from "../../src/app.js"
describe("DELETE /api/users/:id", () => {
  it("deletes an existing user", async () => {
    const email = `delete-${Date.now()}@example.com`

    const createResponse = await request(app)
      .post("/api/users")
      .send({
        email,
        password: "password123"
      })

    expect(createResponse.status).toBe(201)

    const userId = createResponse.body.id

    const response = await request(app)
      .delete(`/api/users/${userId}`)

    expect(response.status).toBe(204)

    const getResponse = await request(app)
      .get(`/api/users/${userId}`)

    expect(getResponse.status).toBe(404)
  })
})