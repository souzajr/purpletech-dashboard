const User = require('../procedure/userProcedure')
const Project = require('../procedure/projectProcedure')
const jwt = require('jwt-simple')
const bcrypt = require('bcrypt-nodejs')

module.exports = app => {
    const login = async (req, res) => {
        const {
            existOrError,
            tooBigEmail,
            validEmailOrError
        } = app.src.api.validation

        try {
            existOrError(req.body.email, 'Digite seu Email')
            tooBigEmail(req.body.email, 'Seu Email é muito longo')
            validEmailOrError(req.body.email, 'Email inválido')
            existOrError(req.body.password, 'Digite sua senha')
        } catch(msg) {
            return res.status(400).json(msg)
        }

        await User.getByEmailWithPass(req.body.email).then(async user => {
            if(user === undefined) return res.status(500).json('Algo deu errado')
            if (user.deletedAt) return res.status(401).json('E-mail ou senha inválidos')
            const isMatch = bcrypt.compareSync(req.body.password, user.password)
            if (!isMatch) return res.status(401).json('E-mail ou senha inválidos')
            user.password = undefined

            const now = Math.floor(Date.now() / 1000)
            const payload = {
                id: user._id,
                iss: 'http://localhost:3000',
                iat: now,
                exp: now + (60 * 60 * 24 * 3)
            }

            await Project.getAllById(user._idProject).then(project => {
                if(project === undefined) return res.status(500).json('Algo deu errado')
                req.session.project = project
                req.session.user = user
                req.session.token = jwt.encode(payload, process.env.AUTH_SECRET)
                res.status(200).end()
            })
        }).catch(_ => {
            res.status(401).json('E-mail ou senha inválidos')
        })
    }

    const validateToken = async (req, res) => {
        const userToken = req.session.token || null
        try {
            if (userToken) {
                const token = jwt.decode(userToken, process.env.AUTH_SECRET)
                if (new Date(token.exp * 1000) > new Date()) {
                    res.status(200).redirect('/dashboard')
                }
            }
        } catch (err) {
            return res.status(401).render('login', { message: JSON.stringify('Algo deu errado') })
        }
    }

    return { login, validateToken }
}