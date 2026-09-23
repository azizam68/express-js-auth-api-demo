import "dotenv/config"
import express from "express"
import path from "path"
import healthRoutes from "./routes/health.routes.js"
import { notFound } from "./middlewares/notFound.js"
import usersRouter from "./routes/users.routes.js"
import { errorMiddleware } from "./middleware/error.middleware.js"

const __dirname = path.resolve(".")

const PORT = process.env.PORT || process.env.APP_PORT || 3000

const app = express()
app.use(express.json())
app.use(express.static(path.join(__dirname, "./public")))

app.use("/api", healthRoutes)
app.use("/api/users", usersRouter)

app.use(notFound)
app.use(errorMiddleware)

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})