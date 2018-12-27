const bcrypt = require('bcrypt-nodejs')
const User = require('../procedure/userProcedure')
const Project = require('../procedure/projectProcedure')
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
            const userFromDB = await User.getByEmail(user.email)
            if(userFromDB === undefined) return res.status(500).render('500') 
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

        await User.createNew(user).then(user => {
            if(!user) return res.status(400).json('Algo deu errado')
            res.status(200).json('Sucesso!')
        })
    }

    const changeProfile = async (req, res) => {
        if (!req.body.newName && !req.body.newEmail && !req.body.currentPassword && !req.body.newPassword && !req.body.confirmNewPassword) {
            return res.status(400).json('Algo deu errado')
        } 

        await User.getById(req.session.user._id).then(async user => {
            if(!user) return res.status(500).json('Algo deu errado')

            if (req.body.newName) {
                const getNewName = req.body.newName

                try {
                    tooSmall(getNewName, 'Nome muito curto, digite um nome maior')
                    tooBig(getNewName, 'Nome muito longo, digite um nome menor')
                } catch (msg) {
                    return res.status(400).json(msg)
                }

                user.name = getNewName
            } 

            if (req.body.newEmail) {
                const email = req.body.newEmail

                try {
                    tooBigEmail(email, 'Seu Email é muito longo')
                    validEmailOrError(email, 'Email inválido')
                    const userFromDB = await User.getByEmail(email)
                    if(userFromDB === undefined) return res.status(500).json('Algo deu errado')
                    notExistOrError(userFromDB, 'Esse Email já está registrado')
                } catch (msg) {
                    return res.status(400).json(msg)
                }

                user.email = email
            } 

            if (req.body.currentPassword || req.body.newPassword || req.body.confirmNewPassword) {
                const getCurrentPassword = req.body.currentPassword
                const getNewPassword = req.body.newPassword
                const getConfirmNewPassword = req.body.confirmNewPassword

                try {
                    existOrError(getCurrentPassword, 'Digite sua senha atual')
                    existOrError(getNewPassword, 'Digite sua nova senha')
                    existOrError(getConfirmNewPassword, 'Digite a confirmação da sua nova senha')
                    const checkUser = await User.getByEmailWithPass(req.session.user.email)
                    if(!checkUser) return res.status(500).json('Algo deu errado')
                    const isMatch = bcrypt.compareSync(getCurrentPassword, checkUser.password)
                    if (!isMatch) return res.status(401).json('Senha inválida')
                    hasDigitOrError(getNewPassword, 'A senha deve ter pelo menos um número')
                    hasLowerOrError(getNewPassword, 'A senha deve ter pelo menos uma letra minúscula')
                    hasUpperOrError(getNewPassword, 'A senha deve ter pelo menos uma letra maiúscula')
                    notSpaceOrError(getNewPassword, 'A senha não deve ter espaços em branco')
                    hasSpecialOrError(getNewPassword, 'A senha deve ter pelo menos um caractere especial')
                    strongOrError(getNewPassword, 'A senha deve conter pelo menos 8 caracteres')
                    equalsOrError(getNewPassword, getConfirmNewPassword, 'A senha e confirmação da senha não são iguais')
                } catch (msg) {
                    return res.status(400).json(msg)
                }

                user.password = encryptPassword(getNewPassword)
                delete getCurrentPassword, getNewPassword, getConfirmNewPassword
            } 
            
            await User.saveInfo(user).then(user => {
                if(!user) return res.status(500).json('Algo deu errado')
                req.session.user = user
                res.status(200).json({ 
                    "msg": "Sucesso!",
                    "name": req.body.newName,
                    "email": req.body.newEmail
                })
            })
        })
    }

    const getAll = async (req, res) => {
    }

    const getProfile = async (req, res) => {
        await User.getById(req.session.user._id).then(user => {
            if(!user) return res.status(500).render('500')
            req.session.user = user
            res.status(200).render('./dashboard/index', {
                user,
                page: req.url,
                message: null
            })
        })
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

            await User.getByEmail(email).then(async user => {
                if(!user || user.deletedAt) return res.status(400).render('forgotpassword', { message: JSON.stringify('Algo deu errado') })
                
                const token = crypto.randomBytes(64).toString('hex')
                user.resetPasswordToken = token
                user.resetPasswordExpires = Date.now() + 3600000
                await User.saveInfo(user).then(_ => {
                    mail.recoveryMail(user.email, token)
                    res.status(200).render('forgotpassword', { message: JSON.stringify('Sucesso!') }) 
                })
            })
        } else {
            await User.getByToken(req.params.token).then(user => {
                if (!user || user.deletedAt) {
                    res.status(401).render('forgotpassword', { message: JSON.stringify('O token de redefinição de senha é inválido ou expirou') })
                } else {
                    res.status(200).render('reset', { user, message: null })
                }
            })
        }
    }

    const reset = async (req, res) => {
        await User.getByToken(req.params.token).then(async user => {
            if(user === undefined) return res.status(500).render('500')

            if (!user || user.deletedAt) {
                return res.status(401).render('forgotpassword', {  message: JSON.stringify('O token de redefinição de senha é inválido ou expirou') })
            } else {
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
                    return res.status(400).render('reset', {
                        refresh: null,
                        user,
                        message: JSON.stringify(msg)
                    })
                }

                user.password = encryptPassword(req.body.password)
                user.resetPasswordToken = undefined
                user.resetPasswordExpires = undefined
                await User.saveInfo(user).then(user => {
                    if(!user) return res.status(500).render('500')
                    mail.alertOfChange(user.email)
                    res.status(200).render('login', { message: JSON.stringify('Sucesso!') })
                })
            }
        })
    }

    const profilePicture = async (req, res) => {
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
            
            
            await User.getById(req.params.id).then(async user => {
                fs.unlinkSync('./public/upload/' + req.file.filename)
                if(!user) return res.status(500).render('500')
                user.profilePicture = req.file.filename
                user.avatar = undefined
                await User.saveInfo(user).then(user => {
                    if(!user) return res.status(500).render('500')
                    req.session.user = user
                    res.status(200).render('./dashboard/index', {
                        user, 
                        page: '/profile',
                        message: JSON.stringify('Sucesso!')
                    })
                })
            })
        })
    }

    const getProfilePicture = async (req, res) => {
        await User.getById(req.params.id).then(user => {
            if(!user) return res.status(500).render('500')
            if(!user.avatar) {
                res.status(200).sendFile(user.profilePicture, { root: './public/upload/profile/' })
            } else {
                res.status(200).end()
            }
        })
    }

    const get = async (req, res) => {
        await User.getById(req.session.user._id).then(async user => {
            if(!user) return res.status(500).render('500')
            await Project.getAllById(user._idProject).then(project => {
                if(project === undefined) return res.status(500).render('500')
                req.session.project = project
                req.session.user = user
                res.status(200).render('./dashboard/index', {
                    project,
                    user,
                    page: req.url,
                    message: null
                })
            })
        })
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