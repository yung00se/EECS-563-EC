const jwt = require('jsonwebtoken')
const User = require('../models/userModel')

const requireAuth = async (req, res, next) => {
    // verify auth
    // destructure auth property from request header
    const { auth } = req.headers

    // if there is no authorization header, return a 401 error
    if (!auth) {
        return res.status(401).json({ error: 'Authorization Required' })
    }

    // if there is an authorization header, check whether the token in the header is valid
    if (auth) {
        // get the token from the header
        const token = auth.split(' ')[1]
        try {
            // verify the token and get the id that is returned
            const { _id } = jwt.verify(token, process.env.ACCESS_TOKEN)
            // search for the user's entry in database
            req.user = await User.findOne({ _id }).select('_id')
            console.log(req.user)
            // at this point the user is authenticated, so we can move out of the middleware to the next function
            next()
        }
        // if an error is caught, the user is not authenticated, so we return a 401 error
        catch (error) {
            console.log(error)
            res.status(401).json({ error: 'Unauthorized' })
        }
    }
}
module.exports = requireAuth