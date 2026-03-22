const express = require('express')
const app = express()
const cors = require('cors')
const dotenv = require('dotenv')
dotenv.config()
const router = require('./Routes/ai.routes')

app.use(cors())
app.use(express.json())
app.use('/api',router)

module.exports = app
