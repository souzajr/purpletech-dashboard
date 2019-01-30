"use strict";

const mongoose = require('mongoose')
const User = mongoose.model('User')

module.exports = app => { 
    const viewMessagePage = (req, res) => {
        res.status(200).render('./dashboard/index', { 
            user: req.session.user,
            page: req.url,
            message: null
        })
    }


    return { viewMessagePage }
}