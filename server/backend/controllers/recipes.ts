import { Router, Request, Response } from "express";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const router = Router();
const dataPath = path.join(__dirname, "../../../data/recipes.json");

// Load recipes from JSON file
const loadRecipes = () => {
  if (!fs.existsSync(dataPath)) return [];
  const raw = fs.readFileSync(dataPath, "utf-8");
  return JSON.parse(raw);
};

// Save recipes to JSON file
const saveRecipes = (recipes: any[]) => {
  fs.writeFileSync(dataPath, JSON.stringify(recipes, null, 2));
};

// GET all recipes
router.get("/", (_req: Request, res: Response) => {
  const recipes = loadRecipes();
  res.json(recipes);
});

// POST new recipe
router.post("/", (req: Request, res: Response) => {
  const recipes = loadRecipes();

  const newRecipe = {
    id: uuidv4(),
    title: req.body.title,
    ingredients: req.body.ingredients,
    steps: req.body.steps
  };

  recipes.push(newRecipe);
  saveRecipes(recipes);
  res.status(201).json(newRecipe);
});

// DELETE recipe by ID (with 'r: any' fix)
router.delete("/:id", (req: Request, res: Response) => {
  const recipes = loadRecipes();
  const updated = recipes.filter((r: any) => r.id !== req.params.id);

  if (recipes.length === updated.length) {
    return res.status(404).json({ error: "Recipe not found" });
  }

  saveRecipes(updated);
  res.json({ message: "Deleted" });
});

export default router;
