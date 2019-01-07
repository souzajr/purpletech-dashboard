const passport = require('passport')
const FacebookStrategy = require('passport-facebook')
const mongoose = require('mongoose')
const User = mongoose.model('User')
const moment = require('moment')
moment.locale('pt-br')

passport.serializeUser(function(user, done) {
    done(null, user)
})
  
passport.deserializeUser(function(obj, done) {
    done(null, obj)
})

passport.use(new FacebookStrategy({
    clientID: process.env.CLIENT_FACEBOOK_ID,
    clientSecret: process.env.CLIENT_FACEBOOK_SECRET,
    callbackURL: process.env.FACEBOOK_CALLBACK_URL,
    enableProof: true,
    profileFields: ['id', 'name', 'picture', 'email']
}, async (accessToken, refreshToken, profile, done) => {   
    console.log(profile) 
    await User.findOne({ facebookId: profile.id }, async function(err, user) {
        if(err) return done(err, user)
        if(!user && !profile.email) {
            user = 'A sua conta do Facebook deve ter um Email'
            return done(err, user)
        }
        if(!user) {
            const userFromDB = await User.findOne({ email: profile.email })
            .catch(err => done(err, user))   
            if(userFromDB) {
                user = 'Esse Email já está registrado'
                return done(err, user)
            }

            await new User({
                name: profile.name,
                email: profile.email,
                phone: 'Sem telefone',
                admin: false,  
                avatar: profile.picture,      
                firstAccess: false,
                firstProject: true,
                createdAt: moment().format('L'),
                facebookId: profile.id
            }).save().then(user => done(err, user))
        }

        return done(err, user)
    })
}))