// components/PostItem.js
import React, { useState, useEffect } from "react";
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  deleteDoc,
  onSnapshot,
  collection,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import CommentSection from "./CommentSection";
import {
  FaHeart,
  FaRegHeart,
  FaCommentDots,
  FaEdit,
  FaTrash,
} from "react-icons/fa";

const PostItem = ({ postId }) => {
  const { currentUser } = useAuth();
  const [post, setPost] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [isProcessingLike, setIsProcessingLike] = useState(false);
  const [commentCount, setCommentCount] = useState(0);

  useEffect(() => {
    const postRef = doc(db, "posts", postId);
    const unsubscribe = onSnapshot(postRef, (snapshot) => {
      if (snapshot.exists()) {
        setPost(snapshot.data());
        setEditedContent(snapshot.data().content);
      }
    });

    return () => unsubscribe();
  }, [postId]);

  useEffect(() => {
    const fetchComments = async () => {
      const commentsRef = collection(db, "posts", postId, "comments");
      const commentSnap = await getDocs(commentsRef);
      setCommentCount(commentSnap.size);
    };

    fetchComments();
  }, [postId]);

  if (!post) return null;

  const isLiked = post.likedBy?.includes(currentUser?.uid);
  const isPostOwner = currentUser?.uid === post.uid;

  const handleLike = async () => {
    if (!currentUser || isProcessingLike) return;
    setIsProcessingLike(true);
    const postRef = doc(db, "posts", postId);

    try {
      if (isLiked) {
        await updateDoc(postRef, {
          likedBy: arrayRemove(currentUser.uid),
        });
      } else {
        await updateDoc(postRef, {
          likedBy: arrayUnion(currentUser.uid),
        });
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    } finally {
      setIsProcessingLike(false);
    }
  };

  const handleEdit = async () => {
    const postRef = doc(db, "posts", postId);
    try {
      await updateDoc(postRef, {
        content: editedContent,
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update post:", error);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Delete this post?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "posts", postId));
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md mb-6">
      {isEditing ? (
        <div>
          <textarea
            className="w-full p-2 border rounded-md"
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
          />
          <div className="mt-2 flex gap-2">
            <button
              onClick={handleEdit}
              className="bg-blue-600 text-white px-3 py-1 rounded"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="bg-gray-400 text-white px-3 py-1 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Author Info */}
          <div className="flex items-center space-x-3 mb-2">
            <img
              src={post.authorProfileImage}
              alt="Author"
              className="w-10 h-10 rounded-full object-cover border"
            />
            <div>
              <p className="font-semibold text-gray-800 dark:text-gray-100">
                {post.authorName || "Unknown"}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                @{post.authorUsername}
              </p>
            </div>
          </div>

          {/* Post Content */}
          <p className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap mb-2">
            {post.content}
          </p>

          {post.imageUrl && (
            <img
              src={post.imageUrl}
              alt="Post"
              className="mt-2 rounded-lg max-w-full"
            />
          )}

          {/* Post Actions */}
          <div className="mt-3 flex items-center gap-5 text-gray-600 dark:text-gray-300">
            <button
              onClick={handleLike}
              className="flex items-center gap-1 hover:text-red-500 transition"
            >
              {isLiked ? <FaHeart /> : <FaRegHeart />}
              <span>{post.likedBy?.length || 0}</span>
            </button>

            <div className="flex items-center gap-1">
              <FaCommentDots />
              <span>{commentCount}</span>
            </div>

            {isPostOwner && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1 hover:text-green-600 transition"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-1 hover:text-red-600 transition"
                >
                  <FaTrash />
                </button>
              </>
            )}
          </div>
        </>
      )}

      {/* Comments */}
      <CommentSection postId={postId} />
    </div>
  );
};

export default PostItem;
