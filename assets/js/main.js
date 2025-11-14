// assets/js/main.js
(function () {
    'use strict';

    const selectors = {
        subjectButtons: '.subject-card',
        panels: '.subject-panel',
        closeButtons: '.close-panel',
        mainContent: '#main-content',
        subjectsSection: '#subjects',
        backBtn: '#back-btn',
        themeToggle: '#theme-toggle',
        themeIcon: '#theme-icon'
    };

    let els = {};

    function $(s) { return document.querySelector(s); }
    function $all(s) { return Array.from(document.querySelectorAll(s)); }

    function cache() {
        els.subjectButtons = $all(selectors.subjectButtons);
        els.panels = $all(selectors.panels);
        els.closeButtons = $all(selectors.closeButtons);
        els.mainContent = $(selectors.mainContent);
        els.subjectsSection = $(selectors.subjectsSection);
        els.backBtn = $(selectors.backBtn);
        els.themeToggle = $(selectors.themeToggle);
        els.themeIcon = $(selectors.themeIcon);
    }

    function hideMainFromFlow() {
        // set display:none so it does not occupy layout space (prevents scrolling gap)
        if (els.mainContent) els.mainContent.style.display = 'none';
        if (els.backBtn) els.backBtn.style.display = 'flex';
    }

    function showMainInFlow() {
        if (els.mainContent) els.mainContent.style.display = '';
        if (els.backBtn) els.backBtn.style.display = 'none';
    }

    function closeAllPanels() {
        els.panels.forEach(p => {
            p.classList.remove('active');
            p.setAttribute('aria-hidden', 'true');
        });
        els.subjectButtons.forEach(b => b.setAttribute('aria-expanded', 'false'));
    }

    function openPanel(id, openerBtn) {
        const target = document.getElementById(id);
        if (!target) return console.warn('No panel with id', id);
        closeAllPanels();
        // hide the main content completely
        hideMainFromFlow();

        // mark opener expanded (for accessibility)
        if (openerBtn) openerBtn.setAttribute('aria-expanded', 'true');

        // show the panel
        target.classList.add('active');
        target.setAttribute('aria-hidden', 'false');

        // focus panel for keyboard users
        setTimeout(() => {
            target.focus();
            window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 16, behavior: 'smooth' });
        }, 60);
    }

    function attachSubjectClicks() {
        els.subjectButtons.forEach(btn => {
            btn.addEventListener('click', function (e) {
                const sub = btn.getAttribute('data-sub');
                const expanded = btn.getAttribute('aria-expanded') === 'true';
                if (expanded) { // close if already open
                    closeAllPanels();
                    showMainInFlow();
                    return;
                }
                openPanel(sub, btn);
            });
        });
    }

    function attachCloseButtons() {
        els.closeButtons.forEach(cb => cb.addEventListener('click', () => {
            closeAllPanels();
            showMainInFlow();
            window.scrollTo({ top: els.subjectsSection.offsetTop - 40, behavior: 'smooth' });
        }));
    }

    function attachBackButton() {
        if (!els.backBtn) return;
        els.backBtn.addEventListener('click', () => {
            closeAllPanels();
            showMainInFlow();
            window.scrollTo({ top: els.subjectsSection.offsetTop - 40, behavior: 'smooth' });
        });
    }

    function wireSubcardsAndSearch() {
        els.panels.forEach(panel => {
            // subcard clicks change badge text
            panel.querySelectorAll('.subcard').forEach(card => {
                card.addEventListener('click', () => {
                    const badge = panel.querySelector('.badge');
                    if (badge) {
                        badge.textContent = panel.querySelector('h3').textContent + ' • ' + card.textContent.trim();
                        badge.style.opacity = 0.6;
                        setTimeout(() => badge.style.opacity = 1, 220);
                    }
                });
            });

            // search
            const search = panel.querySelector('input');
            if (search) {
                search.addEventListener('input', () => {
                    const q = search.value.trim().toLowerCase();
                    const items = panel.querySelectorAll('.file-list .list-group-item');
                    items.forEach(it => {
                        const text = it.textContent.toLowerCase();
                        it.style.display = text.includes(q) ? '' : 'none';
                    });
                });
            }

            // upload inputs
            const uploader = panel.querySelector('.file-input');
            const list = panel.querySelector('.uploaded-list');
            if (uploader && list) {
                // keep simple map of blob URLs to allow revoking
                const uploaded = [];

                uploader.addEventListener('change', (ev) => {
                    const files = Array.from(ev.target.files);
                    files.forEach(file => {
                        const li = document.createElement('li');
                        li.className = 'list-group-item d-flex justify-content-between align-items-start gap-2';

                        // create blob url so user can download directly
                        const blobUrl = URL.createObjectURL(file);
                        uploaded.push(blobUrl);

                        const left = document.createElement('div');
                        left.innerHTML = `<a href="${blobUrl}" download="${escape(file.name)}" target="_blank">${file.name}</a>
                              <div class="meta">${(file.size / 1024).toFixed(1)} KB • ${new Date().toLocaleString()}</div>`;

                        // remove button
                        const removeBtn = document.createElement('button');
                        removeBtn.className = 'btn btn-sm btn-outline-danger';
                        removeBtn.type = 'button';
                        removeBtn.innerText = 'Remove';
                        removeBtn.addEventListener('click', () => {
                            // revoke blob and remove element
                            URL.revokeObjectURL(blobUrl);
                            li.remove();
                        });

                        li.appendChild(left);
                        li.appendChild(removeBtn);
                        list.prepend(li);
                    });

                    // clear input so same file can be uploaded again if needed
                    uploader.value = '';
                });
            }
        });
    }

    function attachKeyboardShortcuts() {
        // Esc closes any open panel
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // if any panel open, close and show main
                const anyOpen = els.panels.some(p => p.classList.contains('active'));
                if (anyOpen) {
                    closeAllPanels();
                    showMainInFlow();
                }
            }
        });
    }

    function themeToggle() {
        if (!els.themeToggle) return;
        els.themeToggle.addEventListener('click', () => {
            const isDark = document.body.classList.toggle('dark');
            els.themeToggle.setAttribute('aria-pressed', isDark ? 'true' : 'false');
            if (els.themeIcon) els.themeIcon.className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
            try { localStorage.setItem('eduhub-dark', isDark ? '1' : '0'); } catch (e) { }
        });

        // hydrate from localStorage
        try {
            const saved = localStorage.getItem('eduhub-dark');
            if (saved === '1') {
                document.body.classList.add('dark');
                if (els.themeIcon) els.themeIcon.className = 'fa-solid fa-sun';
                if (els.themeToggle) els.themeToggle.setAttribute('aria-pressed', 'true');
            }
        } catch (e) { }
    }

    function init() {
        cache();
        attachSubjectClicks();
        attachCloseButtons();
        attachBackButton();
        wireSubcardsAndSearch();
        attachKeyboardShortcuts();
        themeToggle();
    }

    // Bootstrapped on DOMContentLoaded
    document.addEventListener('DOMContentLoaded', init);
})();
