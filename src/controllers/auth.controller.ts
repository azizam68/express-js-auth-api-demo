// /src/controllers/auth.controller.ts
import type { Request, Response } from "express";
import { eq } from "drizzle-orm";
import argon2 from "argon2";
import { createAccessToken } from "../auth/jwt.js";
import { db } from "../config/database.js";
import { users } from "../db/schema.js";
import { publicUserColumns } from "../db/selections.js";
import * as authValidator from "../validators/auth.validator.js";
import { isUniqueViolation } from "../validators/validation.js";
import {
  createRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
} from "../auth/refreshTokens.js";

export async function login(req: Request, res: Response) {
  const result = authValidator.loginSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      error: "Invalid auth",
      details: result.error.issues,
    });

    return;
  }

  const [user] = await db
    .select({
      id: users.id,
      passwordHash: users.passwordHash,
      isActive: users.isActive,
    })
    .from(users)
    .where(eq(users.email, result.data.email));
  if (!user || !user.isActive) {
    res.status(401).json({
      error: "Invalid credentials",
    });

    return;
  }

  const passwordIsValid = await argon2.verify(
    user.passwordHash,
    result.data.password,
  );

  if (!passwordIsValid) {
    res.status(401).json({
      error: "Invalid credentials",
    });

    return;
  }

  const accessToken = createAccessToken(user.id)
  const refreshToken = await createRefreshToken(user.id)

  res.json({
    accessToken,
    refreshToken
  })
}

export async function me(req: Request, res: Response) {
  const [user] = await db
    .select(publicUserColumns)
    .from(users)
    .where(eq(users.id, req.user!.id));

  if (!user) {
    res.status(404).json({
      error: "User not found",
    });

    return;
  }

  res.json(user);
}

export const register = async (req: Request, res: Response) => {
  const result = authValidator.registerSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      error: "Invalid register form",
      details: result.error.issues,
    });

    return;
  }

  const { email, password } = result.data;

  const passwordHash = await argon2.hash(password);

  try {
    const [user] = await db
      .insert(users)
      .values({
        email,
        passwordHash,
      })
      .returning(publicUserColumns);

    res.status(201).json(user);
  } catch (error) {
    if (isUniqueViolation(error)) {
      res.status(409).json({
        error: "Email already exists",
      });

      return;
    }

    throw error;
  }
};

export async function refresh(req: Request, res: Response) {
  const result = authValidator.refreshSchema.safeParse(req.body);

  if (!result.success) {
    res.status(401).json({ error: "Invalid refresh token" });
    return;
  }

  const rotated = await rotateRefreshToken(result.data.refreshToken);

  if (!rotated) {
    res.status(401).json({ error: "Invalid refresh token" });
    return;
  }

  const [user] = await db
    .select({ isActive: users.isActive })
    .from(users)
    .where(eq(users.id, rotated.userId));

  if (!user || !user.isActive) {
    res.status(401).json({ error: "Invalid refresh token" });
    return;
  }

  res.json({
    accessToken: createAccessToken(rotated.userId),
    refreshToken: rotated.newToken,
  });
}

export async function logout(req: Request, res: Response) {
  const result = authValidator.refreshSchema.safeParse(req.body);

  if (result.success) {
    await revokeRefreshToken(result.data.refreshToken);
  }

  res.sendStatus(204);
}
