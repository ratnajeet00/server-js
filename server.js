const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const dbPath = path.join(__dirname, "user.db"); // Path to the SQLite database file

const db = new sqlite3.Database(dbPath);

// Function to check and update table structure
function checkAndUpdateTableStructure(tableName, tableStructure) {
  const existingTableStructureQuery = `SELECT sql FROM sqlite_master WHERE type='table' AND name='${tableName}'`;

  db.get(existingTableStructureQuery, (err, row) => {
    if (err) {
      console.error(`Error checking if ${tableName} table exists:`, err);
    } else {
      const existingTableStructure =
        row && row.sql ? row.sql.toLowerCase() : "";
      const newTableStructure = tableStructure.toLowerCase();

      if (existingTableStructure !== newTableStructure) {
        console.log(`Updating ${tableName} table structure...`);
        const dropTableQuery = `DROP TABLE IF EXISTS ${tableName}`;

        db.run(dropTableQuery, (err) => {
          if (err) {
            console.error(`Error dropping ${tableName} table:`, err);
          } else {
            const createTableQuery = tableStructure;

            db.run(createTableQuery, (err) => {
              if (err) {
                console.error(`Error creating ${tableName} table:`, err);
              } else {
                console.log(
                  `Updated ${tableName} table structure successfully`
                );
                createDefaultAdminUser(); // Call the function to create the default admin user
              }
            });
          }
        });
      } else {
        console.log(`${tableName} table structure is up to date`);
        createDefaultAdminUser(); // Call the function to create the default admin user
      }
    }
  });
}
// Check and update table structures
checkAndUpdateTableStructure(
  "items",
  `
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_name VARCHAR,
    quantity INTEGER,
    date_of_expiry DATE,
    date_of_manufacture DATE,
    type VARCHAR
  )
`
);

checkAndUpdateTableStructure(
  "orders",
  `
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name VARCHAR,
    item_name VARCHAR,
    date_of_order DATE,
    quantity INTEGER,
    date_of_delivery DATE
  )
`
);

checkAndUpdateTableStructure(
  "orders",
  `
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name VARCHAR,
    chemical_name VARCHAR,
    date_of_order DATE,
    quantity INTEGER,
    date_of_delivery DATE
  )
`
);

// Function to create the default admin user
function createDefaultAdminUser() {
  // Add default admin user if it doesn't exist
  db.get("SELECT * FROM users WHERE username = 'admin'", (err, row) => {
    if (err) {
      console.error("Error checking admin user:", err);
    } else if (!row) {
      console.log("Creating default admin user...");
      db.run(
        "INSERT INTO users (username, password, email) VALUES (?, ?, ?)",
        ["admin", "admin", "admin@example.com"],
        function (err) {
          if (err) {
            console.error("Error creating default admin user:", err);
          } else {
            console.log("Default admin user created successfully");
          }
        }
      );
    } else {
      console.log("Default admin user already exists");
    }
  });
}

// Rest of the code...

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

// User login
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username && password) {
    db.get(
      "SELECT * FROM users WHERE username = ? AND password = ?",
      [username, password],
      (err, row) => {
        if (err) {
          console.error("Error during login:", err);
          res.status(500).json({ message: "Internal server error" });
        } else if (row) {
          console.log(`User '${username}' logged in`);
          res.status(200).json({ message: "success" });
        } else {
          res.status(401).json({ message: "Invalid username or password" });
        }
      }
    );
  } else {
    res.status(400).json({ message: "Invalid username or password" });
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

  db.run("DELETE FROM users WHERE username = ?", [username], function (err) {
    if (err) {
      console.error("Error during user removal:", err);
      res.status(500).json({ message: "Internal server error" });
    } else if (this.changes > 0) {
      res.status(200).json({ message: "User removed successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  });
});

// Add a new inventory item
app.post("/addInventoryItem", (req, res) => {
  const { item_name, quantity, date_of_expiry, date_of_manufacture, type } =
    req.body;

  if (item_name && quantity && date_of_expiry && date_of_manufacture && type) {
    db.run(
      "INSERT INTO inventory (item_name, quantity, date_of_expiry, date_of_manufacture, type) VALUES (?, ?, ?, ?, ?)",
      [item_name, quantity, date_of_expiry, date_of_manufacture, type],
      function (err) {
        if (err) {
          console.error("Error during inventory item creation:", err);
          res.status(500).json({ message: "Internal server error" });
        } else {
          res
            .status(200)
            .json({ message: "Inventory item created successfully" });
        }
      }
    );
  } else {
    res.status(400).json({ message: "Invalid item details" });
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

  db.run("DELETE FROM inventory WHERE id = ?", [id], function (err) {
    if (err) {
      console.error("Error during inventory item removal:", err);
      res.status(500).json({ message: "Internal server error" });
    } else if (this.changes > 0) {
      res.status(200).json({ message: "Inventory item removed successfully" });
    } else {
      res.status(404).json({ message: "Inventory item not found" });
    }
  });
});

// Update an inventory item
app.post("/updateInventoryItem", (req, res) => {
  const { id, item_name, quantity, date_of_expiry, date_of_manufacture, type } =
    req.body;

  if (
    id &&
    item_name &&
    quantity &&
    date_of_expiry &&
    date_of_manufacture &&
    type
  ) {
    db.run(
      "UPDATE inventory SET item_name = ?, quantity = ?, date_of_expiry = ?, date_of_manufacture = ?, type = ? WHERE id = ?",
      [item_name, quantity, date_of_expiry, date_of_manufacture, type, id],
      function (err) {
        if (err) {
          console.error("Error during inventory item update:", err);
          res.status(500).json({ message: "Internal server error" });
        } else if (this.changes > 0) {
          res
            .status(200)
            .json({ message: "Inventory item updated successfully" });
        } else {
          res.status(404).json({ message: "Inventory item not found" });
        }
      }
    );
  } else {
    res.status(400).json({ message: "Invalid item ID, name, or quantity" });
  }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
