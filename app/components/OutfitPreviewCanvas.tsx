import React from "react";
import type { WardrobeItemPreview } from "~/routes/plan";

interface OutfitItemData extends WardrobeItemPreview {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
}

interface OutfitPreviewCanvasProps {
  items: OutfitItemData[];
}

export default function OutfitPreviewCanvas({ items }: OutfitPreviewCanvasProps) {
  // Determine bounds for scaling
  const canvasWidth = 400; // fixed preview width
  const canvasHeight = 300; // fixed preview height

  // Optional: find max extents of outfit for auto-scaling
  const maxX = Math.max(...items.map(i => i.x + i.width), canvasWidth);
  const maxY = Math.max(...items.map(i => i.y + i.height), canvasHeight);
  const scale = Math.min(canvasWidth / maxX, canvasHeight / maxY, 1);

  return (
    <div
      className="relative bg-gray-100 overflow-hidden rounded-lg border border-gray-300"
      style={{ width: `${canvasWidth}px`, height: `${canvasHeight}px` }}
    >
      {items.map((oi) => (
        <img
          key={oi.id}
          src={oi.imageUrl}
          alt={oi.category}
          style={{
            position: "absolute",
            left: `${oi.x * scale}px`,
            top: `${oi.y * scale}px`,
            width: `${oi.width * scale}px`,
            height: `${oi.height * scale}px`,
            transform: `rotate(${oi.rotation}deg)`,
            zIndex: oi.zIndex,
          }}
          className="object-contain pointer-events-none"
        />
      ))}
    </div>
  );
}
