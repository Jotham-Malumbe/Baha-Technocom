
// ===============================
// BAHA TECHNOCOM - CART SYSTEM
// ===============================

let cart = [];
let products = [];

// ===============================
// LOAD PRODUCTS (SAFE JSON HANDLING)
// ===============================
async function loadProducts() {
    try {
        const response = await fetch('products.json');
        const data = await response.json();

        if (!data || !data.products) {
            throw new Error("Invalid products structure");
        }

        products = data.products;
        renderProducts();

    } catch (error) {
        console.error("Error loading products:", error);

        document.getElementById('products-container').innerHTML = `
            <p style="grid-column:1/-1; text-align:center; color:red; padding:2rem;">
                Failed to load products. Please refresh or check configuration.
            </p>
        `;
    }
}

// ===============================
// RENDER PRODUCTS
// ===============================
function renderProducts() {
    const container = document.getElementById('products-container');
    container.innerHTML = '';

    products.forEach(product => {
        const item = `
            <div class="product-card">
                <img 
                    src="${product.image}" 
                    alt="${product.name}" 
                    class="product-image"
                    onerror="this.style.display='none'"
                >

                <div class="product-info">
                    <h3>${product.name}</h3>
                    <div class="price">${config.currency} ${product.price}</div>

                    <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
                        Add to Cart
                    </button>
                </div>
            </div>
        `;

        container.innerHTML += item;
    });
}

// ===============================
// ADD TO CART
// ===============================
function addToCart(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    const existing = cart.find(item => item.id === id);

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    saveCart();
    updateCart();
    showToast(`${product.name} added`);
}

// ===============================
// REMOVE ITEM
// ===============================
function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    updateCart();
}

// ===============================
// CHANGE QUANTITY
// ===============================
function changeQty(id, amount) {
    const item = cart.find(i => i.id === id);
    if (!item) return;

    item.quantity += amount;

    if (item.quantity <= 0) {
        removeFromCart(id);
    } else {
        saveCart();
        updateCart();
    }
}

// ===============================
// RENDER CART
// ===============================
function renderCart() {
    const container = document.getElementById('cart-items');
    container.innerHTML = '';

    if (cart.length === 0) {
        container.innerHTML = `
            <p style="text-align:center; padding:2rem; color:#888;">
                Your cart is empty
            </p>
        `;
        return;
    }

    cart.forEach(item => {
        const total = item.price * item.quantity;

        container.innerHTML += `
            <div class="cart-item">
                <div>
                    <h4>${item.name}</h4>
                    <p>${config.currency} ${item.price}</p>

                    <div>
                        <button onclick="changeQty(${item.id}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="changeQty(${item.id}, 1)">+</button>
                        <button onclick="removeFromCart(${item.id})">x</button>
                    </div>
                </div>

                <strong>${config.currency} ${total}</strong>
            </div>
        `;
    });
}

// ===============================
// UPDATE TOTALS + COUNT
// ===============================
function updateCart() {
    renderCart();

    let subtotal = 0;
    let count = 0;

    cart.forEach(item => {
        subtotal += item.price * item.quantity;
        count += item.quantity;
    });

    document.getElementById('subtotal').textContent =
        `${config.currency} ${subtotal}`;

    document.getElementById('grand-total').textContent =
        `${config.currency} ${subtotal}`;

    document.getElementById('cart-count').textContent = count;
    document.getElementById('floating-cart-count').textContent = count;
}

// ===============================
// SAVE CART (LOCAL STORAGE)
// ===============================
function saveCart() {
    localStorage.setItem('baha_cart', JSON.stringify(cart));
}

// ===============================
// LOAD CART
// ===============================
function loadCart() {
    const saved = localStorage.getItem('baha_cart');
    if (saved) {
        cart = JSON.parse(saved);
    }
    updateCart();
}

// ===============================
// TOGGLE CART SIDEBAR
// ===============================
function toggleCart() {
    document.getElementById('cart-sidebar').classList.toggle('open');
}

// ===============================
// MOBILE MENU
// ===============================
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
}

// ===============================
// WHATSAPP ORDER SYSTEM
// ===============================
function sendOrderToWhatsApp() {
    if (cart.length === 0) {
        alert("Cart is empty");
        return;
    }

    let message = `*NEW ORDER - ${config.shopName}*\n\n`;
    message += `📍 ${config.location}\n\n`;

    let total = 0;

    cart.forEach((item, i) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        message += `${i + 1}. ${item.name}\n`;
        message += `Qty: ${item.quantity} x ${item.price} = ${itemTotal}\n\n`;
    });

    message += `--------------------\n`;
    message += `TOTAL: ${config.currency} ${total}\n`;

    const url = `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank");
}

// ===============================
// TOAST MESSAGE
// ===============================
function showToast(text) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = text;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 2000);
}

// ===============================
// INIT APP
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    if (typeof config === "undefined") {
        console.error("Config missing");
        return;
    }

    loadProducts();
    loadCart();

    console.log(`%c${config.shopName} loaded`, "color:blue;font-weight:bold;");
});