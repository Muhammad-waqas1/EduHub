/**
 * assets/js/app.js
 * Centralized site behavior for EduHub (index and global shared UI).
 *
 * Features:
 *  - Theme toggle (light/dark) using localStorage key "eduhub-dark"
 *  - Hydration of saved theme on load
 *  - Wires a theme toggle button with id="theme-toggle" and icon id="theme-icon"
 *  - Ensures keyboard accessibility for the toggle (Enter / Space)
 *  - Mobile nav helper: closes bootstrap collapse when nav links are clicked
 *  - Smooth scroll for on-page anchor links
 *  - Small defensive guards + helpful console messages
 *
 * Usage: simply include <script src="assets/js/app.js" defer></script> in pages
 */

(function () {
    'use strict';

    const LS_KEY = 'eduhub-dark';

    // -------------------------
    // Helpers
    // -------------------------
    const $ = (s, ctx = document) => ctx.querySelector(s);
    const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));

    function safe(fn) {
        try { fn(); } catch (e) { console.error('app.js caught:', e); }
    }

    // -------------------------
    // Theme handling
    // -------------------------
    function setDarkMode(enabled) {
        try {
            if (enabled) {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem(LS_KEY, '1');
            } else {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem(LS_KEY, '0');
            }
            updateThemeIcon(enabled);
        } catch (e) {
            console.warn('Failed to set theme:', e);
        }
    }

    function updateThemeIcon(isDark) {
        const icon = $('#theme-icon');
        if (!icon) return;
        // Use sun for dark, moon for light (inverse — dark shows sun to indicate toggle)
        icon.className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    }

    function hydrateThemeFromStorage() {
        try {
            const saved = localStorage.getItem(LS_KEY);
            const isDark = saved === '1';
            if (isDark) document.documentElement.setAttribute('data-theme', 'dark');
            else document.documentElement.removeAttribute('data-theme');

            updateThemeIcon(isDark);
            // if there's a toggle button, update its aria-pressed
            const toggle = $('#theme-toggle');
            if (toggle) toggle.setAttribute('aria-pressed', isDark ? 'true' : 'false');
        } catch (e) {
            console.warn('Could not hydrate theme:', e);
        }
    }

    function wireThemeToggle() {
        const toggle = $('#theme-toggle');
        if (!toggle) {
            // nothing to wire
            return;
        }
        // click handler
        toggle.addEventListener('click', (ev) => {
            ev.preventDefault();
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            setDarkMode(!isDark);
            toggle.setAttribute('aria-pressed', (!isDark) ? 'true' : 'false');
        });

        // keyboard support (Enter / Space)
        toggle.addEventListener('keyup', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggle.click();
            }
        });
    }

    // -------------------------
    // Mobile nav behavior (Bootstrap collapse)
    // -------------------------
    function wireNavCollapse() {
        // Works with standard bootstrap structure: #nav collapse and .navbar-nav .nav-link
        const collapseEl = $('#nav');
        if (!collapseEl) return;

        // Listen for clicks on nav links and collapse the navbar if open (mobile)
        const links = $$('.navbar-nav a', collapseEl);
        links.forEach(a => {
            a.addEventListener('click', () => {
                // if the collapse is open, programmatically close it by triggering click on toggler
                // find toggler button controlling this collapse
                const toggler = document.querySelector('[data-bs-target="#nav"], [data-bs-target="#' + collapseEl.id + '"]') || document.querySelector('.navbar-toggler');
                if (toggler && window.getComputedStyle(toggler).display !== 'none') {
                    try {
                        toggler.click();
                    } catch (e) {
                        // fallback: try to remove the 'show' class
                        collapseEl.classList.remove('show');
                    }
                }
            });
        });
    }

    // -------------------------
    // Smooth anchor scrolling for on-page links
    // -------------------------
    function wireSmoothAnchors() {
        // anchors linking to same page fragments
        const anchors = $$('a[href^="#"]');
        anchors.forEach(a => {
            a.addEventListener('click', (ev) => {
                // allow normal behavior for links where href == '#' or anchor is empty
                const href = a.getAttribute('href') || '';
                if (href === '#' || href === '') return;
                const id = href.slice(1);
                const target = document.getElementById(id);
                if (!target) return; // not on this page
                ev.preventDefault();
                // scroll with offset to account for sticky navbar
                const y = target.getBoundingClientRect().top + window.scrollY - 72;
                window.scrollTo({ top: y, behavior: 'smooth' });
                // update history
                try { history.pushState(null, '', href); } catch (e) { }
            });
        });
    }

    // -------------------------
    // Small accessibility tweaks
    // -------------------------
    function removeFocusOnMouseDown() {
        // When users click a button, prevent the persistent :focus outline if they used mouse
        document.addEventListener('mousedown', (e) => {
            if (e.target && (e.target.matches('button') || e.target.closest('button'))) {
                try { (e.target).blur(); } catch (e) { /* ignore */ }
            }
        });
    }

    // -------------------------
    // Init
    // -------------------------
    function init() {
        safe(hydrateThemeFromStorage);
        safe(wireThemeToggle);
        safe(wireNavCollapse);
        safe(wireSmoothAnchors);
        safe(removeFocusOnMouseDown);

        // helpful console info in dev mode
        if (window && window.console && window.console.info) {
            console.info('EduHub app.js initialized — theme hydrated, nav and anchors wired.');
        }
    }

    // Run once DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // expose API (optional)
    window.EduHub = window.EduHub || {};
    window.EduHub.setDarkMode = setDarkMode;
    window.EduHub.hydrateTheme = hydrateThemeFromStorage;
})();




// Mobile menu toggle
const mobileBtn = document.querySelector('.mobile-menu-btn');
const mobileMenu = document.querySelector('.mobile-menu');

mobileBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('show');
    mobileBtn.classList.toggle('active'); // trigger hamburger animation
});

// Close menu if clicking outside
document.addEventListener('click', (e) => {
    if (!mobileMenu.contains(e.target) && !mobileBtn.contains(e.target)) {
        mobileMenu.classList.remove('show');
        mobileBtn.classList.remove('active');
    }
});



