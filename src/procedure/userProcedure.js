const mongoose = require('mongoose')
const User = mongoose.model('User')

module.exports = {
    async getById(_id) {
        return await User.findOne({ _id }, {
            "_id": 1,
            "name": 1,
            "email": 1,
            "phone": 1,
            "avatar": 1,
            "admin": 1,
            "createdAt": 1,
            "deletedAt": 1,
            "_idProject": 1,
            "profilePicture": 1
        })
        .then(user => user)
        .catch(_ => undefined)
    },

    async getByEmail(email) {
        return await User.findOne({ email }, {
            "_id": 1,
            "name": 1,
            "email": 1,
            "phone": 1,
            "avatar": 1,
            "admin": 1, 
            "createdAt": 1,
            "deletedAt": 1,
            "_idProject": 1,
            "profilePicture": 1
        })
        .then(user => user)
        .catch(_ => undefined)
    },

    async getByEmailWithPass(email) {
        return await User.findOne({ email })
        .then(user => user)
        .catch(_ => undefined)
    },

    async createNew(user) {
        return await User.create(user)
        .then(user => user)
        .catch(_ => undefined)
    },

    async getByToken(token) {
        return await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        })
        .then(user => user)
        .catch(_ => undefined)
    },

    async saveInfo(user) {
        return await user.save()
        .then(user => user)
        .catch(_ => undefined)
    }
}