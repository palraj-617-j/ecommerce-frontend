console.log("E-commerce Website Loaded");

// Mobile navigation toggle
document.addEventListener('DOMContentLoaded', function () {
	const hamburger = document.querySelector('.hamburger');
	const mainNav = document.querySelector('.main-nav');

	if (!hamburger || !mainNav) return;

	hamburger.addEventListener('click', function (e) {
		const expanded = this.getAttribute('aria-expanded') === 'true';
		this.setAttribute('aria-expanded', String(!expanded));
		mainNav.classList.toggle('open');
	});

	// Optional: close the mobile menu when clicking outside
	document.addEventListener('click', function (e) {
		if (!mainNav.classList.contains('open')) return;
		const target = e.target;
		if (!mainNav.contains(target) && !hamburger.contains(target)) {
			mainNav.classList.remove('open');
			hamburger.setAttribute('aria-expanded', 'false');
		}
	});
    
	/* ---------------- Dynamic product grid ---------------- */
	const productGrid = document.getElementById('productGrid');
	const productsLoading = document.getElementById('productsLoading');
	const productsMap = new Map();
	const cartBadge = document.querySelector('.cart-badge');
	const cartDrawer = document.querySelector('.cart-drawer');
	const cartBackdrop = document.querySelector('.cart-drawer-backdrop');

	// Cart stored as array of items in localStorage under 'cartItems'
	function getCart() {
		try {
			const raw = localStorage.getItem('cartItems');
			return raw ? JSON.parse(raw) : [];
		} catch (e) { return []; }
	}
	function saveCart(cart) {
		localStorage.setItem('cartItems', JSON.stringify(cart));
	}
	function getCartCount() {
		const cart = getCart();
		return cart.reduce((s, it) => s + (it.quantity || 0), 0);
	}
	function updateCartBadge() {
		if (cartBadge) cartBadge.textContent = String(getCartCount());
	}

	// initialize badge
	updateCartBadge();

	// Toast helper (creates a transient notification)
	function showToast(text, ms = 2200) {
		try {
			let container = document.querySelector('.toast-container');
			if (!container) {
				container = document.createElement('div');
				container.className = 'toast-container';
				document.body.appendChild(container);
			}

			const t = document.createElement('div');
			t.className = 'toast';
			t.textContent = text;
			container.appendChild(t);

			setTimeout(() => {
				// graceful hide
				t.style.transition = 'opacity .2s, transform .2s';
				t.style.opacity = '0';
				t.style.transform = 'translateY(8px)';
				setTimeout(() => t.remove(), 220);
			}, ms);
		} catch (e) { /* ignore */ }
	}

	/* CART & MODAL (moved to top-level so buttons can access them) */
	function addToCart(product) {
		const cart = getCart();
		const idx = cart.findIndex(i => i.id === product.id);
		if (idx > -1) {
			cart[idx].quantity = (cart[idx].quantity || 0) + 1;
		} else {
			cart.push({ id: product.id, title: product.title, price: product.price, image: product.image, quantity: 1 });
		}
		saveCart(cart);
		updateCartBadge();
		renderCartItems();
		openCartDrawer();
	}

	function renderCartItems() {
		const container = document.getElementById('cartItemsContainer');
		const totalEl = document.getElementById('cartTotal');
		if (!container) return;
		const cart = getCart();
		container.innerHTML = '';
		let total = 0;
		cart.forEach(item => {
			const el = document.createElement('div');
			el.className = 'cart-item';
			const opts = item.selectedVariations ? Object.entries(item.selectedVariations).map(([k,v])=>`<span class="option-badge">${k}: ${v}</span>`).join('') : '';
			el.innerHTML = `
				<div class="thumb"><img src="${item.image}" alt="${escapeHtml(item.title)}" onerror="this.src='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='"></div>
				<div class="meta">
					<h4>${escapeHtml(item.title)}</h4>
					<div class="ci-price">${formatPrice(item.price)}</div>
					${opts ? `<div class="options-display">${opts}</div>` : ''}
					<div class="qty-controls">
						<button class="qty-btn qty-dec" data-id="${item.id}">−</button>
						<span class="qty-display">${item.quantity}</span>
						<button class="qty-btn qty-inc" data-id="${item.id}">+</button>
					</div>
				</div>
				<button class="btn small remove" data-id="${item.id}">Remove</button>
			`;
			container.appendChild(el);
			total += item.price * item.quantity;
		});
		if (totalEl) totalEl.textContent = formatPrice(total);

		container.querySelectorAll('.remove').forEach(btn => btn.addEventListener('click', function () {
			const id = Number(this.dataset.id);
			let cart = getCart();
			cart = cart.filter(i => i.id !== id);
			saveCart(cart); updateCartBadge(); renderCartItems();
		}));
		container.querySelectorAll('.qty-inc').forEach(btn => btn.addEventListener('click', function () {
			const id = Number(this.dataset.id); const cart = getCart(); const it = cart.find(i => i.id === id); if (it) { it.quantity = (it.quantity||0)+1; saveCart(cart); updateCartBadge(); renderCartItems(); }
		}));
		container.querySelectorAll('.qty-dec').forEach(btn => btn.addEventListener('click', function () {
			const id = Number(this.dataset.id); const cart = getCart(); const it = cart.find(i => i.id === id); if (it) { it.quantity = Math.max(1, (it.quantity||1)-1); saveCart(cart); updateCartBadge(); renderCartItems(); }
		}));
	}

	function openCartDrawer() {
		if (!cartDrawer) return;
		cartDrawer.classList.add('open');
		cartDrawer.setAttribute('aria-hidden', 'false');
		if (cartBackdrop) { cartBackdrop.style.display = ''; }
	}

	function closeCartDrawer() {
		if (!cartDrawer) return;
		cartDrawer.classList.remove('open');
		cartDrawer.setAttribute('aria-hidden', 'true');
		if (cartBackdrop) { cartBackdrop.style.display = 'none'; }
	}

	// attach cart open/close handlers
	const cartBtn = document.querySelector('.cart');
	if (cartBtn) cartBtn.addEventListener('click', function (e) { e.preventDefault(); renderCartItems(); openCartDrawer(); });
	const cartClose = document.querySelector('.cart-drawer-close');
	if (cartClose) cartClose.addEventListener('click', closeCartDrawer);

	// Drawer checkout button: navigate to cart page or warn if empty
	const drawerCheckoutBtn = document.querySelector('.cart-drawer-footer .btn.checkout');
	if (drawerCheckoutBtn) {
		drawerCheckoutBtn.addEventListener('click', function (e) {
			e.preventDefault();
			const count = getCartCount();
			if (!count) {
				alert('Your cart is empty');
				return;
			}
			// Go to the cart page where the full checkout flow/modal is available
			window.location.href = 'cart.html';
		});
	}
	if (cartBackdrop) cartBackdrop.addEventListener('click', closeCartDrawer);

	function escapeHtml(str) {
		return String(str)
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;');
	}

	function openProductModal(product) {
		// Navigate to product detail page
		window.location.href = `product.html?id=${product.id}`;
	}

	async function fetchProducts(limit = 12) {
		// Simple caching to avoid redundant network requests
		const CACHE_KEY = 'productsCache';
		const TTL = 1000 * 60 * 10; // 10 minutes

		function readCache() {
			try {
				const raw = localStorage.getItem(CACHE_KEY);
				if (!raw) return null;
				const obj = JSON.parse(raw);
				if (!obj.ts || !obj.data) return null;
				if ((Date.now() - obj.ts) > TTL) return null;
				return obj.data;
			} catch (e) { return null; }
		}

		function writeCache(data) {
			try { localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data })); } catch (e) { /* ignore */ }
		}

		productsLoading.style.display = '';
		// Check cache first
		const cached = readCache();
		if (cached && cached.length) {
			productsLoading.style.display = 'none';
			return cached.slice(0, limit);
		}

		// Network fetch with timeout
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), 10000);
		try {
			const res = await fetch('https://fakestoreapi.com/products?limit=' + limit, { signal: controller.signal });
			clearTimeout(timeout);
			if (!res.ok) throw new Error('Network response was not ok');
			const data = await res.json();
			writeCache(data);
			return data;
		} catch (err) {
			console.warn('Failed to fetch products from API, attempting local fallback', err && err.message ? err.message : err);
			// try local fallback file
			try {
				const local = await fetch('data/products.json');
				if (local.ok) {
					const jd = await local.json();
					writeCache(jd);
					return jd.slice(0, limit);
				}
			} catch (e) {
				console.error('Failed to load local products.json', e && e.message ? e.message : e);
			}
			throw new Error('Unable to load products');
		} finally {
			productsLoading.style.display = 'none';
		}
	}

	function formatPrice(p) {
		return '$' + Number(p).toFixed(2);
	}

	function createProductCard(product) {
		const card = document.createElement('article');
		card.dataset.id = product.id;
		card.className = 'product-card';

		// media wrapper to reserve space and avoid layout shifts
		const media = document.createElement('div');
		media.className = 'product-media';

		const img = document.createElement('img');
		img.alt = product.title || 'Product image';
		// defer actual loading using data-src and a tiny placeholder
		img.dataset.src = product.image;
		img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
		img.loading = 'lazy';
		img.className = 'product-image';
		// skeleton placeholder to show until image loads
		const skeleton = document.createElement('div');
		skeleton.className = 'skeleton';
		media.appendChild(skeleton);
		img.style.opacity = '0';
		media.appendChild(img);

		const info = document.createElement('div');
		info.className = 'product-info';

		const title = document.createElement('h3');
		title.className = 'product-title';
		title.textContent = product.title;

		const price = document.createElement('div');
		price.className = 'product-price';
		price.textContent = formatPrice(product.price);

		const actions = document.createElement('div');
		actions.className = 'product-actions';

		const add = document.createElement('button');
		add.className = 'btn small add';
		add.type = 'button';
		add.textContent = 'Add to Cart';
		// Accessibility label; event handling is delegated to avoid duplicate events
		add.setAttribute('aria-label', 'Add to cart');

		const view = document.createElement('a');
		view.className = 'btn small view';
		view.href = '#'; // Keep href for accessibility
		view.textContent = 'View';
		view.addEventListener('click', function (e) {
			e.preventDefault();
			openProductModal(product);
		});

		actions.appendChild(add);
		actions.appendChild(view);

		info.appendChild(title);
		info.appendChild(price);
		info.appendChild(actions);

		card.appendChild(media);
		card.appendChild(info);

		return card;
	}

	async function renderProducts() {
		if (!productGrid) return;
		productGrid.innerHTML = '';
		let products = [];
		try {
			products = await fetchProducts(12);
		} catch (err) {
			productGrid.innerHTML = `<p style="color:#b00">Error loading products: ${escapeHtml(err.message || 'Unknown error')}</p>`;
			return;
		}
		productsMap.clear();
		if (!products || !products.length) {
			productGrid.innerHTML = '<p style="color:#666">No products found.</p>';
			return;
		}
		const frag = document.createDocumentFragment();
		products.forEach(p => {
			productsMap.set(String(p.id), p);
			const card = createProductCard(p);
			frag.appendChild(card);
		});
		productGrid.appendChild(frag);

		// Lazy-load images with IntersectionObserver
		const lazyImgs = productGrid.querySelectorAll('img[data-src]');
		if ('IntersectionObserver' in window) {
			const io = new IntersectionObserver((entries, observer) => {
				entries.forEach(entry => {
					if (!entry.isIntersecting) return;
					const img = entry.target;
					img.src = img.dataset.src;
					img.onload = function () {
						const s = img.closest('.product-media') && img.closest('.product-media').querySelector('.skeleton');
						if (s) s.remove();
						img.style.opacity = '1';
					};
					img.removeAttribute('data-src');
					observer.unobserve(img);
				});
			}, { rootMargin: '150px 0px' });

			lazyImgs.forEach(img => io.observe(img));
		} else {
			lazyImgs.forEach(img => {
				img.src = img.dataset.src;
				img.onload = function () {
					const s = img.closest('.product-media') && img.closest('.product-media').querySelector('.skeleton');
					if (s) s.remove();
					img.style.opacity = '1';
				};
				img.removeAttribute('data-src');
			});
		}
	}

	// Event delegation for product grid actions (works better on mobile/touch/pointer devices)
	if (productGrid) {
		let lastHandled = 0;
		function onProductGridAction(e) {
			// prevent duplicate events (touch + click)
				const now = Date.now();
				if (now - lastHandled < 500) return; // debounce duplicate events
				lastHandled = now;

			const target = e.target;
			const addBtn = target.closest('.btn.add');
			const viewBtn = target.closest('.view');
			if (addBtn && productGrid.contains(addBtn)) {
				e.preventDefault();
				const card = addBtn.closest('.product-card');
				if (!card) return;
				const id = card.dataset.id;
				const product = productsMap.get(String(id));
				if (product) { addToCart(product); showToast('Item added to cart'); }
				return;
			}
			if (viewBtn && productGrid.contains(viewBtn)) {
				e.preventDefault();
				const card = viewBtn.closest('.product-card');
				if (!card) return;
				const id = card.dataset.id;
				const product = productsMap.get(String(id));
				if (product) openProductModal(product);
				return;
			}
		}

		if (window.PointerEvent) productGrid.addEventListener('pointerup', onProductGridAction);
		else if ('ontouchstart' in window) productGrid.addEventListener('touchend', onProductGridAction);
		productGrid.addEventListener('click', onProductGridAction);
	}

	// kick off
	renderProducts();
});