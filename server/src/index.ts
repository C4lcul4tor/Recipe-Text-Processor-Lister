// src/index.ts
import express from "express";
import cors from "cors";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("✅ Recipe Text Processor & Lister API is running.");
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
