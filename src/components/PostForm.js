import React, { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import { getUserProfile } from "../utils/getUserProfile";
import axios from "axios";

const PostForm = () => {
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "devconnect");

    try {
      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/demchppdt/image/upload",
        formData
      );
      return res.data.secure_url;
    } catch (err) {
      console.error("❌ Cloudinary upload failed:", err);
      throw new Error("Image upload failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!text.trim()) {
      return alert("Post text cannot be empty");
    }

    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No authenticated user");

      const profile = await getUserProfile(user.uid);
      if (!profile) throw new Error("User profile not found");

      let imageUrl = "";
      if (imageFile) {
        imageUrl = await handleImageUpload(imageFile);
      }

      const postRef = await addDoc(collection(db, "posts"), {
        userId: user.uid,
        username: profile.username || "Anonymous",
        userImage: profile.profileImage || "",
        text: text.trim(),
        image: imageUrl || "",
        createdAt: serverTimestamp(),
      });

      console.log("✅ Post created with ID:", postRef.id);

      setText("");
      setImageFile(null);
      alert("Post created successfully!");
    } catch (err) {
      console.error("❌ Post creation failed:", err.message);
      alert("Something went wrong. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-md shadow-md mb-6">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What's on your mind?"
        rows={4}
        className="w-full p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImageFile(e.target.files[0])}
        className="mt-3"
      />
      <button
        type="submit"
        disabled={loading}
        className={`mt-4 px-5 py-2 rounded-md text-white font-medium ${
          loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? "Posting..." : "Post"}
      </button>
    </form>
  );
};

export default PostForm;
