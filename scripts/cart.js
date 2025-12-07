// Cart page logic: renders cart items from localStorage and handles updates
document.addEventListener('DOMContentLoaded', function () {
    const cartContents = document.getElementById('cartContents');
    const cartTotalEl = document.getElementById('cartTotal');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const cartBadge = document.querySelector('.cart-badge');
    const checkoutModal = document.getElementById('checkoutModal');
    const checkoutBackdrop = document.getElementById('checkoutBackdrop');
    const checkoutForm = document.getElementById('checkoutForm');
    const checkoutClose = document.getElementById('checkoutClose');
    const checkoutCancel = document.getElementById('checkoutCancel');

    if (!cartContents || !cartTotalEl || !checkoutBtn) {
        console.error('Cart page: required elements not found');
        return;
    }

    function getCart() {
        try { const raw = localStorage.getItem('cartItems'); return raw ? JSON.parse(raw) : []; } catch (e) { return []; }
    }
    function saveCart(cart) { try { localStorage.setItem('cartItems', JSON.stringify(cart)); } catch (e) { /* ignore */ } }
    function formatPrice(p) { return '$' + Number(p).toFixed(2); }
    function updateBadge() { if (cartBadge) cartBadge.textContent = String(getCart().reduce((s,i)=>s+(i.quantity||0),0)); }

    function render() {
        const cart = getCart();
        cartContents.innerHTML = '';
        
        if (!cart || !cart.length) {
            cartContents.innerHTML = '<p class="cart-empty">Your cart is empty. <a href="index.html">Start shopping</a>.</p>';
            cartTotalEl.textContent = formatPrice(0);
            checkoutBtn.disabled = true;
            updateBadge();
            return;
        }

        checkoutBtn.disabled = false;

        let total = 0;
        cart.forEach(item => {
            const row = document.createElement('div');
            row.className = 'cart-item-row';
            row.dataset.id = item.id;
            const opts = item.selectedVariations ? Object.entries(item.selectedVariations).map(([k,v])=>`<small class="cart-opts">${k}: ${v}</small>`).join(' ') : '';

            row.innerHTML = `
                <div class="ci-thumb"><img src="${item.image}" alt="${escapeHtml(item.title||'')}" onerror="this.src='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='"></div>
                <div class="ci-meta">
                    <div class="ci-title">${escapeHtml(item.title || '')}</div>
                    ${opts}
                    <div class="ci-price">${formatPrice(item.price)}</div>
                </div>
                <div class="ci-controls">
                    <div class="qty-controls">
                        <button class="qty-btn qty-dec" data-id="${item.id}">−</button>
                        <input type="number" min="1" class="qty-input" data-id="${item.id}" value="${item.quantity||1}">
                        <button class="qty-btn qty-inc" data-id="${item.id}">+</button>
                    </div>
                    <div class="ci-actions">
                        <button class="btn small remove" data-id="${item.id}">Remove</button>
                    </div>
                </div>
            `;

            cartContents.appendChild(row);
            total += (item.price || 0) * (item.quantity || 1);
        });

        cartTotalEl.textContent = formatPrice(total);
        bindRowEvents();
        updateBadge();
    }

    function escapeHtml(str) {
        return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
    }

    function bindRowEvents() {
        cartContents.querySelectorAll('.qty-inc').forEach(btn => btn.addEventListener('click', function () {
            const id = Number(this.dataset.id);
            const cart = getCart(); const it = cart.find(i=>i.id===id);
            if (it) { it.quantity = (it.quantity||0)+1; saveCart(cart); render(); }
        }));

        cartContents.querySelectorAll('.qty-dec').forEach(btn => btn.addEventListener('click', function () {
            const id = Number(this.dataset.id);
            const cart = getCart(); const it = cart.find(i=>i.id===id);
            if (it) { it.quantity = Math.max(1, (it.quantity||1)-1); saveCart(cart); render(); }
        }));

        cartContents.querySelectorAll('.qty-input').forEach(inp => inp.addEventListener('change', function () {
            const id = Number(this.dataset.id);
            let val = parseInt(this.value) || 1; if (val < 1) val = 1; this.value = val;
            const cart = getCart(); const it = cart.find(i=>i.id===id);
            if (it) { it.quantity = val; saveCart(cart); render(); }
        }));

        cartContents.querySelectorAll('.remove').forEach(btn => btn.addEventListener('click', function () {
            const id = Number(this.dataset.id);
            let cart = getCart(); cart = cart.filter(i=>i.id!==id); saveCart(cart); render();
        }));
    }

    function openCheckoutModal() {
        if (checkoutModal && checkoutBackdrop) {
            checkoutModal.style.display = 'block';
            checkoutBackdrop.style.display = 'block';
        }
    }

    function closeCheckoutModal() {
        if (checkoutModal && checkoutBackdrop) {
            checkoutModal.style.display = 'none';
            checkoutBackdrop.style.display = 'none';
        }
    }

    // Checkout button must work regardless of disabled state
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            const cart = getCart();
            if (!cart || !cart.length) {
                alert('Please add items to your cart first');
                return;
            }
            openCheckoutModal();
        });
    }

    if (checkoutClose) checkoutClose.addEventListener('click', closeCheckoutModal);
    if (checkoutCancel) checkoutCancel.addEventListener('click', closeCheckoutModal);
    if (checkoutBackdrop) checkoutBackdrop.addEventListener('click', closeCheckoutModal);

    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function (e) {
            e.preventDefault();
            alert('Order placed successfully!');
            saveCart([]);
            render();
            closeCheckoutModal();
        });
    }

    render();
});

