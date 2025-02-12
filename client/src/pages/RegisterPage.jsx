import React from "react";
import {registerUser} from "../api/register";
import "./Form.css";

export default function RegisterPage() {
  async function handleRegister(e) {
    e.preventDefault();
    const formData = new FormData(e.target);

    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
    };

    if (formData.get("password") !== formData.get("confirmPassword")) {
      console.log("Passwords do not match");
      alert("passwords do not match");
    } else {
      console.log(data);

      const res = await registerUser(data);

      if (res.success) {
        console.log("Registered");
      } else {
        console.log("Error");
      }
    }
  }

  return (
    <div className="form">
      <form id="registerform" onSubmit={handleRegister}>
        <div>
          <label htmlFor="name">Name:</label>
          <input type="text" id="name" name="name" required />
        </div>
        <div>
          <label htmlFor="email">Email:</label>
          <input type="email" id="email" name="email" required />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input type="password" id="password" name="password" required />
        </div>
        <div>
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            required
          />
        </div>
        <button type="submit">Register</button>

        <a href="/login" style={{marginTop:"20px"}}>Already a User</a>
      </form>
    </div>
  );
}
