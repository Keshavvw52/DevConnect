// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import ProfileForm from "./pages/ProfileForm";
import Dashboard from "./pages/Dashboard";
import UserProfile from "./pages/UserProfile";
import Explore from "./pages/Explore";
import PublicProfile from "./pages/PublicProfile";
import { useAuth } from "./context/AuthContext";

function App() {
  const { currentUser } = useAuth();

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <Routes>
          <Route path="/" element={<Navigate to={currentUser ? "/dashboard" : "/login"} />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<ProfileForm />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/user/:username" element={<UserProfile />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/profile/:username" element={<PublicProfile />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
