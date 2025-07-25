import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext"; // adjust if path differs

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const { currentUser } = useAuth(); // To identify logged-in user
  const [commentInput, setCommentInput] = useState({});

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(postData);
    });
    return () => unsubscribe();
  }, []);

  const toggleLike = async (post) => {
    if (!currentUser) return;
    const postRef = doc(db, "posts", post.id);
    const likes = post.likes || [];
    const userId = currentUser.uid;

    const updatedLikes = likes.includes(userId)
      ? likes.filter((id) => id !== userId) // Unlike
      : [...likes, userId]; // Like

    await updateDoc(postRef, { likes: updatedLikes });
  };

  const addComment = async (postId) => {
    if (!currentUser) return;
    const text = commentInput[postId]?.trim();
    if (!text) return;

    const postRef = doc(db, "posts", postId);
    const post = posts.find((p) => p.id === postId);
    const oldComments = post.comments || [];

    const newComment = {
      user: currentUser.displayName || "Anonymous",
      text: text,
    };

    await updateDoc(postRef, {
      comments: [...oldComments, newComment],
    });

    setCommentInput((prev) => ({ ...prev, [postId]: "" }));
  };

  return (
    <div style={{ maxWidth: "600px", margin: "auto" }}>
      {posts.length === 0 && <p>No posts yet.</p>}
      {posts.map((post) => {
        const isLiked = post.likes?.includes(currentUser?.uid);
        return (
          <div
            key={post.id}
            style={{
              border: "1px solid #ddd",
              padding: "16px",
              borderRadius: "12px",
              marginBottom: "20px",
              background: "#fefefe",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
              {post.userImage && (
                <img
                  src={post.userImage}
                  alt="User"
                  style={{ width: 40, height: 40, borderRadius: "50%", marginRight: 10 }}
                />
              )}
              <strong>{post.username || "Anonymous"}</strong>
            </div>

            <p style={{ margin: "10px 0" }}>{post.text}</p>

            {post.image && (
              <img
                src={post.image}
                alt="Post"
                style={{
                  width: "100%",
                  maxHeight: "400px",
                  objectFit: "cover",
                  borderRadius: "10px",
                  marginTop: "10px",
                }}
              />
            )}

            {/* Like/Comment Section */}
            <div style={{ marginTop: "10px", fontSize: "14px" }}>
              <button onClick={() => toggleLike(post)}>
                {isLiked ? "💔 Unlike" : "❤️ Like"} ({post.likes?.length || 0})
              </button>
            </div>

            {/* Comments Section */}
            <div style={{ marginTop: "10px" }}>
              <strong>Comments:</strong>
              <div style={{ marginTop: "8px" }}>
                {post.comments?.map((comment, idx) => (
                  <p key={idx} style={{ margin: "4px 0" }}>
                    <strong>{comment.user}:</strong> {comment.text}
                  </p>
                ))}
              </div>

              <div style={{ marginTop: "8px" }}>
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={commentInput[post.id] || ""}
                  onChange={(e) =>
                    setCommentInput((prev) => ({
                      ...prev,
                      [post.id]: e.target.value,
                    }))
                  }
                  style={{
                    width: "80%",
                    padding: "4px",
                    marginRight: "4px",
                  }}
                />
                <button onClick={() => addComment(post.id)}>Post</button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Feed;
