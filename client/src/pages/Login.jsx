import { useState } from "react";
import "./styles.css"; // Ensure this file contains your CSS styles.

const Login = () => {
  // State for storing form inputs
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try{
      const res = await fetch('http://localhost:4000/api/auth/log-in', {
        method: "POST",
        headers: {
          'Content-type': "application/json"
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });
      
      const data = await res.json();


    }
    catch(err) {
      console.log(err);
      
    }

  };

  return (
    <>
      {/* Navigation Bar */}
      <header>
        <nav className="navbar">
          <div className="logo">SafeNotary</div>
          <ul className="nav-links">
            <li>
              <a href="/">Home</a>
            </li>
          </ul>
        </nav>
      </header>

      {/* Login Form */}
      <main className="login-container">
        <h1>Login</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="col-md-4 text-md-right">
              Email Address:
            </label>
            <input
              type="text"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoFocus
              placeholder="Enter your mail id"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>
          <button type="submit" className="btn-action">
            Login
          </button>
          <p className="text-black mt-to mb-2">
            Don't have an account?{" "}
            <a href="/signup" style={{ textDecoration: "none" }}>
              Sign up
            </a>
          </p>
        </form>
      </main>

      {/* Footer */}
      <footer>
        <p>© 2024 SafeNotary. All rights reserved.</p>
      </footer>
    </>
  );
};

export default Login;
