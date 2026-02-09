// ========== PRODUCT FILTER FUNCTIONALITY ==========

// Get all filter buttons and product items
const filterButtons = document.querySelectorAll('.filter-btn');
const productItems = document.querySelectorAll('.product-item');

// Function to filter products
function filterProducts(category) {
    productItems.forEach(product => {
        const productCategory = product.getAttribute('data-category');

        if (category === 'all' || productCategory === category) {
            // Show product with fade-in animation
            product.style.display = 'flex';
            setTimeout(() => {
                product.style.opacity = '1';
                product.style.transform = 'scale(1)';
            }, 10);
        } else {
            // Hide product with fade-out animation
            product.style.opacity = '0';
            product.style.transform = 'scale(0.9)';
            setTimeout(() => {
                product.style.display = 'none';
            }, 300);
        }
    });
}

// Function to set active button
function setActiveButton(clickedButton) {
    filterButtons.forEach(button => {
        button.classList.remove('active');
    });
    clickedButton.classList.add('active');
}

// Add click event listeners to all filter buttons
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        const filterCategory = button.getAttribute('data-filter');

        // Update active button
        setActiveButton(button);

        // Filter products
        filterProducts(filterCategory);
    });
});

// Initialize: Set all products visible with animation
window.addEventListener('DOMContentLoaded', () => {
    productItems.forEach((product, index) => {
        product.style.opacity = '0';
        product.style.transform = 'scale(0.9)';
        product.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

        // Staggered animation on load
        setTimeout(() => {
            product.style.opacity = '1';
            product.style.transform = 'scale(1)';
        }, index * 50);
    });
});
