import React, { useState } from "react";
import validator from "email-validator";
import "./styles.css"; // Ensure the styles are linked correctly
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Ensure CSS is imported

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password2: "",
  });

  // Function to display toast messages
  const showToast = (message, type = "error") => {
    toast(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      transition: Bounce,
      type: type, // "success" or "error"
    });
  };

  const handleChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.id]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, email, password, password2 } = formData;

    // Email validation
    if (!validator.validate(email)) {
      showToast("Invalid email address");
      return;
    }

    // Password match validation
    if (password !== password2) {
      showToast("Passwords do not match");
      return;
    }

    try {
      const res = await fetch("http://localhost:4000/api/auth/sign-up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      console.log(data);
      

      if (data.ok) {
        showToast("Sign-up successful!", "success");
        setTimeout(() => navigate("/login"), 2000); // Redirect after 2 seconds
      } else {
        showToast(data.message || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
      showToast("Server error. Please try again later.");
    }
  };

  return (
    <div>
      <ToastContainer />
      <header>
        <nav className="navbar">
          <div className="logo">SafeNotary</div>
          <ul className="nav-links">
            <li><a href="/">Home</a></li>
          </ul>
        </nav>
      </header>

      <main className="signup-container">
        <h1>Sign Up</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input type="text" id="name" value={formData.name} onChange={handleChange} required placeholder="Enter your name" />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email Address:</label>
            <input type="email" id="email" value={formData.email} onChange={handleChange} required placeholder="Enter your email" />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input type="password" id="password" value={formData.password} onChange={handleChange} required placeholder="Enter your password" />
          </div>
          <div className="form-group">
            <label htmlFor="password2">Confirm Password:</label>
            <input type="password" id="password2" value={formData.password2} onChange={handleChange} required placeholder="Confirm your password" />
          </div>
          <button type="submit" className="btn-action">Sign Up</button>
          <p className="text-black mt-to mb-2">
            Already have an account?{" "}
            <a href="/Login" style={{ textDecoration: "none" }}>
              Login
            </a>
          </p>
        </form>
      </main>

      <footer>
        <p>© 2024 SafeNotary. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default SignUp;
