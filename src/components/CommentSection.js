import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { FaTrash } from 'react-icons/fa';

const CommentSection = ({ postId }) => {
  const { currentUser } = useAuth();
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);

  // Fetch comments in real-time
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'posts', postId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setComments(data.comments || []);
      }
    });

    return () => unsubscribe();
  }, [postId]);

  const handleComment = async () => {
    if (!comment.trim()) return;

    const commentData = {
      text: comment,
      userId: currentUser.uid,
      username: currentUser?.displayName || 'Anonymous',
      userImage: currentUser?.photoURL || '',
      createdAt: new Date().toISOString(),
    };

    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      comments: [...comments, commentData],
    });

    setComment('');
  };

  const handleDelete = async (indexToDelete) => {
    const postRef = doc(db, 'posts', postId);
    const updatedComments = comments.filter((_, index) => index !== indexToDelete);
    await updateDoc(postRef, {
      comments: updatedComments,
    });
  };

  return (
    <div className="p-4 border-t">
      <h3 className="font-semibold text-lg mb-2">Comments</h3>
      <div className="space-y-4">
        {comments.map((c, index) => (
          <div key={index} className="flex items-start gap-3">
            <img
              src={c.userImage || '/default-avatar.png'}
              alt="avatar"
              className="w-8 h-8 rounded-full"
            />
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <p className="font-medium">{c.username || 'Anonymous'}</p>
                {currentUser?.uid === c.userId && (
                  <button
                    onClick={() => handleDelete(index)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
              <p>{c.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          type="text"
          placeholder="Add a comment..."
          className="border p-2 flex-1 rounded"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <button
          onClick={handleComment}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Post
        </button>
      </div>
    </div>
  );
};

export default CommentSection;
