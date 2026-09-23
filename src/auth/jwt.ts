import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined")
}

const JWT_EXPIRES_IN = "15m"

export interface AccessTokenPayload {
  sub: string
}

export function createAccessToken(userId: string): string {
  const payload: AccessTokenPayload = {
    sub: userId
  }

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  })
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const payload = jwt.verify(token, JWT_SECRET)

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