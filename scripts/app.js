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
});