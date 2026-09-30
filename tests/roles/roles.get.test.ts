// /tests/roles/roles.get.tests
import { describe, expect, it, beforeAll } from "vitest"
import request from "supertest"
import app from "../../src/app.js"
import { createAuthenticatedUser } from "../../tests/helpers/auth.js"
import { ROLES } from "../../src/constants/roles.js"

describe("GET /api/roles", () => {
    let user;
    let accessToken;

    beforeAll(async () => {
        ({ user, accessToken } = await createAuthenticatedUser())
    })

    it("returns 401 without authentication", async () => {
        const response = await request(app)
            .get("/api/roles")

        expect(response.status).toBe(401)
    })

    it("returns a list of roles", async () => {
        const response = await request(app).get("/api/roles")
            .set("Authorization", `Bearer ${accessToken}`)

        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
    });

    it("checking the admin, user, demo role", async () => {
        const response = await request(app).get("/api/roles")
            .set("Authorization", `Bearer ${accessToken}`)
            
        expect(
            response.body.some((role) => role.name === ROLES.ADMIN)
        ).toBe(true)
            
        expect(
            response.body.some((role) => role.name === ROLES.USER)
        ).toBe(true)
        expect(
            response.body.some((role) => role.name === ROLES.DEMO)
        ).toBe(true)
    });

});