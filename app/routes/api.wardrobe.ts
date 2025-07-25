import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import db from "~/utils/db.server";


export const loader: LoaderFunction = async () => {
  const items = await db.wardrobeItem.findMany({
    orderBy: { createdAt: "desc" },
  });
  return json({ items });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  if (request.method === "POST") {
    const title = formData.get("title")?.toString() || "";
    const category = formData.get("category")?.toString() || "";
    const imageUrl = formData.get("imageUrl")?.toString() || "";
    const publicId = formData.get("publicId")?.toString() || "";

    if (!title || !category || !imageUrl || !publicId) {
      return json({ success: false, error: "Missing fields" }, { status: 400 });
    }

    const item = await db.wardrobeItem.create({
      data: { title, category, imageUrl, publicId },
    });

    return json({ success: true, item });
  }

  if (request.method === "DELETE") {
    const id = formData.get("id")?.toString();

    if (!id) {
      return json({ success: false, error: "Missing ID" }, { status: 400 });
    }

    try {
      await db.wardrobeItem.delete({ where: { id } });
      return json({ success: true });
    } catch (error) {
      console.error("Failed to delete item:", error);
      return json({ success: false, error: "Failed to delete" }, { status: 500 });
    }
  }

  return json({ success: false, error: "Unsupported method" }, { status: 405 });
  
};
