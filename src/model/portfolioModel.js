const mongoose = require('mongoose')

const PortfolioSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  url: { type: String, required: true },
  images: [{ type: String }],
  createdAt: { type: String, required: true }
})

mongoose.model('Portfolio', PortfolioSchema)