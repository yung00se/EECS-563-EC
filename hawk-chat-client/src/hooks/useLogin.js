import { useState } from 'react'
import { useAuthContext } from './useAuthContext'

// custom useLogin hook
export const useLogin = () => {
    // set error and loading states to null
    const [errors, setErrors] = useState(null)
    const [isPending, setIsPending] = useState(null)

    // use the dispatch function from Auth Context hook
    const { dispatch } = useAuthContext()

    // login function
    const login = async (email, password) => {
        // reset states
        setIsPending(true)
        setErrors(null)

        // send post request with email and password in body -- send to backend at /auth/login
        const response = await fetch('https://re-backend-s7fz.onrender.com/auth/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ email, password })
            }
        )
        // convert the response to a json object
        const json = await response.json()

        // if the response is not OK, set isLoading to false and set error state to error in json
        if (!response.ok) {
            setIsPending(false)
            setErrors(json.errors)
            console.log(json.errors)
        }
        // if OK, send dispatch of type LOGIN with json as payload
        // set isLoading to false
        if (response.ok) {
            localStorage.setItem('user', JSON.stringify(json))

            dispatch({type: 'LOGIN', payload: json})

            setIsPending(false)

            window.location.assign('/')
        }
    }
    // return the login function, as well as the isLoading and error states
    return { login, isPending, errors }
}