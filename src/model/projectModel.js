const moongoose = require('mongoose')

const PlatformSchema = new moongoose.Schema({
    app: Boolean,
    web: Boolean,
    desktop: Boolean
})

const ProjectHistorySchema = new moongoose.Schema({
    dataChange: String,
    dateChange: String,
    dateTodayChange: String
})

const TaskSchema = new moongoose.Schema({
    status: Boolean,
    description: String,
})

const FileSchema = new moongoose.Schema({
    fileName: String
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
    concludedAt: String,
    startAt: String,
    endAt: String,
    task: [TaskSchema],
    file: [FileSchema]
})

moongoose.model('Project', ProjectSchema)