import { describe, it, expect, beforeEach, afterAll } from "vitest"
import request from "supertest"
import crypto from "node:crypto"
import argon2 from "argon2"
import { eq, inArray } from "drizzle-orm"
import app from "../../src/app.js"
import { db } from "../../src/config/database.js"
import { users, refreshTokens } from "../../src/db/schema.js"
import { verifyAccessToken } from "../../src/auth/jwt.js"

const EMAIL = "login-route-1@example.com"
const PASSWORD = "Password123!"

let userId: string

const sha256 = (s: string) =>
  crypto.createHash("sha256").update(s).digest("hex")

beforeEach(async () => {
  await db.delete(users).where(inArray(users.email, [EMAIL]))

  const [u] = await db
    .insert(users)
    .values({ email: EMAIL, passwordHash: await argon2.hash(PASSWORD) })
    .returning({ id: users.id })

  userId = u.id
})

afterAll(async () => {
  await db.delete(users).where(inArray(users.email, [EMAIL]))
})

describe("POST /api/auth/login", () => {
  it("renvoie un accessToken ET un refreshToken", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: EMAIL, password: PASSWORD })

    expect(res.status).toBe(200)
    expect(verifyAccessToken(res.body.accessToken).sub).toBe(userId)
    expect(typeof res.body.refreshToken).toBe("string")
    expect(res.body.refreshToken.length).toBeGreaterThan(40)
  })

  it("stocke le hash du refreshToken en base, pas le token", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: EMAIL, password: PASSWORD })

    const [row] = await db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.tokenHash, sha256(res.body.refreshToken)))

    expect(row).toBeDefined()
    expect(row.userId).toBe(userId)
    expect(row.revokedAt).toBeNull()
  })

  it("le refreshToken reçu au login fonctionne sur /refresh", async () => {
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: EMAIL, password: PASSWORD })

    const res = await request(app)
      .post("/api/auth/refresh")
      .send({ refreshToken: login.body.refreshToken })

    expect(res.status).toBe(200)
  })

  it("ne renvoie aucun token si le mot de passe est faux", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: EMAIL, password: "AutreMotDePasse123!" })

    expect(res.status).toBe(401)
    expect(res.body.accessToken).toBeUndefined()
    expect(res.body.refreshToken).toBeUndefined()
  })
})