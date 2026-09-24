export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  DEMO: "demo"
} as const

export type Role = typeof ROLES[keyof typeof ROLES]