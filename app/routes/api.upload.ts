const uploadToCloudinary = async (fileToUpload: File) => {
  const formData = new FormData();
  formData.append('file', fileToUpload);
  
  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Upload failed');
    }
    
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};