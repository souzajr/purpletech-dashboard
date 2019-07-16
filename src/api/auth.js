"use strict";

const mongoose = require('mongoose')
const User = mongoose.model('User')
const jwt = require('jwt-simple')
const bcrypt = require('bcrypt-nodejs')
const mail = require('../config/mail')

module.exports = app => {
    const login = async (req, res) => {
        const login = { ...req.body }

        const {
            existOrError,
            tooBigEmail,
            validEmailOrError
        } = app.src.api.validation

        try {
            existOrError(login.email, 'Digite seu Email')
            tooBigEmail(login.email, 'Seu Email é muito longo')
            validEmailOrError(login.email, 'Email inválido')
            existOrError(login.password, 'Digite sua senha')
        } catch(msg) {
            return res.status(400).render('login', { message: JSON.stringify(msg) })
        }
        
        const user = await User.findOne({ email: login.email })
        .catch(err => new Error(err))
        if(user instanceof Error) return res.status(500).render('500')

        if(!user || user.deletedAt) return res.status(401).render('login', { message: JSON.stringify('Email ou senha inválidos') })
        if(!user.password || user.noPassword) return res.status(400).render('login', { message: JSON.stringify('Acesse a plataforma através do seu Facebook/Google') })
        const isMatch = bcrypt.compareSync(login.password, user.password)
        if(!isMatch) return res.status(401).render('login', { message: JSON.stringify('Email ou senha inválidos') })

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

        if(user.firstAccess) return res.redirect('/newPassword')
        if(user.firstProject) return res.redirect('/newProject')
        res.redirect('/dashboard') 
    }

    const google = (req, res) => {
        if(req.user) {
            if(req.user === 'A sua conta do Google deve ter um Email') {
                return res.status(400).render('login', { message: JSON.stringify(req.user) })
            } else if (req.user === 'Esse Email já está registrado') {
                return res.status(400).render('login', { message: JSON.stringify(req.user) })
            } else if(req.user === 'Você já está cadastrado com sua conta no Facebook') {
                return res.status(400).render('login', { message: JSON.stringify(req.user) })
            } else if(req.user === 'Algo deu errado') {
                return res.status(400).render('login', { message: JSON.stringify(req.user) })
            } else {
                User.findOne({ _id: req.user._id }).then(async user => {
                    const now = Math.floor(Date.now() / 1000)
                    const payload = {
                        id: user._id,
                        iss: process.env.DOMAIN_NAME, 
                        iat: now,
                        exp: now + 60 * 60 * 24
                    }
    
                    if(req.session) req.session.reset()
                    req.session.user = user
                    req.session.token = jwt.encode(payload, process.env.AUTH_SECRET)
                    if(user.firstAccess) {
                        user.firstAccess = false
                        await user.save()
                        mail.newAccount(user.email, user.name)
                    }

                    if(user.firstProject) return res.redirect('/newProject')
                    res.redirect('/dashboard')                   
                }).catch(_ => res.status(500).render('500'))
            }
        } else {
            return res.status(401).render('login', { message: JSON.stringify('Algo deu errado') })
        }
    }

    const facebook = (req, res) => {
        if(req.user) {
            if(req.user === 'A sua conta do Facebook deve ter um Email') {
                return res.status(400).render('login', { message: JSON.stringify(req.user) })
            } else if (req.user == 'Esse Email já está registrado') {
                return res.status(400).render('login', { message: JSON.stringify(req.user) })
            } else if(req.user === 'Você já está cadastrado com sua conta no Google') {
                return res.status(400).render('login', { message: JSON.stringify(req.user) })
            } else if(req.user === 'Algo deu errado') {
                return res.status(400).render('login', { message: JSON.stringify(req.user) })
            } else {
                User.findOne({ _id: req.user._id }).then(async user => {
                    const now = Math.floor(Date.now() / 1000)
                    const payload = {
                        id: user._id,
                        iss: process.env.DOMAIN_NAME, 
                        iat: now,
                        exp: now + 60 * 60 * 24
                    }
    
                    if(user.password) user.password = undefined
                    if(req.session) req.session.reset()
                    req.session.user = user
                    req.session.token = jwt.encode(payload, process.env.AUTH_SECRET)
                    if(user.firstAccess) {
                        user.firstAccess = false
                        await user.save()
                        mail.newAccount(user.email, user.name)
                    }

                    if(user.firstProject) return res.redirect('/newProject')
                    res.redirect('/dashboard')                    
                }).catch(_ => res.status(500).render('500'))
            }
        } else {
            return res.status(401).render('login', { message: JSON.stringify('Algo deu errado') })
        }
    }     

    return { login, google, facebook }
}