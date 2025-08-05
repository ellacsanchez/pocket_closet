import { useState, useRef } from "react";
import { useLoaderData, useNavigate, useFetcher } from "@remix-run/react";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { getAuth } from "@clerk/remix/ssr.server";
import { PlanningCanvas, type PlanningCanvasRef } from "~/components/PlanningCanvas";
import { WardrobePanel, type LoaderWardrobeItem } from "~/components/WardrobePanel";
import Navigation from "~/components/Navigation";
import db from "~/utils/db.server";

// ===== Loader =====
export async function loader(args: LoaderFunctionArgs) {
  const { userId } = await getAuth(args);
  if (!userId) return json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(args.request.url);
  const tripId = url.searchParams.get("tripId") || "default-trip";

  try {
    const wardrobeItems = await db.wardrobeItem.findMany({
      where: { userId },
      select: {
        id: true,
        imageUrl: true,
        category: true,
        title: true,
        publicId: true,
        userId: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const categories = Array.from(new Set(wardrobeItems.map((i) => i.category)));

    const tripOutfits = await db.outfit.findMany({
      where: { userId, name: { startsWith: `${tripId}-day-` } },
      orderBy: { createdAt: "asc" },
      include: { outfitItems: { include: { item: true } } },
    });

    return json({
      wardrobeItems: wardrobeItems.map((i) => ({ ...i, createdAt: i.createdAt.toISOString() })),
      filters: { categories },
      savedOutfits: tripOutfits,
      tripId,
    });
  } catch (err) {
    console.error("❌ Loader error:", err);
    return json({ error: "Failed to load data" }, { status: 500 });
  }
}

type LoaderData = {
  wardrobeItems: LoaderWardrobeItem[];
  filters: { categories: string[] };
  savedOutfits: Array<{
    id: string;
    name: string;
    outfitItems: Array<{
      x: number;
      y: number;
      width: number;
      height: number;
      rotation: number;
      zIndex: number;
      item: {
        id: string;
        imageUrl: string;
        category: string;
        title: string;
        publicId: string;
      };
    }>;
  }>;
  tripId: string;
};

export default function Pack() {
  const { wardrobeItems, filters, savedOutfits: initialOutfits, tripId } =
    useLoaderData<LoaderData>();

  const [numberOfDays, setNumberOfDays] = useState(7);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [savedOutfits, setSavedOutfits] = useState<Record<number, any[]>>(() => {
    const map: Record<number, any[]> = {};
    initialOutfits.forEach((outfit) => {
      const match = outfit.name.match(/-day-(\d+)$/);
      if (match) {
        const day = parseInt(match[1]);
        map[day] = outfit.outfitItems.map((oi) => ({
          id: oi.item.id,
          imageUrl: oi.item.imageUrl,
          category: oi.item.category,
          title: oi.item.title,
          publicId: oi.item.publicId,
          x: oi.x,
          y: oi.y,
          width: oi.width,
          height: oi.height,
          rotation: oi.rotation,
          zIndex: oi.zIndex,
        }));
      }
    });
    return map;
  });

  const [isShowingSaveModal, setIsShowingSaveModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const canvasRef = useRef<PlanningCanvasRef>(null);
  const fetcher = useFetcher();
  const navigate = useNavigate();

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
    setTimeout(() => {
      if (savedOutfits[day] && canvasRef.current) {
        canvasRef.current.loadCanvasItems(savedOutfits[day]);
      } else {
        canvasRef.current?.clearCanvas();
      }
    }, 100);
  };

  const handleSaveOutfit = () => {
    if (!selectedDay || !canvasRef.current) return;
    const items = canvasRef.current.getCanvasItems();
    if (!items.length) return alert("Add items before saving.");
    setIsShowingSaveModal(true);
  };

  const handleConfirmSave = async () => {
    if (!selectedDay || !canvasRef.current) return;
    const items = canvasRef.current.getCanvasItems();
    setIsSaving(true);
    setSavedOutfits((p) => ({ ...p, [selectedDay]: items }));

    const name = `${tripId}-day-${selectedDay}`;
    const fd = new FormData();
    fd.append("name", name);
    fd.append("items", JSON.stringify(items));

    try {
      const res = await fetch("/api/outfits", { method: "POST", body: fd });
      const result = await res.json();
      if (!result.success) alert(result.error || "Failed to save.");
      setIsShowingSaveModal(false);
    } catch {
      alert("Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearDay = (day: number) => {
    if (!confirm(`Clear Day ${day}?`)) return;
    setSavedOutfits((p) => {
      const copy = { ...p };
      delete copy[day];
      return copy;
    });
  };

  const hasOutfit = (day: number) => savedOutfits[day]?.length > 0;

  // ===== Thumbnail Generator (with top label padding) =====
  const generateThumbnail = (dayNumber: number) => {
    const items = savedOutfits[dayNumber];
    if (!items || items.length === 0) return null;

    const canvasWidth = 800;
    const canvasHeight = 1200;
    const labelSpace = 80;
    const availableCanvasHeight = canvasHeight - labelSpace;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    items.forEach(item => {
      minX = Math.min(minX, item.x);
      minY = Math.min(minY, item.y);
      maxX = Math.max(maxX, item.x + item.width);
      maxY = Math.max(maxY, item.y + item.height);
    });

    const boxWidth = maxX - minX;
    const boxHeight = maxY - minY;
    const scaleX = (0.9 * canvasWidth) / boxWidth;
    const scaleY = (0.9 * availableCanvasHeight) / boxHeight;
    const scale = Math.min(scaleX, scaleY);

    const offsetX = (canvasWidth - boxWidth * scale) / 2 - minX * scale;
    const offsetY = labelSpace + (availableCanvasHeight - boxHeight * scale) / 2 - minY * scale;

    return (
      <div className="relative w-full h-full overflow-hidden rounded-xl bg-white flex items-center justify-center">
        {items.map((item, index) => (
          <img
            key={item.id}
            src={item.imageUrl}
            alt={item.title}
            className="absolute object-contain"
            style={{
              left: `${((item.x * scale + offsetX) / canvasWidth) * 100}%`,
              top: `${((item.y * scale + offsetY) / canvasHeight) * 100}%`,
              width: `${(item.width * scale / canvasWidth) * 100}%`,
              height: `${(item.height * scale / canvasHeight) * 100}%`,
              transform: `rotate(${item.rotation || 0}deg)`,
              zIndex: item.zIndex || index,
            }}
          />
        ))}
      </div>
    );
  };

  // ===== Day View =====
  if (selectedDay !== null) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="h-screen flex">
          <div className="w-80 bg-white border-r">
            <div className="p-4 border-b">
              <button
                onClick={() => setSelectedDay(null)}
                className="flex items-center text-gray-600 hover:text-gray-800 mb-3"
              >
                ← Back to Trip
              </button>
              <h1 className="text-2xl font-semibold">Day {selectedDay}</h1>
            </div>
            <WardrobePanel items={wardrobeItems} filters={filters} />
          </div>
          <div className="flex-1 flex flex-col">
            <div className="p-4 bg-white border-b flex justify-between">
              <h2 className="text-lg font-medium">Canvas</h2>
              <div className="flex gap-2">
                <button onClick={handleSaveOutfit} className="px-3 py-1 bg-blue-100 text-blue-700 rounded">
                  Save Outfit
                </button>
                <button onClick={() => canvasRef.current?.clearCanvas()} className="px-3 py-1 bg-gray-100 rounded">
                  Clear
                </button>
              </div>
            </div>
            <PlanningCanvas ref={canvasRef} />
          </div>
        </div>
        {isShowingSaveModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-96">
              <h3 className="text-lg font-semibold mb-4">Save Day {selectedDay} Outfit?</h3>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsShowingSaveModal(false)}
                  disabled={isSaving}
                  className="flex-1 bg-gray-200 rounded-md py-2"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmSave}
                  disabled={isSaving}
                  className="flex-1 bg-blue-600 text-white rounded-md py-2"
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ===== Overview Grid =====
  return (
    <div className="min-h-screen bg-lightbackground">
      <Navigation />
      <div className="h-screen flex flex-col">
        <div className="bg-white border-b p-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl text-darkgreen font-bold">Pack for Your Trip</h1>
            <p className="text-accent">Plan outfits for each day</p>
          </div>
          <div className="flex items-center gap-4">
            <label className="text-xl font-medium">Days:</label>
            <select
              value={numberOfDays}
              onChange={(e) => setNumberOfDays(Number(e.target.value))}
              className="px-5 py-3 text-xl border rounded-lg"
            >
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                <option key={day} value={day}>
                  {day} {day === 1 ? "day" : "days"}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex-1 p-6 overflow-auto">
          <div className="grid grid-cols-5 gap-4 auto-rows-[460px]">
            {Array.from({ length: numberOfDays }, (_, i) => i + 1).map((day) => (
              <div key={day} className="relative group">
                <button
                  onClick={() => handleDayClick(day)}
                  className={`w-full h-full border-2 rounded-xl overflow-hidden relative ${
                    hasOutfit(day)
                      ? "bg-white border-lightgreen hover:border-darkred"
                      : "bg-white border-gray-200 hover:border-blue-400 flex flex-col items-center justify-center"
                  }`}
                >
                  {hasOutfit(day) ? (
                    <>
                      <div className="absolute top-2 w-full text-center z-30">
                        <span className="text-2xl font-bold bg-white bg-opacity-80 px-3 py-1 rounded-md">
                          Day {day}
                        </span>
                      </div>
                      {generateThumbnail(day)}
                    </>
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-gray-500 mb-2">Day {day}</div>
                      <div className="text-sm text-gray-400">Plan outfit</div>
                    </>
                  )}
                </button>

                {hasOutfit(day) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClearDay(day);
                    }}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full z-40 flex items-center justify-center text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
