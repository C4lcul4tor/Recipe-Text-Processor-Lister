import { useEffect, useState } from "react";

interface ShoppingItem {
  id: string;
  name: string;
  checked: boolean;
}

export default function ShoppingList() {
  const [list, setList] = useState<ShoppingItem[]>([]);
  const [newItem, setNewItem] = useState("");

  useEffect(() => {
    fetchList();
  }, []);

  const fetchList = async () => {
    const res = await fetch("http://localhost:3001/shopping-list");
    const data = await res.json();
    setList(data);
  };

  const addItem = async () => {
    if (!newItem.trim()) return;
    const res = await fetch("http://localhost:3001/shopping-list", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newItem }),
    });
    const data = await res.json();
    setList([...list, data]);
    setNewItem("");
  };

  const toggleCheck = async (id: string, checked: boolean) => {
    await fetch(`http://localhost:3001/shopping-list/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checked: !checked }),
    });
    fetchList();
  };

  const deleteItem = async (id: string) => {
    await fetch(`http://localhost:3001/shopping-list/${id}`, {
      method: "DELETE",
    });
    fetchList();
  };

  return (
    <div className="p-4 mt-6 border rounded bg-gray-800 text-white">
      <h2 className="text-xl font-bold mb-3">🛒 Shopping List</h2>
      <div className="flex gap-2 mb-3">
        <input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          className="border p-2 rounded text-black w-full"
          placeholder="Add new item..."
        />
        <button
          onClick={addItem}
          className="bg-green-600 px-4 py-1 rounded hover:bg-green-500"
        >
          Add
        </button>
      </div>
      <ul className="space-y-2">
        {list.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between bg-gray-700 p-2 rounded"
          >
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={item.checked}
                onChange={() => toggleCheck(item.id, item.checked)}
              />
              <span className={item.checked ? "line-through" : ""}>
                {item.name}
              </span>
            </label>
            <button
              onClick={() => deleteItem(item.id)}
              className="text-red-400 hover:text-red-200"
            >
              ✖
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
