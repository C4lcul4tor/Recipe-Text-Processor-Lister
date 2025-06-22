import express from "express";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();
const dataPath = path.join(__dirname, "../../../data/shopping_list.json");

// Ensure file exists
if (!fs.existsSync(dataPath)) {
  fs.writeFileSync(dataPath, JSON.stringify([]));
}

// GET shopping list
router.get("/", (req, res) => {
  const data = fs.readFileSync(dataPath, "utf-8");
  res.json(JSON.parse(data));
});

// POST add item
router.post("/", (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Item name is required" });

  const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
  const newItem = { id: uuidv4(), name, checked: false };
  data.push(newItem);
  fs.writeFileSync(dataPath, JSON.stringify(data));
  res.json(newItem);
});

// PUT toggle check
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { checked } = req.body;

  let data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
  data = data.map((item: any) =>
    item.id === id ? { ...item, checked } : item
  );
  fs.writeFileSync(dataPath, JSON.stringify(data));
  res.json({ success: true });
});

// DELETE item
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  let data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
  data = data.filter((item: any) => item.id !== id);
  fs.writeFileSync(dataPath, JSON.stringify(data));
  res.json({ success: true });
});

export default router;
