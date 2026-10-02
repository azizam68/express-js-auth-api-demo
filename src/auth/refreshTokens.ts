import crypto from "node:crypto"
import { and, eq, isNull } from "drizzle-orm"
import { db } from "../config/database.js"
import { refreshTokens } from "../db/schema.js"

const TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 jours

const hash = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex")

export async function createRefreshToken(userId: string): Promise<string> {
  const token = crypto.randomBytes(48).toString("base64url")

  await db.insert(refreshTokens).values({
    userId,
    tokenHash: hash(token),
    expiresAt: new Date(Date.now() + TTL_MS)
  })

  return token
}

async function revokeAllForUser(userId: string): Promise<void> {
  await db
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(and(eq(refreshTokens.userId, userId), isNull(refreshTokens.revokedAt)))
}

export async function rotateRefreshToken(
  token: string
): Promise<{ userId: string; newToken: string } | null> {
  const [entry] = await db
    .select()
    .from(refreshTokens)
    .where(eq(refreshTokens.tokenHash, hash(token)))

  if (!entry) return null

  if (entry.revokedAt) {
    // Token déjà utilisé : vol probable, on révoque toutes les sessions
    await revokeAllForUser(entry.userId)
    return null
  }

  if (entry.expiresAt < new Date()) return null

  // Révocation atomique : si deux requêtes arrivent en même temps, une seule gagne
  const updated = await db
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(and(eq(refreshTokens.id, entry.id), isNull(refreshTokens.revokedAt)))
    .returning({ id: refreshTokens.id })

  if (updated.length === 0) return null

  return { userId: entry.userId, newToken: await createRefreshToken(entry.userId) }
}

export async function revokeRefreshToken(token: string): Promise<void> {
  await db
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(eq(refreshTokens.tokenHash, hash(token)))
}