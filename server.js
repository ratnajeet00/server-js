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
      } else if (!row || !row.sql.includes("email")) {
        console.log("Updating users table structure...");
        db.run("ALTER TABLE users ADD COLUMN email VARCHAR", (err) => {
          if (err) {
            console.error("Error updating users table:", err);
          } else {
            console.log("Users table structure updated successfully");
          }
        });
      } else {
        console.log("Users table already exists with the expected structure");
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

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
