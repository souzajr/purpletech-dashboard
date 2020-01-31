"use strict";

const mongoose = require('mongoose')
const Portfolio = mongoose.model('Portfolio')
const path = require('path')
const multer = require('multer')
const multerS3 = require('multer-s3')
const crypto = require('crypto')
const aws = require('aws-sdk')
const moment = require('moment')
moment.locale('pt-br')
const failMessage = 'Algo deu errado'
const successMessage = 'Sucesso!'

module.exports = app => {
  const viewPortfolio = (req, res) => {
    res.status(200).render('./dashboard/index', {
      user: req.session.user,
      page: '/portfolio',
      message: null
    })
  }

  const postNewPotfolio = (req, res) => {
    const s3 = new aws.S3({
      accessKeyId: process.env.AWS_IAM_USER_KEY,
      secretAccessKey: process.env.AWS_IAM_USER_SECRET,
      Bucket: process.env.AWS_BUCKET_NAME
    })

    const fileFilter = (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase()
      if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png') {
        cb(null, false)
      }

      cb(null, true)
    }

    const multerS3Config = multerS3({
      s3,
      bucket: process.env.AWS_BUCKET_NAME,
      metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname })
      },
      key: function (req, file, cb) {
        cb(null, crypto.randomBytes(10).toString('hex') + Date.now() + path.extname(file.originalname).toLowerCase())
      }
    })

    const upload = multer({
      storage: multerS3Config,
      fileFilter: fileFilter,
      limits: {
        fileSize: 1024 * 1024 * 15 // 15MB
      }
    }).any()

    upload(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json(failMessage)
      } else if (err) {
        return res.status(400).json(failMessage)
      } else if (!req.files.length) {
        return res.status(400).json('Selecione pelo menos um arquivo')
      }

      new Portfolio({
        name: req.body.name,
        url: req.body.url,
        description: req.body.description,
        images: req.files.map(files => files.location),
        createdAt: moment().format('L - LTS')
      }).save()
      .then(() => res.status(200).json(successMessage))
      .catch(() => res.status(500).json(failMessage))
    })
  }

  const getPortfolio = async (req, res) => {
    try {
      const portfolio = await Portfolio.find().sort({ _id: -1 }).lean()
      return res.status(200).json(portfolio)
    } catch(err) {
      return res.status(500).json(err)
    }
  }

  return {
    viewPortfolio,
    postNewPotfolio,
    getPortfolio
  }
}