import { useState } from "react";

interface Recipe {
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

  // Assemble text in backend-expected format
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

  return (
    <div className="min-h-screen bg-gray-50 p-6 text-gray-900">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-blue-600">📝 Recipe Text Processor & Lister</h1>

        {/* Title Input */}
        <div>
          <label className="block font-semibold mb-1">📛 Title:</label>
          <input
            className="w-full p-2 border border-gray-300 rounded-md"
            type="text"
            placeholder="e.g. Chocolate Cake"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Ingredients Input */}
        <div>
          <label className="block font-semibold mb-1">🧂 Ingredients:</label>
          {ingredients.map((ing, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input
                className="flex-1 p-2 border border-gray-300 rounded-md"
                type="text"
                value={ing}
                placeholder={`Ingredient ${i + 1}`}
                onChange={(e) => updateIngredient(i, e.target.value)}
              />
              <button
                className="text-red-600 font-bold"
                onClick={() => removeIngredient(i)}
              >
                ✖
              </button>
            </div>
          ))}
          <button
            className="mt-1 text-blue-600 font-semibold"
            onClick={addIngredient}
          >
            ➕ Add Ingredient
          </button>
        </div>

        {/* Steps Input */}
        <div>
          <label className="block font-semibold mb-1">👨‍🍳 Steps:</label>
          {steps.map((step, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input
                className="flex-1 p-2 border border-gray-300 rounded-md"
                type="text"
                value={step}
                placeholder={`Step ${i + 1}`}
                onChange={(e) => updateStep(i, e.target.value)}
              />
              <button
                className="text-red-600 font-bold"
                onClick={() => removeStep(i)}
              >
                ✖
              </button>
            </div>
          ))}
          <button
            className="mt-1 text-blue-600 font-semibold"
            onClick={addStep}
          >
            ➕ Add Step
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-4">
          <button
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            onClick={handleParse}
          >
            Parse Recipe
          </button>
          <button
            className="bg-gray-400 text-white px-6 py-2 rounded hover:bg-gray-500"
            onClick={clearAll}
          >
            Clear All
          </button>
        </div>

        {/* Error Message */}
        {error && <div className="text-red-600 font-semibold">{error}</div>}

        {/* Parsed Result */}
        {parsed && (
          <div className="bg-white p-4 shadow-md rounded-md mt-6">
            <h2 className="text-2xl font-semibold mb-2 text-green-600">
              {parsed.title}
            </h2>

            <div className="mb-4">
              <h3 className="font-semibold">🧂 Ingredients:</h3>
              <ul className="list-disc list-inside">
                {parsed.ingredients.map((ing, index) => (
                  <li key={index}>{ing}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold">👨‍🍳 Steps:</h3>
              <ol className="list-decimal list-inside">
                {parsed.steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
