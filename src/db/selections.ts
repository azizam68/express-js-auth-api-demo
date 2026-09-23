import { users } from "../db/schema.js"

export const publicUserColumns = {
  id: users.id,
  email: users.email,
  isActive: users.isActive,
  createdAt: users.createdAt,
  updatedAt: users.updatedAt
}