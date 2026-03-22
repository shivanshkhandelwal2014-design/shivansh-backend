const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// PORT (Render compatible)
const PORT = process.env.PORT || 3000;

// ===== Dummy Database =====
let users = [
  {
    _id: "1",
    username: "admin",
    password: "123",
    credits: 1000,
    isSuperAdmin: true
  }
];

let keys = [];

// ===== LOGIN =====
app.post("/login", (req, res) => {
  try {
    const { username, password } = req.body;

    const user = users.find(
      u => u.username === username && u.password === password
    );

    if (!user) {
      return res.status(401).json({ message: "Invalid login" });
    }

    res.json({ admin: user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ===== REGISTER =====
app.post("/register", (req, res) => {
  try {
    const { username, password } = req.body;

    users.push({
      _id: Date.now().toString(),
      username,
      password,
      credits: 0,
      isSuperAdmin: false
    });

    res.json({ message: "Registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ===== GENERATE KEYS =====
app.post("/keys/generate", (req, res) => {
  try {
    const { numberOfKeys, buyer_name, expiry_date } = req.body;

    let generated = [];

    for (let i = 0; i < numberOfKeys; i++) {
      const key = "KEY-" + Math.random().toString(36).substring(2, 8).toUpperCase();

      const newKey = {
        _id: Date.now().toString() + i,
        key_value: key,
        buyer_name,
        expiry_date
      };

      keys.push(newKey);
      generated.push(key);
    }

    res.json({
      keys: generated,
      newCreditCount: 999
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ===== GET KEYS =====
app.get("/keys", (req, res) => {
  res.json(keys);
});

// ===== DELETE KEY =====
app.delete("/keys/:id", (req, res) => {
  keys = keys.filter(k => k._id !== req.params.id);
  res.json({ message: "Key deleted" });
});

// ===== UPDATE KEY =====
app.put("/keys/:id", (req, res) => {
  const { buyer_name, expiry_date } = req.body;

  const key = keys.find(k => k._id === req.params.id);

  if (key) {
    key.buyer_name = buyer_name;
    key.expiry_date = expiry_date;
  }

  res.json({ message: "Key updated" });
});

// ===== ROOT TEST =====
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

// ===== START SERVER =====
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});