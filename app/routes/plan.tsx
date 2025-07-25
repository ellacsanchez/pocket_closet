import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getAuth } from "@clerk/remix/ssr.server";
import db from "~/utils/db.server";
import { PlanningCanvas } from "~/components/PlanningCanvas";
import { WardrobePanel } from "~/components/WardrobePanel";
import Navigation from "~/components/Navigation";
import { redirect } from "@remix-run/node";

// Define the filtered preview shape returned from DB
export type WardrobeItemPreview = {
  id: string;
  imageUrl: string;
  category: string;
  color: string | null;
  brand: string | null;
  season: string | null;
  createdAt: Date;
};

// Define the serialized version that comes from the loader
export type SerializedWardrobeItemPreview = {
  id: string;
  imageUrl: string;
  category: string;
  color: string | null;
  brand: string | null;
  season: string | null;
  createdAt: string; // This becomes a string after JSON serialization
};

export type Filters = {
  categories: string[];
  colors: string[];
  seasons: string[];
};

export async function loader(args: LoaderFunctionArgs) {
  try {
    const { userId } = await getAuth(args); // Pass the full args object to getAuth

    if (!userId) {
        return redirect("/sign-in");
    }

    const wardrobeItems = await db.wardrobeItem.findMany({
      where: { userId },
      select: {
        id: true,
        imageUrl: true,
        category: true,
        color: true,
        brand: true,
        season: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Manually assert type if needed
    const itemsTyped = wardrobeItems as SerializedWardrobeItemPreview[];

    const categories = [...new Set(itemsTyped.map((item) => item.category))];
    const colors = [...new Set(itemsTyped.map((item) => item.color).filter(Boolean))] as string[];
    const seasons = [...new Set(itemsTyped.map((item) => item.season).filter(Boolean))] as string[];

    return json({
      wardrobeItems: itemsTyped,
      filters: { categories, colors, seasons } satisfies Filters,
    });
  } catch (error) {
    console.error("Error in plan loader:", error);
    throw new Response("Internal Server Error", { status: 500 });
  }
}

export default function Plan() {
  const { wardrobeItems, filters } = useLoaderData<typeof loader>();

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
          {/* Fixed: changed items to wardrobeItems */}
          <WardrobePanel items={wardrobeItems} filters={filters} />
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 bg-white border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Canvas</h2>
              <div className="flex space-x-2">
                <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                  Save Outfit
                </button>
                <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                  Clear Canvas
                </button>
              </div>
            </div>
          </div>
          <PlanningCanvas />
        </div>
      </div>
    </div>
  );
}