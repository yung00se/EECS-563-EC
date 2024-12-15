// use dotenv to access environment variables
require('dotenv').config()

const express = require('express')
const authRoutes = require('./routes/authRoutes')
const chatRoutes = require('./routes/chatRoutes')
const mongoose = require('mongoose')
//const cookieParser = require('cookie-parser')
const requireAuth = require('./middleware/authMiddleware')
const cors = require('cors')

// start express app
const app = express()

//middleware
// allows for working with JSON objects
app.use(express.json())
app.use(cors({
    // Open to all origins for development purposes - too inconstistent in dev to lock down CORS policy
    origin: '*',
    methods: ['POST', 'PUT'],
    maxAge: 86400
}))

// for testing; to log HTTP requests to console
app.use((req, res, next) => {
    console.log(req.path, req.method)
    next()
})

// use userRoutes file
app.use('/auth', authRoutes)

app.use('/chat', chatRoutes)

// set view engine to ejs
app.set('view engine', 'ejs')

// GET homepage
app.get('/', requireAuth, (req, res) => {
    console.log('rendering homepage')
    res.send('homepage')
});

// connect to the database then start the server
PORT = 5000

mongoose.connect(process.env.MONG_URI)
    .then(() => {
        app.listen(PORT, () => {
            console.log('Connected to Database and Listening on Port', PORT);
        })
    })
    .catch((error) => {
        console.log(error)
    })