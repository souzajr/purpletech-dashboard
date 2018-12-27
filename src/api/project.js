const Project = require('../procedure/projectProcedure')
const User = require('../procedure/userProcedure')
const mail = require('../config/mail')
const path = require('path')
const multer = require('multer')
const crypto = require('crypto')
const sharp = require('sharp')

module.exports = app => {    
    const {
        existOrError,
        tooSmall,
        tooBig
    } = app.src.api.validation
    
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
        if(ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg' && ext !== '.bmp') {
            return callback(new Error())
        }
        callback(null, true)
    },
    limits: {
        fileSize: 1024 * 2048
    }}).any()

    const save = async (req, res) => {
        const project = { ...req.body }

        try {
            existOrError(project.name, 'Por favor, digite o nome do projeto')
            existOrError(project.budget, 'Por favor, digite o orçamento do projeto')            
            existOrError(project.category, 'Por favor, escolha a categoria do projeto')
            existOrError(project.deadline, 'Por favor, escolha o prazo do projeto')
            existOrError(project.description, 'Por favor, digite a descrição do projeto')
            tooSmall(project.name, 'Digite um nome de projeto maior')
            tooBig(project.name, 'Digite um nome de projeto menor')
            tooSmall(project.description, 'Digite uma descrição de projeto maior')
        } catch (msg) {
            return res.status(400).json(msg)
        }

        const date = new Date()
        const dateTodayChange = date.toLocaleDateString().split('-').reverse().join('/')
        const dateChange = date.getHours() + ':' + ((date.getMinutes() < 10 ? "0" : "") + date.getMinutes())
        
        project.projectHistory = {
            dataChange: 'Created',
            dateChange,
            dateTodayChange
        }       
        project.createdAt = dateTodayChange
        project.status = 'Aguardando aprovação'
        project._idClient = req.session.user._id
        let { web, app, desktop } = false
        if(project.web)
            web = true
        if(project.app)
            app = true
        if(project.desktop)
            desktop = true
        project.platform = { web, app, desktop }

        await Project.createNew(project).then(async project => {
            if(!project) return res.status(500).json('Algo deu errado')
            await User.getById(req.session.user._id).then(async user => {
                if(!user) return res.status(500).json('Algo deu errado')
                user._idProject.push(project._id) 
                await User.saveInfo(user).then(async user => {
                    if(!user) return res.status(500).json('Algo deu errado')
                    await Project.getAllById(user._idProject).then(project => {
                        if(!project) return res.status(500).json('Algo deu errado')
                        req.session.project = project
                        req.session.user = user
                        mail.projectCreated(user.email, user.name)
                        res.status(200).json('Sucesso!')
                    })
                })
            })
        })
    }

    const getAll = async (req, res) => {
        await User.getById(req.session.user._id).then(async user => {
            if(!user) return res.status(500).render('500')
            await Project.getAllById(user._idProject).then(project => {
                if(!project) return res.status(500).render('500')
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

    const get = async (req, res) => {
        await Project.getById(req.params.id).then(project => {
            if(!project) return res.status(500).render('500')
            res.status(200).render('./dashboard/index', {
                project,
                user: req.session.user, 
                page: '/project',
                style: 'details',
                message: null
            })
        })
    }

    const uploadFile = (req, res) => {
        upload(req, res, async function(err) {
            if (err instanceof multer.MulterError) {
                return res.status(500).render('500')
            } else if (err) {
                return res.status(500).json('Algo deu errado')
            } else if (!req.files.length) {
                await Project.getById(req.params.id).then(project => {
                    if(!project) return res.status(500).render('500')
                    res.status(200).render('./dashboard/index', { 
                        project,
                        user: req.session.user, 
                        page: '/project',
                        style: 'archive',
                        message: JSON.stringify('Você deve selecionar ao menos uma imagem') 
                    })
                })
            }

            await Project.getById(req.params.id).then(async project => {
                if(!project) return res.status(500).render('500')
                for (let i = 0; i < req.files.length; i++) {
                    sharp('./public/upload/' + req.files[i].filename)
                    .resize({ 
                        width: 265,
                        height: 200,
                        fit: sharp.fit.cover,
                        position: sharp.strategy.entropy
                    })
                    .toFile('./public/upload/thumb/' + req.files[i].filename)
                    .catch(_ => res.status(500).render('500'))
                    project.file.push({ fileName: req.files[i].filename })
                }
                await Project.saveInfo(project).then(project => {
                    if(!project) return res.status(500).render('500')
                    req.session.project = project
                    res.status(200).render('./dashboard/index', {
                        project,
                        user: req.session.user, 
                        page: '/project',
                        style: 'archive',
                        message: JSON.stringify('Sucesso!')
                    })
                })
            })
        })
    }

    const sendFile = async (req, res) => {
        await Project.getById(req.params.id).then(project => { 
            if(!project) return res.status(500).render('500')
            res.sendFile(req.params.filename, { root: './public/upload/' })
        })
    }

    const sendFileThumb = async (req, res) => {
        await Project.getById(req.params.id).then(project => { 
            if(!project) return res.status(500).render('500')
            res.sendFile(req.params.filename, { root: './public/upload/thumb/' })
        })
    }

    return { 
        save, 
        getAll, 
        get,
        uploadFile, 
        sendFile,
        sendFileThumb 
    }
}