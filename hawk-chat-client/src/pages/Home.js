import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

// logout function
const logout = () => {
    localStorage.removeItem('user')                             // remove the user item from local storage
    window.location.href = 'https://re-frontend.onrender.com'   // redirect the user to the homepage
}

// Homepage react component
const Home = () => {
    // get the user stored in localstorage
    const user = JSON.parse(localStorage.getItem('user'))

    // if there is a user data in localstorage, this means the user is authenticated
    // so we render the chats page that shows chat rooms
    if (user) {
        return (
            <div className='find-room'>
                <Link to='/chats'>
                    <p>Find a Room</p>
                </Link>
                <button className='logout' onClick={() => logout()}>Log out</button>
            </div>
        )
    }
    // if there is no user data in localstorage, the user has not been authenticated
    // so we render the login and signup links
    else {
        return (
            <div className='login-signup'>
                <Link to='/auth/login'>
                    Log in
                </Link>
                <Link to='/auth/signup'>
                    Sign Up
                </Link>
            </div>
        )
    }
};

export default Home