const mongoose = require('mongoose')
const User = mongoose.model('User')
const passport = require('passport')
const passportJwt = require('passport-jwt')
const { Strategy } = passportJwt

module.exports = (app) => {
    const getToken = function(req) {
        let token = null
        try {
            if(req.session && req.session.token) token = req.session.token
            return token
        } catch(err) {
            return err
        }
    }

    const params = {
        secretOrKey: process.env.AUTH_SECRET,
        jwtFromRequest: getToken
    }
    
    const strategy = new Strategy(params, async (payload, done) => {
        await User.findOne({ _id: payload.id })
        .then(user => done(null, user ? { ...payload } : false))
        .catch(err => done(err, false))
    })
    
    passport.use(strategy)
    
    return {
        authenticate: () => passport.authenticate('jwt', { session: false })
    }
}