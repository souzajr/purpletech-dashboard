const moongoose = require('mongoose')

const UserSchema = new moongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String, required: true },
    description: String,
    profileChange: [{ dataChange: String, dateChange: String, dateTodayChange: String }],
    admin: { type: Boolean, required: true },
    createdAt: { type: String, required: true },
    deletedAt: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date
})

moongoose.model('User', UserSchema)