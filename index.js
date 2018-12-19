const express = require('express')
const app = express()
const consign = require('consign')
const db = require('./src/config/db')
require('dotenv').config()

app.use(express.static(__dirname))

db.openConn()

consign()
    .include('./src/config/passport.js')
    .then('./src/config/middlewares.js')
    .then('./src/api/validation.js')
    .then('./src/api')
    .then('./src/config/routes.js')
    .then('./src/config/mail.js')    
    .into(app)

console.log(__dirname) 
const port = process.env.PORT || 8080
app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})