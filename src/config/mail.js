
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
            from: 'PurpleTech' + '<'+process.env.MAIL_AUTH_USER+'>',
            to: email,
            subject: 'Recuperação de senha 🔒⛔',
            text: 'Você está recebendo este Email pois solicitou a redefinição da senha da sua conta.\n' +
            'Por favor, clique no link abaixo ou cole no seu navegador para completar o processo:\n\n' +
            process.env.DOMAIN_NAME + '/reset/' + token + '\n\n' +
            'Se você não solicitou isso, ignore este Email e sua senha permanecerá inalterada.\n'
        } 

        transporter.sendMail(mailOptions)
    },

    alertOfChange(email) {
        const mailOptions = {
            from: 'PurpleTech' + '<'+process.env.MAIL_AUTH_USER+'>',
            to: email,
            subject: 'Alteração de senha 🔒⛔',
            text: 'Uma alteração de senha acabou de ser feita no site ' + process.env.DOMAIN_NAME + '\n\n' +
            'Se você não fez essa alteração, por favor entre em contato com o suporte.'
        } 
        transporter.sendMail(mailOptions)
    },

    projectCreated(email, name, project) {
        const mailOptions = {
            from: 'PurpleTech' + '<'+process.env.MAIL_AUTH_USER+'>',
            to: email,
            subject: 'Projeto criado com sucesso! 💖😍',
            html: '<b>Parabéns ' + name + ', você deu o primeiro passo para o sucesso da sua ideia!</b><br/><br/>'+
            'Seu projeto agora está em fase de análise, entraremos em contato em breve.<br/>' +
            'Para conferir as atualizações referentes ao seu projeto, acesse:<br/>' +
            process.env.DOMAIN_NAME + '/project/' + project + '<br/>' +
            'Em caso de dúvidas, responda a este Email ou nos chame através do nosso WhatsApp.<br/><br/>' +
            '<b>PurpleTech</b><br/>https://purpletech.com.br<br/>' +
            '<a href="https://wa.me/5519995360651">WhatsApp: (19) 9 9536-0651</a>'
        }

        transporter.sendMail(mailOptions) 
    },

    projectApproved(email, name) {
        const mailOptions = {
            from: 'PurpleTech' + '<'+process.env.MAIL_AUTH_USER+'>',
            to: email,
            subject: 'Seu projeto foi aprovado! 🤩🤩',
            html: '<b>Olá, ' + name + '. É com muito prazer que anunciamos que seu projeto foi aprovado!</b><br/><br/>'+
            'Isso significa que agora o seu projeto será estudado e analisado para que possamos começar o desenvolvimento.<br/>' +
            'Em caso de dúvidas, responda a este Email ou nos chame através do nosso WhatsApp.<br/><br/>' +
            '<b>PurpleTech</b><br/>https://purpletech.com.br<br/>' +
            '<a href="https://wa.me/5519995360651">WhatsApp: (19) 9 9536-0651</a>'
        }

        transporter.sendMail(mailOptions) 
    },

    projectDevelopment(email, name) {
        const mailOptions = {
            from: 'PurpleTech' + '<'+process.env.MAIL_AUTH_USER+'>',
            to: email,
            subject: 'Seu projeto está em desenvolvimento! 🔥🚀',
            html: '<b>Olá, ' + name + '. Seu projeto está em fase de desenvolvimento!</b><br/><br/>'+
            'Agora é a hora de colocarmos a mão na massa e transformarmos a sua ideia em realidade.<br/>' +
            'Em caso de dúvidas, responda a este Email ou nos chame através do nosso WhatsApp.<br/><br/>' +
            '<b>PurpleTech</b><br/>https://purpletech.com.br<br/>' +
            '<a href="https://wa.me/5519995360651">WhatsApp: (19) 9 9536-0651</a>'
        }

        transporter.sendMail(mailOptions) 
    },

    projectCompleted(email, name) {
        console.log(email, name)
        const mailOptions = {
            from: 'PurpleTech' + '<'+process.env.MAIL_AUTH_USER+'>',
            to: email,
            subject: 'Seu projeto foi concluído! 🌟😍',
            html: '<b>Olá, ' + name + '. Seu projeto foi concluído com sucesso!</b><br/><br/>'+
            'Finalmente, você poderá colocar a sua ideia em prática e alcançar o sucesso que sempre sonhou.<br/>' +
            'Contudo, isso não significa que a nossa parceria chegou ao fim. A PurpleTech estará sempre a disposição para ajudar você.<br/>' +
            'Ainda há muito trabalho para ser feito e muitas dúvidas surgirão. Por isso, recomendamos que acesse a nossa sessão de tutoriais em nossa plataforma.<br/>' +
            'Para acessar os tutoriais, basta clicar no link: ' + process.env.DOMAIN_NAME + '/support<br/>' +
            'Em caso de dúvidas, responda a este Email ou nos chame através do nosso WhatsApp.<br/><br/>' +
            '<b>PurpleTech</b><br/>https://purpletech.com.br<br/>' +
            '<a href="https://wa.me/5519995360651">WhatsApp: (19) 9 9536-0651</a>'
        }

        transporter.sendMail(mailOptions) 
    },

    projectPaused(email, name) {
        const mailOptions = {
            from: 'PurpleTech' + '<'+process.env.MAIL_AUTH_USER+'>',
            to: email,
            subject: 'Seu projeto foi pausado! ⏸⛔',
            html: '<b>Olá, ' + name + '. Seu projeto foi colocado em espera.</b><br/><br/>' +
            'Em caso de dúvidas, responda a este Email ou nos chame através do nosso WhatsApp.<br/><br/>' +
            '<b>PurpleTech</b><br/>https://purpletech.com.br<br/>' +
            '<a href="https://wa.me/5519995360651">WhatsApp: (19) 9 9536-0651</a>'
        }

        transporter.sendMail(mailOptions) 
    },

    projectCanceled(email, name) {
        const mailOptions = {
            from: 'PurpleTech' + '<'+process.env.MAIL_AUTH_USER+'>',
            to: email,
            subject: 'Seu projeto foi cancelado! 😥😔',
            html: '<b>Olá, ' + name + '. Infelizmente, seu projeto foi cancelado.</b><br/><br/>' +
            'Lamentamos que isso tenha ocorrido e prometemos nos empenhar para que nunca mais aconteça.<br/>' +
            'Por favor, responda a este Email com suas reclamações, queixas e os motivos que levaram ao cancelamento.<br/>' +
            'Analisaremos todos os detalhes com bastante cuidado para que isso não volte a se repetir.<br/><br/>' +
            '<b>PurpleTech</b><br/>https://purpletech.com.br<br/>' +
            '<a href="https://wa.me/5519995360651">WhatsApp: (19) 9 9536-0651</a>'
        }

        transporter.sendMail(mailOptions)
    },

    userCreated(email, name, password) {
        const mailOptions = {
            from: 'PurpleTech' + '<'+process.env.MAIL_AUTH_USER+'>',
            to: email,
            subject: 'Uma conta foi criada para você 🤩🌟',
            html: '<b>Olá, ' + name + '. Uma conta em nosso painel foi criada para que você possa acompanhar o andamento do seu projeto.</b><br/><br/>' +
            'Em nosso sistema, você terá um controle maior sobre o seu projeto e comunicação direta com os desenvolvedores.<br/>' +
            'Além disso, você poderá solicitar novos orçamentos diretamente e ter acesso a diversos tutoriais sobre como gerenciar seu projeto após a finalização.<br/><br/>' +
            'Para acessar a plataforma, utilize as informações abaixo:<br/>' +
            '<b>' + process.env.DOMAIN_NAME + '<br/>' +
            'Email: ' + email +
            '<br/>Senha: ' + password + '</b><br/><br/>' +
            'Em caso de dúvidas, responda a este Email ou nos chame através do nosso WhatsApp.<br/><br/>' +
            '<b>PurpleTech</b><br/>https://purpletech.com.br<br/>' +
            '<a href="https://wa.me/5519995360651">WhatsApp: (19) 9 9536-0651</a>'
        }

        transporter.sendMail(mailOptions)
    }
}