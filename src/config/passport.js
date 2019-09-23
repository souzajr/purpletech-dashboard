"use strict";

const mongoose = require('mongoose')
const User = mongoose.model('User')
const jwt = require('jwt-simple')
const passport = require('passport')
const passportJwt = require('passport-jwt')
const { Strategy } = passportJwt

module.exports = (app) => {
    const getToken = function(req) {
        let token = null

        if(req.session && req.session.token && new Date((jwt.decode(req.session.token, process.env.AUTH_SECRET)).exp * 1000) > new Date()) {
            token = req.session.token
        }
        
        return token
    }

    const params = {
        secretOrKey: process.env.AUTH_SECRET,
        jwtFromRequest: getToken
    }
    
    const strategy = new Strategy(params, (payload, done) => {
        User.findOne({ _id: payload.id })
        .then(user => done(null, user ? true : false))
        .catch(err => done(err, false))
    })
    
    passport.use(strategy)
    
    return {
        authenticate: () => passport.authenticate('jwt', { session: false })
    }
}