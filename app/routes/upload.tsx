import React, { useState } from 'react';
import { Upload, ChevronDown, X } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import Navigation from '~/components/Navigation';

const WardrobeUpload = () => {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const categories = [
    'tops',
    'pants',
    'shorts/skirts',
    'sweaters/coats',
    'dresses',
    'accessories',
    'bags',
    'shoes'
  ];

  const handleFileSelect = async (selectedFile: File) => {
    console.log('File selected:', selectedFile.name, selectedFile.type, selectedFile.size);

    if (!selectedFile.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
    }

    if (selectedFile.size > 20 * 1024 * 1024) {
        alert('This image is too large to compress. Please select a file under 20MB.');
        return;
    }

    try {
        const compressed = await imageCompression(selectedFile, {
        maxSizeMB: 2,
        maxWidthOrHeight: 2000,
        useWebWorker: true,
        });

        console.log('Compressed file size:', compressed.size);
        setUploadedImage(compressed);

        const url = URL.createObjectURL(compressed);
        setPreviewUrl(url);
        console.log('Preview URL created successfully');
    } catch (error) {
        console.error('Image compression failed:', error);
        alert('Failed to compress image. Please try a different one.');
    }
};


  const handleDrag = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.type === "dragenter" || event.type === "dragover") {
      setDragActive(true);
    } else if (event.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const removeImage = () => {
    try {
      console.log('Remove image called - before reset:', { uploadedImage: !!uploadedImage, title, category });
      
      setUploadedImage(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      // Reset form fields
      setTitle('');
      setCategory('');
      setIsDropdownOpen(false);
      
      console.log('Image removed and form reset');
      
      // Force a small delay to check if state updated
      setTimeout(() => {
        console.log('After reset check:', { uploadedImage: !!uploadedImage, title, category });
      }, 100);
    } catch (error) {
      console.error('Error removing image:', error);
    }
  };

  // Upload to Cloudinary with hardcoded values for now
  const uploadToCloudinary = async (fileToUpload: File) => {
    // REPLACE THESE WITH YOUR ACTUAL VALUES
    const CLOUD_NAME = 'dn0cr63ir'; // Replace with your cloud name
    const UPLOAD_PRESET = 'wardrobe-app'; // Replace with your upload preset name
    
    console.log('Starting Cloudinary upload...');
    console.log('Cloud name:', CLOUD_NAME);
    console.log('Upload preset:', UPLOAD_PRESET);

    const formData = new FormData();
    formData.append('file', fileToUpload);
    formData.append('upload_preset', UPLOAD_PRESET);
    
    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
    console.log('Uploading to:', uploadUrl);
    
    try {
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });
      
      console.log('Cloudinary response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Cloudinary error:', errorText);
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Cloudinary upload successful:', data);
      return data;
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw error;
    }
  };

  // Save to backend database
  const saveToDatabase = async (clothingItem: any) => {
    console.log('Saving to database:', clothingItem);
    
    try {
      const formData = new FormData();
      formData.append('title', clothingItem.title);
      formData.append('category', clothingItem.category);
      formData.append('imageUrl', clothingItem.imageUrl);
      formData.append('publicId', clothingItem.publicId);

      const response = await fetch('/api/wardrobe', {
        method: 'POST',
        body: formData,
      });

      console.log('Database response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Database error:', errorData);
        throw new Error(`Failed to save: ${response.status}`);
      }

      const result = await response.json();
      console.log('Database save successful:', result);
      return result;
    } catch (error) {
      console.error('Error saving to database:', error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    console.log('=== STARTING UPLOAD PROCESS ===');
    console.log('uploadedImage:', !!uploadedImage);
    console.log('title:', title);
    console.log('category:', category);
    
    if (!uploadedImage || !title || !category) {
      alert('Please fill in all fields and upload an image');
      return;
    }

    setIsUploading(true);
    
    try {
      console.log('Step 1: Uploading to Cloudinary...');
      const cloudinaryResult = await uploadToCloudinary(uploadedImage);
      
      console.log('Step 2: Saving to database...');
      const clothingItem = {
        title,
        category,
        imageUrl: cloudinaryResult.secure_url,
        publicId: cloudinaryResult.public_id,
      };
      
      const saveResult = await saveToDatabase(clothingItem);
      
      if (saveResult.success) {
        console.log('Step 3: Success! Resetting form...');
        setTitle('');
        setCategory('');
        removeImage();
        
        alert('Item added to wardrobe successfully!');
      } else {
        throw new Error(saveResult.error || 'Failed to save item');
      }
      
    } catch (error) {
        console.error('=== UPLOAD FAILED ===');
        console.error('Error:', error);

        const errorMessage =
            error instanceof Error
            ? error.message
            : typeof error === 'string'
                ? error
                : 'Unknown error occurred';

        alert(`Failed to upload item: ${errorMessage}`);
        } finally {
        setIsUploading(false);
        }
  };

  const handleCategorySelect = (selectedCategory: string) => {
    console.log('Category selected:', selectedCategory);
    setCategory(selectedCategory);
    setIsDropdownOpen(false);
  };


  return (
    <>
    <Navigation showBackButton={true} backTo="/directory" backLabel="directory" showQuickNav={true} />
  <div className="min-h-screen bg-background px-12 py-16 overflow-y-auto">
    <div className="max-w-[1600px] mx-auto">
      <h1 className="text-7xl text-center italic font-semibold text-darkgreen mb-12">upload</h1>

      <div className="bg-background rounded-3xl shadow-lg border border-darkred p-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">

          {/* Upload Section */}
          <div>
            <h2 className="text-5xl font-light text-darkgreen mb-8 italic">upload</h2>

            <div
              className={`relative border-dashed rounded-2xl p-10 text-center transition-all duration-200 ${
                dragActive 
                  ? 'border-accent bg-darkgreen' 
                  : uploadedImage 
                    ? 'border-green-300 bg-greenaccent' 
                    : 'border-gray-300 bg-accent hover:border-darkgreen'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {uploadedImage && previewUrl ? (
                <>
                  <div className="relative">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-h-60 mx-auto rounded-lg object-cover"
                    />
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeImage();
                    }}
                    className="absolute -top-10 -right-1 bg-darkred text-white rounded-full p-1 hover:bg-red-600 transition-colors z-10"
                    style={{ pointerEvents: 'auto' }}
                  >
                    <X size={18} />
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <Upload className="mx-auto mb-4 text-darkgreen" size={56} />
                    <p className="text-xl text-darkgreen mb-2 italic">upload image here</p>
                    <p className="text-base text-darkgreen mb-4">
                      drag and drop or click to select
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleInputChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </>
              )}
            </div>

            {/* Form Fields */}
            <div className="mt-8 space-y-6">
              <div>
                <label className="block text-xl text-darkgreen mb-2 italic">title</label>
                <input
                  type="text"
                  placeholder="describe your item here"
                  value={title}
                  onChange={(e) => {
                    console.log('Title changed:', e.target.value);
                    setTitle(e.target.value);
                  }}
                  className="w-full px-5 py-4 bg-accent border-0 rounded-xl text-darkred placeholder-darkred text-lg focus:bg-background focus:ring-2 focus:ring-darkgreen focus:outline-none transition-all"
                />
              </div>

              <div className="relative">
                <label className="block text-xl text-darkgreen mb-2 italic">category</label>
                <button
                  type="button"
                  onClick={() => {
                    console.log('Dropdown toggled');
                    setIsDropdownOpen(!isDropdownOpen);
                  }}
                  className="w-full px-5 py-4 bg-accent border-0 rounded-xl text-left text-darkred text-lg focus:bg-background focus:ring-2 focus:ring-darkgreen focus:outline-none transition-all flex items-center justify-between"
                >
                  <span className={category ? 'text-darkred' : 'text-darkred'}>
                    {category || 'select a category'}
                  </span>
                  <ChevronDown 
                    size={22} 
                    className={`text-teal-600 transform transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
                  />
                </button>

                {isDropdownOpen && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto text-lg">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => handleCategorySelect(cat)}
                        className="w-full px-5 py-4 text-left hover:bg-gray-50 focus:bg-teal-50 focus:outline-none transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div>
            <h2 className="text-5xl font-light text-darkgreen mb-8 italic">preview</h2>

            <div className="bg-accent rounded-2xl p-10 h-80 flex items-center justify-center mb-8">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-full max-w-full object-contain rounded-lg"
                />
              ) : (
                <p className="text-darkgreen italic text-xl">image preview will appear here</p>
              )}
            </div>

            <div className="bg-background rounded-xl p-6 mb-8 text-base leading-relaxed">
              <p><strong>title:</strong> {title || 'not set'}</p>
              <p><strong>category:</strong> {category || 'not selected'}</p>
              <p><strong>image:</strong> {uploadedImage ? 'ready' : 'not uploaded'}</p>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!uploadedImage || !title || !category || isUploading}
              className="w-full bg-darkgreen text-white py-5 rounded-full text-2xl font-medium hover:bg-teal-800 disabled:bg-accent disabled:text-darkred disabled:cursor-not-allowed transition-colors"
            >
              {isUploading ? 'adding to wardrobe...' : 'add to wardrobe'}
            </button>
          </div>
        </div>
      </div>

      {/* Debug Info */}
      <div className="mt-12 p-6 bg-blue-50 rounded-xl text-base leading-relaxed">
        <h3 className="font-semibold mb-3 text-lg">Debug Info:</h3>
        <p>Image selected: {uploadedImage ? '✅ Yes' : '❌ No'}</p>
        <p>Title: {title ? '✅ ' + title : '❌ Empty'}</p>
        <p>Category: {category ? '✅ ' + category : '❌ Not selected'}</p>
        <p>Ready to upload: {uploadedImage && title && category ? '✅ Yes' : '❌ No'}</p>
      </div>
    </div>
  </div>
  </>
);
}

export default WardrobeUpload;