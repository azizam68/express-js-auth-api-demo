// /test/auth/auth.me.test.ts
import { describe, it, expect } from "vitest"
import request from "supertest"

import app from "../../src/app.js"

describe("GET /api/auth/me", () => {
    it("returns 401 without an access token", async () => {
        const response = await request(app)
            .get("/api/auth/me")

        expect(response.status).toBe(401)
    })

    it("returns 401 with an invalid access token", async () => {
        const response = await request(app)
            .get("/api/auth/me")
            .set("Authorization", "Bearer invalid-token")

        expect(response.status).toBe(401)
    })

    it("returns the authenticated user", async () => {
        const email = `me-${Date.now()}@auth.com`
        const password = "Password123!"

        const createResponse = await request(app)
            .post("/api/users")
            .send({
                email,
                password
            })

        expect(createResponse.status).toBe(201)

        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
                email,
                password
            })

        expect(loginResponse.status).toBe(200)
        expect(loginResponse.body).toHaveProperty("accessToken")

        const accessToken = loginResponse.body.accessToken

        const response = await request(app)
            .get("/api/auth/me")
            .set("Authorization", `Bearer ${accessToken}`)

        expect(response.status).toBe(200)

        expect(response.body).toHaveProperty("id")
        expect(response.body).toHaveProperty("email", email)

        expect(response.body).not.toHaveProperty("passwordHash")
        expect(response.body).not.toHaveProperty("password_hash")
    })
})