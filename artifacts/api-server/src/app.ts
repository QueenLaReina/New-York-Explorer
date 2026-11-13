import cors from "cors";
import express from "express";
import router from "./router";

const app = express();

app.disable("x-powered-by");
app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/api", router);

app.use((error: unknown, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (
    typeof error === "object" &&
    error !== null &&
    "type" in error &&
    error.type === "entity.too.large"
  ) {
    res.status(413).json({
      error: "Photo request is too large. Keep the image under 3 MB.",
    });
    return;
  }
  next(error);
});

export default app;