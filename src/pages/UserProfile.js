// src/pages/UserProfile.js

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

const UserProfile = () => {
  const { username } = useParams();
  const { currentUser, userData } = useAuth();

  const [profile, setProfile] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const usersRef = doc(db, "usernames", username);
        const userSnap = await getDoc(usersRef);

        if (userSnap.exists()) {
          const userId = userSnap.data().uid;
          const userDoc = await getDoc(doc(db, "users", userId));

          if (userDoc.exists()) {
            setProfile({ id: userDoc.id, ...userDoc.data() });
            checkFollowing(userDoc.id);
          } else {
            setProfile(null);
          }
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    const checkFollowing = async (profileId) => {
      if (!userData || !userData.following) return;
      setIsFollowing(userData.following.includes(profileId));
    };

    fetchProfile();
  }, [username, userData]);

  const handleFollow = async () => {
    if (!currentUser || !profile) return;

    try {
      await updateDoc(doc(db, "users", currentUser.uid), {
        following: arrayUnion(profile.id),
      });
      await updateDoc(doc(db, "users", profile.id), {
        followers: arrayUnion(currentUser.uid),
      });
      setIsFollowing(true);
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  const handleUnfollow = async () => {
    if (!currentUser || !profile) return;

    try {
      await updateDoc(doc(db, "users", currentUser.uid), {
        following: arrayRemove(profile.id),
      });
      await updateDoc(doc(db, "users", profile.id), {
        followers: arrayRemove(currentUser.uid),
      });
      setIsFollowing(false);
    } catch (error) {
      console.error("Error unfollowing user:", error);
    }
  };

  if (loading) return <p className="text-center mt-10 dark:text-white">Loading profile...</p>;
  if (!profile) return <p className="text-center mt-10 dark:text-white">Profile not found</p>;

  const isOwnProfile = currentUser?.uid === profile.id;

  return (
    <div className="max-w-2xl mx-auto p-6 mt-8 bg-white dark:bg-gray-900 rounded-lg shadow">
      <div className="flex items-center gap-5">
        <img
          src={profile.profileImage}
          alt="Profile"
          className="w-24 h-24 rounded-full object-cover border dark:border-gray-700"
        />
        <div>
          <h2 className="text-2xl font-bold dark:text-white">{profile.fullName}</h2>
          <p className="text-gray-600 dark:text-gray-400">@{profile.username}</p>
        </div>
      </div>

      {/* Bio */}
      {profile.bio && (
        <p className="mt-4 text-gray-700 dark:text-gray-300">{profile.bio}</p>
      )}

      {/* Social Links */}
      <div className="mt-4 space-y-2">
        {profile.github && (
          <a
            href={profile.github}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-blue-500 hover:underline dark:text-blue-400"
          >
            🔗 GitHub
          </a>
        )}
        {profile.linkedin && (
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-blue-500 hover:underline dark:text-blue-400"
          >
            🔗 LinkedIn
          </a>
        )}
      </div>

      {/* Follow/Unfollow Button */}
      {!isOwnProfile && (
        <div className="mt-6">
          {isFollowing ? (
            <button
              onClick={handleUnfollow}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
            >
              Unfollow
            </button>
          ) : (
            <button
              onClick={handleFollow}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              Follow
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default UserProfile;
