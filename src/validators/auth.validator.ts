import { z } from "zod"

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8)
})

export const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  passwordConfirm: z.string().min(8)
}).refine(
  data => data.password === data.passwordConfirm,
  {
    message: "Passwords do not match",
    path: ["passwordConfirm"]
  })
