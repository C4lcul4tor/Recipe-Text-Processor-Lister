import { useState } from "react";

interface Recipe {
  title: string;
  ingredients: string[];
  steps: string[];
}

export default function App() {
  const [input, setInput] = useState("");
  const [parsed, setParsed] = useState<Recipe | null>(null);
  const [error, setError] = useState("");

  const handleParse = async () => {
    setError("");
    setParsed(null);

    try {
      const response = await fetch("http://localhost:3001/parse-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || "Failed to parse recipe");
      }

      const data = await response.json();
      setParsed(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    }
  };

  const handleClearInput = () => {
    setInput("");
  };

  const handleClearOutput = () => {
    setParsed(null);
    setError("");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 text-gray-900">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-blue-600">
          📝 Recipe Text Processor & Lister
        </h1>

        <textarea
          className="w-full h-40 p-4 border border-gray-300 rounded-md resize-none"
          placeholder={`Paste your recipe here...\n\nTITLE: Pancakes\nING: 2 eggs\nING: 1 cup flour\nSTEP: Mix\nSTEP: Fry`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <div className="flex flex-wrap gap-4">
          <button
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            onClick={handleParse}
          >
            Parse Recipe
          </button>

          <button
            className="bg-gray-300 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-400"
            onClick={handleClearInput}
          >
            Clear Input
          </button>

          <button
            className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600"
            onClick={handleClearOutput}
          >
            Clear Output
          </button>
        </div>

        {error && <div className="text-red-600 font-semibold">{error}</div>}

        {parsed && (
          <div className="bg-white p-4 shadow-md rounded-md">
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
