import { desc, eq } from "drizzle-orm";
import { db, dishPhotosTable } from "@workspace/db";
import { memoryDishStore, type DishStore } from "./dishStore";

// Step 2: the same three jobs as the memory store, but saved in Postgres.
// When no DATABASE_URL is configured, fall back to the in-memory store so the
// app still runs during local development and smoke tests.
export const dbDishStore: DishStore = {
  async list() {
    if (!db) return memoryDishStore.list();
    return db.select().from(dishPhotosTable).orderBy(desc(dishPhotosTable.createdAt));
  },
  async get(id) {
    if (!db) return memoryDishStore.get(id);
    const [row] = await db.select().from(dishPhotosTable).where(eq(dishPhotosTable.id, id));
    return row;
  },
  async add(dish) {
    if (!db) return memoryDishStore.add(dish);
    const [row] = await db.insert(dishPhotosTable).values(dish).returning();
    return row;
  },
  async update(id, details) {
    if (!db) return memoryDishStore.update(id, details);
    const [row] = await db
      .update(dishPhotosTable)
      .set({
        title: details.title,
        caption: details.caption,
      })
      .where(eq(dishPhotosTable.id, id))
      .returning();
    return row;
  },
};