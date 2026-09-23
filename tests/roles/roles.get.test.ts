import { describe, expect, it } from "vitest"
import request from "supertest"
import app from "../../src/app.js"

describe("GET /api/roles", ()=>{

    it("returns a list of roles", async () => {
        const response = await request(app).get("/api/roles");
        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
    });

});