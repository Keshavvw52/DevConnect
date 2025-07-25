import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import PostForm from "../components/PostForm";
import Feed from "../components/Feed";
import { FaBars, FaSun, FaMoon, FaUserEdit, FaSearch } from "react-icons/fa";

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchUserData = async () => {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) setUserData(docSnap.data());
    };

    fetchUserData();
  }, [user, navigate]);

  const handlePostCreated = () => {
    console.log("Post successfully created!");
    window.scrollTo(0, 0);
  };

  if (!userData) return <p className="text-center mt-10">Loading dashboard...</p>;

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
        {/* Sidebar */}
        <div className={`fixed md:relative md:w-64 bg-white dark:bg-gray-800 shadow-md z-20 h-full p-4 transition-transform transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
          <div className="text-xl font-bold mb-6">DevConnect</div>
          <div className="mb-4 text-center">
            {userData.profileImage && (
              <img
                src={userData.profileImage}
                alt="Profile"
                className="w-20 h-20 rounded-full mx-auto object-cover"
              />
            )}
            <h2 className="text-lg font-semibold mt-2">{userData.fullName || user.email}</h2>
            <p className="text-sm text-gray-500">@{userData.username}</p>
          </div>
          <div className="mt-4">
            <p className="text-sm mb-1">{userData.bio}</p>
            <p className="text-sm">📍 {userData.location}</p>
            <p className="text-sm">🛠 Skills: {userData.skills?.join(", ")}</p>
          </div>
          <div className="mt-4 flex flex-col space-y-2">
            <Link
              to="/profile"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
            >
              <FaUserEdit /> Edit Profile
            </Link>
            <Link
              to="/explore"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded"
            >
              <FaSearch /> Explore Developers
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Navbar */}
          <div className="flex justify-between items-center px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 shadow-md sticky top-0 z-10">
            <button
              className="md:hidden text-xl"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <FaBars />
            </button>
            <h1 className="text-xl font-bold dark:text-white">Dashboard</h1>
            <button onClick={() => setDarkMode(!darkMode)} className="text-xl">
              {darkMode ? <FaSun /> : <FaMoon />}
            </button>
          </div>

          {/* Page Body */}
          <div className="p-6 max-w-4xl mx-auto w-full">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2 dark:text-white">Create a Post</h2>
              <PostForm onPostCreated={handlePostCreated} />
            </div>

            <div className="mt-10">
              <h2 className="text-2xl font-semibold mb-4 dark:text-white">Recent Posts</h2>
              <Feed />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
