import app from "./app";
import { logger } from "./lib/logger";

const port = Number(process.env.PORT ?? 5000);

app.listen(port, "0.0.0.0", () => {
  logger.info({ port }, "API server listening");
});

export default app;