const mongoose = require('mongoose')

const ProjectHistorySchema = new mongoose.Schema({
    dataChange: String,
    dateChange: String,
    dateTodayChange: String
})

const ProjectSchema = new mongoose.Schema({
    _idClient: { type: String, required: true },
    name: { type: String, required: true },
    budget: { type: String, required: true },
    status: { type: String, required: true },
    deadline: { type: String, required: true },
    category: { type: String, required: true },
    platform: { app: Boolean, web: Boolean, desktop: Boolean },
    _idResponsible: String,
    description: { type: String, required: true },
    projectHistory: [ProjectHistorySchema],
    createdAt: { type: String, required: true },
    concludedAt: String,
    startAt: String,
    endAt: String,
    file: [{ fileName: String }],
    canceledReason: String
})

mongoose.model('Project', ProjectSchema)