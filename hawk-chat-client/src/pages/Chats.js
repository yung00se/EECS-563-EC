import React, { useState, useEffect } from 'react'
import {io} from 'socket.io-client'
import formatMessage from '../functions'
import { useChat } from "../hooks/useChat"

// Chats react component -- either shows list of available chat rooms (if there are any) or shows the room you are currently in
const Chats = () => {
    // variables for page with list of chat rooms
    const user = JSON.parse(localStorage.getItem('user'))   // get the user from localstorage
    const [userList, setUserList] = useState([])            // set the user list to an empty array
    const [socket, setSocket] = useState(null)              // set the socket to null
    const [inRoom, setInRoom] = useState(false)             // inRoom is set to false -- this variable determines whether to render the list of chatrooms, or the chatroom itself
    const [registered, setRegistered] = useState(false)     // registered is set to false -- tracks whether user has been registered by the TCP server

    // variables for chat room page
    const { send } = useChat()                              // send function for sending messages to database API (so database can store chat history)
    const [friend, setFriend] = useState('')                // friend is the name of the friend you are in a chatroom with -- set to empty string initally
    const [textInput, setTextInput] = useState('')          // textInput is the string in the input field in the chatroom -- set to empty string
    const [messageLog, setMessageLog] = useState([])        // messageLog is the list of messages between the user and the person they are chatting with -- set to empty array

    // getChatHistory function -- this function is invoked when the user enters the chatroom
    // it sends a request to the database API to get a history of all chats between users
    const getChatHistory = async (sender, receiver) => {
        // fetch the message history from the database API, and store the response -- the sender and the receiver are the only fields required for this POST request
        // the response will have the following format: { }
        const response = await fetch('https://re-backend-s7fz.onrender.com/chat/chat-history', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ sender, receiver })
            }
        )

        // deserialize the response into to a json object
        const json = await response.json()
        //console.log(response)
        // if the response is not OK, log any errors to the console
        if (!response.ok) {
            console.log('not ok')
            console.log(json.errors)
        }
        // if OK, extract the messageLog field from the JSON, then update the messageLog variable
        // set isLoading to false
        if (response.ok) {
            const { messageLog } = json
            setMessageLog(messageLog)
            //console.log('message log: ', messageLog)
        }
    }

    // useEffect (allows elements on the page to update without having to refresh)
    useEffect(() => {
        // the user variable in local storage (if it exists), has an 'email' field and a 'token' field
        // here we extract the email from the user data
        let { email } = user;

        // since emails are long (and thus take up screen space), I chose to display the user as only the first half of their email (everything before the @ symbol)
        // split the email at the @ symbol, get the string before the @, and store it as 'username'
        const username = email.split('@')[0]

        // if this client has a socket...
        if (socket) {
            // if the user is not registered with the TCP server, emit a 'register' message to the TCP server, which requests for the server to register this client
            // then set registered to true
            if (!registered) {
                socket.emit('register', username)
                setRegistered(true)
            }

            // if the user list is empty, request the user list from the TCP server
            if (userList.length === 0) {
                //console.log('no user list yet')
                socket.emit('get-current-users')
            }

            // when the socket recives a 'current-users' message, this means the TCP server is sending this client its registry of current users
            socket.on('current-users', users => {
                //console.log('got user list')
                // we do not want our own username to be included in the user list, so we filter it out, then update the user list
                const filteredUsers = users.filter(u => u !== username)
                setUserList(filteredUsers)
            })

            // when the socket receives a 'message' message, this measn the TCP server has a message from another client that it is relaying to this client
            socket.on('message', data => {
                const { sender, msg } = data                        // unpack the sender and the message from the data sent
                const formattedMessage = `${sender}: ${msg}`        // create a formatted string with the sender and message
        
                setMessageLog([...messageLog, formattedMessage])    // push the new message to the message log
            })
        }
        // if the client does not yet have a socket, set the socket to the url of the TCP server
        else {
            setSocket(io("https://im-tcp-server.onrender.com"))
            //setSocket(io('http://localhost:4000'))
        }
    }, [user, socket, registered, userList.length, messageLog])

    // joinRoom function -- invoked when the user clicks on another user's name
    // set 'friend' to the user whose name was just clicked
    // set 'inRoom' to true
    // invoke the getChatHistory function, which will aquire the chat history between this client and the friend they just clicked on
    function joinRoom(f) {
        setFriend(f)
        setInRoom(true)
        getChatHistory(user['email'].split('@')[0], f['u']).then(response => {
            console.log(response)
        })
    }

    // sendMessage function -- invoked when the user clicks send or hits enter on their keyboard
    function sendMessage() {
        // as long as the text input is not empty, send a 'message' message to the TCP server indicating that the client would like to send a message to someone
        if (textInput) {
            const username = user.email.split('@')[0]
            socket.emit('message', formatMessage(username, friend['u'], textInput))

            // then send the message to the database API, so that it can store it in the users' message history
            const body = `${username}: ${textInput}`
            send(username, friend['u'], body)

            // append the message to the message log and empty the input string
            setMessageLog([...messageLog, body])
            setTextInput('')
        }
    }

    // this function ensures that each time the input field changes (by the user typing in it), the textInput variable is updated
    const handleMessageChange = (event) => {
        setTextInput(event.target.value)
    }

    // returnToRooms function -- invoked when the user wants to leave a chat room
    // set friend to empty string and inRoom to false
    const returnToRooms = () => {
        setFriend('')
        setInRoom(false)
    }

    // logout function
    const logout = () => {
        socket.emit('DC', user['email'].split('@')[0])                  // emit a disconnection message to the TCP server
        localStorage.removeItem('user')                                 // remove the user item from local storage
        window.location.href = 'https://re-frontend.onrender.com'       // redirect the user to the homepage
        socket.close()                                                  // close the user's socket
    }

    // if there are no users in the user list, display a message saying that there are not chat rooms to display
    if (userList.length === 0) {
        return (
            <div className='no-rooms'>
                <p>No Chat Rooms to Display</p>
                <button className='logout' onClick={() => logout()}>Log out</button>
            </div>
        )
    }

    // if the user is in a room, display the name of the user they are chatting with, the message log, an input field for typing and sending messages, and the logout button
    else if (inRoom) {
        return (
            <div className='chat-room'>
                <div className='header'>
                    <h1>{friend['u']}</h1>
                    <button className='return' onClick={() => returnToRooms()}>Return to Rooms</button>
                </div>
                <div className='chat-ui'>
                    <div className='message-log'>
                        <ul>
                            {messageLog.map((msg, i) => (
                                <li key={i}>{msg}</li>
                                )
                            )}
                        </ul>
                    </div>
                    <div className='inputs'>
                        <input
                            type="text"
                            value={textInput}
                            onChange={handleMessageChange}>
                        </input>

                        <button id='send' onClick={() => sendMessage()}>Send</button>
                    </div>
                </div>
                <button className='logout' onClick={() => logout()}>Log out</button>
            </div>
        )
    }

    // if there are users in the user list and the user is not currently in a chat room...
    // display a list of users who are ready to chat
    else {
        return (
            <div className='has-rooms'>
                <h1>Chat Rooms</h1>
                <div className='rooms'>
                    {userList.map((u, i) => (
                        <div className='friend'>
                            <button
                                key={i}
                                onClick={() => joinRoom({u})}>
                                <p>{u}</p>
                            </button>
                        </div>
                    )
                    )}
                </div>
                <button className='logout' onClick={() => logout()}>Log out</button>
            </div>
        )
    }
}

export default Chats