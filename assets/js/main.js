// Theme Toggle
let currentTheme = localStorage.getItem('wocon-theme') || 'light';

function toggleTheme() {
    // Add transition class for smooth animation
    document.documentElement.classList.add('theme-transition');
    
    // Toggle theme
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('wocon-theme', currentTheme);
    updateTheme();
    
    // Remove transition class after animation completes
    setTimeout(() => {
        document.documentElement.classList.remove('theme-transition');
    }, 300);
}

function updateTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) {
        if (currentTheme === 'light') {
            themeIcon.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>';
        } else {
            themeIcon.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41.39.39 1.03.39 1.41 0l1.06-1.06zm-10.96 1.06c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41L6.47 6.05z"/></svg>';
        }
    }
    
    // Update theme toggle button style
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        if (currentTheme === 'dark') {
            themeToggle.style.background = 'var(--background-light)';
            themeToggle.style.borderColor = 'var(--deep-blue)';
            themeToggle.style.color = 'var(--text-primary)';
        } else {
            themeToggle.style.background = 'var(--background-light)';
            themeToggle.style.borderColor = 'var(--deep-blue)';
            themeToggle.style.color = 'var(--text-primary)';
        }
    }
}

// Preloader
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    setTimeout(() => {
        preloader.classList.add('hidden');
    }, 500);
});

// Scroll Progress Bar
window.addEventListener('scroll', () => {
    const scrollProgress = document.getElementById('scroll-progress');
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    scrollProgress.style.width = scrollPercent + '%';

    // Back to top button
    const backToTop = document.getElementById('back-to-top');
    if (scrollTop > 300) {
        backToTop.classList.add('visible');
    } else {
        backToTop.classList.remove('visible');
    }

    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    if (scrollTop > 50) {
        navbar.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
    }
});

// Back to top function
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Initialize theme
document.addEventListener('DOMContentLoaded', () => {
    updateTheme();
});

// Smooth scroll to download section
function scrollToDownload() {
    const downloadSection = document.getElementById('download');
    if (downloadSection) {
        downloadSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Smooth scroll for navigation links
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Toggle docs details
function toggleDocsDetails(id) {
    const details = document.getElementById(id + '-details');
    const card = details.closest('.docs-card');
    
    // Toggle the active class and details visibility
    card.classList.toggle('active');
    details.classList.toggle('show');
}

// Close other docs details when opening a new one
document.querySelectorAll('.docs-card').forEach(card => {
    card.addEventListener('click', function() {
        // Close all other cards
        document.querySelectorAll('.docs-card').forEach(otherCard => {
            if (otherCard !== this) {
                otherCard.classList.remove('active');
                const otherDetails = otherCard.querySelector('.docs-details');
                if (otherDetails) {
                    otherDetails.classList.remove('show');
                }
            }
        });
    });
});

// Toggle mobile menu
function toggleMobileMenu() {
    const navMenu = document.getElementById('nav-menu');
    navMenu.classList.toggle('active');
    
    // Change menu icon
    const menuButton = document.getElementById('mobile-menu-button');
    const svg = menuButton.querySelector('svg');
    
    if (navMenu.classList.contains('active')) {
        // Change to close icon
        svg.innerHTML = '<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>';
    } else {
        // Change back to menu icon
        svg.innerHTML = '<path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>';
    }
}

// Close mobile menu when clicking on a nav link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function() {
        const navMenu = document.getElementById('nav-menu');
        if (navMenu.classList.contains('active')) {
            toggleMobileMenu();
        }
    });
});

// Toggle table details in database schema section
function toggleTableDetails(id) {
    const details = document.getElementById(id + '-details');
    const card = details.closest('.table-card');
    
    // Toggle the active class and details visibility
    card.classList.toggle('active');
    details.classList.toggle('show');
}

// Close other table details when opening a new one
document.querySelectorAll('.table-card').forEach(card => {
    card.addEventListener('click', function() {
        // Close all other cards
        document.querySelectorAll('.table-card').forEach(otherCard => {
            if (otherCard !== this) {
                otherCard.classList.remove('active');
                const otherDetails = otherCard.querySelector('.table-details');
                if (otherDetails) {
                    otherDetails.classList.remove('show');
                }
            }
        });
    });
});

// Add animation to database architecture tree nodes
document.querySelectorAll('.tree-node').forEach(node => {
    node.addEventListener('mouseenter', function() {
        this.style.transform = 'translateX(5px)';
        this.style.transition = 'transform 0.3s ease';
    });
    
    node.addEventListener('mouseleave', function() {
        this.style.transform = 'translateX(0)';
    });
});
