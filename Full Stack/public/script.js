let menu = [];
let cart = [];


// ================= PAGE NAVIGATION =================

function showPage(pageName) {

    // Hide all pages
    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
    });

    // Show selected page
    document.getElementById(pageName).classList.add("active");

    // Refresh cart whenever Cart page is opened
    if (pageName === "cart") {
        displayCart();
    }

    // Update checkout amount
    if (pageName === "checkout") {
        updateCheckoutTotal();
    }

    window.scrollTo(0, 0);
}


// ================= LOAD MENU =================

fetch("/api/menu")
    .then(response => response.json())
    .then(data => {

        menu = data;

        displayMenu();

    })
    .catch(error => {

        console.error("Menu loading error:", error);

    });


// ================= DISPLAY MENU =================

function displayMenu() {

    const container =
        document.getElementById("menu-container");

    container.innerHTML = "";

    menu.forEach(food => {

        const card = document.createElement("div");

        card.className = "food-card";

        card.innerHTML = `
            <h3>${food.name}</h3>

            <p>${food.description}</p>

            <div class="price">
                ₹${food.price}
            </div>

            <button onclick="addToCart(${food.id})">
                Add to Cart
            </button>
        `;

        container.appendChild(card);
    });
}


// ================= ADD TO CART =================

function addToCart(id) {

    const food = menu.find(item => item.id === id);

    if (!food) {
        console.error("Food not found");
        return;
    }

    // Add food
    cart.push(food);

    console.log("Cart:", cart);

    alert(food.name + " added to cart!");

    // Immediately update cart
    displayCart();
}


// ================= DISPLAY CART =================

function displayCart() {

    const container =
        document.getElementById("cart-items");

    const totalElement =
        document.getElementById("cart-total");

    if (!container || !totalElement) {
        return;
    }

    // Empty cart
    if (cart.length === 0) {

        container.innerHTML = `
            <p>Your cart is empty.</p>
        `;

        totalElement.textContent = "0";

        return;
    }

    container.innerHTML = "";

    let total = 0;

    cart.forEach((item, index) => {

        total += Number(item.price);

        const div = document.createElement("div");

        div.className = "cart-item";

        div.innerHTML = `
            <span>
                <strong>${item.name}</strong>
                - ₹${item.price}
            </span>

            <button
                class="remove-btn"
                onclick="removeFromCart(${index})">

                Remove

            </button>
        `;

        container.appendChild(div);
    });

    totalElement.textContent = total;

    console.log("Cart displayed:", cart);
}


// ================= REMOVE FROM CART =================

function removeFromCart(index) {

    cart.splice(index, 1);

    displayCart();
}


// ================= GO TO CHECKOUT =================

function goToCheckout() {

    if (cart.length === 0) {

        alert("Please add food to your cart first.");

        return;
    }

    updateCheckoutTotal();

    showPage("checkout");
}


// ================= CHECKOUT TOTAL =================

function updateCheckoutTotal() {

    const total = cart.reduce(
        (sum, item) => sum + Number(item.price),
        0
    );

    document.getElementById("checkout-total").textContent = total;
}


// ================= PLACE ORDER =================

document
    .getElementById("order-form")
    .addEventListener("submit", function(event) {

        event.preventDefault();

        if (cart.length === 0) {

            alert("Your cart is empty!");

            showPage("menu");

            return;
        }

        const customerName =
            document.getElementById("customerName").value;

        const phone =
            document.getElementById("phone").value;

        const address =
            document.getElementById("address").value;

        const total = cart.reduce(
            (sum, item) => sum + Number(item.price),
            0
        );

        const orderData = {
            customerName: customerName,
            phone: phone,
            address: address,
            items: cart,
            total: total
        };


        fetch("/api/order", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(orderData)

        })

        .then(response => response.json())

        .then(data => {

            if (!data.order) {

                alert(data.message || "Order failed.");

                return;
            }

            document.getElementById("message").innerHTML = `

                <p>
                    Thank you,
                    <strong>${data.order.customerName}</strong>
                </p>

                <p>
                    Order ID:
                    <strong>${data.order.id}</strong>
                </p>

                <p>
                    Total Amount:
                    <strong>₹${data.order.total}</strong>
                </p>

                <p>
                    Status:
                    <strong>${data.order.status}</strong>
                </p>

            `;


            // Clear cart after successful order
            cart = [];

            // Reset form
            document.getElementById("order-form").reset();

            // Show confirmation
            showPage("confirmation");

        })

        .catch(error => {

            console.error("Order error:", error);

            alert("Something went wrong while placing the order.");

        });
    });