//import { useState } from 'react'
//import { useAuthContext } from './useAuthContext'

// custom useLogin hook
export const useChat = () => {
    // login function
    const send = async (sender, receiver, message) => {
        const body = JSON.stringify({ sender, receiver, message })
        console.log(body)
        // send post request with email and password in body -- send to backend at /auth/login
        const response = await fetch('https://re-backend-s7fz.onrender.com/chat/send', {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ sender, receiver, message })
            }
        )
        // convert the response to a json object
        const json = await response.json()

        // if the response is not OK, set isLoading to false and set error state to error in json
        if (!response.ok) {
            console.log(json.errors)
        }
        // if OK, send dispatch of type LOGIN with json as payload
        // set isLoading to false
        if (response.ok) {
            console.log(json.body)
        }
    }
    // return the login function, as well as the isLoading and error states
    return { send }
}