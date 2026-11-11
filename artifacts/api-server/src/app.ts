import cors from "cors";
import express from "express";
import router from "./router";

const app = express();

app.disable("x-powered-by");
app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/api", router);

export default app;