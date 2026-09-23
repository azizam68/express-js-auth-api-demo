import { and, eq } from "drizzle-orm"

import { db } from "../src/config/database.js"
import { users, roles, userRoles } from "../src/db/schema.js"

async function seed() {
  console.log("🌱 Seeding user roles...")

  const assignments = [
    {
      email: "admin@example.com",
      role: "admin"
    },
    {
      email: "test@example.com",
      role: "test"
    },
    {
      email: "demo@example.com",
      role: "demo"
    }
  ]

  for (const assignment of assignments) {
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, assignment.email))

    if (!user) {
      console.log(`⚠ User ${assignment.email} not found`)
      continue
    }

    const [role] = await db
      .select({ id: roles.id })
      .from(roles)
      .where(eq(roles.name, assignment.role))

    if (!role) {
      console.log(`⚠ Role ${assignment.role} not found`)
      continue
    }

    const [existingUserRole] = await db
      .select()
      .from(userRoles)
      .where(
        and(
          eq(userRoles.userId, user.id),
          eq(userRoles.roleId, role.id)
        )
      )

    if (existingUserRole) {
      console.log(`↷ ${assignment.email} already has role ${assignment.role}`)
      continue
    }

    await db
      .insert(userRoles)
      .values({
        userId: user.id,
        roleId: role.id
      })

    console.log(`✓ ${assignment.email} → ${assignment.role}`)
  }

  console.log("🌱 User roles seed completed")
}

seed()
  .catch((error) => {
    console.error("User roles seed failed:", error)
    process.exit(1)
  })
  .finally(async () => {
    process.exit(0)
  })