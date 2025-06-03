// test-openrouter.ts
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.OPENROUTER_API_KEY;

console.log("🔑 Loaded API key (first 6 chars):", apiKey?.slice(0, 6));

(async () => {
  if (!apiKey) {
    console.error("❌ API key not loaded from .env");
    return;
  }

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-3.5-turbo",
        messages: [{ role: "user", content: "Say hello!" }],
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ OpenRouter reply:", response.data.choices?.[0]?.message?.content || "No response");
  } catch (err: any) {
    console.error("❌ OpenRouter API error:", err.response?.data || err.message);
  }
})();
