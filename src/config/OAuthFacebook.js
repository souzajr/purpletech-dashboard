"use strict";

const passport = require('passport')
const FacebookStrategy = require('passport-facebook')
const mongoose = require('mongoose')
const User = mongoose.model('User')
const gravatar = require('gravatar')
const axios = require('axios')
const download = require('image-downloader') 
const crypto = require('crypto')
const fs = require('fs')
const sharp = require('sharp')
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
    profileFields: ['id', 'displayName', 'picture.type(large)', 'email'] 
}, (accessToken, refreshToken, profile, done) => {   
    User.findOne({ facebookId: profile.id }, async function(err, user) {
        if(!profile.emails[0].value) {
            return done(err, 'A sua conta do Facebook deve ter um Email')
        }

        if(!user) {
            const userFromDB = await User.findOne({ email: profile.emails[0].value })
            .catch(err => new Error(err)) 
            if(userFromDB instanceof Error) {
                return done(err, 'Algo deu errado')
            }
            
            if(userFromDB) {
                return done(err, 'Esse Email já está registrado')
            }

            if(profile.photos[0].value) {
                axios.get(profile.photos[0].value).then(_ => {
                    const fileName = crypto.randomBytes(10).toString('hex') + Date.now() + '.jpg'
                    const options = {
                        url: profile.photos[0].value,
                        dest: './public/upload/' + fileName
                    }

                    download.image(options).then(_ => {
                        sharp.cache(false)
                        sharp('./public/upload/' + fileName).resize({
                            width: 200,
                            height: 200,
                            fit: sharp.fit.cover,
                            position: sharp.strategy.entropy
                        }).toFile('./public/upload/profile/' + fileName)
                        .then(_ => {
                            fs.unlinkSync('./public/upload/' + fileName)

                            new User({
                                name: profile.displayName,
                                email: profile.emails[0].value,
                                phone: 'Sem telefone',
                                admin: false,  
                                profilePicture: fileName,
                                firstAccess: true,
                                firstProject: true,
                                noPassword: true,
                                createdAt: moment().format('L - LTS'),
                                facebookId: profile.id
                            }).save().then(user => done(err, user))
                            .catch(err => done(err, user))
                        })
                    })
                }).catch(_ => {
                    new User({
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        phone: 'Sem telefone',
                        admin: false,  
                        avatar: gravatar.url(profile.emails[0].value, {
                            s: '200',
                            r: 'x',
                            d: 'retro'
                        }, true),
                        firstAccess: true,
                        firstProject: true,
                        noPassword: true,
                        createdAt: moment().format('L - LTS'),
                        facebookId: profile.id
                    }).save().then(user => done(err, user))
                    .catch(err => done(err, user))
                })
            } else {
                new User({
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    phone: 'Sem telefone',
                    admin: false,  
                    avatar: gravatar.url(profile.emails[0].value, {
                        s: '200',
                        r: 'x',
                        d: 'retro'
                    }, true),
                    firstAccess: true,
                    firstProject: true,
                    noPassword: true,
                    createdAt: moment().format('L - LTS'),
                    facebookId: profile.id
                }).save().then(user => done(err, user))
                .catch(err => done(err, user))
            }
        } else {
            if(user.googleId)
                return done(err, 'Você já está cadastrado com sua conta no Google')
            
            done(err, user)
        }
    })
}))