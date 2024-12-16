const path = require("path")
const http = require("http")
const express = require("express")
const { Server } = require("socket.io")

const app = express()                     // create express app
const server = http.createServer(app)     // create http server using express app
// create io that can wait for connections from clients
  // all origins are allowed
const io = new Server(server, {
    cors: {
      origin: "*"
    }
  })

let usernames = []    // create an array of username strings to track users that are currently connected to the tcp server
let users = []        // create an array of user objects that look like: { username: johnsmith, socket: johns-Socket }

// set to static folder
app.use(express.static(path.join(__dirname, "public")))

// run when client connects to server
io.on('connection', socket => {
    // note that the socket variable is the client socket that is currently connected -- this is true for all of the socket.on functions below as well

    // send a 'connected' message back to the socket to acknowledge that the client socket is successfully connected
    socket.emit("connected", "Welcome to the server")

    // when a client sends a 'register' message to the server, this means the client wants to register a username to the server
    socket.on('register', username => {
      //console.log('before register', usernames)
      // if the client is not already in the user list, add their name to the usernames array, then add their username and socket connection to the users array
      if (!usernames.includes(username)) {
        usernames.push(username)
        users.push({username: username, socket: socket})
        io.emit('current-users', usernames)
        //console.log('registered user', username)
        //console.log('after register', usernames)
      }
    })

    // when a client sends a 'get-current-users' message, this means the client wants a list of all users that are currently online
    socket.on('get-current-users', () => {
      //const userList = users.map(user => user['username'])
      //console.log(userList)
      // emit a message back to the socket with the list of all currenlty online users
      socket.emit('current-users', usernames)
    })

    // when a client sends a 'message' message, this means they want to send a message to another client
    // the data that the client sends has the following format: { sender: johnsmit, receiver: janedoe, msg: Hi Jane }
    socket.on('message', data => {
      // unpack the sender, receiver, and message from the data sent
      const { sender, receiver, msg } = data;

      // locate the receiver in the users array (if it exists)
      // when found, emit a 'message' message to the receiver's socket
      // note that the receiver is not included in the message sent. The message, rather, has the following format: { sender: johnsmith, msg: Hi Jane }
      users.map(user => {
        if (user['username'] === receiver) {
          const message = {sender, msg}
          user['socket'].emit('message', message)
        }
      })
    })
    // when a client sends a 'DC' message, this means they need to disconnect from the server
    // I use a custom disconnect function rather than the built-in disconnect function here, since the custom function allows the username to be passed
    socket.on('DC', user => {
      //console.log('before', usernames)
      // iterate through users and usernames, and remove the disconnecting user from both
      for (let i = 0; i < usernames.length; i++) {
        if (usernames[i] == user) {
          users.splice(i, 1)
          usernames.splice(i, 1)
        }
      }
      //console.log('after', usernames)

      io.emit('current-users', usernames)
    })
})

// set the port number to 4000
const PORT = 4000;

// start listening
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})