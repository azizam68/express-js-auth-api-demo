import { eq } from "drizzle-orm"
import argon2 from "argon2"

import { db } from "../src/config/database.js"
import { users, userProfiles } from "../src/db/schema.js"

async function seed() {
  console.log("🌱 Starting seed...")

  const usersToCreate = [
    {
      email: "admin@example.com",
      password: "Admin123!",
      firstName: "Admin",
      lastName: "User"
    },
    {
      email: "test@example.com",
      password: "Test123!",
      firstName: "Test",
      lastName: "User"
    },
    {
      email: "demo@example.com",
      password: "Demo123!",
      firstName: "Demo",
      lastName: "User"
    }
  ]

  for (const data of usersToCreate) {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))

    if (existingUser.length > 0) {
      console.log(`↷ ${data.email} already exists`)
      continue
    }

    const passwordHash = await argon2.hash(data.password)

    const [user] = await db
      .insert(users)
      .values({
        email: data.email,
        passwordHash
      })
      .returning()

    await db.insert(userProfiles).values({
      userId: user.id,
      firstName: data.firstName,
      lastName: data.lastName
    })

    console.log(`✓ ${data.email} created`)
  }

  console.log("🌱 Seed completed")
}

seed()
  .catch((error) => {
    console.error("Seed failed:", error)
    process.exit(1)
  })
  .finally(async () => {
    process.exit(0)
  })