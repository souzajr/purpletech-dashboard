const moongoose = require('mongoose')

const MessageInfoSchema = new moongoose.Schema({
    _idWhoSend: { type: String, required: true },
    sendedAtDay: { type: String, required: true },
    sendedAtMoment: { type: String, required: true },
    message: { type: String, required: true }
})

const MessageSchema = new moongoose.Schema({
    _idUser: String,
    _idResponsible: String,
    subject: { type: String, required: true },
    createdAt: { type: String, required: true },
    status: { type: String, required: true },
    category: { type: String, required: true },
    message: [MessageInfoSchema]
})

moongoose.model('Message', MessageSchema)