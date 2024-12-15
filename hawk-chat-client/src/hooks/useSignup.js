import { useState } from 'react'
import { useAuthContext } from './useAuthContext'

// custom useSignup hook
export const useSignup = () => {
    // set error and loading states to null
    const [errors, setErrors] = useState(null)
    const [isPending, setIsPending] = useState(null)

    // use the dispatch function from Auth Context hook
    const { dispatch } = useAuthContext()

    // Signup function
    const signup = async (email, password) => {
        // reset states
        setIsPending(true)
        setErrors(null)

        // send post request with email and password in body -- send to backend at /auth/signup
        const response = await fetch('https://re-backend-s7fz.onrender.com/auth/signup', {
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
        // if OK, send dispatch of type SIGNUP with json as payload
        // set isLoading to false
        if (response.ok) {
            localStorage.setItem('user', JSON.stringify(json))

            dispatch({type: 'SIGNUP', payload: json})

            setIsPending(false)

            window.location.assign('/')
        }
    }
    // return the Signup function, as well as the isLoading and error states
    return { signup, isPending, errors }
}