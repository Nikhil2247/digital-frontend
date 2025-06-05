// ./pages/UnauthorizedPage.js
import React from 'react';
import { Link } from 'react-router-dom';

export default function UnauthorizedPage() {
  return (
    <div className="p-4 m-auto max-w-sm text-center">
      <h2 className="text-2xl mb-4 text-red-600">Access Denied</h2>
      <p className="mb-4">You do not have permission to view this page.</p>
      <Link to="/" className="text-blue-600 hover:underline">
        Go to Homepage
      </Link>
    </div>
  );
}