import jwt from "jsonwebtoken"

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET

  if (!secret) {
    throw new Error("JWT_SECRET is not defined")
  }

  return secret
}

const JWT_EXPIRES_IN = "15m"

export interface AccessTokenPayload {
  sub: string
}

export function createAccessToken(userId: string): string {
  const payload: AccessTokenPayload = {
    sub: userId
  }

  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: JWT_EXPIRES_IN
  })
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const payload = jwt.verify(token, getJwtSecret())

  if (
    typeof payload !== "object" ||
    payload === null ||
    typeof payload.sub !== "string"
  ) {
    throw new Error("Invalid access token payload")
  }

  return {
    sub: payload.sub
  }
}