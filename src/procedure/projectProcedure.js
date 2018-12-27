const mongoose = require('mongoose')
const Project = mongoose.model('Project')

module.exports = {
    async getAllById(_id) {
        return await Project.find({ _id })
        .then(project => project)
        .catch(_ => undefined)
    },
    
    async getById(_id) {
        return await Project.findOne({ _id })
        .then(project => project)
        .catch(_ => undefined)
    },

    async createNew(project) {
        return await Project.create(project)
        .then(project => project)
        .catch(_ => undefined)
    },

    async saveInfo(project) {
        return await project.save()
        .then(project => project)
        .catch(_ => undefined)
    }
}