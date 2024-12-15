import { useState, useEffect } from 'react'
import { useSignup } from '../hooks/useSignup'
import { useAuthContext } from '../hooks/useAuthContext'

// Signup React Element
const Signup = () => {
    // set email and password to empty string
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    // check whether user is logged in?? not sure
    const {signup, isPending, errors} = useSignup()
    const [emailError, setEmailError] = useState('')
    const [passwordError, setPasswordError] = useState('')

    // for resetting error messages to '' when either the email or password field is clicked
    const [clicked, setClicked] = useState(false)
    const { user } = useAuthContext()

    if (user) {
        window.location.href = 'https://re-frontend.onrender.com'   // redirect the user to the homepage, but now they are authenticated
    }

    // useEffect
    useEffect(() => {
        if (errors && !clicked) {
            if (errors.email) {setEmailError(errors.email)}
            if (errors.password) {setPasswordError(errors.password)}
        }
        else {
            setEmailError('')
            setPasswordError('')
        }
        if (user) {
            window.location.assign('https://re-frontend.onrender.com')
        }
    }, [user, errors, clicked, setEmailError, setPasswordError])

    // submit handler function
    async function handleSubmit(e) {
        // prevent page from refreshing on submit
        e.preventDefault()
        setClicked(false)

        // log in with the email and password values currently in the Signup form
        await signup(email, password)
    }


    // Signup html
    // the email state is updated each time there is a change detected in the email field
    // same is true for password state
    // Log In button uses isPending state for disabling
    return (
        <div className='login-page'>
            {isPending && (
                <div className='load-screen'>
                    <p>Authenticating</p>
                    <div className='load-symbol' />
                </div>
            )}

            {(!isPending) && (
                <div className="login-form">
                    <h1>Sign Up</h1>
                    <form onSubmit={handleSubmit}>
                        <div className='fields'>
                            <div className="email-error">
                                {emailError && (
                                        <p>{emailError}</p>
                                )}
                            </div>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                placeholder="Email"
                                onClick={() => setClicked(true)}
                                onChange={(e) => setEmail(e.target.value)}
                                value={email}>     
                            </input>
                            <div className="password-error">
                                {passwordError && (
                                    <p>{passwordError}</p>
                                )}
                            </div>
                            <input
                                type="password"
                                name="password"
                                id="signup-password"
                                placeholder="Password"
                                onClick={() => setClicked(true)}
                                onChange={(e) => setPassword(e.target.value)}
                                value={password}>
                            </input>
                        </div>
                        <button id="signup-button">Sign Up</button>
                    </form>
                </div>
            )}
        </div>
    )
}

export default Signup