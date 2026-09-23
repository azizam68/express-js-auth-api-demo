import "dotenv/config"
import app from "./app.js"

const PORT = process.env.PORT || process.env.APP_PORT || 3000

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})