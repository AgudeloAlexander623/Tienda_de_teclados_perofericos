// ========== IMAGE SLIDER FUNCTIONALITY ==========

let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');
const prevButton = document.querySelector('.slider-arrow.prev');
const nextButton = document.querySelector('.slider-arrow.next');
const totalSlides = slides.length;

// Auto-slide interval (5 seconds)
let autoSlideInterval;

// Function to show a specific slide
function showSlide(index) {
    // Wrap around if index is out of bounds
    if (index >= totalSlides) {
        currentSlide = 0;
    } else if (index < 0) {
        currentSlide = totalSlides - 1;
    } else {
        currentSlide = index;
    }

    // Remove active class from all slides and dots
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));

    // Add active class to current slide and dot
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
}

// Function to go to next slide
function nextSlide() {
    showSlide(currentSlide + 1);
}

// Function to go to previous slide
function prevSlide() {
    showSlide(currentSlide - 1);
}

// Function to start auto-sliding
function startAutoSlide() {
    autoSlideInterval = setInterval(nextSlide, 5000);
}

// Function to stop auto-sliding
function stopAutoSlide() {
    clearInterval(autoSlideInterval);
}

// Event listeners for navigation arrows
nextButton.addEventListener('click', () => {
    nextSlide();
    stopAutoSlide();
    startAutoSlide(); // Restart auto-slide after manual navigation
});

prevButton.addEventListener('click', () => {
    prevSlide();
    stopAutoSlide();
    startAutoSlide(); // Restart auto-slide after manual navigation
});

// Event listeners for dots
dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        showSlide(index);
        stopAutoSlide();
        startAutoSlide(); // Restart auto-slide after manual navigation
    });
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        prevSlide();
        stopAutoSlide();
        startAutoSlide();
    } else if (e.key === 'ArrowRight') {
        nextSlide();
        stopAutoSlide();
        startAutoSlide();
    }
});

// Pause auto-slide on hover
const sliderContainer = document.querySelector('.slider-container');
sliderContainer.addEventListener('mouseenter', stopAutoSlide);
sliderContainer.addEventListener('mouseleave', startAutoSlide);

// Initialize slider
showSlide(0);
startAutoSlide();
