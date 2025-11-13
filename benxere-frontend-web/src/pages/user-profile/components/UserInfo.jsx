import React from 'react';

const UserInfo = ({ user }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">{user.name}</h1>
      <p className="text-gray-600">{user.email}</p>
      {/* Additional user details would be shown here */}
    </div>
  );
};

export default UserInfo;