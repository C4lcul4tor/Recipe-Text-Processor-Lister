import express, { Request, Response } from "express";
import cors from "cors";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

interface Recipe {
  title: string;
  ingredients: string[];
  steps: string[];
}

function parseRecipe(text: string): Recipe {
  const lines = text.split("\n");
  let title = "";
  const ingredients: string[] = [];
  const steps: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("TITLE:")) {
      title = trimmed.replace("TITLE:", "").trim();
    } else if (trimmed.startsWith("ING:")) {
      ingredients.push(trimmed.replace("ING:", "").trim());
    } else if (trimmed.startsWith("STEP:")) {
      steps.push(trimmed.replace("STEP:", "").trim());
    }
  }

  return { title, ingredients, steps };
}

app.get("/", (_req: Request, res: Response) => {
  res.send("✅ Recipe Text Processor & Lister API is running.");
});

app.post("/parse-recipe", (req: Request, res: Response) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Missing 'text' in request body" });
  }

  try {
    const parsed = parseRecipe(text);
    res.json(parsed);
  } catch (error) {
    res.status(500).json({ error: "Failed to parse recipe" });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
import recipeRoutes from "./routes/recipes";
app.use("/recipes", recipeRoutes);
