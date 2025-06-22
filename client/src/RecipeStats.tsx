import React from "react";

interface Recipe {
  id?: string;
  title: string;
  ingredients: string[];
  steps: string[];
}

interface Props {
  recipes: Recipe[];
}

const RecipeStats: React.FC<Props> = ({ recipes }) => {
  const total = recipes.length;
  const avgIngredients = total > 0
    ? Math.round(recipes.reduce((sum, r) => sum + r.ingredients.length, 0) / total)
    : 0;
  const avgSteps = total > 0
    ? Math.round(recipes.reduce((sum, r) => sum + r.steps.length, 0) / total)
    : 0;

  return (
    <div className="bg-white rounded-xl shadow p-4 mb-8">
      <h2 className="text-lg font-bold mb-2">📊 Recipe Stats</h2>
      <p>Total Recipes: <strong>{total}</strong></p>
      <p>Avg. Ingredients per Recipe: <strong>{avgIngredients}</strong></p>
      <p>Avg. Steps per Recipe: <strong>{avgSteps}</strong></p>
    </div>
  );
};

export default RecipeStats;
