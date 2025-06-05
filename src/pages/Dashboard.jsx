import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // To access user data

export default function Dashboard() {
  const { userData, logout } = useAuth(); // Get user data and logout function

  const handleLogout = () => {
    logout();
    // Navigation to /login will likely be handled by PrivateRoute or App component state
    // If not, you might want to add navigate('/login') here.
  };

  return (
    <div className="p-6 m-auto max-w-4xl bg-white shadow-md rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-gray-800">
          Welcome, {userData?.name || userData?.email || 'User'}!
        </h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition duration-150"
        >
          Logout
        </button>
      </div>

      <p className="text-gray-600 mb-8">
        This is your central dashboard. From here, you can access various parts of the application.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Example Links - customize these based on your application's features */}
        <div className="p-4 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition-all">
          <Link to="/events" className="block">
            <h2 className="text-xl font-bold mb-2">View Events</h2>
            <p className="text-sm">Browse upcoming and past events.</p>
          </Link>
        </div>

        <div className="p-4 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition-all">
          <Link to="/orders" className="block">
            <h2 className="text-xl font-bold mb-2">My Orders</h2>
            <p className="text-sm">Check your order history and status.</p>
          </Link>
        </div>

        {/* Add more links as needed */}
        {/* Example: Profile Page (if you have one) */}
        {/* <div className="p-4 bg-purple-500 text-white rounded-lg shadow hover:bg-purple-600 transition-all">
          <Link to="/profile" className="block">
            <h2 className="text-xl font-bold mb-2">My Profile</h2>
            <p className="text-sm">Update your personal information.</p>
          </Link>
        </div> */}

        {/* Example: If a certain role (e.g. 'MANAGER') has specific actions accessible from generic dash */}
        {userData?.role?.toUpperCase() === 'MANAGER' && (
          <div className="p-4 bg-yellow-500 text-black rounded-lg shadow hover:bg-yellow-600 transition-all">
            <Link to="/scan" className="block"> {/* Or some other manager specific quick link */}
              <h2 className="text-xl font-bold mb-2">Scan Tickets</h2>
              <p className="text-sm">Access user scanning functionality.</p>
            </Link>
          </div>
        )}
      </div>

      {userData && (
        <div className="mt-8 p-4 bg-gray-100 rounded">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">User Details:</h3>
          <p className="text-sm text-gray-600"><strong>Email:</strong> {userData.email}</p>
          <p className="text-sm text-gray-600"><strong>Role:</strong> {userData.role}</p>
          {/* Display other user details if available */}
        </div>
      )}
    </div>
  );
}