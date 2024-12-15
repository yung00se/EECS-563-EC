const User = require("../models/userModel")
const jwt = require('jsonwebtoken')

// handle errors
const handleErrors = (err) => {
  console.log(err.message, err.code)
  let errors = { email: '', password: '' }

  // incorrect email
  if (err.message === 'Incorrect Email') {
    errors.email = 'That email is not registered'
  }

  // incorrect password
  if (err.message === 'Incorrect Password') {
    errors.password = 'Incorrect Password'
  }

  // duplicate error code
  if (err.code === 11000) {
    errors.email = 'An account exists with that email. Please log in.'
    return errors
  }

  // validation errors
  if (err.message.includes('User validation failed')) {
    Object.values(err.errors).forEach(({properties}) => {
      errors[properties.path] = properties.message
    })
  }
  return errors
}

// create token
const maxAge = 30 * 60
const createToken = (id) => {
  return jwt.sign({ id }, process.env.ACCESS_TOKEN, {
    expiresIn: maxAge
  })
}

const addUser = async (req, res) => {
  // destructure email and password from request body
  const { email, password } = req.body

  try {
    const user = await User.create({ email, password })
    const token = createToken(user._id)
    res.status(200).json({ email , token })
  } catch (err) {
    const errors = handleErrors(err)
    res.status(400).json({ errors })
  }
}

const authenticateUser = async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await User.login(email, password)
    const token = createToken(user.email)
    res.status(200).json({ email: user.email, token })
  }
  catch (err) {
    const errors = handleErrors(err)
    res.status(400).json({errors})
  }
}

module.exports = {
  addUser,
  authenticateUser
}