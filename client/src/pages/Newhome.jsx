import React from "react";
import "./styles.css"; // Ensure your styles are linked correctly
import { useUser } from "../context/userContext";
import { Link } from "react-router-dom";

const Home = () => {
  const {user} = useUser();
  console.log(user);
  
  return (
    <div>
      {/* Navigation Bar */}
      

      <header>
        <nav className="navbar">
          <div className="logo">SafeNotary</div>
          <ul className="nav-links">

          <div className="navbar-center">
  <form className="search-form" onSubmit={(e) => e.preventDefault()}>
    <input
      type="text"
      placeholder="Search profile"
      className="search-bar"
    />
    <button type="submit" className="search-button">Search</button>
  </form>
</div>

          <li>
              <Link to="/profile" className="btn-action">Profile</Link>  {/* ✅ Navigate to File page */}
          </li>
          <li>
              <Link to="/" className="btn-action">Logout</Link>  {/* ✅ Navigate to File page */}
          </li>
          
            {/* You can add navigation links here if needed */}
          </ul>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="hero">
        <h1>Secure File Notarization with SafeNotary</h1>
        <p>Utilizing blockchain technology and zero-knowledge proof for unparalleled security.</p>

        <div className="action-buttons">
          {/* Buttons to navigate */}
          <a href="/upload" className="btn-action">Upload File</a>
          <a href="/verify" className="btn-action">Verify File</a>
        </div>
      </main>

      {/* Footer Section */}
      <footer>
        <div className="footer-content">
          <div className="contact">
            <h4>Contact Us</h4>
            <p>Email: <a href="mailto:support@safenotary.com">support@safenotary.com</a></p>
            <p>Phone: +1 234 567 890</p>
          </div>
          <div className="social">
            <h4>Follow Us</h4>
            <a href="#">Facebook</a>
            <a href="#">Twitter</a>
            <a href="#">LinkedIn</a>
          </div>
          <div className="links">
            <h4>Quick Links</h4>
            <a href="#">Terms of Service</a>
            <a href="#">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
