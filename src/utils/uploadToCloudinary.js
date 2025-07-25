const handleImageUpload = async (file) => {
  console.log("📷 Uploading image to Cloudinary...");
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "devconnect"); // unsigned preset
  formData.append("cloud_name", "demchppdt");     // your cloud name

  try {
    const res = await axios.post(
      "https://api.cloudinary.com/v1_1/demchppdt/image/upload",
      formData
    );
    console.log("✅ Cloudinary upload success:", res.data.secure_url);
    return res.data.secure_url;
  } catch (err) {
    console.error("❌ Cloudinary upload failed:", err.response?.data || err.message);
    throw new Error("Image upload failed");
  }
};




