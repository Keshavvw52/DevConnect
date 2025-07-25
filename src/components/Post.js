// components/Post.js
import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, updateDoc, arrayUnion, arrayRemove, onSnapshot } from "firebase/firestore";
import { Link } from "react-router-dom";
import CommentForm from "./CommentForm";
import CommentList from "./CommentList";

const Post = ({ post }) => {
  const user = auth.currentUser;
  const [likes, setLikes] = useState(post.likes || []);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "posts", post.id), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setLikes(data.likes || []);
      }
    });
    return () => unsub();
  }, [post.id]);

  const isLiked = likes.includes(user?.uid);

  const toggleLike = async () => {
    const postRef = doc(db, "posts", post.id);
    await updateDoc(postRef, {
      likes: isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid),
    });
  };

  return (
    <div className="post border border-gray-300 dark:border-gray-700 p-4 mb-4 rounded-md bg-white dark:bg-gray-800">
      <p className="mb-2 text-gray-800 dark:text-gray-100">{post.content}</p>

      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
        Posted by:{" "}
        <Link
          to={`/user/${post.authorUsername}`}
          className="text-blue-500 hover:underline"
        >
          @{post.authorUsername}
        </Link>
      </p>

      <button
        onClick={toggleLike}
        className="text-blue-600 dark:text-blue-400 font-semibold mb-4"
      >
        {isLiked ? "💙 Liked" : "🤍 Like"} ({likes.length})
      </button>

      <CommentList postId={post.id} />
      <CommentForm postId={post.id} />
    </div>
  );
};

export default Post;
