import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link, useFetcher } from "@remix-run/react";
import { getAuth } from "@clerk/remix/ssr.server";
import db from "~/utils/db.server";
import Navigation from "~/components/Navigation";
import { useState, useEffect } from "react";
import { X, Trash2 } from "lucide-react";

interface WardrobeItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  publicId: string;
  createdAt: string;
}

interface OutfitItem {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  item: WardrobeItem;
}

export interface Outfit {
  id: string;
  name: string;
  createdAt: string;
  outfitItems: OutfitItem[];
}

export const loader: LoaderFunction = async (args) => {
  const { userId } = await getAuth(args);
  if (!userId) return json({ error: "Unauthorized" }, { status: 401 });

  const outfits = await db.outfit.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { outfitItems: { include: { item: true } } },
  });

  return json({ outfits });
};

export const action: ActionFunction = async (args) => {
  const { request } = args;
  const { userId } = await getAuth(args);
  if (!userId) return json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const id = formData.get("id") as string;

  if (!id) return json({ error: "Missing outfit id" }, { status: 400 });

  if (request.method === "DELETE") {
    await db.outfitItem.deleteMany({ where: { outfitId: id } });
    await db.outfit.delete({ where: { id } });
    return json({ success: true });
  }

  if (request.method === "PATCH") {
    const newName = formData.get("name") as string;
    await db.outfit.update({ where: { id }, data: { name: newName } });
    return json({ success: true });
  }

  return json({ error: "Invalid method" }, { status: 405 });
};

// Adjusted preview canvas for better centering
const OutfitPreviewCanvas = ({ items }: { items: OutfitItem[] }) => {
  const canvasWidth = 500;
  const canvasHeight = 500; // Square canvas
  const padding = 20;

  const minX = Math.min(...items.map((i) => i.x));
  const minY = Math.min(...items.map((i) => i.y));
  const maxX = Math.max(...items.map((i) => i.x + i.width));
  const maxY = Math.max(...items.map((i) => i.y + i.height));

  const contentWidth = maxX - minX;
  const contentHeight = maxY - minY;
  const scale = Math.min(
    (canvasWidth - padding * 2) / contentWidth,
    (canvasHeight - padding * 2) / contentHeight
  );

  return (
    <div
      className="relative bg-lightbackground overflow-hidden rounded-lg flex items-center justify-center"
      style={{ width: `${canvasWidth}px`, height: `${canvasHeight}px` }}
    >
      <div
        className="relative"
        style={{
          width: `${contentWidth * scale}px`,
          height: `${contentHeight * scale}px`,
        }}
      >
        {items.map((oi) => (
          <img
            key={oi.id}
            src={oi.item.imageUrl}
            alt={oi.item.title}
            style={{
              position: "absolute",
              left: `${(oi.x - minX) * scale}px`,
              top: `${(oi.y - minY) * scale}px`,
              width: `${oi.width * scale}px`,
              height: `${oi.height * scale}px`,
              transform: `rotate(${oi.rotation}deg)`,
              zIndex: oi.zIndex,
            }}
            className="object-contain pointer-events-none"
          />
        ))}
      </div>
    </div>
  );
};

export default function SavedOutfitsPage() {
  const { outfits: initialOutfits } = useLoaderData<{ outfits: Outfit[] }>();
  const [outfits, setOutfits] = useState<Outfit[]>(initialOutfits);
  const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(null);
  const [editName, setEditName] = useState("");
  const fetcher = useFetcher();

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this outfit?")) return;
    const formData = new FormData();
    formData.append("id", id);
    fetcher.submit(formData, { method: "DELETE" });
    setOutfits((prev) => prev.filter((o) => o.id !== id));
    setSelectedOutfit(null);
  };

  const handleSaveName = () => {
    if (!selectedOutfit) return;
    const formData = new FormData();
    formData.append("id", selectedOutfit.id);
    formData.append("name", editName);
    fetcher.submit(formData, { method: "PATCH" });
    setOutfits((prev) =>
      prev.map((o) =>
        o.id === selectedOutfit.id ? { ...o, name: editName } : o
      )
    );
    setSelectedOutfit(null); // close modal after saving name
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedOutfit(null);
    };
    if (selectedOutfit) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "unset";
    };
  }, [selectedOutfit]);

  return (
    <>
      <Navigation showBackButton backTo="/directory" backLabel="directory" showQuickNav />
      <div className="min-h-screen bg-background px-10 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-10 gap-6">
            <h1 className="text-6xl font-light italic text-darkgreen">saved outfits</h1>
            <Link
              to="/wardrobe"
              className="px-8 py-4 bg-darkgreen text-background rounded-full hover:bg-teal-800 transition-colors text-xl font-semibold shadow-lg"
            >
              back to wardrobe
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {outfits.map((outfit) => (
              <div
                key={outfit.id}
                onClick={() => {
                  setSelectedOutfit(outfit);
                  setEditName(outfit.name);
                }}
                className="bg-lightbackground rounded-2xl shadow-sm p-4 relative group cursor-pointer hover:shadow-lg transition"
              >
                <h3 className="text-2xl font-medium text-gray-800 mb-4">{outfit.name}</h3>
                <div className="flex justify-center items-start">
                  <OutfitPreviewCanvas items={outfit.outfitItems} />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  created {new Date(outfit.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedOutfit && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedOutfit(null)}
        >
          <div
            className="relative bg-lightbackground rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedOutfit(null)}
              className="absolute top-4 right-4 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
            >
              <X size={20} />
            </button>
            <OutfitPreviewCanvas items={selectedOutfit.outfitItems} />
            <div className="mt-4 flex items-center gap-3 w-full max-w-lg">
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="border border-gray-300 rounded-full px-4 py-2 flex-1 text-center"
              />
              <button
                onClick={handleSaveName}
                className="px-5 py-2 bg-darkgreen text-background rounded-full hover:bg-teal-800"
              >
                save name
              </button>
              <button
                onClick={() => handleDelete(selectedOutfit.id)}
                className="px-5 py-2 bg-darkred text-white rounded-full hover:bg-red-600 flex items-center gap-1"
              >
                <Trash2 size={16} />
                delete
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              created {new Date(selectedOutfit.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
