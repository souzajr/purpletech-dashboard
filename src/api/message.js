"use strict";

const mongoose = require('mongoose')
const User = mongoose.model('User')
const Message = mongoose.model('Message')
const mail = require('../config/mail')
const moment = require('moment')
moment.locale('pt-br')
const failMessage = 'Algo deu errado'
const successMessage = 'Sucesso!'

module.exports = app => { 
    const {
        existOrError,
        tooSmall
    } = app.src.api.validation

    const viewMessagePage = async (req, res) => {
        await Message.find().then(async messages => {

            if(req.session.user.admin) {
                let message = []
                for(let i = 0; i < messages.length; i++) { 
                    let responsible = null
                    if(messages[i]._idResponsible) {
                        await User.findOne({ _id: messages[i]._idResponsible }).then(hasResponsible => {
                            hasResponsible.password = undefined
                            responsible = hasResponsible
                        })
                    }

                    await User.findOne({ _id: messages[i]._idUser }).then(user => {
                        user.password = undefined
                    
                        message.push({
                            _idMessage: messages[i]._id,
                            user,
                            subject: messages[i].subject,
                            createdAt: messages[i].createdAt,
                            status: messages[i].status,
                            category: messages[i].category,
                            responsible
                        })
                    })
                }

                res.status(200).render('./dashboard/index', { 
                    user: req.session.user,
                    page: req.url,
                    message
                })
            } else {
                let message = []
                for(let i = 0; i < messages.length; i++) {
                    if(messages[i].message[0]._idWhoSend === req.session.user._id) {  
                        let responsible = null
                        if(messages[i]._idResponsible) {
                            await User.findOne({ _id: messages[i]._idResponsible }).then(hasResponsible => {
                                hasResponsible.password = undefined
                                responsible = hasResponsible
                            })
                        }
                        
                        message.push({
                            _idMessage: messages[i]._id,
                            subject: messages[i].subject,
                            createdAt: messages[i].createdAt,
                            status: messages[i].status,
                            category: messages[i].category,
                            responsible
                        })
                    }
                }

                res.status(200).render('./dashboard/index', { 
                    user: req.session.user,
                    page: req.url,
                    message
                })
            }
        }).catch(_ => res.status(500).render('500'))
    }

    const userPostMessage = async (req, res) => {
        const message = { ...req.body }

        try {
            existOrError(message.subject, 'Digite o assunto da mensagem')
            tooSmall(message.subject, 'Digite um assunto maior')
            existOrError(message.category, 'Escolha a categoria')
            existOrError(message.message, 'Digite sua mensagem')
        } catch(msg) {
            return res.status(400).json(msg)
        }

        return await new Message({
            subject: message.subject,
            createdAt: moment().format('L'),
            _idUser: req.session.user._id,
            status: 'Pendente',
            category: message.category,
            message: {
                _idWhoSend: req.session.user._id,
                sendedAtDay: moment().format('L'),
                sendedAtMoment: moment().format('LT'),
                message: message.message
            }
        }).save().then(message => {
            mail.newMessageNotice(message._id)
            return res.status(200).json({
                msg: successMessage,
                id: message._id
            })
        }).catch(_ => res.status(500).json(failMessage))
    }

    const viewMessageDetail = async (req, res) => {
        await Message.findOne({ _id: req.params.id }).then(async message => {
            if(req.session.user.admin) {
                await User.findOne({ _id: message._idUser }).then(client => {
                    client.password = undefined

                    res.status(200).render('./dashboard/index', { 
                        user: req.session.user,
                        page: '/message-detail',
                        moment,
                        message,
                        client
                    })
                })
            } else {
                await User.findOne({ _id: message._idResponsible }).then(responsible => {
                    if(responsible) responsible.password = undefined

                    res.status(200).render('./dashboard/index', { 
                        user: req.session.user,
                        page: '/message-detail',
                        moment,
                        message,
                        responsible
                    })
                })
            }
        }).catch(_ => res.status(500).render('500'))
    }

    const sendNewMessage = async (req, res) => {
        const newMessage = req.body.message

        try {
            existOrError(newMessage, 'Digite sua mensagem')
        } catch (msg) {
            return res.status(400).json(msg)
        }

        await Message.findOne({ _id: req.params.id }).then(async message => {
             if(message._idUser === req.session.user._id || message._idResponsible === req.session.user._id) {
                message.message.push({
                    _idWhoSend: req.session.user._id,
                    sendedAtDay: moment().format('L'),
                    sendedAtMoment: moment().format('LT'),
                    message: newMessage
                })

                if(message._idUser === req.session.user._id) {
                    mail.newMessageNotice(message._id)
                }

                if(message._idResponsible === req.session.user._id) {
                    await User.findOne({ _id: message._idUser }).then(async user => {
                        mail.newMessageNoticeUser(user.email, user.name)
                    })
                }

                return await message.save().then(_ => res.status(200).json(successMessage))
             } else {
                 res.status(500).json(failMessage)
             }
        }).catch(_ => res.status(500).json(failMessage))
    }

    const changeMessageInfo = async (req, res) => {
        await Message.findOne({ _id: req.params.id }).then(async message => {
            if(req.body.subject) message.subject = req.body.subject
            if(req.body.category) message.category = req.body.category
            if(req.body.status) message.status = req.body.status
            if(req.body.responsible) message._idResponsible = req.session.user._id

            return await message.save().then(_ => res.status(200).json(successMessage))
        }).catch(_ => res.status(500).json(failMessage))
    }

    const sendMail = async (req, res) => {
        const message = { ...req.body }

        try {
            existOrError(message.userId, 'Algo deu errado')
            existOrError(message.message, 'Digite a mensagem')
            tooSmall(message.message, 'Mensagem muito pequena')
        } catch(msg) {
            return res.status(400).json(msg)
        }

        return await User.findOne({ _id: message.userId }).then(user => {
            mail.sendMailUser(user.email, user.name, message.message)
            return res.status(200).end()
        }).catch(_ => res.status(500).json(failMessage))
    }

    return {
        viewMessagePage,
        userPostMessage,
        viewMessageDetail,
        sendNewMessage,
        changeMessageInfo,
        sendMail
    }
}