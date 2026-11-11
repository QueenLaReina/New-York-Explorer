import express, { Request, Response } from "express";
import { desc, eq } from "drizzle-orm";
import { db } from "./db";
import { dishPhotosTable } from "./schema";

const app = express();

// Requirement 5: Raise JSON body parser limit to 5 MB
app.use(express.json({ limit: "5mb" }));

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_RAW_SIZE_BYTES = 3 * 1024 * 1024; // 3 MB

// Helper: Parse and validate data URLs
function parseDataUrl(dataUrl: string) {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
  if (!match) return null;

  const mimeType = match[1].toLowerCase();
  const base64Data = match[2];

  // Calculate approximate byte size of base64 data
  const padding = base64Data.endsWith("==")
    ? 2
    : base64Data.endsWith("=")
      ? 1
      : 0;
  const byteSize = (base64Data.length * 3) / 4 - padding;

  return { mimeType, base64Data, byteSize };
}

// Requirement 2: POST /api/dishes
app.post("/api/dishes", async (req: Request, res: Response) => {
  try {
    const { title, caption, image } = req.body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ error: "A valid title is required." });
    }

    if (!image || typeof image !== "string") {
      return res.status(400).json({ error: "Image data URL is required." });
    }

    const parsedImage = parseDataUrl(image);
    if (!parsedImage) {
      return res
        .status(400)
        .json({
          error: "Invalid image format. Must be a valid base64 data URL.",
        });
    }

    const { mimeType, base64Data, byteSize } = parsedImage;

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return res.status(400).json({
        error: `Unsupported image format (${mimeType}). Only JPEG, PNG, and WebP are allowed.`,
      });
    }

    // Validate file size (up to 3 MB)
    if (byteSize > MAX_RAW_SIZE_BYTES) {
      return res.status(400).json({
        error: `File size exceeds the 3 MB limit. Provided size is ${(byteSize / (1024 * 1024)).toFixed(2)} MB.`,
      });
    }

    const [saved] = await db
      .insert(dishPhotosTable)
      .values({
        title: title.trim(),
        caption: (caption || "").trim(),
        mimeType,
        imageBase64: base64Data,
      })
      .returning();

    return res.status(201).json({
      id: saved.id,
      title: saved.title,
      caption: saved.caption,
      createdAt: saved.createdAt,
      imageUrl: `/api/dishes/${saved.id}/image`,
    });
  } catch (error) {
    console.error("Error creating dish photo:", error);
    return res.status(500).json({ error: "Failed to upload dish photo." });
  }
});

// Requirement 3: GET /api/dishes (newest first, without base64 blob)
app.get("/api/dishes", async (_req: Request, res: Response) => {
  try {
    const dishes = await db
      .select({
        id: dishPhotosTable.id,
        title: dishPhotosTable.title,
        caption: dishPhotosTable.caption,
        createdAt: dishPhotosTable.createdAt,
        inspectorNote: dishPhotosTable.inspectorNote,
      })
      .from(dishPhotosTable)
      .orderBy(desc(dishPhotosTable.createdAt));

    const response = dishes.map((dish) => ({
      ...dish,
      imageUrl: `/api/dishes/${dish.id}/image`,
    }));

    return res.json(response);
  } catch (error) {
    console.error("Error fetching dishes:", error);
    return res.status(500).json({ error: "Failed to fetch dishes." });
  }
});

// Requirement 4: GET /api/dishes/:id/image (returns image bytes)
app.get("/api/dishes/:id/image", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid dish ID." });
    }

    const [dish] = await db
      .select({
        mimeType: dishPhotosTable.mimeType,
        imageBase64: dishPhotosTable.imageBase64,
      })
      .from(dishPhotosTable)
      .where(eq(dishPhotosTable.id, id))
      .limit(1);

    if (!dish) {
      return res.status(404).send("Image not found");
    }

    const imageBuffer = Buffer.from(dish.imageBase64, "base64");

    res.setHeader("Content-Type", dish.mimeType);
    res.setHeader("Content-Length", imageBuffer.length);
    res.setHeader("Cache-Control", "public, max-age=86400"); // Optional cache header
    return res.end(imageBuffer);
  } catch (error) {
    console.error("Error retrieving dish image:", error);
    return res.status(500).json({ error: "Failed to retrieve image." });
  }
});
