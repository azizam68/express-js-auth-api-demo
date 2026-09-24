import "dotenv/config"

import express from "express"
import path from "path"

import healthRoutes from "./routes/health.routes.js"
import usersRouter from "./routes/users.routes.js"
import rolesRouter from "./routes/roles.routes.js"
import authRouter from "./routes/auth.routes.js"
import adminRoutes from "./routes/admin.routes.js"

import { notFound } from "./middlewares/notFound.js"
import { errorMiddleware } from "./middlewares/error.middleware.js"

const __dirname = path.resolve(".")

const app = express()

app.use(express.json())

app.use(express.static(path.join(__dirname, "./public")))

app.use("/api", healthRoutes)
app.use("/api/users", usersRouter)
app.use("/api/roles", rolesRouter)
app.use("/api/auth", authRouter)
app.use("/api/admin", adminRoutes)

// 404 : doit être après toutes les routes
app.use(notFound)

// Erreurs : doit être le dernier middleware
app.use(errorMiddleware)

export default app