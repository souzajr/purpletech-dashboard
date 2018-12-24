const mongoose = require('mongoose')
const User = mongoose.model('User')
const Project = mongoose.model('Project')
const mail = require('../config/mail')
const path = require('path')
const multer = require('multer')
const crypto = require('crypto')

module.exports = app => {
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
        if(ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
            return callback(new Error())
        }
        callback(null, true)
    },
    limits: {
        fileSize: 1024 * 2048
    }}).any()
    
    const {
        existOrError,
        tooSmall,
        tooBig
    } = app.src.api.validation

    const save = async (req, res) => {
        const project = { ...req.body }

        try {
            existOrError(project.name, 'Por favor, digite o nome do projeto')
            existOrError(project.budget, 'Por favor, digite o orçamento do projeto')
            existOrError(project.deadline, 'Por favor, escolha o prazo do projeto')
            existOrError(project.category, 'Por favor, escolha a categoria do projeto')
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

        await Project.create(project).then(async createdProject => {
            const user = await User.findOne({ _id: req.session.user._id })
            .catch(_ => res.status(500).render('500'))
            user._idProject.push(createdProject._id) 
            await user.save()
            const getProject = await Project.find({ _id: user._idProject })
            .catch(_ => res.status(500).render('500'))
            req.session.project = getProject

            mail.projectCreated(user.email, user.name)
            res.status(200).render('./dashboard/index', {
                user,
                project: req.session.project, 
                page: '/dashboard',
                message: JSON.stringify('Sucesso!')
            })
        }).catch(_ => res.status(500).render('500'))
    }

    const getAll = async (req, res) => {
        await User.findOne({ _id: req.session.user._id }, {
            "_id": 1,
            "name": 1,
            "email": 1,
            "avatar": 1,
            "description": 1,              
            "profileChange": 1,          
            "admin": 1,
            "createdAt": 1,
            "_idProject": 1
        }).then(async user => {
            const project = await Project.find({ _id: user._idProject })
            .catch(_ => res.status(500).render('500'))
            req.session.user = user
            res.status(200).render('./dashboard/index', {
                project,
                user,
                page: req.url,
                message: null
            })
        }).catch(_ => res.status(500).render('500'))
    }

    const getBudget = async (req, res) => {
        await User.findOne({ _id: req.session.user._id }, {
            "_id": 1,
            "name": 1,
            "email": 1,
            "avatar": 1,
            "description": 1,              
            "profileChange": 1,          
            "admin": 1,
            "createdAt": 1
        }).then(user => {
            req.session.user = user
            res.status(200).render('./dashboard/index', {
                user,
                page: req.url,
                message: null
            })
        }).catch(_ => res.status(500).render('500'))
    }

    const get = async (req, res) => {
        await Project.findOne({ _id: req.params.id }).then(project => {
            res.status(200).render('./dashboard/index', {
                project,
                user: req.session.user, 
                page: '/project',
                style: 'details',
                message: null
            })
        }).catch(_ => res.status(500).render('500'))
    }

    const uploadFile = (req, res) => {
        upload(req, res, async function(err) {
            if (err instanceof multer.MulterError) {
                return res.status(500).render('500')
            } else if (err) {
                return res.status(500).render('500')
            } else if (!req.files.length) {
                await Project.findOne({ _id: req.params.id }).then(project => {
                    return res.status(400).render('./dashboard/index', {
                        project,
                        user: req.session.user, 
                        page: '/project',
                        style: 'archive',
                        message: JSON.stringify('Você deve selecionar ao menos uma imagem')
                    })
                }).catch(_ => res.status(500).render('500'))
            }

            await Project.findOne({ _id: req.params.id }).then(async project => {
                for (let i = 0; i < (req.files).length; i++) {
                    project.file.push({ fileName: req.files[i].filename })
                }
                await project.save()
                res.status(200).render('./dashboard/index', {
                    project,
                    user: req.session.user, 
                    page: '/project',
                    style: 'archive',
                    message: JSON.stringify('Sucesso!')
                })
            }).catch(_ => res.status(500).render('500'))
        })
    }

    const sendFile = async (req, res) => {
        await Project.findOne({ _id: req.params.id }).then(_ => {
            res.sendFile(req.params.filename, { root: './public/upload/' })
        }).catch(_ => res.status(500).render('500'))
    }

    return { save, getAll, getBudget, get, uploadFile, sendFile }
}