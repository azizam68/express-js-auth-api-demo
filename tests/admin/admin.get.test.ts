import { describe, it, expect, beforeAll } from "vitest"
import { eq } from "drizzle-orm"
import request from "supertest"
import app from "../../src/app.js"
import { db } from "../../src/config/database.js"
import { userRoles, roles } from "../../src/db/schema.js"
import { ROLES } from "../../src/constants/roles.js"
import { getAuthenticatedAdmin, createAuthenticatedUser } from "../../tests/helpers/auth.js"

describe("GET /api/admin", () => {

    it("returns 401 without an access token", async () => {
        const response = await request(app)
            .get("/api/admin")
            .set("Authorization", `Bearer tititoto`)

        expect(response.status).toBe(401)
    })

    it("returns 401 without an access token", async () => {
       const user = await createAuthenticatedUser()
        const response = await request(app)
            .get("/api/admin")
            .set("Authorization", `Bearer ${user.accessToken}`)

        expect(response.status).toBe(403)
    })

    it("returns 403 when user does not have the admin role", async () => {
       const user = await createAuthenticatedUser()

        const response = await request(app)
            .get("/api/admin")
            .set("Authorization", `Bearer ${user.accessToken}`)

        expect(response.status).toBe(403)
    })

    it("returns 200 when user has the admin role", async () => {
       const user = await getAuthenticatedAdmin()

        const response = await request(app)
            .get("/api/admin")
            .set("Authorization", `Bearer ${user.accessToken}`)

        expect(response.status).toBe(200)
    })
})