import React, { useState, useEffect } from 'react';
import { Trash2, RefreshCw, X } from 'lucide-react';
import { Link } from '@remix-run/react';
import Navigation from '~/components/Navigation';

interface WardrobeItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  publicId: string;
  createdAt: string;
}

const WardrobeGallery = () => {
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WardrobeItem | null>(null);

  const categories = [
    'all', 'tops', 'pants', 'shorts/skirts', 'sweaters/coats', 'dresses', 'accessories', 'bags', 'shoes'
  ];

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/wardrobe');
      const data = await response.json();
      setItems(data.items || []);
    } catch (error) {
      console.error('Failed to fetch items:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchItems();
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      const formData = new FormData();
      formData.append('id', id);
      const response = await fetch('/api/wardrobe', {
        method: 'DELETE',
        body: formData,
      });
      const result = await response.json();
      if (result.success) {
        setItems(items.filter(item => item.id !== id));
        setSelectedItem(null);
      } else {
        alert('Failed to delete item');
      }
    } catch {
      alert('Failed to delete item');
    }
  };

  const handleItemClick = (item: WardrobeItem) => setSelectedItem(item);
  const closeModal = () => setSelectedItem(null);

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeModal();
    };
    if (selectedItem) {
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [selectedItem]);

  const filteredItems = selectedCategory === 'all'
    ? items
    : items.filter(item => item.category.toLowerCase() === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-darkgreen text-xl italic mb-4">loading wardrobe...</div>
          <div className="w-8 h-8 border-2 border-darkgreen border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <>
      <Navigation showBackButton backTo="/directory" backLabel="directory" showQuickNav />
      <div className="min-h-screen bg-background px-10 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header with Saved Outfits + Refresh */}
          <div className="flex items-center justify-between mb-10">
            <h1 className="text-6xl italic font-light text-darkgreen">my wardrobe</h1>
            <div className="flex items-center gap-4">
              <Link
                to="/outfits"
                className="flex items-center gap-2 px-5 py-3 bg-accent text-darkred rounded-full hover:bg-lightbackground hover:border-2 hover:border-darkgreen transition-colors"
              >
                saved outfits
              </Link>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-5 py-3 bg-darkgreen text-background rounded-full hover:bg-teal-800 transition-colors"
              >
                <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
                refresh
              </button>
            </div>
          </div>

          {/* Category Buttons */}
          <div className="mb-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 justify-center">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-4 rounded-full text-lg font-semibold text-center transition-all w-full ${
                  selectedCategory === category
                    ? 'bg-darkgreen text-background'
                    : 'bg-accent text-darkred hover:bg-lightbackground hover:border-2 hover:border-darkgreen'
                }`}
              >
                {category}
                <span className="ml-2 text-sm opacity-75">
                  ({
                    category === 'all'
                      ? items.length
                      : items.filter(item => item.category.toLowerCase() === category).length
                  })
                </span>
              </button>
            ))}
          </div>

          {/* Wardrobe Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {filteredItems.map(item => (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className="bg-lightbackground rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition cursor-pointer"
              >
                <div className="relative group">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-64 sm:h-72 md:h-80 object-cover"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteItem(item.id);
                    }}
                    className="absolute top-2 right-2 bg-darkred text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-medium text-gray-800 mb-2">{item.title}</h3>
                  <p className="text-md text-teal-600 italic mb-2">{item.category}</p>
                  <p className="text-sm text-gray-500">
                    added {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all z-10"
            >
              <X size={20} />
            </button>
            <div className="relative">
              <img
                src={selectedItem.imageUrl}
                alt={selectedItem.title}
                className="max-w-full max-h-[70vh] object-contain"
              />
            </div>
            <div className="p-6 border-t border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-medium text-gray-800 mb-2">{selectedItem.title}</h2>
                  <p className="text-lg text-teal-600 italic">{selectedItem.category}</p>
                </div>
                <button
                  onClick={() => deleteItem(selectedItem.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-darkred text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <Trash2 size={16} />
                  delete
                </button>
              </div>
              <p className="text-sm text-gray-500">
                added on {new Date(selectedItem.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WardrobeGallery;
