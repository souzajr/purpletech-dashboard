const mongoose = require('mongoose')
const User = mongoose.model('User')
const jwt = require('jwt-simple')
const bcrypt = require('bcrypt-nodejs')

module.exports = app => {
    const login = async (req, res) => {
        const {
            existOrError,
            tooBigEmail,
            validEmailOrError
        } = app.src.api.validation

        try {
            existOrError(req.body.email, 'Digite seu Email')
            tooBigEmail(req.body.email, 'Seu Email é muito longo')
            validEmailOrError(req.body.email, 'Email inválido')
            existOrError(req.body.password, 'Digite sua senha')
        } catch(msg) {
            return res.status(400).render('login', { message: JSON.stringify(msg)})
        }
        
        const user = await User.findOne({ email: req.body.email })
        .catch(_ => res.status(500).render('500'))

        if(!user || user.deletedAt) return res.status(401).render('login', { message: JSON.stringify('Email ou senha inválidos')})
        if(!user.password) return res.status(400).render('login', { message: JSON.stringify('Acesse a plataforma através do seu Facebook/Google') })
        const isMatch = bcrypt.compareSync(req.body.password, user.password)
        if(!isMatch) return res.status(401).render('login', { message: JSON.stringify('Email ou senha inválidos')})

        const now = Math.floor(Date.now() / 1000)
        const payload = {
            id: user._id,
            iss: process.env.DOMAIN_NAME, 
            iat: now,
            exp: now + 60 * 60 * 24
        }

        user.password = undefined
        if(req.session) req.session.reset()
        req.session.user = user
        req.session.token = jwt.encode(payload, process.env.AUTH_SECRET)
        if(!user.firstAccess) res.redirect('/validate')
        else res.redirect('/newPassword')
    }

    const google = (req, res) => {
        if(req.user) {
            if(req.user == 'A sua conta do Google deve ter um Email') {
                res.status(400).render('login', { message: JSON.stringify(req.user) })
            } else if (req.user == 'Esse Email já está registrado') {
                res.status(400).render('login', { message: JSON.stringify(req.user) })
            } else if(req.user == 'Você já está cadastrado') {
                res.status(400).render('login', { message: JSON.stringify(req.user) })
            } else {
                const user = req.user 
                const now = Math.floor(Date.now() / 1000)
                const payload = {
                    id: user._id,
                    iss: process.env.DOMAIN_NAME, 
                    iat: now,
                    exp: now + 60 * 60 * 24
                }

                user.password = undefined
                if(req.session) req.session.reset()
                req.session.user = user
                req.session.token = jwt.encode(payload, process.env.AUTH_SECRET)
                if(!user.firstAccess) res.redirect('/validate')
                else res.redirect('/newPassword')
            }
        } else {
            res.status(400).render('login', { message: JSON.stringify('Algo deu errado') })
        }
    }

    const facebook = (req, res) => {
        if(req.user) {
            if(req.user == 'A sua conta do Facebook deve ter um Email') {
                res.status(400).render('login', { message: JSON.stringify(req.user) })
            } else if (req.user == 'Esse Email já está registrado') {
                res.status(400).render('login', { message: JSON.stringify(req.user) })
            } else if(req.user == 'Você já está cadastrado') {
                res.status(400).render('login', { message: JSON.stringify(req.user) })
            } else {
                const user = req.user 
                const now = Math.floor(Date.now() / 1000)
                const payload = {
                    id: user._id,
                    iss: process.env.DOMAIN_NAME, 
                    iat: now,
                    exp: now + 60 * 60 * 24
                }

                user.password = undefined
                if(req.session) req.session.reset()
                req.session.user = user
                req.session.token = jwt.encode(payload, process.env.AUTH_SECRET)
                if(!user.firstAccess) res.redirect('/validate')
                else res.redirect('/newPassword')
            }
        } else {
            res.status(400).render('login', { message: JSON.stringify('Algo deu errado') })
        }
    }

    const validateToken = async (req, res) => {
        if(req.session.user) {
            const userToken = req.session.token || null
            try {
                if (userToken) {
                    const token = jwt.decode(userToken, process.env.AUTH_SECRET)
                    if (new Date(token.exp * 1000) > new Date()) {
                        if(req.session.user.firstProject == true) res.redirect('/newProject')
                        else res.redirect('/dashboard')
                    }
                }
            } catch (err) {
                return res.status(401).render('login', { message: JSON.stringify('Algo deu errado') })
            }
        } else {
            return res.status(401).render('login', { message: JSON.stringify('Algo deu errado') })
        }
    }      

    return { login, google, facebook, validateToken }
}