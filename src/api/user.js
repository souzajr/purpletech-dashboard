const bcrypt = require('bcrypt-nodejs')
const mongoose = require('mongoose')
const User = mongoose.model('User')
const Project = mongoose.model('Project')
const gravatar = require('gravatar')
const mail = require('../config/mail')
const path = require('path')
const multer = require('multer')
const crypto = require('crypto')
const fs = require('fs')
const sharp = require('sharp')


module.exports = app => {
    const {
        existOrError,
        notExistOrError,
        tooSmall,
        tooBig,
        tooBigEmail,
        equalsOrError,
        strongOrError,
        hasDigitOrError,
        hasUpperOrError,
        hasLowerOrError,
        notSpaceOrError,
        hasSpecialOrError,
        validEmailOrError
    } = app.src.api.validation

    const encryptPassword = password => {
        const salt = bcrypt.genSaltSync(10)
        return bcrypt.hashSync(password, salt)
    }

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, './public/upload')
        },
        filename: (req, file, cb) => {
            cb(null, crypto.randomBytes(10).toString('hex') + Date.now() + path.extname(file.originalname).toLowerCase())
        }
    })

    const upload = multer({ storage, fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname).toLowerCase()
        if(ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg' && ext !== '.bmp') {
            return callback(new Error())
        }

        callback(null, true)
    },
    limits: {
        limits: 1,
        fileSize: 1024 * 2048
    }}).single('file')

    const save = async (req, res) => {
        const user = { ...req.body }

        if (!req.originalUrl.startsWith('/users')) user.admin = false
        if (!req.user || !req.user.admin) user.admin = false
        if (!req.session || !req.session.admin) user.admin = false

        try {
            existOrError(user.name, 'Digite seu nome')
            tooSmall(user.name, 'Nome muito curto, digite um nome maior')
            tooBig(user.name, 'Nome muito longo, digite um nome menor')
            existOrError(user.email, 'Digite o Email')
            tooBigEmail(user.email, 'Seu Email é muito longo')
            validEmailOrError(user.email, 'Email inválido')
            const userFromDB = await User.findOne({ email: user.email })
            .catch(_ => res.status(500).render('500')) 
            notExistOrError(userFromDB, 'Esse Email já está registrado')
            existOrError(user.phone, 'Digite seu telefone')
            existOrError(user.password, 'Digite sua senha')
            hasDigitOrError(user.password, 'A senha deve ter pelo menos um número')
            hasLowerOrError(user.password, 'A senha deve ter pelo menos uma letra minúscula')
            hasUpperOrError(user.password, 'A senha deve ter pelo menos uma letra maiúscula')
            notSpaceOrError(user.password, 'A senha não deve ter espaços em branco')
            hasSpecialOrError(user.password, 'A senha deve ter pelo menos um caractere especial')
            strongOrError(user.password, 'A senha deve conter pelo menos 8 caracteres')
            existOrError(user.confirmPassword, 'Digite a confirmação da senha')
            equalsOrError(user.password, user.confirmPassword, 'A senha e confirmação da senha não são iguais')
        } catch (msg) {
            return res.status(400).json(msg)
        }

        delete user.confirmPassword
        user.password = encryptPassword(req.body.password)
        user.avatar = gravatar.url(user.email, {
            s: '160',
            r: 'x',
            d: 'retro'
        }, true)
        user.createdAt = new Date().toLocaleDateString().split('-').reverse().join('/')

        await User.create(user).catch(_ => res.status(500).json('Algo deu errado'))
        res.status(200).json('Sucesso!') 
    }

    const changeProfile = async (req, res) => {
        if (!req.body.newPhone && !req.body.newEmail && !req.body.currentPassword && !req.body.newPassword && !req.body.confirmNewPassword) {
            return res.status(400).json('Algo deu errado')
        } 

        await User.findOne({ _id: req.session.user._id }).then(async user => {
            if (req.body.newPhone) {
                try {
                    tooSmall(req.body.newPhone, 'Nome muito curto, digite um nome maior')
                    tooBig(req.body.newPhone, 'Nome muito longo, digite um nome menor')
                } catch (msg) {
                    return res.status(400).json(msg)
                }

                user.phone = req.body.newPhone
            } 

            if (req.body.newEmail) {
                try {
                    tooBigEmail(req.body.newEmail, 'Seu Email é muito longo')
                    validEmailOrError(req.body.newEmail, 'Email inválido')
                    const userFromDB = await User.findOne({ email: req.body.newEmail })
                    .catch(_ => res.status(500).json('Algo deu errado')) 
                    notExistOrError(userFromDB, 'Esse Email já está registrado')
                } catch (msg) {
                    return res.status(400).json(msg)
                }

                user.email = req.body.newEmail
            } 

            if (req.body.currentPassword || req.body.newPassword || req.body.confirmNewPassword) {
                try {
                    existOrError(req.body.currentPassword, 'Digite sua senha atual')
                    existOrError(req.body.newPassword, 'Digite sua nova senha')
                    existOrError(req.body.confirmNewPassword, 'Digite a confirmação da sua nova senha')
                    const checkUser = await User.findOne({ _id: req.session.user.email })
                    .catch(_ => res.status(500).json('Algo deu errado')) 
                    const isMatch = bcrypt.compareSync(req.body.currentPassword, checkUser.password)
                    if (!isMatch) return res.status(401).json('Senha inválida')
                    hasDigitOrError(req.body.newPassword, 'A senha deve ter pelo menos um número')
                    hasLowerOrError(req.body.newPassword, 'A senha deve ter pelo menos uma letra minúscula')
                    hasUpperOrError(req.body.newPassword, 'A senha deve ter pelo menos uma letra maiúscula')
                    notSpaceOrError(req.body.newPassword, 'A senha não deve ter espaços em branco')
                    hasSpecialOrError(req.body.newPassword, 'A senha deve ter pelo menos um caractere especial')
                    strongOrError(req.body.newPassword, 'A senha deve conter pelo menos 8 caracteres')
                    equalsOrError(req.body.newPassword, req.body.confirmNewPassword, 'A senha e confirmação da senha não são iguais')
                } catch (msg) {
                    return res.status(400).json(msg)
                }

                user.password = encryptPassword(req.body.newPassword)
            } 

            await user.save().catch(_ => res.status(500).json('Algo deu errado'))
            req.session.user = user
            res.status(200).json({ 
                "msg": "Sucesso!",
                "phone": req.body.newPhone,
                "email": req.body.newEmail
            })
        }).catch(_ => res.status(400).json('Algo deu errado'))
    }

    const getAll = async (req, res) => {
        await User.find().then(users => { 
            for(let i = 0; i < users.length; i++) {
                users[i].password = undefined
            }
            res.status(200).render('./dashboard/index', {
                users,
                user: req.session.user,
                page: req.url,
                message: null
            })
        })
    }

    const getProfile = async (req, res) => {
        await User.findOne({ _id: req.session.user._id }).then(user => {
            user.password = undefined
            req.session.user = user
            res.status(200).render('./dashboard/index', {
                user,
                page: req.url,
                message: null
            })
        }).catch(_ => res.status(500).render('500'))
    }

    const recover = async (req, res) => {
        if (!req.params.token) {
            const email = req.body.email

            try {
                existOrError(email, 'Digite o Email')
                tooBigEmail(email, 'Seu Email é muito longo')
                validEmailOrError(email, 'Email inválido')
            } catch (msg) {
                return res.status(400).render('forgotpassword', { message: JSON.stringify(msg) })
            }

            const user = await User.findOne({ email })
            .catch(_ => res.status(500).render('500'))
            if(!user || user.deletedAt) return res.status(400).render('forgotpassword', { message: JSON.stringify('Algo deu errado') })
            
            const token = crypto.randomBytes(64).toString('hex')
            user.resetPasswordToken = token
            user.resetPasswordExpires = Date.now() + 3600000
            await user.save()
            .catch(_ => res.status(500).render('500'))
            mail.recoveryMail(user.email, token)
            res.status(200).render('forgotpassword', { message: JSON.stringify('Sucesso!') }) 
        } else {
            await User.findOne({
                resetPasswordToken: req.params.token,
                resetPasswordExpires: { $gt: Date.now() }
            }).then(user => {
                if (!user || user.deletedAt) {
                    res.status(401).render('forgotpassword', { message: JSON.stringify('O token de redefinição de senha é inválido ou expirou') })
                } else {
                    res.status(200).render('reset', { user, message: null })
                }
            }).catch(_ => res.status(500).render('500'))
        }
    }

    const reset = async (req, res) => {
        const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
        }).catch(_ => res.status(500).render('500'))

        if (!user || user.deletedAt) {
            return res.status(401).render('forgotpassword', {  message: JSON.stringify('O token de redefinição de senha é inválido ou expirou') })
        }

        const newPassword = { ...req.body }
        try {
            existOrError(newPassword.password, 'Digite sua senha')
            hasDigitOrError(newPassword.password, 'A senha deve ter pelo menos um número')
            hasLowerOrError(newPassword.password, 'A senha deve ter pelo menos uma letra minúscula')
            hasUpperOrError(newPassword.password, 'A senha deve ter pelo menos uma letra maiúscula')
            notSpaceOrError(newPassword.password, 'A senha não deve ter espaços em branco')
            hasSpecialOrError(newPassword.password, 'A senha deve ter pelo menos um caractere especial')
            strongOrError(newPassword.password, 'A senha deve conter pelo menos 8 caracteres')
            existOrError(newPassword.confirmPassword, 'Digite a confirmação da senha')
            equalsOrError(newPassword.password, newPassword.confirmPassword, 'A senha e confirmação da senha não são iguais')
        } catch (msg) {
            return res.status(400).render('reset', { message: JSON.stringify(msg) })
        }

        user.password = encryptPassword(req.body.password)
        user.resetPasswordToken = undefined
        user.resetPasswordExpires = undefined
        await user.save()
        .catch(_ => res.status(500).render('500'))
        mail.alertOfChange(user.email)
        res.status(200).render('login', { message: JSON.stringify('Sucesso!') })
    }

    const profilePicture = (req, res) => {
        upload(req, res, async function(err) {
            if (err instanceof multer.MulterError) {
                return res.status(500).render('500')
            } else if (err) {
                return res.status(500).render('500')
            } else if (!req.file) {
                return res.status(400).render('./dashboard/index', {
                    user: req.session.user, 
                    page: '/profile',
                    message: JSON.stringify('Você deve selecionar uma imagem')
                })
            }

            sharp.cache(false)
            sharp('./public/upload/' + req.file.filename)
            .resize({
                width: 200,
                height: 200,
                fit: sharp.fit.cover,
                position: sharp.strategy.entropy
            })
            .toFile('./public/upload/profile/' + req.file.filename)
            .catch(_ => res.status(500).render('500'))
            
            
            await User.findOne({ _id: req.params.id }).then(async user => {
                fs.unlinkSync('./public/upload/' + req.file.filename)
                user.profilePicture = req.file.filename
                user.avatar = undefined
                await user.save()
                .catch(_ => res.status(500).render('500'))
                user.password = undefined
                req.session.user = user
                res.status(200).render('./dashboard/index', {
                    user, 
                    page: '/profile',
                    message: JSON.stringify('Sucesso!')
                })
            }).catch(_ => res.status(500).render('500'))
        })
    }

    const getProfilePicture = async (req, res) => {
        await User.findOne({ _id: req.params.id }).then(user => {
            if(!user.avatar) {
                res.status(200).sendFile(user.profilePicture, { root: './public/upload/profile/' })
            } else {
                res.status(200).end()
            }
        }).catch(_ => res.status(500).render('500'))
    }

    const get = async (req, res) => {
        if(!req.session.user.admin) {
            await User.findOne({ _id: req.session.user._id }).then(async user => {
                await Project.find({ _id: user._idProject }).then(project => {
                    user.password = undefined
                    req.session.project = project
                    req.session.user = user
                    res.status(200).render('./dashboard/index', {
                        project,
                        user,
                        page: req.url,
                        message: null
                    })
                }).catch(_ => res.status(500).render('500'))
            }).catch(_ => res.status(500).render('500'))
        } else {
            await User.findOne({ _id: req.session.user._id }).then(async user => {
                user.password = undefined
                await Project.find().then(async project => {
                    await User.countDocuments().then(async userCount => {
                        if(project.length) { 
                            let client = []
                            for(let i = 0; i < project.length; i++) {
                                await User.findOne({ _id: project[i]._idClient }).then(user => {
                                    client.push(user)
                                }).catch(_ => res.status(500).render('500'))
                            }
                            return res.status(200).render('./dashboard/index', {
                                project,
                                user,
                                userCount,
                                client,
                                page: req.url,
                                message: null
                            })
                        } 
                        res.status(200).render('./dashboard/index', {
                            project,
                            user,
                            userCount,
                            page: req.url,
                            message: null
                        })
                    }).catch(_ => res.status(500).render('500'))
                }).catch(_ => res.status(500).render('500'))
            }).catch(_ => res.status(500).render('500'))
        }
    }

    return {
        save,
        changeProfile,
        getAll,
        getProfile,
        recover,
        reset,
        profilePicture,
        getProfilePicture,
        get
    }
}