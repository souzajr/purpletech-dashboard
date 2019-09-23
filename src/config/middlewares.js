"use strict";

const session = require("client-sessions")
const passport = require('passport')
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const helmet = require('helmet')
const methodOverride = require('method-override')

module.exports = app => {
    app.use(helmet())
    app.use(cors())
    app.options('*', cors())
    if(process.env.AMBIENT_MODE === 'PROD') { 
        const express_enforces_ssl = require('express-enforces-ssl')
        app.enable('trust proxy')
        app.use(express_enforces_ssl())
        app.use(helmet.hsts({
            maxAge: 31536000,
            includeSubDomains: false
        }))
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
                secureProxy: true,
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
    }
    app.use(passport.initialize())
    app.use(passport.session())  
    app.set('view engine', 'ejs')        
    app.use(morgan('dev')) 
    app.use(express.urlencoded({ extended: true })) 
    app.use(express.json())      
    app.use(methodOverride(function (req, res) {
        if (req.body && typeof req.body === 'object' && '_method' in req.body) {
          let method = req.body._method
          delete req.body._method
          return method
        }
    }))  
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
        '/newProject',
        '/message',
        '/sendmail',
        '/invoice',
        '/support',
        '/portfolio'
    ], (req, res, next) => {
        if (!req.session.user) {
            res.status(401).render('login', { message: JSON.stringify('Por favor, faça o login para acessar') })
        } else {
            next()
        }
    })
}