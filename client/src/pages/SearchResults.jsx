import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useUser } from '../context/userContext';

const SearchResults = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const username = searchParams.get('username');
  const { user } = useUser();
  
  const [searchedUser, setSearchedUser] = useState(null);
  const [fileHistory, setFileHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Fetch file data for the user
        const response = await fetch(`http://localhost:4000/api/file/getfiles/${username}`);
        const data = await response.json();
        console.log('userData', data);
        
        if (data && data.ok && data.files && data.files.length > 0) {
          // Use the first file's userId to construct user data
          const fileData = data.files[0];
          
          // Create user data from the file information
          const userData = {
            id: fileData.userId,
            username: username,
            email: `${username}@safenotary.com`, // Default email pattern
            joinedDate: new Date(fileData.createdAt).toISOString().split('T')[0]
          };
          
          setSearchedUser(userData);
          setFileHistory(data.files);
        } else {
          setSearchedUser(null);
          setFileHistory([]);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to fetch user data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchUserData();
    } else {
      setError('No username provided');
      setLoading(false);
    }
  }, [username]);

  // Format date helper function
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  // Format hash helper function - truncate to first 8 chars
  const formatHash = (hash) => {
    return hash ? `${hash.substring(0, 8)}...` : 'N/A';
  };

  const handleRequest = async (file) => {
    if (!user) {
      alert("Please login to request verification keys");
      return;
    }
    
    try {
      // Show a modal or prompt for message input
      const message = prompt("Enter a message to the file owner (optional):");
      
      const response = await fetch('http://localhost:4000/api/file/request-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileId: file._id,
          fileName: file.filename,
          requesterId: user._id,
          requesterName: user.name,
          ownerId: file.userId,
          message: message || ''
        }),
      });
      
      const data = await response.json();
      
      if (data.ok) {
        alert("Verification key request sent successfully!");
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error sending verification request:', error);
      alert("Failed to send verification request. Please try again.");
    }
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 bg-gray-50 min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <header className="mb-4 sm:mb-8">
        <nav className="flex justify-between items-center p-3 sm:p-5">
          <div className="logo text-xl sm:text-2xl font-bold text-white">SafeNotary</div>
          <Link to="/newhome" className="btn-action bg-white hover:bg-gray-100 text-blue-800 font-semibold px-3 sm:px-5 py-1 sm:py-2 text-sm sm:text-base rounded-lg transition-all duration-200 shadow-sm hover:shadow-md">Back to Home</Link>
        </nav>
      </header>

      <h1 className="text-xl sm:text-3xl font-bold mb-4 sm:mb-8 text-gray-800 border-b-2 border-blue-200 pb-2 sm:pb-3 pl-3 sm:pl-4 shadow-sm bg-white rounded-t-lg py-2 sm:py-3">
        Search Results for "<span className="text-blue-600 italic">{username}</span>"
      </h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-6 rounded-md shadow-sm">
          <p className="font-bold text-lg mb-1">Error</p>
          <p>{error}</p>
        </div>
      ) : !searchedUser ? (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-6 rounded-md shadow-sm">
          <p className="font-medium">No user found with username "{username}"</p>
        </div>
      ) : (
        <div className="space-y-6 sm:space-y-10">
          <section className="bg-white rounded-lg shadow-md p-4 sm:p-8 mb-4 sm:mb-8 hover:shadow-lg transition-shadow duration-300 border border-gray-100">
            <h2 className="text-lg sm:text-2xl font-semibold mb-3 sm:mb-6 text-gray-800 border-b-2 border-blue-100 pb-2 sm:pb-3">
              <span className="inline-block mr-2">👤</span> User Profile
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
              <div className="space-y-2 sm:space-y-4 bg-gray-50 p-3 sm:p-4 rounded-lg">
                <p className="text-gray-700 flex flex-col sm:flex-row sm:items-center text-sm sm:text-base">
                  <span className="text-gray-900 font-medium sm:w-28 mb-1 sm:mb-0">Username:</span> 
                  <span className="font-semibold text-blue-700">{searchedUser.username}</span>
                </p>
                <p className="text-gray-700 flex flex-col sm:flex-row sm:items-center text-sm sm:text-base">
                  <span className="text-gray-900 font-medium sm:w-28 mb-1 sm:mb-0">User ID:</span> 
                  <span className="break-all font-mono text-xs sm:text-sm">{searchedUser.id}</span>
                </p>
                <p className="text-gray-700 flex flex-col sm:flex-row sm:items-center text-sm sm:text-base">
                  <span className="text-gray-900 font-medium sm:w-28 mb-1 sm:mb-0">First File:</span> 
                  <span className="text-green-700">{new Date(searchedUser.joinedDate).toLocaleDateString()}</span>
                </p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 sm:p-4 flex items-center justify-center mt-3 sm:mt-0">
                <div className="text-center">
                  <div className="h-16 w-16 sm:h-24 sm:w-24 bg-blue-200 rounded-full mx-auto mb-2 sm:mb-3 flex items-center justify-center">
                    <span className="text-2xl sm:text-3xl text-blue-700">{searchedUser.username.charAt(0).toUpperCase()}</span>
                  </div>
                  <p className="text-blue-800 font-medium text-sm sm:text-base">Registered User</p>
                  <p className="text-blue-600 text-xs sm:text-sm mt-1">Files: {fileHistory.length}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-lg shadow-md p-4 sm:p-8 hover:shadow-lg transition-shadow duration-300 border border-gray-100">
            <h2 className="text-lg sm:text-2xl font-semibold mb-3 sm:mb-6 text-gray-800 border-b-2 border-blue-100 pb-2 sm:pb-3">
              <span className="inline-block mr-2">📄</span> File History
            </h2>
            
            {fileHistory.length === 0 ? (
              <p className="p-3 sm:p-4 bg-gray-50 rounded-md text-gray-600 text-sm sm:text-base">No files found for this user.</p>
            ) : (
              <div className="overflow-x-auto rounded-lg shadow">
                <table className="min-w-full bg-white border border-gray-200 text-sm sm:text-base">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-2 px-3 sm:py-3 sm:px-6 border-b text-left text-gray-600 font-semibold">File Name</th>
                      {/* <th className="py-2 px-3 sm:py-3 sm:px-6 border-b text-left text-gray-600 font-semibold">Hash</th> */}
                      <th className="py-2 px-3 sm:py-3 sm:px-6 border-b text-left text-gray-600 font-semibold hidden md:table-cell">Date</th>
                      <th className="py-2 px-3 sm:py-3 sm:px-6 border-b text-left text-gray-600 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fileHistory.map((file, index) => (
                      <tr key={file._id} className={`hover:bg-blue-50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                        <td className="py-2 px-3 sm:py-3 sm:px-6 border-b">
                          <div className="flex items-center">
                            <span className="text-blue-600 mr-1 sm:mr-2">
                              {file.filename.endsWith('.pdf') ? '📕' : 
                               file.filename.endsWith('.json') ? '📘' : 
                               file.filename.endsWith('.txt') ? '📝' : '📄'}
                            </span>
                            <span className="truncate max-w-[100px] sm:max-w-none">{file.filename}</span>
                          </div>
                        </td>
                        {/* <td className="py-2 px-3 sm:py-3 sm:px-6 border-b">
                          <span className="text-xs sm:text-sm font-mono bg-gray-100 p-1 rounded">{formatHash(file.hash)}</span>
                        </td> */}
                        <td className="py-2 px-3 sm:py-3 sm:px-6 border-b hidden md:table-cell">
                          {formatDate(file.createdAt)}
                        </td>
                        <td className="py-2 px-3 sm:py-3 sm:px-6 border-b">
                          <div className="flex flex-col sm:flex-row gap-2">
                            {/* <a 
                              href={file.pdf_url} 
                              target="_blank" 
                              rel="noreferrer"
                              className="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-green-100 text-green-800 border border-green-200 hover:bg-green-200 transition-colors text-center"
                            >
                              View File
                            </a> */}
                            <button 
                              className="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200 transition-colors"
                              onClick={() => handleRequest(file)}
                            >
                              Request Verification Key
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
