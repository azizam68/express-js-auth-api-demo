// /src/controllers/auth.controller.js
import type { Request, Response } from "express"
import { eq } from "drizzle-orm"
import argon2 from "argon2"
import { createAccessToken } from "../auth/jwt.js"
import { db } from "../config/database.js"
import { users } from "../db/schema.js"
import { publicUserColumns } from "../db/selections.js"
import { loginSchema } from "../validators/auth.validator.js"

export async function login(req: Request, res: Response) {
  const result = loginSchema.safeParse(req.body)

  if (!result.success) {
    res.status(400).json({
      error: "Invalid auth",
      details: result.error.issues
    })

    return
  }

  const [user] = await db
    .select({
      id: users.id,
      passwordHash: users.passwordHash,
      isActive: users.isActive
    })
    .from(users)
    .where(eq(users.email, result.data.email))
    if (!user || !user.isActive) {
    res.status(401).json({
      error: "Invalid credentials"
    })

    return
  }

  const passwordIsValid = await argon2.verify(
    user.passwordHash,
    result.data.password
  )

  if (!passwordIsValid) {
    res.status(401).json({
      error: "Invalid credentials"
    })

    return
  }

  // JWT à ajouter ensuite
  const accessToken = createAccessToken(user.id)

  res.json({
    accessToken
  })
}

export async function me(req: Request, res: Response) {
  const [user] = await db
    .select(publicUserColumns)
    .from(users)
    .where(eq(users.id, req.user!.id))

  if (!user) {
    res.status(404).json({
      error: "User not found"
    })

    return
  }

  res.json(user)
}