const express = require('express')
const app = express()
const cors = require('cors')
const dotenv = require('dotenv')
dotenv.config()
const router = require('./Routes/ai.routes')

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173"
}))
app.use(express.json())
app.use('/api', router)

module.exports = app