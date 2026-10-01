const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend files
app.use(express.static(path.join(__dirname, "public")));

// Home page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Get menu
app.get("/api/menu", (req, res) => {
    const menu = [
        {
            id: 1,
            name: "Pizza",
            price: 200,
            description: "Cheesy and delicious pizza"
        },
        {
            id: 2,
            name: "Burger",
            price: 120,
            description: "Fresh vegetable burger"
        },
        {
            id: 3,
            name: "Biryani",
            price: 180,
            description: "Hot and spicy chicken biryani"
        },
        {
            id: 4,
            name: "French Fries",
            price: 100,
            description: "Crispy golden fries"
        },
        {
            id: 5,
            name: "Coke",
            price: 50,
            description: "Chilled soft drink"
        }
    ];

    res.json(menu);
});

// Place order
app.post("/api/order", (req, res) => {
    const { customerName, phone, address, items, total } = req.body;

    if (!customerName || !phone || !address || !items || items.length === 0) {
        return res.status(400).json({
            message: "Please provide all required details."
        });
    }

    const order = {
        id: Date.now(),
        customerName,
        phone,
        address,
        items,
        total,
        status: "Order Placed",
        date: new Date().toLocaleString()
    };

    const filePath = path.join(__dirname, "data", "orders.json");

    let orders = [];

    if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, "utf8");

        if (data.trim() !== "") {
            orders = JSON.parse(data);
        }
    }

    orders.push(order);

    fs.writeFileSync(
        filePath,
        JSON.stringify(orders, null, 2)
    );

    res.json({
        message: "Order placed successfully!",
        order: order
    });
});

// Get all orders
app.get("/api/orders", (req, res) => {
    const filePath = path.join(__dirname, "data", "orders.json");

    if (!fs.existsSync(filePath)) {
        return res.json([]);
    }

    const data = fs.readFileSync(filePath, "utf8");

    if (data.trim() === "") {
        return res.json([]);
    }

    res.json(JSON.parse(data));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});