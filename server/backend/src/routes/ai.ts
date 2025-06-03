import express, { Request, Response } from "express";
import { OpenAI } from "openai";

const router = express.Router();

const apiKey = process.env.OPENROUTER_API_KEY;

if (!apiKey) {
  console.error("❌ Missing OpenRouter API key in .env");
  throw new Error("Missing OpenRouter API key");
}

const openai = new OpenAI({
  apiKey: apiKey,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3000", 
    "X-Title": "Recipe Text Processor"
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;

    const chat = await openai.chat.completions.create({
      model: "openrouter/openai/gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that formats recipe text."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

    const message = chat.choices[0]?.message?.content || "No response.";
    res.json({ response: message });
  } catch (error) {
    console.error("❌ Error in /ai route:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
