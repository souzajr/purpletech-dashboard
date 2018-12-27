const session = require('express-session')
const passport = require('passport')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const methodOverride = require('method-override')
const helmet = require('helmet')

module.exports = app => {
    app.use(helmet())
    app.use(session({
        secret: process.env.SESSION_SECRET,
        resave: true,
        saveUninitialized: false,
        cookie: {
            path: '/',
            httpOnly: true,
            secure: false,
            maxAge: 1800000
        }
    }))
    app.use(passport.initialize())
    app.use(passport.session())  
    app.set('view engine', 'ejs') 
    app.use(morgan('dev'))
    app.use(bodyParser.urlencoded({ extended: true }))    
    app.use(methodOverride(function (req, res) {
        if (req.body && typeof req.body === 'object' && '_method' in req.body) {
          var method = req.body._method
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
        '/users'
    ], function (req, res, next) {
        if (!req.session.user) {
            res.render('login', { message: JSON.stringify('Por favor, faça o login para acessar') })
        } else {
            next()
        }
    })
}