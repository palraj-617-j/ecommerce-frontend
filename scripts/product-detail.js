console.log("Product Detail Page Loaded");

document.addEventListener('DOMContentLoaded', function () {
	const productDetailContainer = document.getElementById('productDetailContainer');
	const cartBadge = document.querySelector('.cart-badge');
	const cartDrawer = document.querySelector('.cart-drawer');
	const cartBackdrop = document.querySelector('.cart-drawer-backdrop');
	const hamburger = document.querySelector('.hamburger');
	const mainNav = document.querySelector('.main-nav');

	// Mobile navigation toggle
	if (hamburger && mainNav) {
		hamburger.addEventListener('click', function (e) {
			const expanded = this.getAttribute('aria-expanded') === 'true';
			this.setAttribute('aria-expanded', String(!expanded));
			mainNav.classList.toggle('open');
		});

		document.addEventListener('click', function (e) {
			if (!mainNav.classList.contains('open')) return;
			const target = e.target;
			if (!mainNav.contains(target) && !hamburger.contains(target)) {
				mainNav.classList.remove('open');
				hamburger.setAttribute('aria-expanded', 'false');
			}
		});
	}

	/* ========== Cart Management (Shared with index.html) ========== */
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

	updateCartBadge();

	function addToCart(product, quantity = 1) {
		const cart = getCart();
		const idx = cart.findIndex(i => i.id === product.id);
		if (idx > -1) {
			cart[idx].quantity = (cart[idx].quantity || 0) + quantity;
		} else {
			cart.push({
				id: product.id,
				title: product.title,
				price: product.price,
				image: product.image,
				quantity: quantity
			});
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
			el.innerHTML = `
				<div class="thumb"><img src="${item.image}" alt="${escapeHtml(item.title)}" onerror="this.src='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='"></div>
				<div class="meta">
					<h4>${escapeHtml(item.title)}</h4>
					<div class="qty">Qty: ${item.quantity} <button class="qty-dec" data-id="${item.id}">−</button> <button class="qty-inc" data-id="${item.id}">+</button></div>
				</div>
				<div><button class="btn small remove" data-id="${item.id}">Remove</button></div>
			`;
			container.appendChild(el);
			total += item.price * item.quantity;
		});
		if (totalEl) totalEl.textContent = '$' + total.toFixed(2);

		container.querySelectorAll('.remove').forEach(btn => btn.addEventListener('click', function () {
			const id = Number(this.dataset.id);
			let cart = getCart();
			cart = cart.filter(i => i.id !== id);
			saveCart(cart);
			updateCartBadge();
			renderCartItems();
		}));
		container.querySelectorAll('.qty-inc').forEach(btn => btn.addEventListener('click', function () {
			const id = Number(this.dataset.id);
			const cart = getCart();
			const it = cart.find(i => i.id === id);
			if (it) {
				it.quantity = (it.quantity || 0) + 1;
				saveCart(cart);
				updateCartBadge();
				renderCartItems();
			}
		}));
		container.querySelectorAll('.qty-dec').forEach(btn => btn.addEventListener('click', function () {
			const id = Number(this.dataset.id);
			const cart = getCart();
			const it = cart.find(i => i.id === id);
			if (it) {
				it.quantity = Math.max(1, (it.quantity || 1) - 1);
				saveCart(cart);
				updateCartBadge();
				renderCartItems();
			}
		}));
	}

	function openCartDrawer() {
		if (!cartDrawer) return;
		cartDrawer.classList.add('open');
		cartDrawer.setAttribute('aria-hidden', 'false');
		if (cartBackdrop) cartBackdrop.style.display = '';
	}

	function closeCartDrawer() {
		if (!cartDrawer) return;
		cartDrawer.classList.remove('open');
		cartDrawer.setAttribute('aria-hidden', 'true');
		if (cartBackdrop) cartBackdrop.style.display = 'none';
	}

	const cartBtn = document.querySelector('.cart');
	if (cartBtn) cartBtn.addEventListener('click', function (e) {
		e.preventDefault();
		renderCartItems();
		openCartDrawer();
	});
	const cartClose = document.querySelector('.cart-drawer-close');
	if (cartClose) cartClose.addEventListener('click', closeCartDrawer);
	if (cartBackdrop) cartBackdrop.addEventListener('click', closeCartDrawer);

	function escapeHtml(str) {
		return String(str)
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;');
	}

	/* ========== Product Detail Loading ========== */
	function getProductIdFromURL() {
		const params = new URLSearchParams(window.location.search);
		return Number(params.get('id'));
	}

	function getProductCache() {
		try {
			const raw = localStorage.getItem('productsCache');
			if (!raw) return null;
			const obj = JSON.parse(raw);
			if (!obj.data) return null;
			return obj.data;
		} catch (e) { return null; }
	}

	async function fetchProductFromAPI(id) {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), 10000);
		try {
			const res = await fetch(`https://fakestoreapi.com/products/${id}`, { signal: controller.signal });
			clearTimeout(timeout);
			if (!res.ok) throw new Error('Product not found');
			return await res.json();
		} catch (err) {
			clearTimeout(timeout);
			throw err;
		}
	}

	async function fetchProductDetail() {
		const productId = getProductIdFromURL();
		if (!productId) {
			productDetailContainer.innerHTML = '<p style="color:#b00;">Invalid product ID. <a href="index.html">Go back to home</a></p>';
			return;
		}

		// Try cache first
		const cachedProducts = getProductCache();
		if (cachedProducts && Array.isArray(cachedProducts)) {
			const cached = cachedProducts.find(p => p.id === productId);
			if (cached) {
				renderProductDetail(cached);
				return;
			}
		}

		// Try API
		try {
			const product = await fetchProductFromAPI(productId);
			renderProductDetail(product);
		} catch (err) {
			productDetailContainer.innerHTML = `<p style="color:#b00;">Error loading product: ${escapeHtml(err.message || 'Unknown error')}. <a href="index.html">Go back to home</a></p>`;
			console.error('Product fetch error:', err);
		}
	}

	function renderProductDetail(product) {
		const html = `
			<section class="product-detail-image" role="region" aria-label="Product image">
				<div class="image-zoom-container">
					<div class="skeleton" aria-hidden="true"></div>
					<img 
						id="productMainImage"
						class="product-zoom-image"
						src="${product.image}" 
						alt="${escapeHtml(product.title)}"
						onerror="this.src='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='"
					>
					<div class="zoom-lens" id="zoomLens" aria-hidden="true"></div>
					<div class="zoom-preview" id="zoomPreview" aria-hidden="true">
						<img id="zoomImage" src="${product.image}" alt="">
					</div>
				</div>
			</section>
			<section class="product-detail-info" role="region" aria-label="Product information">
				<h1>${escapeHtml(product.title)}</h1>
				<div class="product-detail-price" role="doc-subtitle" aria-label="Product price">
					<span id="productPrice">${formatPrice(product.price)}</span>
				</div>
				<div class="product-detail-rating" aria-label="Product rating">
					<span class="stars" aria-hidden="true">★★★★☆</span>
					<span class="rating-value">${product.rating ? product.rating.rate + ' out of 5' : 'Not rated'}</span>
				</div>

				<!-- Product Variations -->
				<div class="product-variations" id="variationsContainer" role="group" aria-label="Product options"></div>

				<p class="product-detail-description" role="doc-abstract">${escapeHtml(product.description || '')}</p>

				<!-- Quantity Selector with +/- buttons -->
				<div class="product-detail-actions">
					<div class="qty-selector-advanced">
						<label for="quantityInputDetail">Quantity:</label>
						<div class="qty-controls">
							<button class="qty-btn qty-minus" id="qtyMinus" aria-label="Decrease quantity">−</button>
							<input 
								type="number" 
								id="quantityInputDetail" 
								min="1" 
								max="999"
								value="1"
								aria-label="Product quantity"
							>
							<button class="qty-btn qty-plus" id="qtyPlus" aria-label="Increase quantity">+</button>
						</div>
						<div class="total-price" id="totalPrice" aria-live="polite" aria-label="Total price">
							Total: ${formatPrice(product.price)}
						</div>
					</div>
					<button 
						class="btn add-to-cart-detail" 
						id="addToCartBtn"
						data-product-id="${product.id}"
						aria-label="Add product to shopping cart"
					>
						Add to Cart
					</button>
				</div>

				<div class="product-success-msg" id="successMsg" role="status" aria-live="polite" aria-atomic="true">
					✓ Added to cart successfully!
				</div>
				<div class="product-error-msg" id="errorMsg" role="alert" aria-live="assertive" aria-atomic="true"></div>
			</section>
		`;

		productDetailContainer.innerHTML = html;

		// Store product data globally for interactive handlers
		window.currentProduct = product;
		window.selectedVariations = {};

		// Initialize interactive features
		initializeImageZoom(product.image);
		initializeVariations(product);
		initializeQuantityControls(product.price);
		initializeAddToCart(product);
	}

	function initializeImageZoom(imageUrl) {
		const container = document.querySelector('.image-zoom-container');
		const mainImg = document.getElementById('productMainImage');
		const zoomLens = document.getElementById('zoomLens');
		const zoomPreview = document.getElementById('zoomPreview');
		const zoomImg = document.getElementById('zoomImage');

		if (!container || !mainImg) return;

		// Show zoom controls only on desktop (hover-based interaction)
		const isDesktop = window.innerWidth > 768;

		mainImg.addEventListener('load', function () {
			this.style.opacity = '1';
		}, { once: true });

		if (isDesktop) {
			container.addEventListener('mouseenter', function () {
				zoomLens.style.display = 'block';
				zoomPreview.style.display = 'block';
			});

			container.addEventListener('mouseleave', function () {
				zoomLens.style.display = 'none';
				zoomPreview.style.display = 'none';
			});

			container.addEventListener('mousemove', function (e) {
				const rect = container.getBoundingClientRect();
				const x = e.clientX - rect.left;
				const y = e.clientY - rect.top;

				// Position zoom lens
				const lensWidth = zoomLens.offsetWidth / 2;
				const lensHeight = zoomLens.offsetHeight / 2;
				zoomLens.style.left = (x - lensWidth) + 'px';
				zoomLens.style.top = (y - lensHeight) + 'px';

				// Calculate zoom preview position
				const imageWidth = mainImg.offsetWidth;
				const imageHeight = mainImg.offsetHeight;
				const previewWidth = zoomPreview.offsetWidth;
				const previewHeight = zoomPreview.offsetHeight;

				const zoomRatio = 2; // 2x magnification
				const previewX = -((x / imageWidth) * imageWidth * zoomRatio - previewWidth / 2);
				const previewY = -((y / imageHeight) * imageHeight * zoomRatio - previewHeight / 2);

				zoomImg.style.transform = `scale(${zoomRatio}) translate(${previewX / zoomRatio}px, ${previewY / zoomRatio}px)`;
			});
		}
	}

	function initializeVariations(product) {
		const container = document.getElementById('variationsContainer');
		if (!container) return;

		// Mock variations for demo (in real scenario, would come from API)
		const variations = {
			Size: ['S', 'M', 'L', 'XL'],
			Color: ['Black', 'White', 'Blue', 'Red']
		};

		let html = '';
		for (const [varName, options] of Object.entries(variations)) {
			html += `
				<div class="variation-group" role="group" aria-label="${varName} selection">
					<label>${varName}:</label>
					<div class="variation-buttons">
						${options.map((opt, idx) => `
							<button 
								class="var-btn" 
								data-variation="${varName}" 
								data-value="${opt}"
								aria-pressed="false"
								aria-label="Select ${varName} ${opt}"
							>
								${opt}
							</button>
						`).join('')}
					</div>
				</div>
			`;
		}
		container.innerHTML = html;

		// Attach variation handlers
		container.querySelectorAll('.var-btn').forEach(btn => {
			btn.addEventListener('click', function () {
				const varName = this.dataset.variation;
				const value = this.dataset.value;

				// Update selected state
				container.querySelectorAll(`[data-variation="${varName}"]`).forEach(b => {
					b.classList.remove('selected');
					b.setAttribute('aria-pressed', 'false');
				});
				this.classList.add('selected');
				this.setAttribute('aria-pressed', 'true');

				// Store selection
				window.selectedVariations[varName] = value;

				// Update display
				updateProductDisplay();
			});
		});
	}

	function initializeQuantityControls(basePrice) {
		const qtyInput = document.getElementById('quantityInputDetail');
		const qtyMinus = document.getElementById('qtyMinus');
		const qtyPlus = document.getElementById('qtyPlus');

		if (!qtyInput) return;

		qtyMinus.addEventListener('click', function () {
			let val = parseInt(qtyInput.value) || 1;
			if (val > 1) {
				qtyInput.value = val - 1;
				updateProductDisplay();
			}
		});

		qtyPlus.addEventListener('click', function () {
			let val = parseInt(qtyInput.value) || 1;
			if (val < 999) {
				qtyInput.value = val + 1;
				updateProductDisplay();
			}
		});

		qtyInput.addEventListener('change', function () {
			let val = parseInt(this.value) || 1;
			if (val < 1) this.value = 1;
			if (val > 999) this.value = 999;
			updateProductDisplay();
		});

		qtyInput.addEventListener('input', updateProductDisplay);
	}

	function updateProductDisplay() {
		const product = window.currentProduct;
		const qtyInput = document.getElementById('quantityInputDetail');
		const qty = Math.max(1, parseInt(qtyInput.value) || 1);

		// Calculate total price (with mock price multiplier for variations)
		let priceMultiplier = 1;
		if (window.selectedVariations.Size === 'XL') priceMultiplier = 1.1;
		if (window.selectedVariations.Color === 'Red') priceMultiplier = 1.05;

		const unitPrice = product.price * priceMultiplier;
		const totalPrice = unitPrice * qty;

		// Update price display
		const productPrice = document.getElementById('productPrice');
		if (productPrice) {
			productPrice.textContent = formatPrice(unitPrice);
		}

		const totalPriceEl = document.getElementById('totalPrice');
		if (totalPriceEl) {
			totalPriceEl.textContent = `Total: ${formatPrice(totalPrice)}`;
		}
	}

	function initializeAddToCart(product) {
		const addBtn = document.getElementById('addToCartBtn');
		if (!addBtn) return;

		addBtn.addEventListener('click', async function () {
			const qtyInput = document.getElementById('quantityInputDetail');
			const qty = Math.max(1, parseInt(qtyInput.value) || 1);

			if (qty < 1) {
				showError('Please enter a valid quantity');
				return;
			}

			// Disable button and show loading state
			const originalText = addBtn.textContent;
			addBtn.disabled = true;
			addBtn.classList.add('loading');
			addBtn.textContent = '';

			try {
				// Simulate processing delay for better UX feedback
				await new Promise(resolve => setTimeout(resolve, 500));

				// Create cart item with variations
				const cartItem = {
					...product,
					quantity: qty,
					selectedVariations: { ...window.selectedVariations }
				};

				addToCart(cartItem, qty);

				// Show success message
				showSuccess(`Added ${qty} item${qty > 1 ? 's' : ''} to cart!`);

				// Reset form
				qtyInput.value = '1';
				updateProductDisplay();

				// Restore button after delay
				setTimeout(() => {
					addBtn.classList.remove('loading');
					addBtn.textContent = originalText;
					addBtn.disabled = false;
				}, 1500);

			} catch (err) {
				showError('Failed to add to cart. Please try again.');
				addBtn.classList.remove('loading');
				addBtn.textContent = originalText;
				addBtn.disabled = false;
			}
		});
	}

	function showSuccess(text) {
		const msg = document.getElementById('successMsg');
		if (!msg) return;

		msg.textContent = text || 'Added to cart successfully!';
		msg.classList.add('show');

		// Remove 'show' class after animation completes (3 seconds)
		setTimeout(() => {
			msg.classList.remove('show');
		}, 3000);
	}

	function showError(text) {
		const msg = document.getElementById('errorMsg');
		if (!msg) return;

		msg.textContent = text || 'An error occurred. Please try again.';
		msg.classList.add('show');

		// Remove 'show' class after 4 seconds
		setTimeout(() => {
			msg.classList.remove('show');
		}, 4000);
	}

	function formatPrice(p) {
		return '$' + Number(p).toFixed(2);
	}

	// Load product on page load
	fetchProductDetail();
});
