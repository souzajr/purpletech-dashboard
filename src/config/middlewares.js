
"use strict";

const session = require("client-sessions")
const passport = require('passport')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const helmet = require('helmet')
const methodOverride = require('method-override')

module.exports = app => {
    app.use(helmet({ dnsPrefetchControl: { allow: true }}))
    if(process.env.AMBIENT_MODE == 'PROD') { 
        app.use(session({
            cookieName: 'session',
            encryptionAlgorithm: 'aes256',
            encryptionKey: new Buffer.from(process.env.SESSION_SECRET1),
            signatureAlgorithm: 'sha256-drop128',
            signatureKey: new Buffer.from(process.env.SESSION_SECRET2, 'base64'),
            duration: 3600000,
            cookie: {
                path: '/',
                httpOnly: true,
                secure: false,
                ephemeral: false
            }
        })) 
    } else {
        app.use(session({
            cookieName: 'session',
            secret: process.env.SESSION_SECRET1,
            duration: 3600000,
            cookie: {
                path: '/',
                httpOnly: true,
                secure: false,
                ephemeral: true
            }
        })) 
        
        app.use(morgan('dev'))
    }
    app.use(passport.initialize())
    app.use(passport.session())  
    app.set('view engine', 'ejs') 
    app.use(bodyParser.urlencoded({ extended: true }))      
    app.use(methodOverride(function (req, res) {
        if (req.body && typeof req.body === 'object' && '_method' in req.body) {
          let method = req.body._method
          delete req.body._method
          return method
        }
    }))  
    app.use(cors())
    app.use([
        '/dashboard',
        '/profile',
        '/profilePicture',
        '/project',
        '/upload',
        '/get',
        '/getThumb',
        '/users',
        '/validate',
        '/allprojects',
        '/budget',
        '/viewUser',
        '/newPassword',
        '/message',
        '/invoice',
        '/support'
    ], function (req, res, next) {
        if (!req.session.user) {
            res.status(401).render('login', { message: JSON.stringify('Por favor, faça o login para acessar') })
        } else {
            next()
        }
    })
}