
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
            from: 'PurpleTech <' + process.env.MAIL_SEND_FROM + '>',
            to: email,
            subject: 'Recuperação de senha 🔒⛔',
            html: 'Você está recebendo este Email pois solicitou a redefinição da senha da sua conta.<br/><br/>' +
            'Por favor, clique no link abaixo ou cole no seu navegador para completar o processo:<br/>' +
            process.env.DOMAIN_NAME + '/reset/' + token + '<br/><br/>' +
            'Se você não solicitou isso, ignore este Email e sua senha permanecerá inalterada.<br/>' +
            'Em caso de dúvidas, entre em contato através do nosso WhatsApp: ' +
            '<a target="_blank" href="https://wa.me/5519995360651">(19) 9 9536-0651</a><br/><br/>' +
            '<b>Atenciosamente,<br/>PurpleTech</b><br/>https://purpletech.com.br<br/>' +
            'Não responda este Email, em caso de dúvidas envie um Email para contato@purpletech.com.br'
        } 

        transporter.sendMail(mailOptions)
    },

    alertOfChange(email) {
        const mailOptions = {
            from: 'PurpleTech <' + process.env.MAIL_SEND_FROM + '>',
            to: email,
            subject: 'Alteração de senha 🔒⛔',
            html: 'Uma alteração de senha acabou de ser feita no site ' + process.env.DOMAIN_NAME + '<br/><br/>' +
            'Se você não fez essa alteração, por favor entre em contato com o suporte.' +
            'Em caso de dúvidas, entre em contato através do nosso WhatsApp: ' +
            '<a target="_blank" href="https://wa.me/5519995360651">(19) 9 9536-0651</a><br/><br/>' +
            '<b>Atenciosamente,<br/>PurpleTech</b><br/>https://purpletech.com.br<br/>' +
            'Não responda este Email, em caso de dúvidas envie um Email para contato@purpletech.com.br'
        } 
        transporter.sendMail(mailOptions)
    },

    newAccount(email, name) {
        const mailOptions = {
            from: 'PurpleTech <' + process.env.MAIL_SEND_FROM + '>',
            to: email,
            subject: 'Sua conta foi criada com sucesso! 🚀🤩',
            html: '<b>Uhuuuul! ' + name + ', sua conta foi criada com sucesso!</b><br/><br/>' +
            'Em nossa plataforma, você poderá:<br/>' +
            '<ul>' +
                '<li>Acompanhar seus projetos</li>' +
                '<li>Solicitar novos orçamentos</li>' +
                '<li>Conversar diretamente com os desenvolvedores</li>' +
                '<li>Pagar suas faturas de maneira comoda e prática</li>' +
                '<li>Acessar diversos tutoriais que ajudarão na administração do seu projeto</li>' +
                '<li><b>E muito mais!</b></li>' +
            '</ul><br/><br/>' +
            'Agradecemos a confiança e preferência. Conte com a PurpleTech para tornar a sua ideia realidade!<br/>' +
            'Em caso de dúvidas, entre em contato através do nosso WhatsApp: ' +
            '<a target="_blank" href="https://wa.me/5519995360651">(19) 9 9536-0651</a><br/><br/>' +
            '<b>Atenciosamente,<br/>PurpleTech</b><br/>https://purpletech.com.br<br/>' +
            'Não responda este Email, em caso de dúvidas envie um Email para contato@purpletech.com.br'
        }

        transporter.sendMail(mailOptions) 
    },

    projectNotice(name, project) {
        const mailOptions = {
            from: 'PurpleTech <' + process.env.MAIL_SEND_FROM + '>',
            to: process.env.MAIL_AUTH_USER,
            subject: 'Oba, mais um projeto! 🤑🤑',
            html: '<b>Parabéns! Um novo projeto foi criado por ' + name + '</b><br/><br/>' +
            'Confira o projeto no link abaixo:<br/>' +
            process.env.DOMAIN_NAME + '/project/' + project + '<br/><br/>' +
            '<b>PurpleTech</b><br/>https://purpletech.com.br'
        }

        transporter.sendMail(mailOptions) 
    },

    projectCreated(email, name, project) {
        const mailOptions = {
            from: 'PurpleTech <' + process.env.MAIL_SEND_FROM + '>',
            to: email,
            subject: 'Projeto criado com sucesso! 💖😍',
            html: '<b>Parabéns ' + name + ', você deu o primeiro passo para o sucesso da sua ideia!</b><br/><br/>' +
            'Seu projeto agora está em fase de análise, entraremos em contato em breve.<br/>' +
            'Para conferir as atualizações referentes ao seu projeto, acesse:<br/>' +
            process.env.DOMAIN_NAME + '/project/' + project + '<br/>' +
            'Em caso de dúvidas, entre em contato através do nosso WhatsApp: ' +
            '<a target="_blank" href="https://wa.me/5519995360651">(19) 9 9536-0651</a><br/><br/>' +
            '<b>Atenciosamente,<br/>PurpleTech</b><br/>https://purpletech.com.br<br/>' +
            'Não responda este Email, em caso de dúvidas envie um Email para contato@purpletech.com.br'
        }

        transporter.sendMail(mailOptions) 
    },

    projectApproved(email, name) {
        const mailOptions = {
            from: 'PurpleTech <' + process.env.MAIL_SEND_FROM + '>',
            to: email,
            subject: 'Seu projeto foi aprovado! 🤩🤩',
            html: '<b>Olá, ' + name + '. É com muito prazer que anunciamos que seu projeto foi aprovado!</b><br/><br/>'+
            'Isso significa que agora o seu projeto será estudado e analisado para que possamos começar o desenvolvimento.<br/>' +
            'Em caso de dúvidas, entre em contato através do nosso WhatsApp: ' +
            '<a target="_blank" href="https://wa.me/5519995360651">(19) 9 9536-0651</a><br/><br/>' +
            '<b>Atenciosamente,<br/>PurpleTech</b><br/>https://purpletech.com.br<br/>' +
            'Não responda este Email, em caso de dúvidas envie um Email para contato@purpletech.com.br'
        }

        transporter.sendMail(mailOptions) 
    },

    projectDevelopment(email, name) {
        const mailOptions = {
            from: 'PurpleTech <' + process.env.MAIL_SEND_FROM + '>',
            to: email,
            subject: 'Seu projeto está em desenvolvimento! 🔥🚀',
            html: '<b>Olá, ' + name + '. Seu projeto está em fase de desenvolvimento!</b><br/><br/>'+
            'Agora é a hora de colocarmos a mão na massa e transformarmos a sua ideia em realidade.<br/>' +
            'Em caso de dúvidas, entre em contato através do nosso WhatsApp: ' +
            '<a target="_blank" href="https://wa.me/5519995360651">(19) 9 9536-0651</a><br/><br/>' +
            '<b>Atenciosamente,<br/>PurpleTech</b><br/>https://purpletech.com.br<br/>' +
            'Não responda este Email, em caso de dúvidas envie um Email para contato@purpletech.com.br'
        }

        transporter.sendMail(mailOptions) 
    },

    projectCompleted(email, name) {
        console.log(email, name)
        const mailOptions = {
            from: 'PurpleTech <' + process.env.MAIL_SEND_FROM + '>',
            to: email,
            subject: 'Seu projeto foi concluído! 🌟😍',
            html: '<b>Olá, ' + name + '. Seu projeto foi concluído com sucesso!</b><br/><br/>'+
            'Finalmente, você poderá colocar a sua ideia em prática e alcançar o sucesso que sempre sonhou.<br/>' +
            'Contudo, isso não significa que a nossa parceria chegou ao fim. A PurpleTech estará sempre a disposição para ajudar você.<br/>' +
            'Ainda há muito trabalho para ser feito e muitas dúvidas surgirão. Por isso, recomendamos que acesse a nossa sessão de tutoriais em nossa plataforma.<br/>' +
            'Para acessar os tutoriais, basta clicar no link: ' + process.env.DOMAIN_NAME + '/support<br/>' +
            'Em caso de dúvidas, entre em contato através do nosso WhatsApp: ' +
            '<a target="_blank" href="https://wa.me/5519995360651">(19) 9 9536-0651</a><br/><br/>' +
            '<b>Atenciosamente,<br/>PurpleTech</b><br/>https://purpletech.com.br<br/>' +
            'Não responda este Email, em caso de dúvidas envie um Email para contato@purpletech.com.br'
        }

        transporter.sendMail(mailOptions) 
    },

    projectPaused(email, name) {
        const mailOptions = {
            from: 'PurpleTech <' + process.env.MAIL_SEND_FROM + '>',
            to: email,
            subject: 'Seu projeto foi pausado! ⏸⛔',
            html: '<b>Olá, ' + name + '. Seu projeto foi colocado em espera.</b><br/><br/>' +
            'Em caso de dúvidas, entre em contato através do nosso WhatsApp: ' +
            '<a target="_blank" href="https://wa.me/5519995360651">(19) 9 9536-0651</a><br/><br/>' +
            '<b>Atenciosamente,<br/>PurpleTech</b><br/>https://purpletech.com.br<br/>' +
            'Não responda este Email, em caso de dúvidas envie um Email para contato@purpletech.com.br'
        }

        transporter.sendMail(mailOptions) 
    },

    projectCanceled(email, name) {
        const mailOptions = {
            from: 'PurpleTech <' + process.env.MAIL_SEND_FROM + '>',
            to: email,
            subject: 'Seu projeto foi cancelado! 😥😔',
            html: '<b>Olá, ' + name + '. Infelizmente, seu projeto foi cancelado.</b><br/><br/>' +
            'Lamentamos que isso tenha ocorrido e prometemos nos empenhar para que nunca mais aconteça.<br/>' +
            'Por favor, responda a este Email com suas reclamações, queixas e os motivos que levaram ao cancelamento.<br/>' +
            'Analisaremos todos os detalhes com bastante cuidado para que isso não volte a se repetir.<br/><br/>' +
            'Em caso de dúvidas, entre em contato através do nosso WhatsApp: ' +
            '<a target="_blank" href="https://wa.me/5519995360651">(19) 9 9536-0651</a><br/><br/>' +
            '<b>Atenciosamente,<br/>PurpleTech</b><br/>https://purpletech.com.br<br/>' +
            'Não responda este Email, em caso de dúvidas envie um Email para contato@purpletech.com.br'
        }

        transporter.sendMail(mailOptions)
    },

    userCreated(email, name, password) {
        const mailOptions = {
            from: 'PurpleTech <' + process.env.MAIL_SEND_FROM + '>',
            to: email,
            subject: 'Uma conta foi criada para você 🤩🌟',
            html: '<b>Olá, ' + name + '! Uma conta em nosso painel foi criada para que você possa acompanhar o andamento do seu projeto.</b><br/><br/>' +
            'Em nosso sistema, você terá um controle maior sobre o seu projeto e comunicação direta com os desenvolvedores.<br/>' +
            'Além disso, você poderá solicitar novos orçamentos diretamente e ter acesso a diversos tutoriais sobre como gerenciar seu projeto após a finalização.<br/><br/>' +
            'Para acessar a plataforma, utilize as informações abaixo:<br/>' +
            '<b>' + process.env.DOMAIN_NAME + '<br/>' +
            'Email: ' + email +
            '<br/>Senha: ' + password + '</b><br/><br/>' +
            'Em caso de dúvidas, entre em contato através do nosso WhatsApp: ' +
            '<a target="_blank" href="https://wa.me/5519995360651">(19) 9 9536-0651</a><br/><br/>' +
            '<b>Atenciosamente,<br/>PurpleTech</b><br/>https://purpletech.com.br<br/>' +
            'Não responda este Email, em caso de dúvidas envie um Email para contato@purpletech.com.br'
        }

        transporter.sendMail(mailOptions)
    },

    newMessageNotice(message) {
        const mailOptions = {
            from: 'PurpleTech <' + process.env.MAIL_SEND_FROM + '>',
            to: process.env.MAIL_AUTH_USER,
            subject: 'Você recebeu uma nova mensagem! 📩📩',
            html: '<b>Recebemos uma nova mensagem!</b><br/><br/>' +
            'Confira a mensagem no link abaixo:<br/>' +
            process.env.DOMAIN_NAME + '/message/' + message + '<br/><br/>' +
            '<b>PurpleTech</b><br/>https://purpletech.com.br'
        }

        transporter.sendMail(mailOptions) 
    },

    newMessageNoticeUser(message, email, name) {
        const mailOptions = {
            from: 'PurpleTech <' + process.env.MAIL_SEND_FROM + '>',
            to: email,
            subject: 'Você recebeu uma nova mensagem! 📩📩',
            html: '<b>Olá, ' + name + '. Você recebeu uma nova mensagem.</b><br/><br/>' +
            'Você pode responder a mensagem acessando o link abaixo:<br/>' +
            process.env.DOMAIN_NAME + '/message/' + message + '<br/><br/>' +
            'Em caso de dúvidas, entre em contato através do nosso WhatsApp: ' +
            '<a target="_blank" href="https://wa.me/5519995360651">(19) 9 9536-0651</a><br/><br/>' +
            '<b>Atenciosamente,<br/>PurpleTech</b><br/>https://purpletech.com.br<br/>' +
            'Não responda este Email, em caso de dúvidas envie um Email para contato@purpletech.com.br'
        }

        transporter.sendMail(mailOptions) 
    },

    sendMailUser(email, name, message) {
        const mailOptions = {
            from: 'PurpleTech <' + process.env.MAIL_SEND_FROM + '>',
            to: email,
            subject: 'Você recebeu uma nova mensagem! 📩📩',
            html: '<b>Olá, ' + name + '. Você recebeu uma nova mensagem.</b><br/><br/>' +
            'Confira a mensagem abaixo:<br/><br/>' +
            '==========================<br/><b>' +
            message +
            '</b><br/>==========================<br/><br/>' +
            'Em caso de dúvidas, entre em contato através do nosso WhatsApp: ' +
            '<a target="_blank" href="https://wa.me/5519995360651">(19) 9 9536-0651</a><br/><br/>' +
            '<b>Atenciosamente,<br/>PurpleTech</b><br/>https://purpletech.com.br<br/>' +
            'Não responda este Email, em caso de dúvidas envie um Email para contato@purpletech.com.br'
        }

        transporter.sendMail(mailOptions) 
    },

    sendMessage(message) {
        const mailOptions = {
            from: message.name + ' <' + process.env.MAIL_SEND_FROM + '>',
            to: process.env.MAIL_AUTH_USER,
            subject: 'Você recebeu uma nova mensagem! 📩📩',
            html: '<b>Recebemos uma nova mensagem!</b><br/><br/>' +
            'Nome: ' + message.name + '<br/>' +
            'Email: ' + message.email + '<br/>' +
            'Telefone: ' + '<a href="https://wa.me/55' + message.phone + '">' + message.phone + '</a><br/>' +
            'Mensagem: ' + message.message + '<br/><br/>' +
            '<b>PurpleTech</b><br/>https://purpletech.com.br'
            
        }

        transporter.sendMail(mailOptions) 
    }
}