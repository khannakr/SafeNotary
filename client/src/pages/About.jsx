import React from "react";
import { Link } from "react-router-dom";
import "./styles.css";

const About = () => {
  return (
    <>
      {/* Navigation Bar */}
      <header>
        <nav className="navbar">
          <div className="logo">SafeNotary</div>
          <ul className="nav-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/signup">Sign Up</Link></li>
          </ul>
        </nav>
      </header>

      {/* About Section */}
      <div className="about-container">
        <h1>About SafeNotary</h1>
        
        <section className="about-section">
          <h2>Our Mission</h2>
          <p>
            SafeNotary is dedicated to revolutionizing document authentication through blockchain technology and 
            zero-knowledge proofs. We aim to provide secure, tamper-proof notarization services that maintain 
            privacy while ensuring document integrity.
          </p>
        </section>

        <section className="about-section">
          <h2>Our Services</h2>
          <div className="services-grid">
            <div className="service-card">
              <h3>Document Notarization</h3>
              <p>Securely notarize documents with blockchain verification, providing immutable proof of existence and authenticity.</p>
            </div>
            <div className="service-card">
              <h3>Zero-Knowledge Verification</h3>
              <p>Verify document authenticity without revealing sensitive information, maintaining privacy while ensuring integrity.</p>
            </div>
            <div className="service-card">
              <h3>Timestamp Certification</h3>
              <p>Establish irrefutable proof of when a document was created or modified with blockchain timestamps.</p>
            </div>
            <div className="service-card">
              <h3>Document Management</h3>
              <p>Easily track, manage, and retrieve your notarized documents from our secure platform.</p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>Why Choose SafeNotary?</h2>
          <ul className="features-list">
            <li><strong>Enhanced Security:</strong> Blockchain technology ensures your documents can never be tampered with.</li>
            <li><strong>Privacy First:</strong> Zero-knowledge proofs allow verification without exposing document contents.</li>
            <li><strong>Time-Efficiency:</strong> Skip traditional notary appointments and process documents instantly.</li>
            <li><strong>Cost-Effective:</strong> Reduce expenses associated with traditional notarization services.</li>
            <li><strong>Environmental Impact:</strong> Go paperless with our digital notarization solutions.</li>
          </ul>
        </section>

        <div className="action-buttons about-buttons">
          <Link to="/signup" className="btn-action">Get Started Today</Link>
          <Link to="/login" className="btn-action">Login to Your Account</Link>
        </div>
      </div>

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

export default About;
