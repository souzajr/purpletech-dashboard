const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: String,
    phone: { type: String, required: true },
    avatar: String,
    admin: { type: Boolean, required: true },
    createdAt: { type: String, required: true },
    deletedAt: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    _idProject: Array,
    profilePicture: String,
    firstAccess: { type: Boolean, required: true },
    firstProject: { type: Boolean, required: true },
    googleId: String,
    facebookId: String,
    noPassword: Boolean
})

mongoose.model('User', UserSchema)