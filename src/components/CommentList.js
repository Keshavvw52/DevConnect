// components/CommentList.js
import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

const CommentList = ({ postId }) => {
  const { currentUser } = useAuth();
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "posts", postId, "comments"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setComments(data);
    });
    return () => unsubscribe();
  }, [postId]);

  const handleDelete = async (commentId) => {
    await deleteDoc(doc(db, "posts", postId, "comments", commentId));
  };

  return (
    <div className="mt-4">
      {comments.length === 0 && (
        <p className="text-gray-700 dark:text-gray-300">No comments yet.</p>
      )}
      {comments.map((comment) => (
        <div
          key={comment.id}
          className="flex justify-between items-center border-b border-gray-300 dark:border-gray-700 py-2"
        >
          <p className="text-gray-800 dark:text-gray-100">
            <strong className="text-blue-600 dark:text-blue-400">{comment.author}</strong>:{" "}
            {comment.text}
          </p>
          {comment.uid === currentUser?.uid && (
            <button
              onClick={() => handleDelete(comment.id)}
              className="text-red-600 dark:text-red-400 ml-4"
            >
              Delete
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default CommentList;
