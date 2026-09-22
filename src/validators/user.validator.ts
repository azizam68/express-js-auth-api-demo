import { z } from "zod"

export const createUserSchema = z.object({
  email: z.email()
})

export const userIdSchema = z.object({
  id: z.uuid()
})

export const updateUserSchema = z.object({
  email: z.email()
})

export const replaceUserSchema = z.object({
  email: z.email()
})