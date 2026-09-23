import type { Request, Response, NextFunction } from "express"

import { verifyAccessToken } from "../auth/jwt.js"

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authorization = req.headers.authorization

  if (!authorization) {
    res.status(401).json({
      error: "Authentication required"
    })

    return
  }

  if (!authorization.startsWith("Bearer ")) {
    res.status(401).json({
      error: "Invalid authorization header"
    })

    return
  }

  const token = authorization.substring("Bearer ".length)

  try {
    const payload = verifyAccessToken(token)

    req.user = {
      id: payload.sub
    }

    next()
  } catch {
    res.status(401).json({
      error: "Invalid or expired token"
    })
  }
}