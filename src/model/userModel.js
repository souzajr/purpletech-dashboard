const moongoose = require('mongoose')

const HistoricSchema = new moongoose.Schema({
    dataChange: String,
    dateChange: String,
    dateTodayChange: String
})

const UserSchema = new moongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    avatar: String,
    profileChange: [HistoricSchema],
    admin: { type: Boolean, required: true },
    createdAt: { type: String, required: true },
    deletedAt: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    _idProject: Array,
    profilePicture: String
})

moongoose.model('User', UserSchema)