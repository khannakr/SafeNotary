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
        
        // Replace this with your actual API call to fetch user data by username
        // Example:
        // const response = await fetch(`/api/users/${username}`);
        // const userData = await response.json();
        
        // Mock data for demonstration
        const mockUserData = {
          id: 'user123',
          username: username,
          email: `${username}@example.com`,
          joinedDate: '2023-01-15'
        };
        
        setSearchedUser(mockUserData);
        
        // Replace this with your actual API call to fetch file history
        // Example:
        // const filesResponse = await fetch(`/api/users/${userData.id}/files`);
        // const filesData = await filesResponse.json();
        
        // Mock file history data
        const mockFileHistory = [
          {
            id: 'file1',
            name: 'Contract.pdf',
            hash: '0x1a2b3c4d5e6f7g8h9i0j',
            timestamp: '2023-05-10T14:30:00Z',
            status: 'verified'
          },
          {
            id: 'file2',
            name: 'Agreement.docx',
            hash: '0xa1b2c3d4e5f6g7h8i9j0',
            timestamp: '2023-04-22T09:15:00Z',
            status: 'verified'
          },
          {
            id: 'file3',
            name: 'Proof-of-concept.pdf',
            hash: '0xz9y8x7w6v5u4t3s2r1q0',
            timestamp: '2023-03-15T11:45:00Z',
            status: 'verified'
          }
        ];
        
        setFileHistory(mockFileHistory);
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
                  <span className="text-gray-900 font-medium sm:w-28 mb-1 sm:mb-0">Email:</span> 
                  <span className="break-all">{searchedUser.email}</span>
                </p>
                <p className="text-gray-700 flex flex-col sm:flex-row sm:items-center text-sm sm:text-base">
                  <span className="text-gray-900 font-medium sm:w-28 mb-1 sm:mb-0">Joined:</span> 
                  <span className="text-green-700">{new Date(searchedUser.joinedDate).toLocaleDateString()}</span>
                </p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 sm:p-4 flex items-center justify-center mt-3 sm:mt-0">
                <div className="text-center">
                  <div className="h-16 w-16 sm:h-24 sm:w-24 bg-blue-200 rounded-full mx-auto mb-2 sm:mb-3 flex items-center justify-center">
                    <span className="text-2xl sm:text-3xl text-blue-700">{searchedUser.username.charAt(0).toUpperCase()}</span>
                  </div>
                  <p className="text-blue-800 font-medium text-sm sm:text-base">Registered User</p>
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
                      <th className="py-2 px-3 sm:py-3 sm:px-6 border-b text-left text-gray-600 font-semibold">Hash</th>
                      <th className="py-2 px-3 sm:py-3 sm:px-6 border-b text-left text-gray-600 font-semibold hidden md:table-cell">Date</th>
                      <th className="py-2 px-3 sm:py-3 sm:px-6 border-b text-left text-gray-600 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fileHistory.map((file, index) => (
                      <tr key={file.id} className={`hover:bg-blue-50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                        <td className="py-2 px-3 sm:py-3 sm:px-6 border-b">
                          <div className="flex items-center">
                            <span className="text-blue-600 mr-1 sm:mr-2">
                              {file.name.endsWith('.pdf') ? '📕' : file.name.endsWith('.docx') ? '📘' : '📄'}
                            </span>
                            <span className="truncate max-w-[100px] sm:max-w-none">{file.name}</span>
                          </div>
                        </td>
                        <td className="py-2 px-3 sm:py-3 sm:px-6 border-b">
                          <span className="text-xs sm:text-sm font-mono bg-gray-100 p-1 rounded">{file.hash.substring(0, 6)}...</span>
                        </td>
                        <td className="py-2 px-3 sm:py-3 sm:px-6 border-b hidden md:table-cell">
                          {new Date(file.timestamp).toLocaleString()}
                        </td>
                        <td className="py-2 px-3 sm:py-3 sm:px-6 border-b">
                          <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                            file.status === 'verified' 
                              ? 'bg-green-100 text-green-800 border border-green-200' 
                              : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                          }`}>
                            {file.status === 'verified' ? '✓' : '⌛'} {file.status}
                          </span>
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
