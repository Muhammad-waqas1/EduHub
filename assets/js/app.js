// app.js
// Handles theme toggle, subject navigation, and PDF listing

// Theme Toggle
const themeToggle = document.getElementById('themeToggle');

themeToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark-mode');
    localStorage.setItem('theme', document.documentElement.classList.contains('dark-mode') ? 'dark' : 'light');
});

// Apply saved theme
(function loadTheme() {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
        document.documentElement.classList.add('dark-mode');
    }
})();

// Dynamic Subject Loader
const subjects = document.querySelectorAll('.subject-box');

subjects.forEach(box => {
    box.addEventListener('click', () => {
        const subject = box.getAttribute('data-subject');
        window.location.href = `/subjects/${subject}.html`;
    });
});

// PDF Loader (on subject pages)
async function loadPDFs(folderName) {
    const listContainer = document.getElementById('pdfList');
    if (!listContainer) return;

    try {
        const response = await fetch(`/notes/${folderName}/`);
        const text = await response.text();

        const pdfRegex = /href=\"(.*?\.pdf)\"/g;
        let match;
        const pdfFiles = [];

        while ((match = pdfRegex.exec(text)) !== null) {
            pdfFiles.push(match[1]);
        }

        if (pdfFiles.length === 0) {
            listContainer.innerHTML = `<p>No PDF Notes Available.</p>`;
            return;
        }

        listContainer.innerHTML = pdfFiles
            .map(file => `<li><a href="${file}" target="_blank">${file.split('/').pop()}</a></li>`)
            .join('');

    } catch (err) {
        listContainer.innerHTML = `<p>Error loading notes.</p>`;
        console.error('PDF Load Error:', err);
    }
}
