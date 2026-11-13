import { Router, type IRouter } from "express";
import { DishUpload, DishDetailsUpdate, parseImageDataUrl, toGalleryItem } from "../lib/dishUpload";
import { memoryDishStore } from "../lib/dishStore";
import { dbDishStore } from "../lib/dishStore.db";
import { inspectDish, type DishInspectionResult } from "../agents/dishInspector";
import { city } from "../city";
import { logger } from "../lib/logger";

// Step 1 used memoryDishStore (forgets on restart).
// Step 2 switches to the Postgres pantry so photos survive restarts.
void memoryDishStore;
const store = dbDishStore;
const router: IRouter = Router();

// GET /api/dishes: the gallery menu (no image data, just links to each image)
router.get("/dishes", async (_req, res) => {
  const rows = await store.list();
  res.json({ dishes: rows.map(toGalleryItem) });
});

// GET /api/dishes/:id/image: serve one photo's bytes
router.get("/dishes/:id/image", async (req, res) => {
  const id = Number(req.params.id);
  const dish = Number.isInteger(id) ? await store.get(id) : undefined;
  if (!dish) {
    res.status(404).json({ error: "Photo not found." });
    return;
  }
  res.type(dish.mimeType);
  res.set("Cache-Control", "public, max-age=86400");
  res.send(Buffer.from(dish.imageBase64, "base64"));
});

// POST /api/dishes: drop off a new photo at the kitchen door
router.put("/dishes/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) {
    res.status(400).json({ error: "Invalid photo ID." });
    return;
  }

  const parsed = DishDetailsUpdate.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Provide a title and caption." });
    return;
  }

  const updated = await store.update(id, parsed.data);
  if (!updated) {
    res.status(404).json({ error: "Photo not found." });
    return;
  }

  res.json({ dish: toGalleryItem(updated) });
});

router.post("/dishes", async (req, res) => {
  const parsed = DishUpload.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid upload." });
    return;
  }

  const image = parseImageDataUrl(parsed.data.image);
  if ("error" in image) {
    res.status(400).json({ error: image.error });
    return;
  }

  let inspection: DishInspectionResult;
  try {
    inspection = await inspectDish(
      image.base64,
      image.mimeType,
      city.dish,
      city.dishLooksLike,
      city.notTheDish,
    );
  } catch (error) {
    logger.error({ err: error }, "Dish photo inspection failed");
    res.status(502).json({
      error: "The photo inspector is temporarily unavailable. Please try again.",
    });
    return;
  }

  if (!inspection.isMatch || inspection.confidence < 0.7) {
    res.status(422).json({
      error: `Only ${city.dish} photos can be uploaded!`,
      reason: `The inspector saw: ${inspection.whatISee}`,
    });
    return;
  }

  const saved = await store.add({
    title: parsed.data.title,
    caption: parsed.data.caption ?? "",
    mimeType: image.mimeType,
    imageBase64: image.base64,
    inspectorNote: `Inspector: ${inspection.whatISee} (${Math.round(inspection.confidence * 100)}% sure)`,
  });
  res.status(201).json({ dish: toGalleryItem(saved) });
});

export default router;