import fs from "fs";
import path from "path";

const filePath = path.join(__dirname, "../../data/recipes.json");

export const loadRecipes = () => {
  if (!fs.existsSync(filePath)) return [];
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
};

export const saveRecipes = (recipes: any[]) => {
  fs.writeFileSync(filePath, JSON.stringify(recipes, null, 2));
};
