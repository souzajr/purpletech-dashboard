const moongoose = require('mongoose')

const MessageSchema = new moongoose.Schema({
    _idWhoSend: { type: String, required: true },
    _idWhoReceived: String,
    _idProject: String,
    subject: { type: String, required: true },
    message: { type: Array, required: true }
})

moongoose.model('Message', MessageSchema)