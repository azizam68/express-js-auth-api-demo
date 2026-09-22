import type { Request, Response } from "express"
import { db } from "../config/database.js"
import { users } from "../db/schema.js"
import { createUserSchema, userIdSchema, updateUserSchema, replaceUserSchema } from "../validators/user.validator.js"
import { eq } from "drizzle-orm"

export async function getUsers(_req: Request, res: Response) {
  const result = await db.select().from(users)

  res.json(result)
}

export async function getUserById(req: Request, res: Response) {
  const result = userIdSchema.safeParse(req.params)

  if (!result.success) {
    res.status(400).json({
      error: "Invalid user ID",
      details: result.error.issues
    })

    return
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, result.data.id))

  if (!user) {
    res.status(404).json({
      error: "User not found"
    })

    return
  }

  res.json(user)
}

export async function createUser(req: Request, res: Response) {
  const result = createUserSchema.safeParse(req.body)

  if (!result.success) {
    res.status(400).json({
      error: "Invalid request",
      details: result.error.issues
    })

    return
  }

try {
    const [user] = await db
      .insert(users)
      .values({
        email: result.data.email
      })
      .returning()

    res.status(201).json(user)
  } catch (error) {
    if (isUniqueViolation(error)) {
      res.status(409).json({
        error: "Email already exists"
      })

      return
    }

    throw error
  }
}

export async function updateUser(req: Request, res: Response) {
  const idResult = userIdSchema.safeParse(req.params)

  if (!idResult.success) {
    res.status(400).json({
      error: "Invalid user ID",
      details: idResult.error.issues
    })

    return
  }

  const bodyResult = updateUserSchema.safeParse(req.body)

  if (!bodyResult.success) {
    res.status(400).json({
      error: "Invalid request",
      details: bodyResult.error.issues
    })

    return
  }

  const [user] = await db
    .update(users)
    .set({
      email: bodyResult.data.email
    })
    .where(eq(users.id, idResult.data.id))
    .returning()

  if (!user) {
    res.status(404).json({
      error: "User not found"
    })

    return
  }

  res.json(user)
}

export async function deleteUser(req: Request, res: Response) {
  const result = userIdSchema.safeParse(req.params)

  if (!result.success) {
    res.status(400).json({
      error: "Invalid user ID",
      details: result.error.issues
    })

    return
  }

  const [user] = await db
    .delete(users)
    .where(eq(users.id, result.data.id))
    .returning()

  if (!user) {
    res.status(404).json({
      error: "User not found"
    })

    return
  }

  res.status(204).send()
}

export async function replaceUser(req: Request, res: Response) {
  const idResult = userIdSchema.safeParse(req.params)

  if (!idResult.success) {
    res.status(400).json({
      error: "Invalid user ID",
      details: idResult.error.issues
    })

    return
  }

  const bodyResult = replaceUserSchema.safeParse(req.body)

  if (!bodyResult.success) {
    res.status(400).json({
      error: "Invalid request",
      details: bodyResult.error.issues
    })

    return
  }

  const [user] = await db
    .update(users)
    .set({
      email: bodyResult.data.email
    })
    .where(eq(users.id, idResult.data.id))
    .returning()

  if (!user) {
    res.status(404).json({
      error: "User not found"
    })

    return
  }

  res.json(user)
}

function isUniqueViolation(error: unknown): boolean {
  if (typeof error !== "object" || error === null) {
    return false
  }

  if (!("cause" in error)) {
    return false
  }

  const cause = error.cause

  return (
    typeof cause === "object" &&
    cause !== null &&
    "code" in cause &&
    cause.code === "23505"
  )
}