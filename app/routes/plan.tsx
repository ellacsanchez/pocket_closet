import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getAuth } from "@clerk/remix/ssr.server";
import { useState, useRef } from "react";
import db from "~/utils/db.server";
import { PlanningCanvas, type PlanningCanvasRef } from "~/components/PlanningCanvas";
import { WardrobePanel } from "~/components/WardrobePanel";
import Navigation from "~/components/Navigation";

// Matches what is returned from your DB query
export type WardrobeItemPreview = {
  id: string;
  imageUrl: string;
  category: string;
  title: string;
  publicId: string;
  userId: string | null;
  createdAt: Date;
};

// Serialized for the loader
export type SerializedWardrobeItemPreview = {
  id: string;
  imageUrl: string;
  category: string;
  title: string;
  publicId: string;
  userId: string | null;
  createdAt: string;
};

export type Filters = {
  categories: string[];
};

export async function loader(args: LoaderFunctionArgs) {
  try {
    const { userId } = await getAuth(args);

    if (!userId) {
      throw new Response("Unauthorized", { status: 401 });
    }

    // Query items for the current user only
    const wardrobeItems = await db.wardrobeItem.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        category: true,
        imageUrl: true,
        publicId: true,
        createdAt: true,
        userId: true,
      },
      orderBy: { createdAt: "desc" },
    });

   const itemsTyped: SerializedWardrobeItemPreview[] = wardrobeItems.map((item) => ({
      ...item,
      imageUrl: item.imageUrl ?? "",
      publicId: item.publicId ?? "", // null → empty string
      createdAt: item.createdAt.toISOString(),
    }));


    const categories = [...new Set(itemsTyped.map((item) => item.category))];

    return json({
      wardrobeItems: itemsTyped,
      filters: { categories } satisfies Filters,
    });
  } catch (error: any) {
    console.error("Error in plan loader:", error);
    throw new Response("Internal Server Error", { status: 500 });
  }
}

export default function Plan() {
  const { wardrobeItems, filters } = useLoaderData<typeof loader>();
  const canvasRef = useRef<PlanningCanvasRef>(null);
  const [isShowingSaveModal, setIsShowingSaveModal] = useState(false);
  const [outfitName, setOutfitName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveOutfit = () => {
    const canvasItems = canvasRef.current?.getCanvasItems() || [];
    if (canvasItems.length === 0) {
      alert("Please add some items to the canvas before saving!");
      return;
    }
    setIsShowingSaveModal(true);
  };

  const handleConfirmSave = async () => {
    if (!outfitName.trim()) {
      alert("Please enter a name for your outfit!");
      return;
    }

    const canvasItems = canvasRef.current?.getCanvasItems() || [];
    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.append("name", outfitName.trim());
      formData.append("items", JSON.stringify(canvasItems));

      const response = await fetch("/api/outfits", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        alert("Outfit saved successfully!");
        setIsShowingSaveModal(false);
        setOutfitName("");
        // Optionally clear the canvas
        // canvasRef.current?.clearCanvas();
      } else {
        alert("Failed to save outfit: " + (result.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error saving outfit:", error);
      alert("Failed to save outfit. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearCanvas = () => {
    if (confirm("Are you sure you want to clear the canvas?")) {
      canvasRef.current?.clearCanvas();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="h-screen flex bg-gray-50">
        {/* Wardrobe Panel - Left Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-xl font-semibold text-gray-900">Plan Outfit</h1>
            <p className="text-sm text-gray-600 mt-1">
              Drag items to the canvas to create your outfit
            </p>
          </div>
          <WardrobePanel items={wardrobeItems} filters={filters} />
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 bg-white border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Canvas</h2>
              <div className="flex space-x-2">
                <button 
                  onClick={handleSaveOutfit}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  Save Outfit
                </button>
                <button 
                  onClick={handleClearCanvas}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  Clear Canvas
                </button>
              </div>
            </div>
          </div>
          <PlanningCanvas ref={canvasRef} />
        </div>
      </div>

      {/* Save Outfit Modal */}
      {isShowingSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Save Outfit</h3>
            <div className="mb-4">
              <label htmlFor="outfit-name" className="block text-sm font-medium text-gray-700 mb-2">
                Outfit Name
              </label>
              <input
                id="outfit-name"
                type="text"
                value={outfitName}
                onChange={(e) => setOutfitName(e.target.value)}
                placeholder="Enter outfit name..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSaving}
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setIsShowingSaveModal(false);
                  setOutfitName("");
                }}
                disabled={isSaving}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSave}
                disabled={isSaving || !outfitName.trim()}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
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