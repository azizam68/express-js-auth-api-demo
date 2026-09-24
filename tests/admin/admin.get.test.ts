import { describe, it, expect } from "vitest"
import request from "supertest"
import { eq } from "drizzle-orm"
import { db } from "../../src/config/database.js"
import { roles, userRoles } from "../../src/db/schema.js"
import { ROLES } from "../../src/constants/roles.js"
import app from "../../src/app.js"

describe("GET /api/admin", () => {
    it("returns 401 without an access token", async () => {
        const response = await request(app)
            .get("/api/admin")

        expect(response.status).toBe(401)
    })
    it("returns 403 when user does not have the admin role", async () => {
        const email = `user-${Date.now()}@auth.com`
        const password = "User123!"

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

        const accessToken = loginResponse.body.accessToken

        const response = await request(app)
            .get("/api/admin")
            .set("Authorization", `Bearer ${accessToken}`)

        expect(response.status).toBe(403)
    })
    it("returns 200 when user has the admin role", async () => {
        const email = `admin-${Date.now()}@auth.com`
        const password = "Admin123!"

        const createResponse = await request(app)
            .post("/api/users")
            .send({
                email,
                password
            })

        expect(createResponse.status).toBe(201)

        const userId = createResponse.body.id

        const [adminRole] = await db
            .select()
            .from(roles)
            .where(eq(roles.name, ROLES.ADMIN))

        expect(adminRole).toBeDefined()

        await db.insert(userRoles).values({
            userId,
            roleId: adminRole.id
        })

        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
                email,
                password
            })

        expect(loginResponse.status).toBe(200)

        const accessToken = loginResponse.body.accessToken

        const response = await request(app)
            .get("/api/admin")
            .set("Authorization", `Bearer ${accessToken}`)

        expect(response.status).toBe(200)
    })
})