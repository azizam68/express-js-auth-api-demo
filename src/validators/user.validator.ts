import { z } from "zod"

export const createUserSchema = z.object({
  email: z.email(),
  password: z.string().min(8)
})

export const userIdSchema = z.object({
  id: z.uuid()
})

export const replaceUserSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  isActive: z.boolean()
})

export const updateUserSchema = z.union([
  z.object({
    email: z.email()
  }),
  z.object({
    password: z.string().min(8)
  })
])

export const userIdParamsSchema = z.object({
  id: z.uuid()
})

export const assignRoleSchema = z.object({
  roleId: z.uuid()
})

export const deleteUserRoleSchema = z.object({
  id: z.uuid(),
  roleId: z.uuid()
})