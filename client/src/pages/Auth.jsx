import React from 'react'
import './Auth.css'

export default function Auth() {
    return(
        <>
            <a href='/login'>
                <button className='authBtn'>Log In</button>
            </a>
            <a href='/register'>
                <button className='authBtn'>New User</button>       
            </a>
        </>
    )
}