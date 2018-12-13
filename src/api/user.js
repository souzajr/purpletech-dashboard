const bcrypt = require('bcrypt-nodejs')
const mongoose = require('mongoose')
const User = mongoose.model('User')
const gravatar = require('gravatar')
const mail = require('../config/mail')

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

    const save = async (req, res) => {
        const user = { ...req.body }

        if (!req.originalUrl.startsWith('/users')) user.admin = false
        if (!req.user || !req.user.admin) user.admin = false
        if (!req.session || !req.session.admin) user.admin = false

        try {
            existOrError(user.name, 'Digite seu nome')
            tooSmall(user.name, 'Nome muito curto, digite um nome maior')
            tooBig(user.name, 'Nome muito longo, digite um nome menor')
            existOrError(user.email, 'Digite o E-mail')
            tooBigEmail(user.email, 'Seu E-mail é muito longo')
            validEmailOrError(user.email, 'E-mail inválido')
            const userFromDB = await User.findOne({ email: user.email })
            .catch(err => res.status(500).render('500'))
            notExistOrError(userFromDB, 'Esse E-mail já está registrado')
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
            return res.status(400).render('enter', { 
                page: '/register',
                message: JSON.stringify(msg)
            })
        }

        user.password = encryptPassword(req.body.password)
        delete user.confirmPassword
        delete user.check

        user.avatar = gravatar.url(user.email, {
            s: '160',
            r: 'x',
            d: 'retro'
        }, true)
        user.createdAt = new Date().toLocaleDateString().split('-').reverse().join('/')

        await User.create(user).then(_ => res.status(200).render('enter', { 
            page: '/login',
            message: JSON.stringify('Sucesso!')
        })).catch(err => res.status(500).render('500'))
    }

    const change = async (req, res) => {
        if (req.body.newDescription) {
            const getNewDescription = req.body.newDescription



            try {
                tooSmall(getNewDescription, 'Descrição muito curta, digite uma descrição maior')
                tooBig(getNewDescription, 'Descrição muito longa, digite uma descrição menor')
            } catch (msg) {
                return res.status(400).render('./dashboard/index', {
                    user: req.session.user,
                    page: '/profile',
                    style: false,
                    message: JSON.stringify(msg)
                })
            }

            await User.findOne({ _id: req.session.user._id })
            .then(async user => {
                const date = new Date()
                const dateTodayChange = date.toLocaleDateString().split('-').reverse().join('/')
                const dateChange = date.getHours() + ':' + ((date.getMinutes() < 10 ? "0" : "") + date.getMinutes())
        
                user.description = getNewDescription
                user.profileChange.push({
                    dataChange: 'DescriptionChange',
                    dateChange,
                    dateTodayChange
                })

                await user.save()
                .then(user => {
                    req.session.user = user
                    res.status(200).render('./dashboard/index', {
                        user,
                        page: '/profile',
                        style: false,
                        message: JSON.stringify('Sucesso!')
                    })
                }).catch(err => res.status(500).render('500'))
            }).catch(err => res.status(500).render('500'))

        } else if (req.body.newName) {
            const getNewName = req.body.newName
            
            try {
                tooSmall(getNewName, 'Nome muito curto, digite um nome maior')
                tooBig(getNewName, 'Nome muito longo, digite um nome menor')
            } catch (msg) {
                return res.status(400).render('./dashboard/index', {
                    user: req.session.user,
                    page: '/profile',
                    style: false,
                    message: JSON.stringify(msg)
                })
            }

            await User.findOne({ _id: req.session.user._id })
            .then(async user => {
                const date = new Date()
                const dateTodayChange = date.toLocaleDateString().split('-').reverse().join('/')
                const dateChange = date.getHours() + ':' + ((date.getMinutes() < 10 ? "0" : "") + date.getMinutes())
        
                user.name = getNewName
                user.profileChange.push({
                    dataChange: 'NameChange',
                    dateChange,
                    dateTodayChange
                })

                await user.save()
                .then(user => {
                    req.session.user = user
                    res.status(200).render('./dashboard/index', {
                        user,
                        page: '/profile',
                        style: false,
                        message: JSON.stringify('Sucesso!')
                    })
                }).catch(err => res.status(500).render('500'))
            }).catch(err => res.status(500).render('500'))

        } else if (req.body.newEmail) {
            const getNewEmail = req.body.newEmail

            try {                
                tooBigEmail(getNewEmail, 'Seu E-mail é muito longo')
                validEmailOrError(getNewEmail, 'E-mail inválido')
                const emailFromDB = await User.findOne({
                        email: getNewEmail
                    }).catch(err => res.status(500).render('500'))
                notExistOrError(emailFromDB, 'Esse E-mail já está registrado')
            } catch (msg) {
                return res.status(400).render('./dashboard/index', {
                    user: req.session.user,
                    page: '/profile',
                    style: false,
                    message: JSON.stringify(msg)
                })
            }

            await User.findOne({ _id: req.session.user._id })
            .then(async user => {
                const date = new Date()
                const dateTodayChange = date.toLocaleDateString().split('-').reverse().join('/')
                const dateChange = date.getHours() + ':' + ((date.getMinutes() < 10 ? "0" : "") + date.getMinutes())
        
                user.email = getNewEmail
                user.profileChange.push({
                    dataChange: 'EmailChange',
                    dateChange,
                    dateTodayChange
                })

                await user.save()
                .then(user => {
                    req.session.user = user
                    res.status(200).render('./dashboard/index', {
                        user,
                        page: '/profile',
                        style: false,
                        message: JSON.stringify('Sucesso!')
                    })
                }).catch(err => res.status(500).render('500'))
            }).catch(err => res.status(500).render('500'))

        } else if (req.body.currentPassword || req.body.newPassword || req.body.confirmNewPassword) {
            const getCurrentPassword = req.body.currentPassword
            const getNewPassword = req.body.newPassword
            const getConfirmNewPassword = req.body.confirmNewPassword

            try {
                existOrError(getCurrentPassword, 'Digite sua senha atual')
                existOrError(getNewPassword, 'Digite sua nova senha')
                existOrError(getConfirmNewPassword, 'Digite a confirmação da sua nova senha')
                const user = await User.findOne({ _id: req.session.user._id })
                .catch(err => res.status(500).render('500'))
                const isMatch = bcrypt.compareSync(getCurrentPassword, user.password)
                if (!isMatch) return res.status(401).render('./dashboard/index', {
                    user: req.session.user,
                    page: '/profile',
                    style: false,
                    message: JSON.stringify('Senha inválida')
                })
                hasDigitOrError(getNewPassword, 'A senha deve ter pelo menos um número')
                hasLowerOrError(getNewPassword, 'A senha deve ter pelo menos uma letra minúscula')
                hasUpperOrError(getNewPassword, 'A senha deve ter pelo menos uma letra maiúscula')
                notSpaceOrError(getNewPassword, 'A senha não deve ter espaços em branco')
                hasSpecialOrError(getNewPassword, 'A senha deve ter pelo menos um caractere especial')
                strongOrError(getNewPassword, 'A senha deve conter pelo menos 8 caracteres')
                equalsOrError(getNewPassword, getConfirmNewPassword, 'A senha e confirmação da senha não são iguais')
            } catch (msg) {
                return res.status(400).render('./dashboard/index', {
                    user: req.session.user,
                    page: '/profile',
                    style: false,
                    message: JSON.stringify(msg)
                })
            }

            await User.findOne({ _id: req.session.user._id })
            .then(async user => {
                const date = new Date()
                const dateTodayChange = date.toLocaleDateString().split('-').reverse().join('/')
                const dateChange = date.getHours() + ':' + ((date.getMinutes() < 10 ? "0" : "") + date.getMinutes())
        
                user.password = encryptPassword(getNewPassword)
                user.profileChange.push({
                    dataChange: 'PasswordChange',
                    dateChange,
                    dateTodayChange
                })
                
                delete getCurrentPassword, getNewPassword, getConfirmNewPassword

                await user.save()
                .then(user => {
                    req.session.user = user
                    res.status(200).render('./dashboard/index', {
                        user,
                        page: '/profile',
                        style: false,
                        message: JSON.stringify('Sucesso!')
                    })
                }).catch(err => res.status(500).render('500'))
            }).catch(err => res.status(500).render('500'))

        } else {
            res.status(400).render('./dashboard/index', {
                user: req.session.user,
                page: '/profile',
                style: false,
                message: JSON.stringify('Algo deu errado')
            })
        }
    }

    const getAll = async (req, res) => {
        await User.find({
                deletedAt: { $exists: false }
            }, {
                "_id": 1,
                "name": 1,
                "email": 1,
                "admin": 1,
                "createdAt": 1
            }).then(users => res.render('all', { users }))
            .catch(err => res.status(500).render('500'))
    }

    const remove = async (req, res) => {
        if(req.body.deleteHistory) { 
            const history = req.body.deleteHistory
            await User.updateOne({ _id: req.session.user._id, }, {
                $pull: { 'profileChange': { _id: history }}
            }).then(async _ => {
                await User.findOne({ _id: req.session.user._id }, {
                    "_id": 1,
                    "name": 1,
                    "email": 1,
                    "avatar": 1,
                    "description": 1,              
                    "profileChange": 1,          
                    "admin": 1,
                    "createdAt": 1
                }).then(getUser => {
                    req.session.user = getUser
                    res.status(200).render('./dashboard/index', {
                        user: req.session.user,
                        page: '/profile',
                        style: true,
                        message: JSON.stringify('Sucesso!')
                    })
                }).catch(err => res.status(500).render('500'))
            }).catch(err => res.status(500).render('500'))
        }
        else {
            const user = req.body.emailConfirm
            try {
                existOrError(user, 'Email not set')                
                tooBigEmail(user, 'Seu E-mail é muito longo')
                validEmailOrError(user, 'Invalid Email')
                const userFromDB = await User.findOne({ _id: req.session.user._id, email: user })
                .catch(err => res.status(500).render('500'))
                existOrError(userFromDB, 'Error verifying Email')
            } catch (msg) {
                return res.status(400).render('./dashboard/index', { 
                    user: req.session.user,
                    page: '/profile',
                    style: false,
                    message: JSON.stringify(msg) })
            }

            await User.findOneAndUpdate({ _id: req.session.user._id }, {
                $set: {
                    deletedAt: new Date().toLocaleDateString().split('-').reverse().join('/')
                }
            }).then(_ => {
                req.session.destroy(function () {
                    res.render('enter', { page: '/login', message: JSON.stringify('Sucesso!') })
                })
            }).catch(err => res.status(500).render('500'))
        }
    }

    const get = async (req, res) => {
        await User.findOne({ _id: req.session.user._id }, {
            "_id": 1,
            "name": 1,
            "email": 1,
            "avatar": 1,
            "description": 1,              
            "profileChange": 1,          
            "admin": 1,
            "createdAt": 1
        }).then(getUser => {
            req.session.user = getUser
            res.status(200).render('./dashboard/index', {
                user: req.session.user,
                page: req.url,
                style: false,
                message: null
            })
        }).catch((err) => res.status(500).render('500'))
    }

    const recover = async (req, res) => {
        if(!req.params.token) {
            const email = req.body.email

            try {
                existOrError(email, 'Digite o E-mail')                
                tooBigEmail(email, 'Seu E-mail é muito longo')
                validEmailOrError(email, 'E-mail inválido')
            } catch (msg) {
                return res.status(400).render('enter', { 
                    page: '/forgotpassword',
                    message: JSON.stringify(msg)
                })
            }

            try {
                mail.recoveryMail(email)
            } catch (error) {
                return res.status(400).render('enter', { page: '/forgotpassword', message: JSON.stringify('Algo deu errado') })
            }
            
            res.status(200).render('enter', { page: '/forgotpassword', message: JSON.stringify('Sucesso!') })

        } else {
            const getUser = await User.findOne({ 
                resetPasswordToken: req.params.token,
                resetPasswordExpires: { $gt: Date.now() }
            }).catch(err => res.status(500).render('500'))

            if(!getUser || getUser.deletedAt) {
                res.status(401).render('enter', { page: '/forgotpassword', message: JSON.stringify('Password reset token is invalid or has expired') })
            } else {
                res.status(200).render('reset', { user: getUser, message: null })
            }
        } 
    }

    const reset = async (req, res) => {
        const getUser = await User.findOne({ 
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
        }).catch(err => res.status(500).render('500'))

        if(!getUser || getUser.deletedAt) {
            res.status(401).render('enter', { page: '/forgotpassword', message: JSON.stringify('Password reset token is invalid or has expired') })
        } else {
            const user = { ...req.body }
            try {
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
                return res.status(400).render('reset', {
                    user: getUser,
                    message: JSON.stringify(msg)
                })
            }

            getUser.password = encryptPassword(req.body.password)
            getUser.resetPasswordToken = undefined
            getUser.resetPasswordExpires = undefined              
            let date = new Date()                
            const currentHour = date.getHours()
            let currentMin = date.getMinutes()
            currentMin = (currentMin < 10 ? "0" : "") + currentMin
            const dateChange = currentHour + ':' + currentMin
            const dateTodayChange = date.toLocaleDateString().split('-').reverse().join('/')
            const dataChange = 'PasswordChange' 
            getUser.profileChange.push({'dataChange': dataChange, 'dateChange': dateChange, 'dateTodayChange': dateTodayChange})
            await getUser.save()

            try {
                mail.alertOfChange(getUser.email)
            } catch (error) {
                return res.status(400).render('enter', { page: '/login', message: JSON.stringify('Algo deu errado') })
            }
            
            res.status(200).render('enter', { page: '/login', message: JSON.stringify('Sucesso!') })
    }

}

    return {
        save,
        change,
        getAll,
        remove,
        get,
        recover,
        reset
    }
}