import "dotenv/config"
import express from 'express'

const PORT = process.env.APP_PORT || 3000;
const app = express()

app.get('/', (req, res) => {
  res.send('Hello World')
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})