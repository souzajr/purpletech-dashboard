const mongoose = require('mongoose')

const UserTestSchema = new mongoose.Schema({
    name: String,
    age: String,
    phone: String,
    address: String,
}, {
    timestamps: true,
})

mongoose.model('UserTest', UserTestSchema)