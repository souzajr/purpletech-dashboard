const moongoose = require('mongoose')

const ProjectHistorySchema = new moongoose.Schema({
    dataChange: String,
    dateChange: String,
    dateTodayChange: String
})

const PlatformSchema = new moongoose.Schema({
    app: Boolean,
    web: Boolean,
    desktop: Boolean
})

const ProjectSchema = new moongoose.Schema({
    _idClient: { type: String, required: true },
    name: { type: String, required: true },
    budget: { type: String, required: true },
    status: { type: String, required: true },
    deadline: { type: String, required: true },
    category: { type: String, required: true },
    platform: [PlatformSchema],
    _idResponsible: String,
    description: { type: String, required: true },
    projectHistory: [ProjectHistorySchema],
    createdAt: { type: String, required: true },
    concludedAt: String
})

moongoose.model('Project', ProjectSchema)