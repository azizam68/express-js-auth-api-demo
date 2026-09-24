// src/middlewares/role.middleware.ts

import type { Request, Response, NextFunction } from "express"
import { eq, and } from "drizzle-orm"

import { db } from "../config/database.js"
import { roles, userRoles } from "../db/schema.js"
import type { Role } from "../constants/roles.js"

export function requireRole(roleName: Role) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({
        error: "Authentication required"
      })

      return
    }

    const [userRole] = await db
      .select({
        id: roles.id
      })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(
        and(
          eq(userRoles.userId, req.user.id),
          eq(roles.name, roleName)
        )
      )

    if (!userRole) {
      res.status(403).json({
        error: "Forbidden"
      })

      return
    }

    next()
  }
}