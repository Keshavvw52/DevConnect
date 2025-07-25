import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

const PublicProfile = () => {
  const { username } = useParams();
  const { currentUser, userData } = useAuth();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const fetchUserByUsername = async () => {
      try {
        const q = query(collection(db, "users"), where("username", "==", username));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          setUser({ id: userDoc.id, ...userDoc.data() });
          checkFollowing(userDoc.id);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error fetching public user:", error);
        setUser(null);
      }
    };

    const checkFollowing = async (targetUserId) => {
      if (!currentUser || !userData) return;
      setIsFollowing(userData.following?.includes(targetUserId));
    };

    fetchUserByUsername();
  }, [username, currentUser, userData]);

  useEffect(() => {
    const fetchPosts = async () => {
      if (!user) return;

      try {
        const q = query(collection(db, "posts"), where("userId", "==", user.id));
        const querySnapshot = await getDocs(q);
        const postsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPosts(postsData);
      } catch (error) {
        console.error("Error fetching user posts:", error);
      }
    };

    fetchPosts();
  }, [user]);

  const handleFollow = async () => {
    try {
      await updateDoc(doc(db, "users", currentUser.uid), {
        following: arrayUnion(user.id),
      });
      await updateDoc(doc(db, "users", user.id), {
        followers: arrayUnion(currentUser.uid),
      });
      setIsFollowing(true);
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  const handleUnfollow = async () => {
    try {
      await updateDoc(doc(db, "users", currentUser.uid), {
        following: arrayRemove(user.id),
      });
      await updateDoc(doc(db, "users", user.id), {
        followers: arrayRemove(currentUser.uid),
      });
      setIsFollowing(false);
    } catch (error) {
      console.error("Error unfollowing user:", error);
    }
  };

  if (!user) {
    return (
      <div className="text-center mt-20 text-gray-600">
        <p>User not found 🕵️</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 bg-white shadow rounded-md mt-10">
      <div className="flex flex-col items-center space-y-4">
        <img
          src={user.profileImage}
          alt="Profile"
          className="w-32 h-32 rounded-full object-cover border"
        />
        <div className="text-center">
          <h1 className="text-2xl font-semibold">{user.fullName}</h1>
          <p className="text-gray-600">@{user.username}</p>
        </div>

        {user.bio && (
          <div className="mt-2 text-center text-gray-700 px-4">{user.bio}</div>
        )}

        <div className="flex space-x-4 mt-2">
          {user.github && (
            <a
              href={user.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              GitHub
            </a>
          )}
          {user.linkedin && (
            <a
              href={user.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              LinkedIn
            </a>
          )}
        </div>

        {currentUser?.uid !== user.id && (
          <button
            onClick={isFollowing ? handleUnfollow : handleFollow}
            className={`mt-4 px-4 py-2 rounded text-white ${
              isFollowing ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {isFollowing ? "Unfollow" : "Follow"}
          </button>
        )}
      </div>

      {/* Public Posts */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Posts</h2>
        {posts.length === 0 ? (
          <p className="text-gray-500 text-center">No posts yet.</p>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="border p-4 rounded shadow-sm bg-gray-50"
              >
                {post.image && (
                  <img
                    src={post.image}
                    alt="Post"
                    className="w-full h-60 object-cover rounded mb-2"
                  />
                )}
                <p className="text-sm text-gray-800">{post.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicProfile;
