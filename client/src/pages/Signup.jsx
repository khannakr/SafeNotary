import React, { useState } from "react";
import validator from 'email-validator';
import "./styles.css"; // Ensure the styles are linked correctly
import {useNavigate} from 'react-router-dom';
const SignUp = () => {
  const navigate = useNavigate();
  const [formData,setFormData] = useState({});
      const handleChange = (e) => {
    console.log(formData);
    setFormData((prevData) => {
      return {...prevData , [e.target.id]: e.target.value }
    })
  }
  
  
const handleSubmit = async (e) => {
  console.log("helllooooo")
    // e.preventDefault()
    const {password2,...rest} = formData;
    if(!validator.validate(formData.email)) {
      console.log("Invalid email address")
      return
    }
    if(formData.password != formData.password2) {
      alert("Password do not match...");
      return;
    }
    try {
   
     
      const res = await fetch('http://localhost:4000/api/auth/sign-in', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      });
      const data = await res.json();
      // if (data.success === false) {
      //   setError(data.message);
      //   return;
      // }

      //setError(null);
      //navigate(`/sign-in/${params.role}`);
      navigate("/login");
    }
    catch(err) {
      console.log(err);
      //setError(err.message)
    }
  
  }
  return (
    <div>
      {/* Navigation Bar */}
      <header>
        <nav className="navbar">
          <div className="logo">SafeNotary</div>
          <ul className="nav-links">
            <li><a href="/">Home</a></li> {/* Adjusted to route to Home in React */}
          </ul>
        </nav>
      </header>
      
      {/* Sign-Up Form */}
      <main className="signup-container">
        <h1>Sign Up</h1>
        <div>
        <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="String"
              id="name"
              onChange={handleChange}
              name="name"
              required
              placeholder="Enter your name"
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email Address:</label>
            <input
              type="email"
              id="email"
              onChange={handleChange}
              name="email"
              required
              placeholder="Enter your email address"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password2">Confirm Password:</label>
            <input
              type="password"
              id="password2"
              onChange={handleChange}
              name="confirm_password"
              required
              placeholder="Confirm your password"
            />
          </div>
          <button onClick={handleSubmit}  className="btn-action">Sign Up</button>
        </div>
      </main>

      {/* Footer */}
      <footer>
        <p>© 2024 SafeNotary. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default SignUp;
