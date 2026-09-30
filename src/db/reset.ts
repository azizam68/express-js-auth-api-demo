import "dotenv/config"
import { sql } from "drizzle-orm"

import { db } from "../config/database.js"

async function resetDatabase() {
  console.log("Resetting test database...")

  await db.execute(sql`
    TRUNCATE TABLE
      user_roles,
      users,
      roles
    RESTART IDENTITY
    CASCADE
  `)

  console.log("Test database reset.")
}

resetDatabase()
  .catch((error) => {
    console.error("Database reset failed:", error)
    process.exit(1)
  })