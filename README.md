# Complete Order Management System

The Complete Order Management System is a web application built with Express.js and SQLite to manage orders and items. It provides functionality to add new orders, update item quantities, retrieve lists of items and orders, transfer orders to the complete order list, and more. The system also includes features to save the complete order data in a Word or CSV file.

## Features

- User authentication: Users can log in to access the system.
- Order Management:
  - Add new orders.
  - Update item quantities.
  - Retrieve a list of orders.
  - Transfer orders to the complete order list.
  - Remove orders from the system.
- Item Management:
  - Retrieve a list of items.
  - Update item quantities.
- Save Data:
  - Save the complete order data in a Word file.
  - Save the complete order data in a CSV file.

## Prerequisites

Before running the Complete Order Management System, ensure you have the following dependencies installed:

- Node.js (version X.X.X)
- npm (version X.X.X)
- SQLite (version X.X.X)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/complete-order-management-system.git
```

Certainly! Here's a README file template that you can use to document the code:

markdown
Copy code
# Complete Order Management System

The Complete Order Management System is a web application built with Express.js and SQLite to manage orders and items. It provides functionality to add new orders, update item quantities, retrieve lists of items and orders, transfer orders to the complete order list, and more. The system also includes features to save the complete order data in a Word or CSV file.

## Features

- User authentication: Users can log in to access the system.
- Order Management:
  - Add new orders.
  - Update item quantities.
  - Retrieve a list of orders.
  - Transfer orders to the complete order list.
  - Remove orders from the system.
- Item Management:
  - Retrieve a list of items.
  - Update item quantities.
- Save Data:
  - Save the complete order data in a Word file.
  - Save the complete order data in a CSV file.

## Prerequisites

Before running the Complete Order Management System, ensure you have the following dependencies installed:

- Node.js (version X.X.X)
- npm (version X.X.X)
- SQLite (version X.X.X)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/complete-order-management-system.git
```
Navigate to the project directory:
```bash
cd complete-order-management-system
```
```Install the dependencies:
bash
npm install
```
```Create the SQLite database file:
bash
touch data.db
```
```Run the database migration to create or update the required tables:

npm run migrate
```
Configuration
Before starting the server, ensure the following configurations are set:

Database Path:
Open config.js file.
Update the dbPath variable in the configuration to specify the correct path to your SQLite database file.
Usage
Start the server:
bash
Copy code
npm start
Access the Complete Order Management System in your web browser at http://localhost:3000.
API Endpoints
POST /login: User login. Parameters: username, password.
GET /itemList: Retrieve a list of items.
POST /updateItem: Update an item's quantity. Parameters: id, quantity.
GET /orderList: Retrieve a list of orders.
POST /addOrder: Add a new order. Parameters: customer_name, item_name, quantity.
POST /deleteData: Remove an order. Parameters: itemId.
POST /transferData: Transfer selected order data from orders table to complete_order table. Parameters: itemId.
GET /saveCompleteOrder: Save complete_order data in a Word file.
GET /saveCompleteOrderCSV: Save complete_order data in a CSV file.
Contributing
Contributions to the Complete Order Management System are welcome! If you encounter any bugs, have suggestions, or want to contribute enhancements, please feel free to submit a pull request.

License
MIT
