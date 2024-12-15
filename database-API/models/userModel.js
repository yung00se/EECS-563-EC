const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
const { isEmail } = require('validator')
//const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String
    },
    lastname: {
      type: String
    },
    email: {
      type: String,
      required: [true, 'You have not entered an email'],
      unique: true,
      lowercase: true,
      validate: [isEmail, 'Please enter a valid email']
    },
    password: {
      type: String,
      required: [true, 'You have not entered a password'],
      minlength: [8, 'Minimum password length is 8 characters']
    },
  },
  { timestamps: true }
)

// fire a function before doc saved to db
userSchema.pre('save', async function (next) {
  const salt = await bcrypt.genSalt()
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

// fire a funciton after doc saved to db
userSchema.post('save', function (doc, next) {
  console.log('New user was created and saved', doc)
  next()
})

// add a custom login function to the User schema that logs the user in
userSchema.statics.login = async function (email, password) {
  // find the user in database by their email
  const user = await this.findOne({ email })
  // if the user exists, compare their hashed password with their hashed password in database
  if (user) {
    const auth = await bcrypt.compare(password, user.password)
    // if the passwords are the same, return the user
    if (auth) {
      return user
    }
    // otherwise throw an incorrect pasword error
    throw Error('Incorrect Password')
  }
  // if the user does not exist in the databasde, throw an incorrect email error
  throw Error('Incorrect Email')
}

module.exports = mongoose.model('User', userSchema)