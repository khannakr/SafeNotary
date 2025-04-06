import React, { useState } from "react";
import "./styles.css"; // Ensure your styles are linked correctly
import { useUser } from "../context/userContext";
import { Link, useNavigate } from "react-router-dom";

const Home = () => {
  const {user} = useUser();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search-results?username=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  
  return (
    <div>
      {/* Navigation Bar */}
      <header>
        <nav className="flex flex-row justify-between items-center h-full px-4">
          <div className="logo">SafeNotary</div>
          <ul className="flex flex-row items-center space-x-4">
            <div className="h-full rounded-lg">
              <form
                className="h-full flex flex-row items-center space-x-2 w-92 gap-6"
                onSubmit={handleSearch}
              >
                <input
                  type="text"
                  placeholder="Search profile"
                  className="search-bar w-64 px-2 py-1 rounded flex-0"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="submit"
                  className="text-white w-32 h-10 text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
                >
                  Search
                </button>
              </form>
            </div>
            <li>
              <Link to="/profile" className="btn-action">
                Profile
              </Link>
            </li>
            <li>
              <Link to="/" className="btn-action">
                Logout
              </Link>
            </li>
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
