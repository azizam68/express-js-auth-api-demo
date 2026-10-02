import { describe, it, expect, beforeEach, afterAll } from "vitest"
import crypto from "node:crypto"
import { eq, inArray } from "drizzle-orm"
import { db } from "../../src/config/database.js"
import { users, refreshTokens } from "../../src/db/schema.js"
import {
  createRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken
} from "../../src/auth/refreshTokens.js"

const EMAILS = ["refresh-test-1@example.com", "refresh-test-2@example.com"]

let userId: string
let otherUserId: string

const sha256 = (s: string) =>
  crypto.createHash("sha256").update(s).digest("hex")

const findByToken = async (token: string) =>
  (
    await db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.tokenHash, sha256(token)))
  )[0]

beforeEach(async () => {
  // Repartir propre : supprimer les anciens utilisateurs de test (cascade sur leurs tokens)
  await db.delete(users).where(inArray(users.email, EMAILS))

  const [u1, u2] = await db
    .insert(users)
    .values([
      { email: EMAILS[0], passwordHash: "x" },
      { email: EMAILS[1], passwordHash: "x" }
    ])
    .returning({ id: users.id })

  userId = u1.id
  otherUserId = u2.id
})

afterAll(async () => {
  await db.delete(users).where(inArray(users.email, EMAILS))
})

describe("createRefreshToken", () => {
  it("renvoie un token en clair et ne stocke que son hash", async () => {
    const token = await createRefreshToken(userId)

    expect(token.length).toBeGreaterThan(40)

    const row = await findByToken(token)
    expect(row.tokenHash).toBe(sha256(token))
    expect(row.tokenHash).not.toBe(token)
    expect(row.userId).toBe(userId)
    expect(row.revokedAt).toBeNull()
  })

  it("fixe une expiration à environ 7 jours", async () => {
    const token = await createRefreshToken(userId)
    const row = await findByToken(token)

    const expected = Date.now() + 7 * 24 * 60 * 60 * 1000
    expect(Math.abs(row.expiresAt.getTime() - expected)).toBeLessThan(5000)
  })

  it("génère des tokens différents à chaque appel", async () => {
    const a = await createRefreshToken(userId)
    const b = await createRefreshToken(userId)
    expect(a).not.toBe(b)
  })
})

describe("rotateRefreshToken", () => {
  it("renvoie userId et un nouveau token si le token est valide", async () => {
    const token = await createRefreshToken(userId)

    const result = await rotateRefreshToken(token)

    expect(result).not.toBeNull()
    expect(result!.userId).toBe(userId)
    expect(result!.newToken).not.toBe(token)
  })

  it("révoque l'ancien token et stocke le nouveau comme actif", async () => {
    const token = await createRefreshToken(userId)

    const result = await rotateRefreshToken(token)

    expect((await findByToken(token)).revokedAt).not.toBeNull()
    expect((await findByToken(result!.newToken)).revokedAt).toBeNull()
  })

  it("renvoie null pour un token inconnu", async () => {
    expect(await rotateRefreshToken("inconnu")).toBeNull()
  })

  it("renvoie null pour un token expiré", async () => {
    await db.insert(refreshTokens).values({
      userId,
      tokenHash: sha256("vieux-token"),
      expiresAt: new Date(Date.now() - 1000)
    })

    expect(await rotateRefreshToken("vieux-token")).toBeNull()
  })

  it("refuse un token déjà utilisé", async () => {
    const token = await createRefreshToken(userId)
    await rotateRefreshToken(token)

    expect(await rotateRefreshToken(token)).toBeNull()
  })

  it("révoque toutes les sessions de l'utilisateur si un token déjà utilisé est rejoué", async () => {
    const token = await createRefreshToken(userId)
    const { newToken } = (await rotateRefreshToken(token))!
    const autreToken = await createRefreshToken(otherUserId)

    await rotateRefreshToken(token) // rejeu = vol probable

    expect((await findByToken(newToken)).revokedAt).not.toBeNull()
    expect((await findByToken(autreToken)).revokedAt).toBeNull()
  })

  it("un seul appel gagne si le même token est utilisé deux fois en parallèle", async () => {
    const token = await createRefreshToken(userId)

    const results = await Promise.all([
      rotateRefreshToken(token),
      rotateRefreshToken(token)
    ])

    expect(results.filter((r) => r !== null)).toHaveLength(1)
  })
})

describe("revokeRefreshToken", () => {
  it("marque le token comme révoqué, puis le refus à la rotation", async () => {
    const token = await createRefreshToken(userId)

    await revokeRefreshToken(token)

    expect((await findByToken(token)).revokedAt).not.toBeNull()
    expect(await rotateRefreshToken(token)).toBeNull()
  })

  it("ne plante pas si le token n'existe pas", async () => {
    await expect(revokeRefreshToken("inconnu")).resolves.toBeUndefined()
  })
})