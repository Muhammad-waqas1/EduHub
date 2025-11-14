// subject.js
// Handles subcard clicks, file search, back button, and PDF rendering for each subject page

document.addEventListener('DOMContentLoaded', () => {
    // Back button functionality
    const backBtn = document.querySelector('.back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = '../index.html';
        });
    }

    // Subcard selection (Notes / Code / Videos / Extras)
    const subcards = document.querySelectorAll('.subcard');
    subcards.forEach(card => {
        card.addEventListener('click', () => {
            // Remove active from all
            subcards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');

            const type = card.dataset.type;
            const badge = document.querySelector('.subject-badge');
            const title = document.querySelector('.subject-title').textContent;

            if (badge) badge.textContent = `${title} • ${card.textContent.trim()}`;

            // Load files dynamically if needed (here just showing manual list)
            // Optionally you can fetch JSON for each type
        });
    });

    // Search functionality
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const q = searchInput.value.toLowerCase().trim();
            const items = document.querySelectorAll('.file-list li');
            items.forEach(item => {
                item.style.display = item.textContent.toLowerCase().includes(q) ? '' : 'none';
            });
        });
    }
});