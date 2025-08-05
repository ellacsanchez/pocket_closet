import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { getAuth } from "@clerk/remix/ssr.server";
import db from "~/utils/db.server";
import Navigation from "~/components/Navigation";

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

interface Outfit {
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

const OutfitPreviewCanvas = ({ items }: { items: OutfitItem[] }) => {
  const canvasWidth = 300;
  const canvasHeight = 240;
  const maxX = Math.max(...items.map(i => i.x + i.width), canvasWidth);
  const maxY = Math.max(...items.map(i => i.y + i.height), canvasHeight);
  const scale = Math.min(canvasWidth / maxX, canvasHeight / maxY, 1);

  return (
    <div
      className="relative bg-lightbackground overflow-hidden rounded-lg border border-darkred"
      style={{ width: `${canvasWidth}px`, height: `${canvasHeight}px` }}
    >
      {items.map((oi) => (
        <img
          key={oi.id}
          src={oi.item.imageUrl}
          alt={oi.item.title}
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
};

export default function SavedOutfitsPage() {
  const { outfits } = useLoaderData<{ outfits: Outfit[] }>();

  return (
    <>
      <Navigation showBackButton backTo="/directory" backLabel="directory" showQuickNav />
      <div className="min-h-screen bg-background px-10 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <h1 className="text-6xl font-light italic text-darkgreen">saved outfits</h1>
            <Link
              to="/wardrobe"
              className="px-5 py-3 bg-darkgreen text-background rounded-full hover:bg-teal-800 transition-colors"
            >
              back to wardrobe
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {outfits.map((outfit) => (
              <div key={outfit.id} className="bg-lightbackground rounded-2xl shadow-sm border border-gray-200 p-4">
                <h3 className="text-2xl font-medium text-gray-800 mb-4">{outfit.name}</h3>
                <OutfitPreviewCanvas items={outfit.outfitItems} />
                <p className="text-sm text-gray-500 mt-2">
                  created {new Date(outfit.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
