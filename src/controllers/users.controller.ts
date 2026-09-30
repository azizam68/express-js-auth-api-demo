import type { Request, Response } from "express"
import { db } from "../config/database.js"
import { users, userRoles } from "../db/schema.js"
import { publicUserColumns } from "../db/selections.js"
import * as ZodValidator from "../validators/user.validator.js"
import { eq, and } from "drizzle-orm"
import argon2 from "argon2"
import { isUniqueViolation } from "../validators/validation.js"

export async function getUsers(_req: Request, res: Response) {
  const result = await db
    .select(publicUserColumns)
    .from(users)

  res.json(result)
}

export async function getUserById(req: Request, res: Response) {
  const result = ZodValidator.userIdSchema.safeParse(req.params)

  if (!result.success) {
    res.status(400).json({
      error: "Invalid user ID",
      details: result.error.issues
    })

    return
  }

  const [user] = await db
    .select(publicUserColumns)
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
  const result = ZodValidator.createUserSchema.safeParse(req.body)

  if (!result.success) {
    res.status(400).json({
      error: "Invalid request",
      details: result.error.issues
    })

    return
  }

  const passwordHash = await argon2.hash(result.data.password)

  try {
    const [user] = await db
      .insert(users)
      .values({
        email: result.data.email,
        passwordHash
      })
      .returning(publicUserColumns)

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
  const idResult = ZodValidator.userIdSchema.safeParse(req.params)

  if (!idResult.success) {
    res.status(400).json({
      error: "Invalid user ID",
      details: idResult.error.issues
    })

    return
  }

  const bodyResult = ZodValidator.updateUserSchema.safeParse(req.body)

  if (!bodyResult.success) {
    res.status(400).json({
      error: "Invalid request",
      details: bodyResult.error.issues
    })

    return
  }
  let user
  if ("email" in bodyResult.data) {
    ;[user] = await db
      .update(users)
      .set({
        email: bodyResult.data.email
      })
      .where(eq(users.id, idResult.data.id))
      .returning(publicUserColumns)
  }
  else if ("password" in bodyResult.data) {
    const passwordHash = await argon2.hash(bodyResult.data.password)

      ;[user] = await db
        .update(users)
        .set({
          passwordHash
        })
        .where(eq(users.id, idResult.data.id))
        .returning(publicUserColumns)
  }


  if (!user) {
    res.status(404).json({
      error: "User not found"
    })

    return
  }

  res.json(user)
}

export async function deleteUser(req: Request, res: Response) {
  const result = ZodValidator.userIdSchema.safeParse(req.params)

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
    .returning({
      id: users.id
    })

  if (!user) {
    res.status(404).json({
      error: "User not found"
    })

    return
  }

  res.status(204).send()
}

export async function replaceUser(req: Request, res: Response) {
  const idResult = ZodValidator.userIdSchema.safeParse(req.params)

  if (!idResult.success) {
    res.status(400).json({
      error: "Invalid user ID",
      details: idResult.error.issues
    })

    return
  }

  const bodyResult = ZodValidator.replaceUserSchema.safeParse(req.body)

  if (!bodyResult.success) {
    res.status(400).json({
      error: "Invalid request",
      details: bodyResult.error.issues
    })

    return
  }

  const passwordHash = await argon2.hash(bodyResult.data.password)

  const [user] = await db
    .update(users)
    .set({
      email: bodyResult.data.email,
      passwordHash,
      isActive: bodyResult.data.isActive,
    })
    .where(eq(users.id, idResult.data.id))
    .returning(publicUserColumns)

  if (!user) {
    res.status(404).json({
      error: "User not found"
    })

    return
  }

  res.json(user)
}

export const assignRole = async (req: Request, res: Response) => {
const paramsResult = ZodValidator.userIdParamsSchema.safeParse(req.params)

if (!paramsResult.success) {
  res.status(400).json({
    error: "Invalid parameters",
    details: paramsResult.error.issues
  })

  return
}

const bodyResult = ZodValidator.assignRoleSchema.safeParse(req.body)

if (!bodyResult.success) {
  res.status(400).json({
    error: "Invalid request",
    details: bodyResult.error.issues
  })

  return
}

const userId = paramsResult.data.id
const roleId = bodyResult.data.roleId

  try {
    const [userRole] = await db
      .insert(userRoles)
      .values({
        roleId,
        userId
      })
      .returning()

    res.status(201).json(userRole)
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

export const getRoles = async (req: Request, res: Response) => {
const paramsResult = ZodValidator.userIdParamsSchema.safeParse(req.params)

if (!paramsResult.success) {
  res.status(400).json({
    error: "Invalid parameters",
    details: paramsResult.error.issues
  })

  return
}

  try {
    const userRolesList = await db
      .select()
      .from(userRoles)
      .where(eq(userRoles.userId, paramsResult.data.id))

    res.status(200).json(userRolesList)
  } catch (error) {
    throw error
  }
}

export const removeRole = async (req: Request, res: Response) => {
  const result = await ZodValidator.deleteUserRoleSchema.safeParse(req.params)

  if (!result.success) {
    res.status(400).json({
      error: "Invalid role ID",
      details: result.error.issues
    })

    return
  }


const userId = result.data.id
const roleId = result.data.roleId

  try {
    const userRolesList = await db.select()
      .from(userRoles)
      .where(and(eq(userRoles.userId, userId), eq(userRoles.roleId, result.data.roleId)))

    if (userRolesList.length != 1) {
      res.status(404)
    }
  } catch (error) {
    throw error
  }

  try {
    await db.delete(userRoles)
      .where(and(eq(userRoles.userId, userId), eq(userRoles.roleId, result.data.roleId)))
      
    res.status(204).json()
  } catch (error) {
    throw error
  }
}