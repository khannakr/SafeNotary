import React from "react";
import { Link } from "react-router-dom";
import "./styles.css"; // Ensure your styles are linked correctly.
import { useUser } from "../context/userContext";

const Home = () => {
  const { user } = useUser();

  
  return (
    <>
      {/* Navigation Bar */}
      <header>
        <nav className="navbar">
          <div className="logo">SafeNotary</div>
          <ul className="nav-links">
            {/* Add navigation links if needed */}
          </ul>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="hero">
        <h1>Secure File Notarization with SafeNotary</h1>
        <p>
          Utilizing blockchain technology and zero-knowledge proof for
          unparalleled security.
        </p>

        <div className="action-buttons">
          {/* Buttons to navigate */}
          <Link to="/login" className="btn-action">
            Get Started
          </Link>
          <Link to="/about" className="btn-action">
            Learn More
          </Link>
        </div>
      </main>

      {/* Footer Section */}
      <footer>
        <div className="footer-content">
          <div className="contact">
            <h4>Contact Us</h4>
            <p>
              Email: <a href="mailto:support@safenotary.com">support@safenotary.com</a>
            </p>
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
    </>
  );
};

export default Home;
