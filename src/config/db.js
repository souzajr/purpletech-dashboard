const mongoose = require('mongoose')
mongoose.set('useCreateIndex', true)
mongoose.set('useFindAndModify', false)

module.exports = {
    openConn() {
        mongoose.connect(process.env.DB_HOST, { useNewUrlParser: true }).catch(err => {
            const msg = 'Error connecting to database!'
            console.log('\x1b[41m\x1b[37m', msg, '\x1b[0m')
        })
        require('../model/userModel')
    }
}