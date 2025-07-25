// components/CommentForm.js
import React, { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

const CommentForm = ({ postId }) => {
  const { currentUser } = useAuth();
  const [text, setText] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      await addDoc(collection(db, "posts", postId, "comments"), {
        text,
        uid: currentUser.uid,
        author: currentUser.displayName || currentUser.email,
        createdAt: serverTimestamp(),
      });
      setText("");
    } catch (error) {
      console.error("❌ Error adding comment:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-2 flex items-center space-x-2">
      <input
        type="text"
        placeholder="Write a comment..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="flex-1 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 
                   dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 
                   focus:ring-blue-500"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 
                   transition-colors"
      >
        Post
      </button>
    </form>
  );
};

export default CommentForm;
