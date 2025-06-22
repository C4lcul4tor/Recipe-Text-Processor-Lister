import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import 'dotenv/config';
import shoppingListRoutes from "./routes/shoppingList";

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

// ✅ Ensure shopping_list.json exists
const shoppingDataPath = path.join(__dirname, "../../data/shopping_list.json");
if (!fs.existsSync(shoppingDataPath)) {
  fs.writeFileSync(shoppingDataPath, JSON.stringify([]));
}

// ✅ Mount the shopping list API route
app.use("/shopping-list", shoppingListRoutes);

// Recipe interface
interface Recipe {
  id: string;
  title: string;
  ingredients: string[];
  steps: string[];
}

// In-memory storage for recipes (replace with database in production)
let recipes: Recipe[] = [];
let recipeIdCounter = 1;

// Recipe endpoints
app.get("/recipes", (req: express.Request, res: express.Response) => {
  res.json(recipes);
});

app.post("/recipes", (req: express.Request, res: express.Response) => {
  const recipe: Recipe = {
    id: recipeIdCounter.toString(),
    title: req.body.title || "",
    ingredients: req.body.ingredients || [],
    steps: req.body.steps || []
  };
  recipeIdCounter++;
  recipes.push(recipe);
  res.json(recipe);
});

app.delete("/recipes/:id", (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  recipes = recipes.filter((r: Recipe) => r.id !== id);
  res.json({ success: true });
});

// Parse recipe endpoint
app.post("/parse-recipe", (req: express.Request, res: express.Response) => {
  const { text } = req.body;

  const lines: string[] = text.split('\n');
  let title = '';
  const ingredients: string[] = [];
  const steps: string[] = [];

  lines.forEach((line: string) => {
    if (line.startsWith('TITLE:')) {
      title = line.replace('TITLE:', '').trim();
    } else if (line.startsWith('ING:')) {
      ingredients.push(line.replace('ING:', '').trim());
    } else if (line.startsWith('STEP:')) {
      steps.push(line.replace('STEP:', '').trim());
    }
  });

  res.json({ title, ingredients, steps });
});

// AI endpoint
app.post("/ai", async (req: express.Request, res: express.Response) => {
  const { prompt } = req.body;

  if (!process.env.OPENROUTER_API_KEY) {
    return res.status(500).json({ error: "Missing OpenRouter API key in .env" });
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Recipe App"
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500
      })
    });

    const data: any = await response.json();

    if (!response.ok) {
      console.error("OpenRouter API error:", data);
      return res.status(response.status).json({
        error: data.error?.message || data.error || "AI request failed"
      });
    }

    const reply = data.choices?.[0]?.message?.content || "No reply from AI";
    res.json({ reply });
  } catch (err: any) {
    console.error("AI error:", err);
    res.status(500).json({ error: "OpenRouter API connection error" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
