import React, { useState, useMemo } from 'react';
import { Search, Filter, X } from 'lucide-react';
import type { Filters } from '~/routes/plan';

// Use a more flexible type that matches what actually comes from useLoaderData
type LoaderWardrobeItem = {
  id: string;
  imageUrl: string;
  category: string;
  color: string | null;
  brand: string | null;
  season: string | null;
  createdAt: string; // This is a string after JSON serialization
};

interface WardrobePanelProps {
  items: LoaderWardrobeItem[];
  filters: Filters;
}

export function WardrobePanel({ items, filters }: WardrobePanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedColor, setSelectedColor] = useState<string>('all');
  const [selectedSeason, setSelectedSeason] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Filter items based on current selections
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesColor = selectedColor === 'all' || item.color === selectedColor;
      const matchesSeason = selectedSeason === 'all' || item.season === selectedSeason;
      const matchesSearch = searchTerm === '' || 
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.brand && item.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.color && item.color.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesCategory && matchesColor && matchesSeason && matchesSearch;
    });
  }, [items, selectedCategory, selectedColor, selectedSeason, searchTerm]);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, item: LoaderWardrobeItem) => {
    e.dataTransfer.setData('application/json', JSON.stringify(item));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedColor('all');
    setSelectedSeason('all');
    setSearchTerm('');
  };

  const activeFiltersCount = [selectedCategory, selectedColor, selectedSeason].filter(f => f !== 'all').length;

  return (
    <div className="flex flex-col h-full">
      {/* Search and Filter Controls */}
      <div className="p-4 border-b border-gray-200 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
                {activeFiltersCount}
              </span>
            )}
          </button>
          
          {activeFiltersCount > 0 && (
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        {showFilters && (
          <div className="space-y-2 pt-2 border-t border-gray-200">
            {/* Category Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="all">All categories</option>
                {filters.categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Color Filter */}
            {filters.colors.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Color</label>
                <select
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="all">All colors</option>
                  {filters.colors.map(color => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Season Filter */}
            {filters.seasons.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Season</label>
                <select
                  value={selectedSeason}
                  onChange={(e) => setSelectedSeason(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="all">All seasons</option>
                  {filters.seasons.map(season => (
                    <option key={season} value={season}>{season}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Items Count */}
      <div className="px-4 py-2 text-sm text-gray-600 border-b border-gray-200">
        {filteredItems.length} of {items.length} items
      </div>

      {/* Items Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => handleDragStart(e, item)}
              className="bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all cursor-grab active:cursor-grabbing"
            >
              <div className="aspect-square overflow-hidden rounded-t-lg">
                <img
                  src={item.imageUrl}
                  alt={`${item.category} item`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk3OThkZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                  }}
                />
              </div>
              <div className="p-2">
                <p className="text-xs font-medium text-gray-900 truncate">
                  {item.category}
                </p>
                {item.color && (
                  <p className="text-xs text-gray-500 truncate">{item.color}</p>
                )}
                {item.brand && (
                  <p className="text-xs text-gray-400 truncate">{item.brand}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">No items match your filters</p>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="mt-2 text-blue-600 text-sm hover:text-blue-800"
              >
                Clear filters to see all items
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}