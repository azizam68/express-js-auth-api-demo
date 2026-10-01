import "dotenv/config"

console.log("JWT_SECRET loaded:", Boolean(process.env.JWT_SECRET))
console.log("JWT_SECRET length:", process.env.JWT_SECRET?.length ?? 0)

import app from "./app.js"

const PORT = process.env.PORT || process.env.APP_PORT || 3000

app.listen(PORT, () => {
  console.log(`La broche tourne sur http://localhost:${PORT}`)
})