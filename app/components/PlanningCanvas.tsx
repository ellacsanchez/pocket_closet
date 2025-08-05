import React, { useState, useRef, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Trash2, RotateCw, ZoomIn, ZoomOut, Move, X } from 'lucide-react';
import type { WardrobeItemPreview } from '~/routes/plan';

interface CanvasItem extends WardrobeItemPreview {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  naturalWidth?: number;
  naturalHeight?: number;
}

export interface PlanningCanvasRef {
  getCanvasItems: () => CanvasItem[];
  clearCanvas: () => void;
  loadCanvasItems: (items: CanvasItem[]) => void; 
}

export const PlanningCanvas = forwardRef<PlanningCanvasRef>((props, ref) => {
  const [canvasItems, setCanvasItems] = useState<CanvasItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isDraggingItem, setIsDraggingItem] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragItemStart, setDragItemStart] = useState({ x: 0, y: 0 });
  const [nextZIndex, setNextZIndex] = useState(1);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    loadCanvasItems: (items: CanvasItem[]) => {
      setCanvasItems(items);
      setSelectedItem(null);
      const maxZIndex = items.reduce((max, item) => Math.max(max, item.zIndex || 0), 0);
      setNextZIndex(maxZIndex + 1);
    },
    getCanvasItems: () => canvasItems,
    clearCanvas: () => {
      setCanvasItems([]);
      setSelectedItem(null);
    }
  }));

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey || e.deltaY !== 0) {
        e.preventDefault();
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const canvasX = (mouseX - offset.x) / zoom;
        const canvasY = (mouseY - offset.y) / zoom;
        const scaleAmount = e.deltaY > 0 ? 0.98 : 1.02;

        setZoom(prevZoom => {
          const newZoom = Math.min(3, Math.max(0.3, prevZoom * scaleAmount));
          setOffset({
            x: mouseX - canvasX * newZoom,
            y: mouseY - canvasY * newZoom,
          });
          return newZoom;
        });
      }
    };

    const canvasEl = canvasRef.current;
    canvasEl?.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvasEl?.removeEventListener('wheel', handleWheel);
  }, [zoom, offset]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedItem(null);
        setIsDraggingItem(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingItem && selectedItem) {
        const deltaX = (e.clientX - dragStart.x) / zoom;
        const deltaY = (e.clientY - dragStart.y) / zoom;

        setCanvasItems(prev => prev.map(item =>
          item.id === selectedItem
            ? { ...item, x: dragItemStart.x + deltaX, y: dragItemStart.y + deltaY }
            : item
        ));
      }
    };

    const handleMouseUp = () => setIsDraggingItem(false);

    if (isDraggingItem) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDraggingItem, selectedItem, dragStart, dragItemStart, zoom]);

  const getImageDimensions = (url: string) =>
    new Promise<{ width: number; height: number }>((resolve) => {
      const img = new Image();
      img.onload = () => {
        const maxSize = 300;
        const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
        resolve({ width: img.width * scale, height: img.height * scale });
      };
      img.onerror = () => resolve({ width: 200, height: 200 });
      img.src = url;
    });

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    const itemData = JSON.parse(e.dataTransfer.getData('application/json')) as WardrobeItemPreview;
    const { width, height } = await getImageDimensions(itemData.imageUrl);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left - offset.x) / zoom - width / 2;
    const y = (e.clientY - rect.top - offset.y) / zoom - height / 2;

    setCanvasItems(prev => [
      ...prev,
      {
        ...itemData,
        x,
        y,
        width,
        height,
        rotation: 0,
        zIndex: nextZIndex,
        naturalWidth: width,
        naturalHeight: height,
      },
    ]);
    setNextZIndex(z => z + 1);
  }, [zoom, offset, nextZIndex]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const startPan = (e: React.MouseEvent) => {
    if (!isDraggingItem) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    }
  };

  const doPan = (e: React.MouseEvent) => {
    if (!isPanning || isDraggingItem) return;
    setOffset({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
  };

  const stopPan = () => setIsPanning(false);

  const handleItemMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedItem(id);
    setCanvasItems(prev => prev.map(item =>
      item.id === id ? { ...item, zIndex: nextZIndex } : item
    ));
    setNextZIndex(z => z + 1);
    const item = canvasItems.find(item => item.id === id);
    if (item) {
      setIsDraggingItem(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      setDragItemStart({ x: item.x, y: item.y });
    }
  };

  const deleteSelectedItem = () => {
    setCanvasItems(prev => prev.filter(item => item.id !== selectedItem));
    setSelectedItem(null);
  };

  const rotateSelectedItem = () => {
    setCanvasItems(prev => prev.map(item =>
      item.id === selectedItem ? { ...item, rotation: (item.rotation + 90) % 360 } : item
    ));
  };

  const resizeSelectedItem = (delta: number) => {
    setCanvasItems(prev => prev.map(item =>
      item.id === selectedItem
        ? {
            ...item,
            width: Math.max(50, item.width + delta),
            height: Math.max(50, item.height + delta),
          }
        : item
    ));
  };

  const resetSelectedItemSize = () => {
    setCanvasItems(prev => prev.map(item =>
      item.id === selectedItem && item.naturalWidth
        ? { ...item, width: item.naturalWidth, height: item.naturalHeight! }
        : item
    ));
  };

  const zoomIn = () => setZoom(z => Math.min(z * 1.05, 3));
  const zoomOut = () => setZoom(z => Math.max(z / 1.05, 0.3));
  const clearCanvas = () => {
    setCanvasItems([]);
    setSelectedItem(null);
  };

  const gridSize = 20 * zoom;
  const gridOffsetX = offset.x % gridSize;
  const gridOffsetY = offset.y % gridSize;

  return (
    <div className="flex-1 flex flex-col bg-gray-100">
      <div className="p-4 bg-white border-b border-gray-200 flex justify-between items-center">
        <div className="flex space-x-2">
          {selectedItem && (
            <>
              <button onClick={deleteSelectedItem} className="px-3 py-1 bg-red-100 text-red-700 rounded flex items-center space-x-1 hover:bg-red-200">
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
              <button onClick={rotateSelectedItem} className="px-3 py-1 bg-blue-100 text-blue-700 rounded flex items-center space-x-1 hover:bg-blue-200">
                <RotateCw className="w-4 h-4" />
                <span>Rotate</span>
              </button>
              <div className="flex items-center space-x-1">
                <button onClick={() => resizeSelectedItem(-20)} className="px-2 py-1 bg-gray-100 rounded">-</button>
                <span>Size</span>
                <button onClick={() => resizeSelectedItem(20)} className="px-2 py-1 bg-gray-100 rounded">+</button>
                <button onClick={resetSelectedItemSize} className="ml-2 px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200">Reset</button>
              </div>
            </>
          )}
        </div>
        <div className="flex space-x-2 items-center">
          <button onClick={zoomOut} className="p-1"><ZoomOut /></button>
          <span>{Math.round(zoom * 100)}%</span>
          <button onClick={zoomIn} className="p-1"><ZoomIn /></button>
          <button onClick={clearCanvas} className="px-3 py-1 bg-gray-200 rounded">Clear All</button>
        </div>
      </div>

      <div
        className="relative flex-1 overflow-hidden"
        onMouseDown={(e) => {
          setSelectedItem(null);
          startPan(e);
        }}
        onMouseMove={doPan}
        onMouseUp={stopPan}
        onMouseLeave={stopPan}
        style={{ cursor: isPanning ? 'grabbing' : isDraggingItem ? 'move' : 'grab' }}
      >
        <div
          ref={canvasRef}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="absolute w-full h-full"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
            transformOrigin: 'top left',
          }}
        >
          <div
            className="absolute opacity-20 pointer-events-none"
            style={{
              left: -offset.x / zoom,
              top: -offset.y / zoom,
              width: `calc(100vw / ${zoom} + ${Math.abs(offset.x) / zoom}px)`,
              height: `calc(100vh / ${zoom} + ${Math.abs(offset.y) / zoom}px)`,
              backgroundImage: `
                linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px',
              backgroundPosition: `${gridOffsetX / zoom}px ${gridOffsetY / zoom}px`,
            }}
          />

          {canvasItems.length === 0 && (
            <div
              className="absolute flex items-center justify-center w-full h-full pointer-events-none"
              style={{
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                position: 'absolute',
              }}
            >
              <div className="text-center text-gray-500">
                <Move className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Drop wardrobe items here</p>
                <p className="text-sm">Drag items from the left panel to start planning your outfit</p>
              </div>
            </div>
          )}

          {canvasItems.map(item => (
            <div
              key={item.id}
              onMouseDown={e => handleItemMouseDown(e, item.id)}
              className={`absolute select-none ${selectedItem === item.id ? 'ring-2 ring-blue-500' : ''}`}
              style={{
                top: item.y,
                left: item.x,
                width: item.width,
                height: item.height,
                transform: `rotate(${item.rotation}deg)`,
                zIndex: item.zIndex,
                cursor: selectedItem === item.id ? 'move' : 'pointer',
              }}
            >
              <img src={item.imageUrl} alt="" className="w-full h-full object-contain" draggable={false} />
              {selectedItem === item.id && (
                <button
                  onClick={e => {
                    e.stopPropagation();
                    deleteSelectedItem();
                  }}
                  className="absolute -top-3 -right-3 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});