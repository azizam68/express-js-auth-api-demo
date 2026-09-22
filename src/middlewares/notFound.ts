import type { Request, Response, NextFunction } from "express"

export function notFound(
  req: Request,
  res: Response,
  _next: NextFunction
) {
  res.status(404).sendFile("404.html", {
    root: "public"
  })
}