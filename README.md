# Hawk Chat (Instant Messaging)
- Hosted at https://re-frontend.onrender.com/
- Github Repository: https://github.com/yung00se/EECS-563-EC

# Description
- Hawk Chat is an instant messaging client that connects to a central TCP server for instant messaging, and a central Database API for authenticating users as well as storing message history

# Table of Contents
- [Description](#description)
- [Overview](#overview)
- [How to Use It](#usage)
- [Database API](#database-api)
    - [Authentication](#authentication)
        - [Login](#login)
        - [Signup](#signup)

    - [Chat History Retrieval/Storage](#chat-history-retrievalstorage)
        - [Get Chat History (Retrieval)](#get-chat-history)
        - [Add Chat (Storage)](#add-chat)

- [TCP Server](#tcp-server)
    - [Arrays for Active Users](#arrays-for-active-users)
    - [Socket Events](#socket-events)

- [Hawk Chat Client](#hawk-chat-client)
    - [Homepage](#homepage)
    - [Login Page](#login-page)
    - [Signup Page](#signup-page)
    - [Chats Page (3 possible modes)](#chats-page)
        - [Establish TCP Connection](#establish-tcp-connection)
        - [Lobby](#lobby)
        - [Chatroom](#chatroom)
            - [Send Button](#send-button)
        - [Logout Button](#logout-button)

# Overview
- This implementation consists of three codebases:
    - An API that uses HTTP for processing login/signup requests, and for storing/retrieving message history for users using a MongoDB database collection
    - A TCP server that can relay messages between users quickly and reliably
    - A static client that can connect to the previously mentioned database API and TCP server

- All code is hosted using Render, a platform for hosting cloud applications

# Usage
- Chrome or Firefox are preffered as that is primarily what was used in development testing
- Open https://re-frontend.onrender.com/ in your browser
- You should see a Login/Signup page

1. **Login/Signup**
- If you already have an account, login with your password
- If you do not already have an account, Signup with a valid email and password
    - The email field must be an email
    - The password must be at least 8 characters long

- **Note: The Database API tends to slow down the less it is used, so logging in/signing up may take a minute or so**
    - **If the API has not responded after a minute or so, return to the homepage and try logging in (IF YOU JUST SIGNED UP, DO NOT SIGN UP WITH THE SAME INFORMATION AGAIN)**

- **Passwords are stored securely -- click on the following to see how the Database API processes Login and Signup requests: [Authentication](#authentication)**

2. **Find Rooms**
- Once you are authenticated/registered, you will be brought to a page with a single button that reads **Find a Room**

- Upon clicking this button, a TCP connection will be established to the TCP server, and your username will be registered with the TCP server's list of active users

3. **Login/Signup on Second Client**
- Repeat steps 1 and 2 for another client
- The second client **must** be either
    - on a different browser application (i.e. if **Client 1** is in Firefox, **Client 2** must NOT be in Firefox) **or**
    - on a different machine

4. **Join a Room**
- If both clients are logged in/signed up, and both clients have hit the **Find a Room** button, they should see each other in the list of available

- On **Client 1**'s page, click on **Client 2**'s name

- On **Client 2**'s page, click on **Client 1**'s name

5. **Chat**
- You should now be in the chat room (for both **Client 1** and **Client 2**)
- Try sending a message (it does not matter which client instance sends a message first)

- You should see the message you just sent in your message logs, and you should also see the message in the other client's message logs (the message logs should always look identical for both clients)

- Send a few messages back and forth to make sure it works

6. Test the [Get Chat History](#get-chat-history) functionality
- Now, try logging out of both clients
    - this removes all local variables and deletes the user's information from LocalStorage (but not from the database!)

- Then, log back in to the accounts you just logged out of

- Rejoin the room you were just in (on both clients)

- Upon rejoining, you should see that all of your message history was restored, and you can continue sending messages from where you left off

# Database API
- HTTP requests to the database API can be tested at any time using Postman or similar software
- Make sure to correctly format the JSON in the request body, or you will not get a successful response
- See the proper formatting for each request below under [Authentication](#authentication)


## Authentication
### Login
- Checks for user entry in database and authenticate if password is correct

- HTTP method: POST
- URL: https://re-backend-s7fz.onrender.com/auth/login
- Request body format:
```json
{
    "email": "johnsmith@email.com",
    "password": "password123"
}
```
- Response body format:
```json
{
    "email": "johnsmith@email.com",
    "token": "d9d6f9s6D.......q1my"
}
```

- **Your raw password is never stored anywhere -- passwords are always hashed before being stored in the database**

- Upon successful authentication, the user's email and a temporary json web token (expires after 30 minutes) is stored in LocalStorage

### Signup
- Create a new user entry in the database

- HTTP method: POST
- URL: https://re-backend-s7fz.onrender.com/auth/signup
- Request body format:
```json
{
    "email": "johnsmith@email.com",
    "password": "password123"
}
```
- Response body format:
```json
{
    "email": "johnsmith@email.com",
    "token": "d9d6f9s6D.......q1my"
}
```

- **Your raw password is never stored anywhere -- passwords are always hashed before being stored in the database**

- **Username must be an email**

- **Password must be 8 characters long**

- Upon successful authentication, the user's email and a temporary json web token (expires after 30 minutes) is stored in LocalStorage

## Chat History Retrieval/Storage
### Get chat history
- Gets all chat history for two users

- HTTP method: POST
- URL: https://re-backend-s7fz.onrender.com/chat/chat-history
- Request body format:
    ```json
    {
        "sender": "johnsmith",
        "receiver": "janedoe"
    }
    ```
    - Note that the ending tag of the email is not included (johnsmith@email.com -> johnsmith)
- Response body format:
    ```json
    {
        "members": ["janedoe", "johnsmith"]
        "messageLog": [
            "johnsmith: Hey Jane",
            "janedoe: Hi John",
            "johnsmith: How are you?"
        ]
    }
    ```

### Add chat
- HTTP method: PUT
- URL: https://re-backend-s7fz.onrender.com/chat/send
- Request body format:
```json
{
    "sender": "janedoe",
    "receiver": "johnsmith",
    "message": "janedoe: This is a new message"
}
```

- Response body format (same as chat history response):
```json
{
    "members": ["janedoe", "johnsmith"]
    "messageLog": [
        "johnsmith: Hey Jane",
        "janedoe: Hi John",
        "johnsmith: How are you?",
        "janedoe: This is a new message"
    ]
}

```

- Note:
    - The member names in the **members** field are sorted before checking database 
    - this means that in the request body, the sender and receiver could be switched, and **the response will be the same**
    - **thus, John could send a chat to Jane, or Jane could send a chat to John, and both will be added to the same entry in the database**

# TCP Server
- The server listens on port **4000**

## Arrays for active users
- The **usernames** array stores an array of the names (strings) of all currently active users

- The **users** array stores an array of json objects with the following format:
```json
{
    "username": "johnsmith",
    "socket": "(Socket object corresponding to John Smith's client app)"
}
```

## Socket events
- socket.on(**'register'**, (username))
    - the client would like to register their username in the server

- socket.on(**'get-current-users'**, ())
    - the client is requesting that the server send a list of all active clients

- socket.on(**'message'**, data)
    - the client has a message that it would like the server to send to the designated user
    - the **data** variable has the following format:
    ```json
    {
        "sender": "johnsmith",
        "receiver": "janedoe",
        "msg": "What's up?"
    }
    ```

- socket.on(**'DC'**, user)
    - the client is disconnecting, so it needs the server to remove it from the active users list

# Hawk Chat Client
## Homepage
- Log In and Sign Up buttons that takes the user to the Login or Signup page, respectively

## Login Page
- Contains form where user enters email and password to be authenticated

- Upon successful authentication, the user is redirected to Chats page

- Upon failed authentication, the user remains on Login page

## Signup Page
- Contains form where user enters new email and password to be registered in database

- Upon successful registration, the user is redirected to Chats page

- Upon failed regsitration, the user remains on Signup page

## Chats page
### Three Possible Modes:
#### Establish TCP Connection
- Displays this page when client's socket is null

- **Find a Room** button
    - Creates TCP socket, connects to TCP server, and registers current user with TCP server

- **Logout** button (see [Logout Button](#logout-button))

#### Lobby
- If user list is empty
    - Display message **No Chat Rooms to Display**
    - Repeatedly request user list from TCP server until the list is not empty

- If user list is not empty
    - Display the user list and stop making requests to the TCP server for user list

- **Logout** button (see [Logout Button](#logout-button))

#### Chatroom 
- Show name of user they are in a room with

- **Return to Rooms** button
    - On click, returns user to page with list of available rooms

- Message log of the two users

- Input field for typing and sending messages

- **Logout** button (see [Logout Button](#logout-button))

##### Send Button
- Tell the TCP server that you have a message from **sender** to **receiver**

- Send HTTP request to database API with new message, so that the message is stored in a message log in the database

#### Logout Button
- Delete the user information from LocalStorage, then redirect the user to the homepage
