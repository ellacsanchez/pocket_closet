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
    const items = await db.wardrobeItem.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return json({ items });
  } catch (error) {
    console.error("❌ Error loading wardrobe items:", error);
    return json({ error: "Failed to fetch items" }, { status: 500 });
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

// Replace your entire POST handler in api.wardrobe.ts with this:
if (request.method === "POST") {
  const title = formData.get("title")?.toString() || "";
  const category = formData.get("category")?.toString() || "";
  const imageUrl = formData.get("imageUrl")?.toString() || "";
  const publicId = formData.get("publicId")?.toString() || "";
  const userIdFromForm = formData.get("userId")?.toString() || "";

  // DEBUG: Log all the data being received
  console.log("🔍 API - userId from getAuth():", userId);
  console.log("🔍 API - userId from form data:", userIdFromForm);
  console.log("🔍 API - Item data:", { title, category, imageUrl, publicId });

  if (!title || !category || !imageUrl || !publicId) {
    console.error("❌ Missing required fields");
    return json({ success: false, error: "Missing fields" }, { status: 400 });
  }

  try {
    const item = await db.wardrobeItem.create({
      data: {
        title,
        category,
        imageUrl,
        publicId,
        userId, // This should use userId from getAuth()
      },
    });

    console.log("✅ Item created successfully with userId:", item.userId);
    return json({ success: true, item });
  } catch (error) {
    console.error("❌ Failed to create item:", error);
    return json({ success: false, error: "Failed to create item" }, { status: 500 });
  }
}

  if (request.method === "DELETE") {
    const id = formData.get("id")?.toString();

    if (!id) {
      return json({ success: false, error: "Missing ID" }, { status: 400 });
    }

    try {
      await db.wardrobeItem.deleteMany({
        where: {
          id,
          userId, // Ensure item belongs to current user
        },
      });

      return json({ success: true });
    } catch (error) {
      console.error("❌ Failed to delete item:", error);
      return json({ success: false, error: "Failed to delete item" }, { status: 500 });
    }
  }

  return json({ success: false, error: "Unsupported method" }, { status: 405 });
};
