"use strict";

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
const generator = require('generate-password')
const moment = require('moment')
moment.locale('pt-br')
const failMessage = 'Algo deu errado'
const successMessage = 'Sucesso!'


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

    const registerNewUser = async (req, res) => {
        const user = { ...req.body }

        try {
            existOrError(user.name, 'Digite seu nome')
            tooSmall(user.name, 'Nome muito curto, digite um nome maior')
            tooBig(user.name, 'Nome muito longo, digite um nome menor')
            existOrError(user.email, 'Digite o Email')
            tooBigEmail(user.email, 'Seu Email é muito longo')
            validEmailOrError(user.email, 'Email inválido')
            const userFromDB = await User.findOne({ email: user.email })
            .catch(err => new Error(err))
            if(userFromDB instanceof Error)
                return res.status(500).json(failMessage)
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
        user.password = encryptPassword(user.password)
        user.noPassword = false
        user.avatar = gravatar.url(user.email, {
            s: '200',
            r: 'x',
            d: 'retro'
        }, true)
        user.createdAt = moment().format('L - LTS')
        user.admin = false        
        user.firstAccess = false
        user.firstProject = true

        User.create(user).then(_ => {
            mail.newAccount(user.email, user.name)
            res.status(200).json(successMessage)
        }).catch(_ => res.status(500).json(failMessage))
    }

    const changeProfile = async (req, res) => {
        const changeProfile = { ...req.body }

        if (
            !changeProfile.newPhone &&
            !changeProfile.newEmail &&
            !changeProfile.currentPassword &&
            !changeProfile.newPassword &&
            !changeProfile.confirmNewPassword
        ) return res.status(400).json(failMessage)
        
        await User.findOne({ _id: req.session.user._id }).then(async user => {
            if (changeProfile.newPhone) {
                user.phone = changeProfile.newPhone
            } 

            if (changeProfile.newEmail && req.session.user.email !== changeProfile.newEmail) {
                try {
                    tooBigEmail(changeProfile.newEmail, 'Seu Email é muito longo')
                    validEmailOrError(changeProfile.newEmail, 'Email inválido')
                    const userFromDB = await User.findOne({ email: changeProfile.newEmail })
                    .catch(err => new Error(err))
                    if(userFromDB instanceof Error) return res.status(500).json(failMessage)
                    notExistOrError(userFromDB, 'Esse Email já está registrado')
                } catch (msg) {
                    return res.status(400).json(msg)
                }

                user.email = changeProfile.newEmail
            } 

            if (changeProfile.currentPassword || changeProfile.newPassword || changeProfile.confirmNewPassword) {
                try {
                    existOrError(changeProfile.currentPassword, 'Digite sua senha atual')
                    existOrError(changeProfile.newPassword, 'Digite sua nova senha')
                    existOrError(changeProfile.confirmNewPassword, 'Digite a confirmação da sua nova senha')
                    const checkUser = await User.findOne({ _id: req.session.user._id })
                    .catch(err => new Error(err))
                    if(checkUser instanceof Error) return res.status(500).json(failMessage)
                    const isMatch = bcrypt.compareSync(changeProfile.currentPassword, checkUser.password)
                    if (!isMatch) return res.status(401).json('Senha inválida')
                    hasDigitOrError(changeProfile.newPassword, 'A senha deve ter pelo menos um número')
                    hasLowerOrError(changeProfile.newPassword, 'A senha deve ter pelo menos uma letra minúscula')
                    hasUpperOrError(changeProfile.newPassword, 'A senha deve ter pelo menos uma letra maiúscula')
                    notSpaceOrError(changeProfile.newPassword, 'A senha não deve ter espaços em branco')
                    hasSpecialOrError(changeProfile.newPassword, 'A senha deve ter pelo menos um caractere especial')
                    strongOrError(changeProfile.newPassword, 'A senha deve conter pelo menos 8 caracteres')
                    equalsOrError(changeProfile.newPassword, changeProfile.confirmNewPassword, 'A senha e confirmação da senha não são iguais')
                } catch (msg) {
                    return res.status(400).json(msg)
                }

                user.password = encryptPassword(changeProfile.newPassword)
            } 

            user.save().then(_ => {
                res.status(200).json({ 
                    'msg': 'Sucesso!',
                    'phone': changeProfile.newPhone,
                    'email': changeProfile.newEmail
                })
            })
        }).catch(_ => res.status(400).json(failMessage))
    }

    const viewAllUsers = (req, res) => {
        User.findOne({ _id: req.session.user._id }).then(user => {
            User.find().then(users => { 
                res.status(200).render('./dashboard/index', {
                    users,
                    user,
                    page: req.url,
                    message: null
                })
            })
        }).catch(_ => res.status(500).render('500'))
    }

    const viewProfile = (req, res) => {
        User.findOne({ _id: req.session.user._id }).then(user => {
            user.createdAt = moment(user.createdAt, 'L - LTS').format('L')
            
            res.status(200).render('./dashboard/index', {
                user,
                page: req.url,
                message: null
            })
        }).catch(_ => res.status(500).render('500'))
    }

    const recoverPassword = async (req, res) => {
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
            .catch(err => new Error(err))
            if(user instanceof Error) return res.status(500).render('500')
            if(!user || user.deletedAt) return res.status(400).render('forgotpassword', { message: JSON.stringify(failMessage) })
            
            const token = crypto.randomBytes(64).toString('hex')
            user.resetPasswordToken = token
            user.resetPasswordExpires = Date.now() + 3600000
            await user.save().catch(_ => res.status(500).render('500'))
            mail.recoveryMail(user.email, token)
            res.status(200).render('forgotpassword', { message: JSON.stringify(successMessage) }) 
        } else {
            User.findOne({
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

    const resetPassword = async (req, res) => {
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
        await user.save().catch(_ => res.status(500).render('500'))
        mail.alertOfChange(user.email)
        res.status(200).render('login', { message: JSON.stringify(successMessage) })
    }

    const uploadProfileAvatar = (req, res) => {    
        User.findOne({ _id: req.session.user._id }).then(user => {
            upload(req, res, function(err) {
                if (err instanceof multer.MulterError) {
                    return res.status(500).json(failMessage)
                } else if (err) {
                    return res.status(500).json(failMessage)
                } else if (!req.file) {
                    return res.status(400).json('Você deve selecionar uma imagem')
                }

                sharp.cache(false)
                sharp('./public/upload/' + req.file.filename).resize({
                    width: 200,
                    height: 200,
                    fit: sharp.fit.cover,
                    position: sharp.strategy.entropy
                }).toFile('./public/upload/profile/' + req.file.filename)
                .then(async _ => {
                    user.profilePicture = req.file.filename
                    user.avatar = undefined
                    user.save().then(_ => {
                        fs.unlinkSync('./public/upload/' + req.file.filename)
                        res.status(200).json(successMessage)
                    })
                })
            })
        }).catch(_ => res.status(500).json(failMessage))
    }

    const getProfileAvatar = (req, res) => {
        User.findOne({ _id: req.params.id }).then(user => {
            if(!user.avatar)
                return res.status(200).sendFile(user.profilePicture, { root: './public/upload/profile/' })

            res.status(200).end()
        }).catch(_ => res.status(500).render('500'))
    }

    const viewDashboard = (req, res) => {
        User.findOne({ _id: req.session.user._id }).then(user => {            
            if(!user.admin) {
                Project.find({ _id: user._idProject }).then(async project => {
                    let responsible = []
                    for(let i = 0; i < project.length; i++) {
                        if(project[i]._idResponsible) {
                            await User.findOne({ _id: project[i]._idResponsible }).then(user => {
                                responsible.push(user.name)
                            })
                        }
                    }

                    res.status(200).render('./dashboard/index', {
                        project,
                        responsible,
                        user,
                        page: req.url,
                        message: null
                    })
                })
            } else {
                User.countDocuments().then(userCount => {
                    Project.countDocuments().then(projectCount => {
                        res.status(200).render('./dashboard/index', {
                            projectCount,
                            user,
                            userCount,
                            page: req.url,
                            message: null
                        })
                    })
                })
            }
        }).catch(_ => res.status(500).render('500'))
    }

    const viewUser = (req, res) => {
        User.findOne({ _id: req.params.id }).then(getUser => {
            res.status(200).render('./dashboard/index', {
                user: req.session.user,
                getUser,
                page: '/viewUser',
                message: null
            })
        }).catch(_ => res.status(500).render('500'))
    }

    const changeUser = (req, res) => {
        const changeProfile = { ... req.body }

        if (!changeProfile.newPhone && !changeProfile.newEmail)
            return res.status(400).json(failMessage)

        User.findOne({ _id: req.params.id }).then(async user => {
            if (changeProfile.newPhone) {
                user.phone = changeProfile.newPhone
            } 

            if (changeProfile.newEmail) {
                try {
                    tooBigEmail(changeProfile.newEmail, 'Seu Email é muito longo')
                    validEmailOrError(changeProfile.newEmail, 'Email inválido')
                    const userFromDB = await User.findOne({ email: changeProfile.newEmail })
                    .catch(err => new Error(err))
                    if(userFromDB instanceof Error) return res.status(500).json(failMessage)
                    notExistOrError(userFromDB, 'Esse Email já está registrado')
                } catch (msg) {
                    return res.status(400).json(msg)
                }

                user.email = changeProfile.newEmail
            } 

            user.save().then(_ => {
                res.status(200).json({ 
                    'msg': successMessage,
                    'phone': changeProfile.newPhone,
                    'email': changeProfile.newEmail
                })
            })
        }).catch(_ => res.status(500).json(failMessage))
    }

    const removeUser = (req, res) => {
        const confirm = { ...req.body }

        if(!confirm.remove || confirm.remove.toUpperCase() !== 'EU TENHO CERTEZA')
            return res.status(400).json('Digite a frase corretamente')
        
        User.findOne({ _id: req.params.id }).then(user => {
            if(!user.deletedAt) user.deletedAt = moment().format('L')
            else user.deletedAt = undefined

            user.save().then(res.status(200).json(successMessage))
        }).catch(_ => res.status(500).json(failMessage))
    }

    const registerNewUserAdmin = async (req, res) => {
        const user = { ...req.body }

        try {
            existOrError(user.name, 'Digite o nome')
            tooSmall(user.name, 'Nome muito curto, digite um nome maior')
            tooBig(user.name, 'Nome muito longo, digite um nome menor')
            existOrError(user.email, 'Digite o Email')
            tooBigEmail(user.email, 'Email muito longo')
            validEmailOrError(user.email, 'Email inválido')
            const userFromDB = await User.findOne({ email: user.email })
            .catch(err => new Error(err))
            if(userFromDB instanceof Error) return res.status(500).json(failMessage)
            notExistOrError(userFromDB, 'Esse Email já está registrado')
            existOrError(user.role, 'Escolha o cargo')
        } catch (msg) {
            return res.status(400).json(msg)
        }

        const password = generator.generate({ uppercase: false, excludeSimilarCharacters: true })   
        if(user.role == 'Admin' && req.session.user.admin) {
            user.admin = true
        } else {
            user.admin = false
        }

        user.password = encryptPassword(password)
        user.avatar = gravatar.url(user.email, {
            s: '200',
            r: 'x',
            d: 'retro'
        }, true)
        if(!user.phone) user.phone = 'Sem telefone' 
        user.createdAt = moment().format('L - LTS')
        user.firstAccess = true        
        user.firstProject = true

        User.create(user).then(_ => {
            mail.userCreated(user.email, user.name, password)
            res.status(200).json(successMessage)
        }).catch(_ => res.status(500).json(failMessage))
    }

    const viewNewPassword = (req, res) => {
        if(req.session.user.firstAccess)
            return res.status(200).render('newPassword', { message: null })
        
        res.redirect('/')
    }

    const createNewPassword = async (req, res) => {
        const newPassword = { ...req.body }

        try {
            const checkUser = await User.findOne({ _id: req.session.user._id })
            .catch(err => new Error(err))
            if(checkUser instanceof Error) return res.status(500).json(failMessage)
            const isMatch = bcrypt.compareSync(newPassword.password, checkUser.password)
            if (isMatch) return res.status(400).json('A sua nova senha não pode ser igual a sua senha provisória')
            hasDigitOrError(newPassword.password, 'A senha deve ter pelo menos um número')
            hasLowerOrError(newPassword.password, 'A senha deve ter pelo menos uma letra minúscula')
            hasUpperOrError(newPassword.password, 'A senha deve ter pelo menos uma letra maiúscula')
            notSpaceOrError(newPassword.password, 'A senha não deve ter espaços em branco')
            hasSpecialOrError(newPassword.password, 'A senha deve ter pelo menos um caractere especial')
            strongOrError(newPassword.password, 'A senha deve conter pelo menos 8 caracteres')
            existOrError(newPassword.confirmPassword, 'Digite a confirmação da senha')
            equalsOrError(newPassword.password, newPassword.confirmPassword, 'A senha e confirmação da senha não são iguais')
        } catch (msg) {
            return res.status(400).json(msg)
        }

        delete newPassword.confirmPassword
        newPassword.password = encryptPassword(newPassword.password)

        User.findOne({ _id: req.session.user._id }).then(user => {
            user.password = newPassword.password
            user.noPassword = false
            user.firstAccess = false

            user.save().then(_ => {
                if(user.firstProject === false)
                    return res.status(200).json({ 'msg': successMessage, 'project': false })
                
                res.status(200).json({ 'msg': successMessage, 'project': true })
            })
        }).catch(_ => res.status(500).json(failMessage))
    }

    const viewNewProjectFirstAccess = (req, res) => {
        if(req.session.user.firstProject)
            return res.status(200).render('newProject', {
                user: req.session.user,
                message: null
            })
        
        res.redirect('/')
    }

    return {
        registerNewUser,
        changeProfile,
        viewAllUsers,
        viewProfile,
        recoverPassword,
        resetPassword,
        uploadProfileAvatar,
        getProfileAvatar,
        viewDashboard,
        viewUser,
        changeUser,
        removeUser,
        registerNewUserAdmin,
        viewNewPassword,
        createNewPassword,
        viewNewProjectFirstAccess
    }
}