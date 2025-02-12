import React from 'react'
import "./Form.css"

import { loginUser } from "../API/login";


export default function LoginPage() {  

    async function handleLogin(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        const data = { email: formData.get('email'), password: formData.get('password') };
        console.log(data);

        const res = await loginUser(data);

        if(res.success){
            console.log("Logged In");
        }
    }

    return (
        <div className='form'>
            <form className="login-form" onSubmit={handleLogin}>
                <div>
                    <label htmlFor="email">Email:</label>
                    <input type="email" id="email" name="email" required />
                </div>
                <div>
                    <label htmlFor="password">Password:</label>
                    <input type="password" id="password" name="password" required />
                </div>
                <button type="submit">Login</button>

                <a href="/register" style={{marginTop:"20px"}}>New User</a>
            </form>
        </div>
    )
}