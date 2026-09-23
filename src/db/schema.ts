import {
  boolean,
  primaryKey,
  pgTable,
  timestamp,
  uuid,
  varchar
} from "drizzle-orm/pg-core"

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),

  email: varchar("email", { length: 255 }).notNull().unique(),

  passwordHash: varchar("password_hash", { length: 255 }).notNull(),

  isActive: boolean("is_active").notNull().default(true),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull()
})

export const userProfiles = pgTable("user_profiles", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, {
      onDelete: "cascade"
    }),

  firstName: varchar("first_name", { length: 100 }),

  lastName: varchar("last_name", { length: 100 }),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull()
})

export const roles = pgTable("roles", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
})

export const userRoles = pgTable(
  "user_roles",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),

    createdAt: timestamp("created_at").defaultNow().notNull()
  },
  (table) => [
    primaryKey({
      columns: [table.userId, table.roleId]
    })
  ]
)