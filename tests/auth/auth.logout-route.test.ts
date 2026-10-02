import { describe, it, expect, beforeEach, afterAll } from "vitest"
import request from "supertest"
import crypto from "node:crypto"
import { eq, inArray } from "drizzle-orm"
import app from "../../src/app.js"
import { db } from "../../src/config/database.js"
import { users, refreshTokens } from "../../src/db/schema.js"
import { createRefreshToken } from "../../src/auth/refreshTokens.js"

const EMAILS = ["logout-route-1@example.com"]

let userId: string

const sha256 = (s: string) =>
  crypto.createHash("sha256").update(s).digest("hex")

beforeEach(async () => {
  await db.delete(users).where(inArray(users.email, EMAILS))

  const [u] = await db
    .insert(users)
    .values({ email: EMAILS[0], passwordHash: "x" })
    .returning({ id: users.id })

  userId = u.id
})

afterAll(async () => {
  await db.delete(users).where(inArray(users.email, EMAILS))
})

describe("POST /api/auth/logout", () => {
  it("renvoie 204 et révoque le refreshToken en base", async () => {
    const refreshToken = await createRefreshToken(userId)

    const res = await request(app)
      .post("/api/auth/logout")
      .send({ refreshToken })

    expect(res.status).toBe(204)

    const [row] = await db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.tokenHash, sha256(refreshToken)))
    expect(row.revokedAt).not.toBeNull()
  })

  it("le refreshToken ne peut plus être utilisé sur /refresh", async () => {
    const refreshToken = await createRefreshToken(userId)

    await request(app).post("/api/auth/logout").send({ refreshToken })
    const res = await request(app)
      .post("/api/auth/refresh")
      .send({ refreshToken })

    expect(res.status).toBe(401)
  })

  it("renvoie 204 si le refreshToken est inconnu", async () => {
    const res = await request(app)
      .post("/api/auth/logout")
      .send({ refreshToken: "inconnu" })

    expect(res.status).toBe(204)
  })

  it("renvoie 204 si le body est vide", async () => {
    const res = await request(app).post("/api/auth/logout").send({})

    expect(res.status).toBe(204)
  })
})