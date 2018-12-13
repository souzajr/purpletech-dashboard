
const nodemailer = require('nodemailer')
const crypto = require('crypto')
const mongoose = require('mongoose')
const User = mongoose.model('User')

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: process.env.MAIL_SECURE,
    auth: {
        user: process.env.MAIL_AUTH_USER,
        pass: process.env.MAIL_AUTH_PASS
    }
})

module.exports = {
    recoveryMail(value, req, res) {
        nodemailer.createTestAccount(async (err, account) => {
            try {
                await User.findOne({ email: value }).then(async user => {
                    if(!user || user.deletedAt) throw error
                    const token = crypto.randomBytes(64).toString('hex')
                    user.resetPasswordToken = token
                    user.resetPasswordExpires = Date.now() + 3600000
                    await user.save()
                    
                    const mailOptions = {
                        from: process.env.MAIL_AUTH_USER,
                        to: user.email,
                        subject: 'Recuperação de senha',
                        text: 'Você está recebendo isso porque você (ou outra pessoa) solicitou a redefinição da senha da sua conta.\n' +
                        'Por favor, clique no link abaixo ou cole no seu navegador para completar o processo:\n\n' +
                        'http://localhost:3000/reset/' + token + '\n\n' +
                        'Se você não solicitou isso, ignore este e-mail e sua senha permanecerá inalterada.\n'
                    }

                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            throw error
                        }
                    })
                })
            } catch (error) {
                throw error
            }
        })
    },

    alertOfChange(value) {
        nodemailer.createTestAccount((err, account) => {
            const mailOptions = {
                from: process.env.MAIL_AUTH_USER,
                to: value,
                subject: 'Alteração de senha',
                text: 'Uma alteração de senha acabou de ser feita no site http://localhost:3000' + '\n\n' +
                'Se você não fez essa alteração, por favor entre em contato com o suporte.'
            }

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    throw error
                }
            })
        })
    }
}