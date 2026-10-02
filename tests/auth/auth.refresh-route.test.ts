import { describe, it, expect, beforeEach, afterAll } from "vitest"
import request from "supertest"
import crypto from "node:crypto"
import { inArray } from "drizzle-orm"
import app from "../../src/app.js"
import { db } from "../../src/config/database.js"
import { users, refreshTokens } from "../../src/db/schema.js"
import { createRefreshToken } from "../../src/auth/refreshTokens.js"
import { verifyAccessToken } from "../../src/auth/jwt.js"

const EMAILS = ["refresh-route-1@example.com", "refresh-route-2@example.com"]

let userId: string
let inactiveUserId: string

const sha256 = (s: string) =>
  crypto.createHash("sha256").update(s).digest("hex")

beforeEach(async () => {
  await db.delete(users).where(inArray(users.email, EMAILS))

  const [u1, u2] = await db
    .insert(users)
    .values([
      { email: EMAILS[0], passwordHash: "x" },
      { email: EMAILS[1], passwordHash: "x", isActive: false }
    ])
    .returning({ id: users.id })

  userId = u1.id
  inactiveUserId = u2.id
})

afterAll(async () => {
  await db.delete(users).where(inArray(users.email, EMAILS))
})

describe("POST /api/auth/refresh", () => {
  it("renvoie 200 avec une nouvelle paire de tokens", async () => {
    const refreshToken = await createRefreshToken(userId)

    const res = await request(app)
      .post("/api/auth/refresh")
      .send({ refreshToken })

    expect(res.status).toBe(200)
    expect(typeof res.body.accessToken).toBe("string")
    expect(typeof res.body.refreshToken).toBe("string")
    expect(res.body.refreshToken).not.toBe(refreshToken)
    expect(verifyAccessToken(res.body.accessToken).sub).toBe(userId)
  })

  it("renvoie 401 si le refreshToken est absent", async () => {
    const res = await request(app).post("/api/auth/refresh").send({})

    expect(res.status).toBe(401)
  })

  it("renvoie 401 si le refreshToken est inconnu", async () => {
    const res = await request(app)
      .post("/api/auth/refresh")
      .send({ refreshToken: "inconnu" })

    expect(res.status).toBe(401)
  })

  it("renvoie 401 si le refreshToken est expiré", async () => {
    await db.insert(refreshTokens).values({
      userId,
      tokenHash: sha256("vieux-token"),
      expiresAt: new Date(Date.now() - 1000)
    })

    const res = await request(app)
      .post("/api/auth/refresh")
      .send({ refreshToken: "vieux-token" })

    expect(res.status).toBe(401)
  })

  it("renvoie 401 si le refreshToken a déjà été utilisé", async () => {
    const refreshToken = await createRefreshToken(userId)

    await request(app).post("/api/auth/refresh").send({ refreshToken })
    const res = await request(app)
      .post("/api/auth/refresh")
      .send({ refreshToken })

    expect(res.status).toBe(401)
  })

  it("renvoie 401 si l'utilisateur est désactivé", async () => {
    const refreshToken = await createRefreshToken(inactiveUserId)

    const res = await request(app)
      .post("/api/auth/refresh")
      .send({ refreshToken })

    expect(res.status).toBe(401)
  })
})