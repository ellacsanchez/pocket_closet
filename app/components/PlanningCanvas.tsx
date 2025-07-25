import React, { useState, useRef, useCallback } from 'react';
import { Trash2, RotateCw, Move, ZoomIn, ZoomOut } from 'lucide-react';
import type { WardrobeItemPreview } from '~/routes/plan';

interface CanvasItem extends WardrobeItemPreview {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
}

export function PlanningCanvas() {
  const [canvasItems, setCanvasItems] = useState<CanvasItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [nextZIndex, setNextZIndex] = useState(1);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    
    if (!canvasRef.current) return;

    try {
      const itemData = JSON.parse(e.dataTransfer.getData('application/json')) as WardrobeItemPreview;
      const rect = canvasRef.current.getBoundingClientRect();
      
      const x = (e.clientX - rect.left) / zoom - 75; // Center the item
      const y = (e.clientY - rect.top) / zoom - 75;

      const newItem: CanvasItem = {
        ...itemData,
        x,
        y,
        width: 150,
        height: 150,
        rotation: 0,
        zIndex: nextZIndex,
      };

      setCanvasItems(prev => [...prev, newItem]);
      setNextZIndex(prev => prev + 1);
    } catch (error) {
      console.error('Failed to add item to canvas:', error);
    }
  }, [zoom, nextZIndex]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleItemMouseDown = useCallback((e: React.MouseEvent, itemId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    setSelectedItem(itemId);
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });

    // Bring item to front
    setCanvasItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, zIndex: nextZIndex }
        : item
    ));
    setNextZIndex(prev => prev + 1);
  }, [nextZIndex]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !selectedItem) return;

    const deltaX = (e.clientX - dragStart.x) / zoom;
    const deltaY = (e.clientY - dragStart.y) / zoom;

    setCanvasItems(prev => prev.map(item =>
      item.id === selectedItem
        ? { ...item, x: item.x + deltaX, y: item.y + deltaY }
        : item
    ));

    setDragStart({ x: e.clientX, y: e.clientY });
  }, [isDragging, selectedItem, dragStart, zoom]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragStart({ x: 0, y: 0 });
  }, []);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setSelectedItem(null);
    }
  }, []);

  const deleteSelectedItem = useCallback(() => {
    if (selectedItem) {
      setCanvasItems(prev => prev.filter(item => item.id !== selectedItem));
      setSelectedItem(null);
    }
  }, [selectedItem]);

  const rotateSelectedItem = useCallback(() => {
    if (selectedItem) {
      setCanvasItems(prev => prev.map(item =>
        item.id === selectedItem
          ? { ...item, rotation: (item.rotation + 90) % 360 }
          : item
      ));
    }
  }, [selectedItem]);

  const resizeSelectedItem = useCallback((delta: number) => {
    if (selectedItem) {
      setCanvasItems(prev => prev.map(item =>
        item.id === selectedItem
          ? { 
              ...item, 
              width: Math.max(50, item.width + delta),
              height: Math.max(50, item.height + delta)
            }
          : item
      ));
    }
  }, [selectedItem]);

  const clearCanvas = useCallback(() => {
    setCanvasItems([]);
    setSelectedItem(null);
  }, []);

  const zoomIn = () => setZoom(prev => Math.min(prev * 1.2, 3));
  const zoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.3));

  return (
    <div className="flex-1 flex flex-col bg-gray-100">
      {/* Canvas Controls */}
      <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {selectedItem && (
            <>
              <button
                onClick={deleteSelectedItem}
                className="flex items-center space-x-1 px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
              <button
                onClick={rotateSelectedItem}
                className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                <RotateCw className="w-4 h-4" />
                <span>Rotate</span>
              </button>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => resizeSelectedItem(-20)}
                  className="px-2 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  -
                </button>
                <span className="text-sm text-gray-600">Size</span>
                <button
                  onClick={() => resizeSelectedItem(20)}
                  className="px-2 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  +
                </button>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <button
              onClick={zoomOut}
              className="p-1 text-gray-600 hover:text-gray-800"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-600 min-w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={zoomIn}
              className="p-1 text-gray-600 hover:text-gray-800"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={clearCanvas}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 overflow-hidden relative">
        <div
          ref={canvasRef}
          className="w-full h-full relative cursor-crosshair"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Grid Pattern */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px'
            }}
          />

          {/* Canvas Items */}
          {canvasItems.map((item) => (
            <div
              key={item.id}
              className={`absolute cursor-move select-none ${
                selectedItem === item.id ? 'ring-2 ring-blue-500' : ''
              }`}
              style={{
                left: item.x,
                top: item.y,
                width: item.width,
                height: item.height,
                transform: `rotate(${item.rotation}deg)`,
                zIndex: item.zIndex,
              }}
              onMouseDown={(e) => handleItemMouseDown(e, item.id)}
            >
              <img
                src={item.imageUrl}
                alt={`${item.category} item`}
                className="w-full h-full object-cover rounded-lg shadow-lg"
                draggable={false}
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk3OThkZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                }}
              />
              
              {/* Selection handles */}
              {selectedItem === item.id && (
                <>
                  <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-full" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full" />
                  <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 rounded-full" />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full" />
                </>
              )}
            </div>
          ))}

          {/* Drop Zone Hint */}
          {canvasItems.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <Move className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">Drop wardrobe items here</p>
                <p className="text-sm">Drag items from the left panel to start planning your outfit</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}