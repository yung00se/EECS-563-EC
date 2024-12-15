const mongoose = require('mongoose')
//const jwt = require('jsonwebtoken')

const chatSchema = new mongoose.Schema(
  {
    members: {
      type: [String],
      required: true
    },
    messageLog: {
      type: [String],
      required: true,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Chat', chatSchema)