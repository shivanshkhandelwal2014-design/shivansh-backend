const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// ===== TEMP DATABASE =====
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

    const newUser = {
      _id: Date.now().toString(),
      username,
      password,
      credits: 0,
      isSuperAdmin: false
    };

    users.push(newUser);
    res.json({ message: "Registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ===== GENERATE KEYS =====
app.post("/keys/generate", (req, res) => {
  try {
    const {
      numberOfKeys,
      buyer_name,
      expiry_date,
      adminUsername
    } = req.body;

    let generated = [];

    const cleanName = buyer_name.replace(/\s+/g, '').toLowerCase();

    for (let i = 0; i < numberOfKeys; i++) {
      const randomPart = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();

      const key = `${cleanName}-${randomPart}`;

      const newKey = {
        _id: Date.now().toString() + i,
        key_value: key,
        buyer_name,
        expiry_date,
        created_by: adminUsername || "admin"
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
  try {
    const { username, isSuper } = req.query;

    if (isSuper === "true") {
      return res.json(keys);
    }

    const filteredKeys = keys.filter(
      k => k.created_by === username
    );

    res.json(filteredKeys);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ===== DELETE KEY =====
app.delete("/keys/:id", (req, res) => {
  keys = keys.filter(k => k._id !== req.params.id);
  res.json({ message: "Key deleted" });
});

// ===== UPDATE KEY =====
app.put("/keys/:id", (req, res) => {
  const { buyer_name, expiry_date, device_limit } = req.body;

  const key = keys.find(k => k._id === req.params.id);

  if (key) {
    key.buyer_name = buyer_name;
    key.expiry_date = expiry_date;
    key.device_limit = device_limit;
  }

  res.json({ message: "Key updated" });
});


// ==============================
// 🔥 RESELLER SYSTEM (FULL FIX)
// ==============================

// GET ALL RESELLERS (users hi return karenge)
app.get("/resellers", (req, res) => {
  const resellers = users.filter(u => !u.isSuperAdmin);
  res.json(resellers);
});

// ADD CREDITS
app.post("/resellers/add-credits", (req, res) => {
  try {
    const { resellerId, amountToAdd } = req.body;

    const user = users.find(u => u._id == resellerId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.credits += amountToAdd;

    res.json({ message: "Credits added" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE RESELLER
app.delete("/resellers/:id", (req, res) => {
  users = users.filter(u => u._id != req.params.id);
  res.json({ message: "Reseller deleted" });
});

// PROMOTE TO SUPER ADMIN
app.post("/admins/promote", (req, res) => {
  try {
    const { targetAdminId } = req.body;

    const user = users.find(u => u._id == targetAdminId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isSuperAdmin = true;

    res.json({ message: "Promoted to Super Admin" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ==============================


// ===== ROOT =====
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

// ===== START SERVER =====
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});