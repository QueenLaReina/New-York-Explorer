import { Router, type IRouter } from "express";
import healthRouter from "./routes/health";
import chatRouter from "./routes/chat";
import dishesRouter from "./routes/dishes";

const router: IRouter = Router();

router.use(healthRouter);
router.use(chatRouter);
router.use(dishesRouter);

export default router;
