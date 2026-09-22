import "dotenv/config"
import express from "express"
import path from "path"

const __dirname = path.resolve(".")

const PORT = process.env.PORT || process.env.APP_PORT || 3000

const app = express()

app.use(express.static(path.join(__dirname, "./public")))

app.use((req, res) => {
  res.status(404).sendFile("404.html", {
    root: path.join(__dirname, "public")
  })
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})