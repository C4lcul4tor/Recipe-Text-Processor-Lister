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
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [search, setSearch] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      const res = await fetch("http://localhost:3001/recipes");
      const data = await res.json();
      setSavedRecipes(data);
    } catch (err) {
      console.error("Failed to fetch recipes", err);
    }
  };

  const handleParse = async () => {
    if (!title.trim() || ingredients.some(i => !i.trim()) || steps.some(s => !s.trim())) {
      alert("Please fill in all fields before parsing.");
      return;
    }

    const text = `TITLE: ${title}\n${ingredients.map(i => `ING: ${i}`).join("\n")}\n${steps.map(s => `STEP: ${s}`).join("\n")}`;

    try {
      const res = await fetch("http://localhost:3001/parse-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      setParsed(data);
    } catch (err: any) {
      alert("Parsing failed.");
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
      const data = await res.json();
      setSavedRecipes([...savedRecipes, data]);
      clearAll();
    } catch (err) {
      console.error("Save failed", err);
    }
  };

  const deleteRecipe = async (id: string) => {
    try {
      await fetch(`http://localhost:3001/recipes/${id}`, { method: "DELETE" });
      setSavedRecipes(savedRecipes.filter(r => r.id !== id));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const addIngredient = () => setIngredients([...ingredients, ""]);
  const addStep = () => setSteps([...steps, ""]);
  const updateIngredient = (i: number, val: string) => {
    const copy = [...ingredients];
    copy[i] = val;
    setIngredients(copy);
  };
  const updateStep = (i: number, val: string) => {
    const copy = [...steps];
    copy[i] = val;
    setSteps(copy);
  };
  const removeIngredient = (i: number) => setIngredients(ingredients.filter((_, idx) => idx !== i));
  const removeStep = (i: number) => setSteps(steps.filter((_, idx) => idx !== i));
  const clearAll = () => {
    setTitle("");
    setIngredients([""]);
    setSteps([""]);
    setParsed(null);
  };
  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const handleAskAI = async () => {
    if (!aiPrompt.trim()) return;
    setAiResponse("Loading...");

    try {
      const res = await fetch("http://localhost:3001/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      });

      const data = await res.json();

      if (res.ok && data.reply) {
        setAiResponse(data.reply);
      } else if (data.error) {
        console.error("❌ AI Error Response:", data);
        setAiResponse("❌ " + (data.error || "Unknown error"));
      } else {
        setAiResponse("No valid response from AI.");
      }
    } catch (err) {
      console.error("❌ Fetch Error:", err);
      setAiResponse("AI request failed.");
    }
  };

  const filteredRecipes = savedRecipes.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">📝 Recipe Text Processor & Lister</h1>

        <div className="bg-white rounded-xl shadow p-4 mb-8">
          <div className="mb-4">
            <label className="block font-semibold">💗 Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} className="w-full border p-2 rounded" />
          </div>

          <div className="mb-4">
            <label className="block font-semibold">🧂 Ingredients</label>
            {ingredients.map((ing, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input value={ing} onChange={e => updateIngredient(i, e.target.value)} className="flex-1 border p-2 rounded" />
                <button onClick={() => removeIngredient(i)} className="text-red-500 font-bold">✖</button>
              </div>
            ))}
            <button onClick={addIngredient} className="text-blue-500 font-semibold">➕ Add Ingredient</button>
          </div>

          <div className="mb-4">
            <label className="block font-semibold">👨‍🍳 Steps</label>
            {steps.map((step, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input value={step} onChange={e => updateStep(i, e.target.value)} className="flex-1 border p-2 rounded" />
                <button onClick={() => removeStep(i)} className="text-red-500 font-bold">✖</button>
              </div>
            ))}
            <button onClick={addStep} className="text-blue-500 font-semibold">➕ Add Step</button>
          </div>

          <div className="flex gap-4 mt-4">
            <button onClick={handleParse} className="bg-blue-600 text-white px-4 py-2 rounded">Parse</button>
            <button onClick={clearAll} className="bg-gray-400 text-white px-4 py-2 rounded">Clear</button>
            {parsed && (
              <button onClick={saveParsedRecipe} className="bg-green-600 text-white px-4 py-2 rounded">💾 Save</button>
            )}
          </div>
        </div>

        {/* Parsed Recipe Preview */}
        {parsed && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8">
            <h2 className="text-lg font-bold mb-2">📋 Parsed Recipe Preview</h2>
            <div className="space-y-2">
              <div><strong>Title:</strong> {parsed.title}</div>
              <div><strong>Ingredients:</strong> {parsed.ingredients.join(", ")}</div>
              <div><strong>Steps:</strong> {parsed.steps.join(" → ")}</div>
            </div>
          </div>
        )}

        {/* AI Assistant */}
        <div className="bg-white rounded-xl shadow p-4 mb-8">
          <h2 className="text-lg font-bold mb-2">🧠 Ask the AI</h2>
          <div className="flex gap-2 mb-2">
            <input
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g. Suggest 2 quick vegan breakfasts"
              className="w-full border p-2 rounded"
              onKeyPress={(e) => e.key === 'Enter' && handleAskAI()}
            />
            <button onClick={handleAskAI} className="bg-purple-600 text-white px-4 py-2 rounded">Ask</button>
          </div>
          {aiResponse && (
            <div className="bg-gray-100 border rounded p-3 whitespace-pre-wrap text-sm">{aiResponse}</div>
          )}
        </div>

        <div className="mb-6">
          <input
            placeholder="🔍 Search recipes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {filteredRecipes.map((r) => (
            <div key={r.id} className="bg-white p-4 rounded-lg shadow-md space-y-3">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-green-700">{r.title}</h2>
                <div className="space-x-3">
                  <button onClick={() => copyText(r.ingredients.join(", "))} className="text-sm text-blue-600 hover:underline">📋 Copy Ingredients</button>
                  <button onClick={() => deleteRecipe(r.id!)} className="text-sm text-red-600 hover:underline">🗑 Delete</button>
                </div>
              </div>

              <div>
                <h3 className="font-semibold">🧂 Ingredients:</h3>
                <ul className="list-disc list-inside text-sm">
                  {r.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold">👨‍🍳 Steps:</h3>
                <ol className="list-decimal list-inside text-sm">
                  {r.steps.map((s, i) => <li key={i}>{s}</li>)}
                </ol>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}