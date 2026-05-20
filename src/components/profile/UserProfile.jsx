import React from "react";
import { useNavigate } from "react-router-dom";

const UserProfile = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("userSession"));

  const handleLogout = () => {
    localStorage.removeItem("userSession");
    navigate("/login"); // 👈 redirect to login page
  };

  if (!user) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-4 text-center text-sm text-gray-500">
        No user data found
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Avatar */}
      <div className="flex flex-col items-center mb-4">
        <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-semibold">
          {user.fullName?.charAt(0).toUpperCase()}
        </div>
        <h3 className="mt-2 text-lg font-semibold">
          {user.fullName}
        </h3>
        <p className="text-sm text-gray-500">{user.email}</p>
      </div>

      {/* Profile Info */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">User ID</span>
          <span className="font-medium">{user.id}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Phone</span>
          <span className="font-medium">{user.phone}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Gender</span>
          <span className="font-medium">{user.gender}</span>
        </div>

        {/* <div className="flex justify-between">
          <span className="text-gray-500">Platform</span>
          <span className="font-medium capitalize">{user.platform}</span>
        </div> */}
      </div>

      {/* Divider */}
      <hr className="my-4" />

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition"
      >
        Logout
      </button>
    </div>
  );
};

export default UserProfile;