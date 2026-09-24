import { eq } from "drizzle-orm"

import { db } from "../src/config/database.js"
import { roles } from "../src/db/schema.js"
import { ROLES } from "../src/constants/roles.js"

async function seed() {
  console.log("🌱 Seeding roles...")

  const rolesToCreate = [
    ROLES.ADMIN,
    ROLES.USER,
    ROLES.DEMO
  ]

  for (const name of rolesToCreate) {
    const existingRole = await db
      .select()
      .from(roles)
      .where(eq(roles.name, name))

    if (existingRole.length > 0) {
      console.log(`↷ ${name} already exists`)
      continue
    }

    await db
      .insert(roles)
      .values({ name })

    console.log(`✓ ${name} created`)
  }

  console.log("🌱 Roles seed completed")
}

seed()
  .catch((error) => {
    console.error("Roles seed failed:", error)
    process.exit(1)
  })
  .finally(async () => {
    process.exit(0)
  })