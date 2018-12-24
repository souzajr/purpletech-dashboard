
const nodemailer = require('nodemailer')

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
    recoveryMail(email, token) {
        const mailOptions = {
            from: process.env.MAIL_AUTH_USER,
            to: email,
            subject: 'Recuperação de senha 🔒⚠',
            text: 'Você está recebendo isso porque você (ou outra pessoa) solicitou a redefinição da senha da sua conta.\n' +
            'Por favor, clique no link abaixo ou cole no seu navegador para completar o processo:\n\n' +
            'http://localhost:3000/reset/' + token + '\n\n' +
            'Se você não solicitou isso, ignore este e-mail e sua senha permanecerá inalterada.\n'
        } 

        transporter.sendMail(mailOptions)
    },

    alertOfChange(email) {
        const mailOptions = {
            from: process.env.MAIL_AUTH_USER,
            to: email,
            subject: 'Alteração de senha 🔒⚠',
            text: 'Uma alteração de senha acabou de ser feita no site http://localhost:3000' + '\n\n' +
            'Se você não fez essa alteração, por favor entre em contato com o suporte.'
        } 
        transporter.sendMail(mailOptions)
    },

    projectCreated(email, name) {
        const mailOptions = {
            from: process.env.MAIL_AUTH_USER,
            to: email,
            subject: 'Projeto criado com sucesso! 💖',
            html: '<b>Parabéns ' + name + ', você deu o primeiro passo para o sucesso da sua ideia!</b><br/>'+
            'Seu projeto agora está em fase de análise, entraremos em contato em breve.<br/><br/>' +
            '<b>PurpleTech</b><br/>https://purpletech.com.br<br/>' +
            '<a href="https://wa.me/5519995360651">WhatsApp: (19) 9 9536-0651</a>'
        }

        transporter.sendMail(mailOptions) 
    }
}