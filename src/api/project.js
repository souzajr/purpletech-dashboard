const mongoose = require('mongoose')
const User = mongoose.model('User')
const Project = mongoose.model('Project')
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

    const createNewProject = async (req, res) => {
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
        project.projectHistory = [{ 
            dataChange: 'Created',
            dateChange: date.toLocaleDateString().split('-').reverse().join('/'),
            dateTodayChange: date.getHours() + ':' + ((date.getMinutes() < 10 ? "0" : "") + date.getMinutes())
        }]
        project.createdAt = project.projectHistory[0].dateChange
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

        await User.findOne({ _id: req.session.user._id }).then(async user => {
            await Project.create(project).then(async project => {
                user._idProject.push(project._id)
                mail.projectCreated(user.email, user.name, project._id)
                await user.save().catch(_ => res.status(500).json('Algo deu errado'))
                res.status(200).json('Sucesso!')
            }).catch(_ => res.status(500).json('Algo deu errado'))
        }).catch(_ => res.status(500).json('Algo deu errado'))
    }

    const viewProject = async (req, res) => {
        await Project.findOne({ _id: req.params.id }).then(async project => {
            let responsible = null
            if(project._idResponsible) { 
                responsible = await User.findOne({ _id: project._idResponsible })
                .catch(_ => res.status(500).render('500'))
                responsible.password = undefined
            }
            res.status(200).render('./dashboard/index', {
                project,
                responsible,
                user: req.session.user, 
                page: '/project',
                style: 'details',
                message: null
            })
        }).catch(_ => res.status(500).render('500'))
    }

    const uploadProjectFile = (req, res) => {
        upload(req, res, async function(err) {
            if (err instanceof multer.MulterError) {
                return res.status(500).render('500')
            } else if (err) {
                return res.status(500).render('500')
            } else if (!req.files.length) {
                await Project.findOne({ _id: req.params.id }).then(async project => {
                    let responsible = null
                    if(project._idResponsible) { 
                        responsible = await User.findOne({ _id: project._idResponsible })
                        .catch(_ => res.status(500).render('500'))
                        responsible.password = undefined
                    }
                    return res.status(400).render('./dashboard/index', { 
                        project,
                        responsible,
                        user: req.session.user, 
                        page: '/project',
                        style: 'archive',
                        message: JSON.stringify('Você deve selecionar ao menos uma imagem') 
                    })
                }).catch(_ => res.status(500).render('500'))
            }
    
            await Project.findOne({ _id: req.params.id }).then(async project => {
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

                await project.save().catch(_ => res.status(500).render('500'))                
                let responsible = null
                if(project._idResponsible) { 
                    responsible = await User.findOne({ _id: project._idResponsible })
                    .catch(_ => res.status(500).render('500'))
                    responsible.password = undefined
                }
                res.status(200).render('./dashboard/index', {
                    project,
                    responsible,
                    user: req.session.user, 
                    page: '/project',
                    style: 'archive',
                    message: JSON.stringify('Sucesso!')
                })
            }).catch(_ => res.status(500).render('500'))
        })
    }

    const getProjectFile = async (req, res) => {
        await Project.findOne({ _id: req.params.id }).then(_ => { 
            res.sendFile(req.params.filename, { root: './public/upload/' })
        }).catch(_ => res.status(500).render('500'))
    }

    const getProjectFileThumb = async (req, res) => {
        await Project.findOne({ _id: req.params.id }).then(_ => { 
            res.sendFile(req.params.filename, { root: './public/upload/thumb/' })
        }).catch(_ => res.status(500).render('500'))
    }

    const changeProject = async (req, res) => {  
        const newProject = { ...req.body }     
        try {
            existOrError(newProject.name, 'Por favor, digite o nome do projeto')
            existOrError(newProject.budget, 'Por favor, digite o orçamento do projeto')            
            existOrError(newProject.category, 'Por favor, escolha a categoria do projeto')
            existOrError(newProject.deadline, 'Por favor, escolha o prazo do projeto')
            existOrError(newProject.description, 'Por favor, digite a descrição do projeto')
            tooSmall(newProject.name, 'Digite um nome de projeto maior')
            tooBig(newProject.name, 'Digite um nome de projeto menor')
            tooSmall(newProject.description, 'Digite uma descrição de projeto maior')
            if(newProject.status == 'Projeto cancelado') {
                existOrError(newProject.reason, 'Digite o motivo do cancelamento')
                tooSmall(newProject.reason, 'Digite um motivo maior')
            }
        } catch (msg) {
            return res.status(400).json(msg)
        }

        await Project.findOne({ _id: req.params.id }).then(async project => {
            await User.findOne({ _id: project._idClient }).then(user => {
                if(newProject.status == project.status) {
                    changeProject()
                } else if(newProject.status == 'Aguardando aprovação') {
                    changeProject(newProject.status, 'Created')
                } else if(newProject.status == 'Projeto aprovado') {     
                    mail.projectApproved(user.email, user.name)         
                    changeProject(newProject.status, 'Approved')
                } else if(newProject.status == 'Projeto em desenvolvimento') {
                    mail.projectDevelopment(user.email, user.name)
                    changeProject(newProject.status, 'Development')
                } else if(newProject.status == 'Projeto concluído') {
                    mail.projectCompleted(user.email, user.name)
                    changeProject(newProject.status, 'Completed')
                } else if(newProject.status == 'Projeto pausado') {
                    mail.projectPaused(user.email, user.name)
                    changeProject(newProject.status, 'Paused')
                } else {
                    mail.projectCanceled(user.email, user.name)
                    changeProject(newProject.status, 'Canceled', newProject.reason)
                }

                async function changeProject(status, pushHistory, reason) {
                    if(status && pushHistory) {
                        const date = new Date()
                        project.projectHistory.push({ 
                            dataChange: pushHistory,
                            dateChange: date.toLocaleDateString().split('-').reverse().join('/'),
                            dateTodayChange: date.getHours() + ':' + ((date.getMinutes() < 10 ? "0" : "") + date.getMinutes())
                        })
                        project.status = status
                        if(reason)
                            project.canceledReason = reason
                        else
                            project.canceledReason = undefined
                    }
                    
                    project.name = newProject.name
                    project.budget = newProject.budget
                    project.category = newProject.category
                    project.deadline = newProject.deadline
                    project.description = newProject.description
                    let { web, app, desktop } = false
                    if(newProject.web)
                        web = true
                    if(newProject.app)
                        app = true
                    if(newProject.desktop)
                        desktop = true
                    project.platform = { web, app, desktop }
                    if(newProject.responsible)
                        project._idResponsible = req.session.user._id
                    else
                        project._idResponsible = undefined

                    await project.save().catch(_ => res.status(500).json('Algo deu errado'))
                    res.status(200).json('Sucesso!')
                }
            }).catch(_ => res.status(500).json('Algo deu errado'))
        }).catch(_ => res.status(500).json('Algo deu errado'))
    }

    const viewAllProjects = async (req, res) => {
        await Project.find().then(async project => {
            let client = []
            for(let i = 0; i < project.length; i++) {
                await User.findOne({ _id: project[i]._idClient }).then(user => {
                    client.push(user)
                }).catch(_ => res.status(500).render('500'))
            }

            res.status(200).render('./dashboard/index', {
                project,
                client,
                user: req.session.user,
                page: req.url,
                message: null
            })
        }).catch(_ => res.status(500).render('500'))
    }

    const viewBudget = async (req, res) => {
        await User.find().then(users => {
            for(let i = 0; i < users.length; i++) users[i].password = undefined
            res.status(200).render('./dashboard/index', {
                users,
                user: req.session.user, 
                page: req.url,
                message: null
            })
        }).catch(_ => res.status(500).render('500'))
    }

    const createNewProjectAdmin = async (req, res) => {
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
            existOrError(project.status, 'Escolha o status do projeto')
            if(project.status == 'Projeto cancelado') { 
                existOrError(project.reason, 'Digite o motivo do cancelamento')
                tooSmall(project.reason, 'Digite um motivo maior')
            }
            existOrError(project._idClient, 'Escolha um usuário')
        } catch (msg) {
            return res.status(400).json(msg)
        }       

        let { web, app, desktop } = false
        if(project.web)
            web = true
        if(project.app)
            app = true
        if(project.desktop)
            desktop = true
        project.platform = { web, app, desktop }
        if(project.responsible)
            project._idResponsible = req.session.user._id
        else
            project._idResponsible = undefined
        let dataChange = ''
        if(project.status == 'Aguardando aprovação') dataChange = 'Created'
        else if(project.status == 'Projeto aprovado') dataChange = 'Approved'
        else if(project.status == 'Projeto em desenvolvimento') dataChange = 'Development'
        else if(project.status == 'Projeto concluído') dataChange = 'Completed'
        else if(project.status == 'Projeto pausado') DataChange = 'Paused'
        else dataChange = 'Canceled'
        const date = new Date()
        project.projectHistory = [{ 
            dataChange,
            dateChange: date.toLocaleDateString().split('-').reverse().join('/'),
            dateTodayChange: date.getHours() + ':' + ((date.getMinutes() < 10 ? "0" : "") + date.getMinutes())
        }]
        project.createdAt = project.projectHistory[0].dateChange

        await Project.create(project).then(async project => {
            await User.findOne({ _id: project._idClient }).then(async user => {
                user._idProject.push(project._id)
                await user.save().catch(_ => res.status(500).json('Algo deu errado'))
                if(project.projectHistory[0].dataChange == 'Created') mail.projectCreated(user.email, user.name, project._id)
                else if(project.projectHistory[0].dataChange == 'Approved') mail.projectApproved(user.email, user.name)  
                else if(project.projectHistory[0].dataChange == 'Development') mail.projectDevelopment(user.email, user.name)
                else if(project.projectHistory[0].dataChange == 'Completed') mail.projectCompleted(user.email, user.name)  
                else if(project.projectHistory[0].dataChange == 'Paused') mail.projectPaused(user.email, user.name)   
                else mail.projectCanceled(user.email, user.name) 
                res.status(200).json({
                    'msg': 'Sucesso!',
                    'id': project._id
                })
            }).catch(_ => res.status(500).json('Algo deu errado'))  
        }).catch(_ => res.status(500).json('Algo deu errado'))        
    }

    return { 
        createNewProject, 
        viewProject,
        uploadProjectFile, 
        getProjectFile,
        getProjectFileThumb,
        changeProject,
        viewAllProjects,
        viewBudget,
        createNewProjectAdmin
    }
}