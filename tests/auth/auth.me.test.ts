// /test/auth/auth.me.test.ts
import { describe, it, expect } from "vitest"
import request from "supertest"
import { getAuthenticatedAdmin, createAuthenticatedUser } from "../../tests/helpers/auth.js"
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
        const { user, accessToken } =  await createAuthenticatedUser()

        const response = await request(app)
            .get("/api/auth/me")
            .set("Authorization", `Bearer ${accessToken}`)

        expect(response.status).toBe(200)

        expect(response.body).toHaveProperty("id")
        expect(response.body).toHaveProperty("email", user.email)

        expect(response.body).not.toHaveProperty("passwordHash")
        expect(response.body).not.toHaveProperty("password_hash")
    })
})