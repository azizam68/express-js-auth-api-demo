import "dotenv/config"

import express from "express"
import path from "path"

import healthRoutes from "./routes/health.routes.js"
import usersRouter from "./routes/users.routes.js"

import { notFound } from "./middlewares/notFound.js"
import { errorMiddleware } from "./middlewares/error.middleware.js"

const __dirname = path.resolve(".")

const app = express()

app.use(express.json())

app.use(express.static(path.join(__dirname, "./public")))

app.use("/api", healthRoutes)
app.use("/api/users", usersRouter)

// 404 : doit être après toutes les routes
app.use(notFound)

// Erreurs : doit être le dernier middleware
app.use(errorMiddleware)

export default app