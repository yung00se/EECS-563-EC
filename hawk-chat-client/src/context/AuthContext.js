import { createContext, useReducer, useEffect } from 'react'

export const AuthContext = createContext()

export const authReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN':
            return { user: action.payload }
        
        case 'SIGNUP':
            return { user: action.payload}

        case 'LOGOUT':
            return { user: null }

        default:
            return state
    }
}

export const AuthContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, {
        user: null
    })

    // call this when webpage first loads or when refresh button is clicked
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'))
        // have user

        // if there is a user in local storage, load the page for a logged in user
        if (user) {
            dispatch({ type: 'LOGIN', payload: user })
        }
    }, [])

    return (
        <AuthContext.Provider value={{...state, dispatch}}>
            { children }
        </AuthContext.Provider>
    )
}