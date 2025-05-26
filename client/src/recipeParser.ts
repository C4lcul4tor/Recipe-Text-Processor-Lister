// backend/src/recipeParser.ts
export interface Recipe {
  ingredients: string[];
  steps: string[];
}

export function parseRecipe(text: string): Recipe {
  const ingredients: string[] = [];
  const steps: string[] = [];

  const lines = text.split('\n');
  for (const line of lines) {
    if (line.startsWith("ING:")) {
      ingredients.push(line.replace("ING:", "").trim());
    } else if (line.startsWith("STEP:")) {
      steps.push(line.replace("STEP:", "").trim());
    }
  }

  return { ingredients, steps };
}
