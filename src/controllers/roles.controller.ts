import type { Request, Response } from "express"
import { db } from "../config/database.js"
import { roles } from "../db/schema.js"

export async function getRoles(_req: Request, res: Response) {
  const result = await db
    .select({
      id: roles.id,
      name: roles.name,
      createdAt: roles.createdAt,
      updatedAt: roles.updatedAt
    })
    .from(roles)

  res.json(result)
}