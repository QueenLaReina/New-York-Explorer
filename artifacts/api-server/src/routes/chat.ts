import { Router, type IRouter } from "express";
import { city } from "../city";
import { AiError, askGemini } from "../lib/gemini";
import { ChatRequest, withDefaults } from "../lib/ChatRequests";
import { buildCityGuidePrompt } from "../lib/prompts";

const router: IRouter = Router();

router.get("/chat/system-prompt", (_req, res) => {
  res.json({ systemPrompt: buildCityGuidePrompt(city) });
});

router.post("/chat", async (req, res) => {
  const parsed = ChatRequest.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid chat request." });
    return;
  }

  try {
    const settings = withDefaults(parsed.data.settings);
    const response = await askGemini({
      system: buildCityGuidePrompt(city),
      message: parsed.data.message,
      history: parsed.data.history,
      temperature: settings.temperature,
      topP: settings.topP,
      maxOutputTokens: settings.maxOutputTokens,
    });

    res.json({
      reply: response.text,
      settings,
      usage: response.usage,
    });
  } catch (error) {
    const message = error instanceof AiError ? error.message : "The guide could not answer right now.";
    const status = error instanceof AiError ? error.status : 500;
    res.status(status).json({ error: message });
  }
});

export default router;
