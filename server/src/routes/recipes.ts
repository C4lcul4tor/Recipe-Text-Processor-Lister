import express, { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();
const dataPath = path.join(__dirname, "..", "data", "recipes.json");

interface Recipe {
  id: string;
  title: string;
  ingredients: string[];
  steps: string[];
}

function loadRecipes(): Recipe[] {
  try {
    const data = fs.readFileSync(dataPath, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

function saveRecipes(recipes: Recipe[]) {
  fs.writeFileSync(dataPath, JSON.stringify(recipes, null, 2), "utf-8");
}

router.get("/", (_req: Request, res: Response) => {
  const recipes = loadRecipes();
  res.json(recipes);
});

router.post("/", (req: Request, res: Response) => {
  const { title, ingredients, steps } = req.body;

  if (!title || !ingredients || !steps) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const recipes = loadRecipes();
  const newRecipe: Recipe = {
    id: uuidv4(),
    title,
    ingredients,
    steps,
  };

  recipes.push(newRecipe);
  saveRecipes(recipes);
  res.status(201).json(newRecipe);
});

router.delete("/:id", (req: Request, res: Response) => {
  const recipes = loadRecipes();
  const updatedRecipes = recipes.filter((r) => r.id !== req.params.id);

  if (recipes.length === updatedRecipes.length) {
    return res.status(404).json({ error: "Recipe not found" });
  }

  saveRecipes(updatedRecipes);
  res.json({ message: "Recipe deleted" });
});

export default router;
