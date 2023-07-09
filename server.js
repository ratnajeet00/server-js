const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const dbPath = path.join(__dirname, "user.db"); // Path to the SQLite database file

const db = new sqlite3.Database(dbPath);

// Check if the users table exists and verify the structure
db.serialize(() => {
  db.get(
    "SELECT sql FROM sqlite_master WHERE type='table' AND name='users'",
    (err, row) => {
      if (err) {
        console.error("Error checking if users table exists:", err);
      } else {
        const expectedUsersSchema = `
          CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT,
            password TEXT,
            email VARCHAR
          )
        `;
        if (!row || row.sql !== expectedUsersSchema) {
          console.log("Updating users table structure...");
          db.run("DROP TABLE IF EXISTS users");
          db.run(expectedUsersSchema);
          console.log("Users table created or updated successfully");
        } else {
          console.log("Users table already exists with the expected structure");
        }
      }
    }
  );

  db.get(
    "SELECT sql FROM sqlite_master WHERE type='table' AND name='inventory'",
    (err, row) => {
      if (err) {
        console.error("Error checking if inventory table exists:", err);
      } else {
        const expectedInventorySchema = `
          CREATE TABLE inventory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            item_name TEXT,
            quantity INTEGER,
            price REAL
          )
        `;
        if (!row || row.sql !== expectedInventorySchema) {
          console.log("Updating inventory table structure...");
          db.run("DROP TABLE IF EXISTS inventory");
          db.run(expectedInventorySchema);
          console.log("Inventory table created or updated successfully");
        } else {
          console.log("Inventory table already exists with the expected structure");
        }
      }
    }
  );
});

// Add a new user
app.post("/addUser", (req, res) => {
  const { username, password, email } = req.body;

  if (username && password && email) {
    db.run(
      "INSERT INTO users (username, password, email) VALUES (?, ?, ?)",
      [username, password, email],
      function (err) {
        if (err) {
          console.error("Error during user creation:", err);
          res.status(500).json({ message: "Internal server error" });
        } else {
          res.status(200).json({ message: "User created successfully" });
        }
      }
    );
  } else {
    res.status(400).json({ message: "Invalid username, password, or email" });
  }
});

// Retrieve the list of users
app.get("/userList", (req, res) => {
  db.all("SELECT * FROM users", (err, rows) => {
    if (err) {
      console.error("Error retrieving user list:", err);
      res.status(500).json({ message: "Internal server error" });
    } else {
      res.json(rows);
    }
  });
});

// Remove a user
app.post("/removeUser", (req, res) => {
  const { username } = req.body;

  db.run(
    "DELETE FROM users WHERE username = ?",
    [username],
    function (err) {
      if (err) {
        console.error("Error during user removal:", err);
        res.status(500).json({ message: "Internal server error" });
      } else if (this.changes > 0) {
        res.status(200).json({ message: "User removed successfully" });
      } else {
        res.status(404).json({ message: "User not found" });
      }
    }
  );
});

// Add a new inventory item
app.post("/addInventoryItem", (req, res) => {
  const { item_name, quantity, price } = req.body;

  if (item_name && quantity && price) {
    db.run(
      "INSERT INTO inventory (item_name, quantity, price) VALUES (?, ?, ?)",
      [item_name, quantity, price],
      function (err) {
        if (err) {
          console.error("Error during inventory item creation:", err);
          res.status(500).json({ message: "Internal server error" });
        } else {
          res.status(200).json({ message: "Inventory item created successfully" });
        }
      }
    );
  } else {
    res.status(400).json({ message: "Invalid item name, quantity, or price" });
  }
});

// Retrieve the list of inventory items
app.get("/inventoryList", (req, res) => {
  db.all("SELECT * FROM inventory", (err, rows) => {
    if (err) {
      console.error("Error retrieving inventory list:", err);
      res.status(500).json({ message: "Internal server error" });
    } else {
      res.json(rows);
    }
  });
});

// Remove an inventory item
app.post("/removeInventoryItem", (req, res) => {
  const { id } = req.body;

  db.run(
    "DELETE FROM inventory WHERE id = ?",
    [id],
    function (err) {
      if (err) {
        console.error("Error during inventory item removal:", err);
        res.status(500).json({ message: "Internal server error" });
      } else if (this.changes > 0) {
        res.status(200).json({ message: "Inventory item removed successfully" });
      } else {
        res.status(404).json({ message: "Inventory item not found" });
      }
    }
  );
});

// Update an inventory item
app.post("/updateInventoryItem", (req, res) => {
  const { id, item_name, quantity, price } = req.body;

  if (id && item_name && quantity && price) {
    db.run(
      "UPDATE inventory SET item_name = ?, quantity = ?, price = ? WHERE id = ?",
      [item_name, quantity, price, id],
      function (err) {
        if (err) {
          console.error("Error during inventory item update:", err);
          res.status(500).json({ message: "Internal server error" });
        } else if (this.changes > 0) {
          res.status(200).json({ message: "Inventory item updated successfully" });
        } else {
          res.status(404).json({ message: "Inventory item not found" });
        }
      }
    );
  } else {
    res.status(400).json({ message: "Invalid item ID, name, quantity, or price" });
  }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
