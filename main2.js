document.addEventListener("DOMContentLoaded", () => {

// SWIPER
var swiper = new Swiper('.mySwiper', {
    loop: true,
    navigation: {
        nextEl: "#next",
        prevEl: "#prev",
    },
});

// SELECTORS
const cartIcon = document.querySelector('.cart-icon');
const cartTab = document.querySelector('.cart-tab');
const closeBtn = document.querySelector('.close-btn');
const cardList = document.querySelector('.card-list');
const cartList = document.querySelector('.cart-list');
const cartTotal = document.querySelector('.cart-total');
const cartValue = document.querySelector('.cart-value');
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.mobile-menu');
const bars = document.querySelector('.fa-bars');

// SAFETY CHECK (prevents crash)
if (!cardList) {
    console.error("card-list not found ❌");
    return;
}

// TOGGLES
cartIcon.addEventListener('click', () => cartTab.classList.add('cart-tab-active'));
closeBtn.addEventListener('click', () => cartTab.classList.remove('cart-tab-active'));

hamburger.addEventListener('click', () => mobileMenu.classList.toggle('mobile-menu-active'));
hamburger.addEventListener('click', () => bars.classList.toggle('fa-xmark'));

// DATA
let productlist = [];
let cartProduct = [];

// UPDATE TOTALS
const updateTotals = () => {
    let totalprice = 0;
    let totalquantity = 0;

    document.querySelectorAll('.item').forEach(item => {
        const quantity = parseInt(item.querySelector('.quantity-value').textContent);
        const price = parseFloat(item.querySelector('.item-total').textContent.replace('$', ''));

        totalprice += price;
        totalquantity += quantity;
    });

    cartTotal.textContent = `${totalprice.toFixed(2)}`;
    cartValue.textContent = totalquantity;
};

// SHOW PRODUCTS
const showcards = () => {
    cardList.innerHTML = "";

    productlist.forEach(product => {
        const card = document.createElement("div");
        card.classList.add("card");

        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h4>${product.name}</h4>
            <p>$${product.price}</p>
            <button class="btn add-btn">Add to Cart</button>
        `;

        cardList.appendChild(card);

        const btn = card.querySelector('.add-btn');

        btn.addEventListener('click', () => {
            addtocart(product);
        });
    });
};

// ADD TO CART
const addtocart = (product) => {

    const existingProduct = cartProduct.find(item => item.id === product.id);

    if (existingProduct) {
        const existingItem = document.querySelector(`[data-id='${product.id}']`);

        if (!existingItem) return;

        const quantityValue = existingItem.querySelector('.quantity-value');
        const itemTotal = existingItem.querySelector('.item-total');

        let quantity = parseInt(quantityValue.textContent);
        quantity++;

        quantityValue.textContent = quantity;
        itemTotal.textContent = `$${(product.price * quantity).toFixed(2)}`;

        updateTotals();
        return;
    }

    cartProduct.push(product);

    let quantity = 1;
    let price = parseFloat(product.price);

    const cartItem = document.createElement('div');
    cartItem.classList.add('item');
    cartItem.setAttribute('data-id', product.id);

    cartItem.innerHTML = `
    <div class="item-image">
      <img src="${product.image}">
    </div>
    <div class="detail">
        <h4>${product.name}</h4>
        <h4 class="item-total">$${product.price}</h4>
    </div>
    <div class="flex">
        <a href="#" class="quantity-btn minus">
            <i class="fa-solid fa-minus"></i>
        </a>
        <h4 class="quantity-value">${quantity}</h4>
        <a href="#" class="quantity-btn plus">
            <i class="fa-solid fa-plus"></i>
        </a>
     </div>
    `;

    cartList.appendChild(cartItem);

    updateTotals();

    const plusBtn = cartItem.querySelector('.plus');
    const minusBtn = cartItem.querySelector('.minus');
    const quantityvalue = cartItem.querySelector('.quantity-value');
    const itemTotal = cartItem.querySelector('.item-total');

    plusBtn.addEventListener('click', (e) => {
        e.preventDefault();
        quantity++;
        quantityvalue.textContent = quantity;
        itemTotal.textContent = `$${(price * quantity).toFixed(2)}`;
        updateTotals();
    });

    minusBtn.addEventListener('click', (e) => {
        e.preventDefault();

        if (quantity > 1) {
            quantity--;
            quantityvalue.textContent = quantity;
            itemTotal.textContent = `$${(price * quantity).toFixed(2)}`;
            updateTotals();
        } else {
            cartItem.classList.add('slide-out');

            setTimeout(() => {
                cartItem.remove();
                cartProduct = cartProduct.filter(item => item.id !== product.id);
                updateTotals();
            }, 300);
        }
    });
};

// INIT
const initApp = () => {
    fetch('./products2.json')
        .then(response => response.json())
        .then(data => {
            productlist = data;
            showcards();
        })
        .catch(err => console.log("Error loading JSON:", err));
};

initApp();

initApp();

// 👇 ADD HERE
const checkoutBtn = document.querySelector('a[href="checkout.html"]');

if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        localStorage.setItem("cart", JSON.stringify(cartProduct));
    });
}

});
