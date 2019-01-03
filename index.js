const express = require('express')
const app = express()
const consign = require('consign')
const db = require('./src/config/db')
const createFolder = require('./src/config/createFolder')
require('dotenv').config()

app.use(express.static(__dirname))
createFolder()
db.openConn()
consign()
    .include('./src/config/passport.js')
    .then('./src/config/middlewares.js')
    .then('./src/api/validation.js')
    .then('./src/config/mail.js')  
    .then('./src/api')
    .then('./src/config/routes.js')  
    .into(app)

const port = process.env.PORT || 9000
app.listen(port, _ => {
    console.log(`Servidor funcionando na porta ${port}`)
})