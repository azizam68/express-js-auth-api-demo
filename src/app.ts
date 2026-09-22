import "dotenv/config"
import express from "express"
import path from "path"
import healthRoutes from "./routes/health.routes.ts"
import { notFound } from "./middlewares/notFound.ts"

const __dirname = path.resolve(".")

const PORT = process.env.PORT || process.env.APP_PORT || 3000

const app = express()

app.use(express.static(path.join(__dirname, "./public")))

app.use("/api", healthRoutes)

app.use(notFound)

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})