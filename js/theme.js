// Theme Management System for Online Talk
// This file should be included in all pages to maintain consistent theming

// Theme configuration
const THEME_STORAGE_KEY = 'siteTheme';
const DEFAULT_THEME = 'cream';

// Load and apply saved theme immediately on page load
(function() {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || DEFAULT_THEME;
    applyThemeImmediate(savedTheme);
})();

// Apply theme without animation (for initial load)
function applyThemeImmediate(theme) {
    document.body.className = '';
    
    if (theme === 'white') {
        document.body.classList.add('theme-white');
    } else if (theme === 'dark') {
        document.body.classList.add('theme-dark');
    }
    // cream is default (no class needed)
}

// Apply theme with transition
function applyTheme(theme) {
    document.body.className = '';
    
    if (theme === 'white') {
        document.body.classList.add('theme-white');
    } else if (theme === 'dark') {
        document.body.classList.add('theme-dark');
    }
    // cream is default (no class needed)
}

// Save theme to localStorage
function saveTheme(theme) {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    applyTheme(theme);
}

// Get current theme
function getCurrentTheme() {
    return localStorage.getItem(THEME_STORAGE_KEY) || DEFAULT_THEME;
}

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        applyTheme,
        saveTheme,
        getCurrentTheme
    };
}