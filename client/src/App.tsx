import { useEffect, useState } from "react";

interface Recipe {
  id?: string;
  title: string;
  ingredients: string[];
  steps: string[];
}

export default function App() {
  const [title, setTitle] = useState("");
  const [ingredients, setIngredients] = useState([""]);
  const [steps, setSteps] = useState([""]);
  const [parsed, setParsed] = useState<Recipe | null>(null);
  const [error, setError] = useState("");
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);

  const buildRecipeText = () => {
    let text = `TITLE: ${title}\n`;
    ingredients.forEach((ing) => {
      if (ing.trim()) text += `ING: ${ing.trim()}\n`;
    });
    steps.forEach((step) => {
      if (step.trim()) text += `STEP: ${step.trim()}\n`;
    });
    return text.trim();
  };

  const handleParse = async () => {
    setError("");
    setParsed(null);
    const text = buildRecipeText();

    try {
      const response = await fetch("http://localhost:3001/parse-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || "Parsing failed");
      }

      const data = await response.json();
      setParsed(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchSavedRecipes = async () => {
    try {
      const res = await fetch("http://localhost:3001/recipes");
      const data = await res.json();
      setSavedRecipes(data);
    } catch (err) {
      console.error("Failed to fetch recipes", err);
    }
  };

  const saveParsedRecipe = async () => {
    if (!parsed) return;
    try {
      const res = await fetch("http://localhost:3001/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });
      const newRecipe = await res.json();
      setSavedRecipes([...savedRecipes, newRecipe]);
    } catch (err) {
      console.error("Failed to save recipe", err);
    }
  };

  const deleteRecipe = async (id: string) => {
    try {
      await fetch(`http://localhost:3001/recipes/${id}`, {
        method: "DELETE",
      });
      setSavedRecipes(savedRecipes.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Failed to delete recipe", err);
    }
  };

  const loadRecipe = (recipe: Recipe) => {
    setTitle(recipe.title);
    setIngredients(recipe.ingredients);
    setSteps(recipe.steps);
    setParsed(recipe);
  };

  const addIngredient = () => setIngredients([...ingredients, ""]);
  const addStep = () => setSteps([...steps, ""]);

  const updateIngredient = (index: number, value: string) => {
    const updated = [...ingredients];
    updated[index] = value;
    setIngredients(updated);
  };

  const updateStep = (index: number, value: string) => {
    const updated = [...steps];
    updated[index] = value;
    setSteps(updated);
  };

  const removeIngredient = (index: number) => {
    const updated = ingredients.filter((_, i) => i !== index);
    setIngredients(updated.length ? updated : [""]);
  };

  const removeStep = (index: number) => {
    const updated = steps.filter((_, i) => i !== index);
    setSteps(updated.length ? updated : [""]);
  };

  const clearAll = () => {
    setTitle("");
    setIngredients([""]);
    setSteps([""]);
    setParsed(null);
    setError("");
  };

  useEffect(() => {
    fetchSavedRecipes();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6 text-gray-900">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-blue-600">📝 Recipe Text Processor & Lister</h1>

        {/* Title */}
        <div>
          <label className="block font-semibold mb-1">💗 Title:</label>
          <input
            className="w-full p-2 border border-gray-300 rounded-md"
            type="text"
            value={title}
            placeholder="e.g. Chocolate Cake"
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Ingredients */}
        <div>
          <label className="block font-semibold mb-1">🧂 Ingredients:</label>
          {ingredients.map((ing, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input
                className="flex-1 p-2 border border-gray-300 rounded-md"
                type="text"
                value={ing}
                onChange={(e) => updateIngredient(i, e.target.value)}
              />
              <button onClick={() => removeIngredient(i)} className="text-purple-600 font-bold">✖</button>
            </div>
          ))}
          <button onClick={addIngredient} className="text-blue-600 font-semibold mt-1">➕ Add Ingredient</button>
        </div>

        {/* Steps */}
        <div>
          <label className="block font-semibold mb-1">👨‍🍳 Steps:</label>
          {steps.map((step, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input
                className="flex-1 p-2 border border-gray-300 rounded-md"
                type="text"
                value={step}
                onChange={(e) => updateStep(i, e.target.value)}
              />
              <button onClick={() => removeStep(i)} className="text-purple-600 font-bold">✖</button>
            </div>
          ))}
          <button onClick={addStep} className="text-blue-600 font-semibold mt-1">➕ Add Step</button>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 mt-4 flex-wrap">
          <button onClick={handleParse} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
            Add Recipe
          </button>
          <button onClick={clearAll} className="bg-gray-400 text-white px-6 py-2 rounded hover:bg-gray-500">
            Clear All
          </button>
          {parsed && (
            <button onClick={saveParsedRecipe} className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
              💾 Save Recipe
            </button>
          )}
        </div>

        {/* Error */}
        {error && <div className="text-red-600 font-semibold">{error}</div>}

        {/* Parsed Output */}
        {parsed && (
          <div className="bg-white p-4 shadow-md rounded-md mt-6">
            <h2 className="text-2xl font-semibold mb-2 text-green-600">{parsed.title}</h2>
            <div className="mb-4">
              <h3 className="font-semibold">🧂 Ingredients:</h3>
              <ul className="list-disc list-inside">
                {parsed.ingredients.map((ing, index) => <li key={index}>{ing}</li>)}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold">👨‍🍳 Steps:</h3>
              <ol className="list-decimal list-inside">
                {parsed.steps.map((step, index) => <li key={index}>{step}</li>)}
              </ol>
            </div>
          </div>
        )}

        {/* Saved Recipes */}
        {savedRecipes.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-bold mb-2">📚 Saved Recipes</h2>
            <ul className="space-y-2">
              {savedRecipes.map((recipe) => (
                <li key={recipe.id} className="flex justify-between items-center bg-white p-3 shadow-sm rounded-md">
                  <span className="font-medium text-gray-800">{recipe.title}</span>
                  <div className="space-x-3">
                    <button onClick={() => loadRecipe(recipe)} className="text-blue-600 hover:underline">View</button>
                    <button onClick={() => deleteRecipe(recipe.id!)} className="text-red-600 hover:underline">Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
