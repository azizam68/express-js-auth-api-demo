import { sql } from "drizzle-orm"
import type { Request, Response } from "express"
import { db } from "../config/database.js"

export async function getHealth(_req: Request, res: Response) {
  try {
    await db.execute(sql`SELECT 1`)

    res.status(200).json({
      status: "ok",
      database: "ok"
    })
  } catch (error) {
    console.error("Database health check failed:", error)

    res.status(503).json({
      status: "error",
      database: "unavailable"
    })
  }
}