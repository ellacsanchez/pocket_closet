import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { getAuth } from "@clerk/remix/ssr.server";
import db from "~/utils/db.server";

// --- LOADER ---
export const loader: LoaderFunction = async (args) => {
  const { userId } = await getAuth(args);

  if (!userId) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const outfitsWithItems = await db.outfit.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        outfitItems: {
          include: {
            item: true, // WardrobeItem relation
          },
        },
      },
    });

    return json({ outfits: outfitsWithItems });
  } catch (error) {
    console.error("❌ Error loading outfits:", error);
    return json({ error: "Failed to fetch outfits" }, { status: 500 });
  }
};

// --- ACTION ---
export const action: ActionFunction = async (args) => {
  const { request } = args;
  const { userId } = await getAuth(args);

  if (!userId) {
    return json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();

  if (request.method === "POST") {
    const name = formData.get("name")?.toString();
    const itemsData = formData.get("items")?.toString();

    if (!name || !itemsData) {
      return json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    try {
      const items = JSON.parse(itemsData);

      const outfit = await db.outfit.create({
        data: {
          name,
          userId,
          outfitItems: {
            create: items.map((item: any) => ({
              itemId: item.id,
              x: item.x,
              y: item.y,
              width: item.width,
              height: item.height,
              rotation: item.rotation,
              zIndex: item.zIndex,
            })),
          },
        },
        include: {
          outfitItems: {
            include: {
              item: true,
            },
          },
        },
      });

      console.log("✅ Outfit created successfully:", outfit.name);
      return json({ success: true, outfit });
    } catch (error) {
      console.error("❌ Failed to create outfit:", error);
      return json(
        { success: false, error: "Failed to create outfit" },
        { status: 500 }
      );
    }
  }

  if (request.method === "DELETE") {
    const id = formData.get("id")?.toString();

    if (!id) {
      return json({ success: false, error: "Missing ID" }, { status: 400 });
    }

    try {
      await db.outfit.deleteMany({
        where: {
          id,
          userId,
        },
      });

      return json({ success: true });
    } catch (error) {
      console.error("❌ Failed to delete outfit:", error);
      return json(
        { success: false, error: "Failed to delete outfit" },
        { status: 500 }
      );
    }
  }

  return json({ success: false, error: "Unsupported method" }, { status: 405 });
};
