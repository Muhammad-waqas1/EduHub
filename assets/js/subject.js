/**
 * subject.js
 * Shared subject-page behavior:
 *  - loadFiles(subjectFolder) -> fetches notes/<subject>/files.json and renders list
 *  - file icon detection (pdf, pptx, docx, zip, img, video, others)
 *  - subcard switching (notes/code/videos/extras)
 *  - search
 *  - back button wiring
 *  - theme hydration (reads localStorage 'eduhub-dark')
 *
 * Usage on subject pages:
 *   <script src="../assets/js/subject.js"></script>
 *   <script> loadFiles('graph-theory'); </script>
 *
 * Notes:
 *  - files.json format: [{ "name": "Lecture 1 — Intro.pdf", "url": "Lecture1.pdf", "type": "notes" }, ...]
 *  - `type` is optional; if present, rendering filters by subcard type
 */

(function () {
    'use strict';

    // --- small helpers ---
    const el = selector => document.querySelector(selector);
    const els = selector => Array.from(document.querySelectorAll(selector));

    function safeJSON(res) {
        if (!res.ok) throw new Error('Network response not ok: ' + res.status);
        return res.json();
    }

    function getExt(url) {
        const m = url.match(/\.([0-9a-z]+)(?:[\?#]|$)/i);
        return m ? m[1].toLowerCase() : '';
    }

    function iconForFile(url) {
        const ext = getExt(url);
        switch (ext) {
            case 'pdf': return 'fa-solid fa-file-pdf';
            case 'ppt':
            case 'pptx': return 'fa-solid fa-file-powerpoint';
            case 'doc':
            case 'docx': return 'fa-solid fa-file-word';
            case 'zip':
            case 'rar': return 'fa-solid fa-file-zipper';
            case 'xls':
            case 'xlsx': return 'fa-solid fa-file-excel';
            case 'png':
            case 'jpg':
            case 'jpeg':
            case 'gif': return 'fa-solid fa-image';
            case 'mp4':
            case 'webm':
            case 'mov': return 'fa-solid fa-film';
            case 'ipynb': return 'fa-solid fa-code';
            case 'html':
            case 'htm': return 'fa-solid fa-code';
            case 'js':
            case 'py':
            case 'java':
            case 'c':
            case 'cpp':
            case 'rb':
            case 'go': return 'fa-solid fa-code';
            default: return 'fa-solid fa-file';
        }
    }

    function humanSize(bytes) {
        if (!bytes && bytes !== 0) return '';
        const units = ['B', 'KB', 'MB', 'GB'];
        let i = 0;
        let val = Number(bytes);
        while (val >= 1024 && i < units.length - 1) {
            val = val / 1024;
            i++;
        }
        return val.toFixed(val >= 10 || i === 0 ? 0 : 1) + ' ' + units[i];
    }

    // --- theme hydration (reads localStorage 'eduhub-dark') ---
    function hydrateTheme() {
        try {
            const saved = localStorage.getItem('eduhub-dark');
            if (saved === '1') {
                document.documentElement.setAttribute('data-theme', 'dark');
            } else {
                document.documentElement.removeAttribute('data-theme');
            }
        } catch (e) {
            // ignore storage errors
        }
    }

    // --- back button wiring ---
    function wireBackButton() {
        const back = el('.back-btn');
        if (!back) return;
        // If back button is <a href="../index.html"> it will just work.
        // If it's a button, attempt to go back in history then fallback to index.
        if (back.tagName.toLowerCase() === 'button') {
            back.addEventListener('click', function () {
                if (history.length > 1) history.back();
                else window.location.href = '../index.html';
            });
        } // else anchor will navigate
    }

    // --- subcard behavior ---
    function wireSubcards(renderCallback) {
        // renderCallback(selectedType) should re-render items (or filter them)
        const cards = els('.subcard');
        if (!cards.length) return;

        cards.forEach(c => {
            c.addEventListener('click', () => {
                cards.forEach(x => x.classList.remove('active'));
                c.classList.add('active');

                const type = c.dataset.type || 'notes';
                if (typeof renderCallback === 'function') renderCallback(type);
            });
        });
    }

    // --- search wiring ---
    function wireSearch(renderCallback) {
        const input = el('.search-input') || el('input[placeholder*="Search"]');
        if (!input) return;
        input.addEventListener('input', () => {
            const q = input.value.toLowerCase().trim();
            if (typeof renderCallback === 'function') renderCallback(null, q);
        });
    }

    // --- main loader: fetch files.json and render ---
    // subjectFolder: folder name under /notes/, e.g. 'graph-theory'
    // options: { listSelector: '#fileList', fallback: htmlString }







    // async function loadFiles(subjectFolder, options = {}) {
    //     const listSelector = options.listSelector || '#fileList';
    //     const listRoot = el(listSelector);
    //     if (!listRoot) {
    //         console.error('loadFiles: target list not found:', listSelector);
    //         return;
    //     }

    //     // initial state
    //     listRoot.innerHTML = '<li>Loading files…</li>';

    //     let files = [];
    //     try {
    //         const res = await fetch(`../notes/${subjectFolder}/files.json`, { cache: 'no-store' });
    //         files = await safeJSON(res);
    //         if (!Array.isArray(files)) throw new Error('files.json must be an array');
    //     } catch (err) {
    //         console.warn('Could not load files.json, attempting fallback (index listing).', err);
    //         // graceful fallback: try to fetch index.html of notes folder and attempt extract links (best-effort)
    //         try {
    //             const indexRes = await fetch(`../notes/${subjectFolder}/`);
    //             const text = await indexRes.text();
    //             // crude regex to pick hrefs for known extensions
    //             const re = /href=["']([^"']+\.(pdf|pptx?|docx?|zip|png|jpe?g|mp4|ipynb|zip))["']/ig;
    //             let match;
    //             const found = new Map();
    //             while ((match = re.exec(text)) !== null) {
    //                 const url = match[1];
    //                 const name = url.split('/').pop();
    //                 if (!found.has(name)) found.set(name, { name, url, type: 'notes' });
    //             }
    //             files = Array.from(found.values());
    //         } catch (err2) {
    //             console.error('Fallback index listing failed:', err2);
    //         }
    //     }

    //     // ensure files is an array of objects {name, url, type?, size?}
    //     files = files.map(f => {
    //         if (typeof f === 'string') {
    //             return { name: f.split('/').pop(), url: f, type: 'notes' };
    //         }
    //         return {
    //             name: f.name || (f.url ? f.url.split('/').pop() : 'file'),
    //             url: f.url || f.name || '',
    //             type: f.type || 'notes',
    //             size: f.size || null
    //         };
    //     });

    //     // state for filtering
    //     let activeType = el('.subcard.active') ? (el('.subcard.active').dataset.type || 'notes') : 'notes';
    //     let searchQuery = '';

    //     function renderList(typeFilter = null, search = null) {
    //         activeType = typeFilter === null ? activeType : (typeFilter || 'notes');
    //         searchQuery = typeof search === 'string' ? search : searchQuery;

    //         const filtered = files.filter(item => {
    //             // type filter: if item.type exists, use it; else keep all when activeType is 'notes'
    //             if (activeType && item.type && item.type !== activeType) return false;
    //             // search filter
    //             if (searchQuery) {
    //                 return (item.name || '').toLowerCase().includes(searchQuery);
    //             }
    //             return true;
    //         });

    //         if (!filtered.length) {
    //             listRoot.innerHTML = '<li>No files found.</li>';
    //             return;
    //         }

    //         // build nodes
    //         listRoot.innerHTML = '';
    //         const listFragment = document.createDocumentFragment();

    //         filtered.forEach(item => {
    //             const li = document.createElement('li');
    //             li.className = 'mb-2';

    //             const anchor = document.createElement('a');
    //             anchor.href = `../notes/${subjectFolder}/${item.url}`;
    //             anchor.target = '_blank';
    //             anchor.rel = 'noopener noreferrer';
    //             anchor.className = 'd-flex align-items-center justify-content-between';

    //             const left = document.createElement('div');
    //             left.style.display = 'flex';
    //             left.style.alignItems = 'center';
    //             left.style.gap = '12px';

    //             const icon = document.createElement('i');
    //             icon.className = iconForFile(item.url) + ' fa-lg';
    //             icon.setAttribute('aria-hidden', 'true');

    //             const meta = document.createElement('div');
    //             const title = document.createElement('div');
    //             title.textContent = item.name;
    //             title.style.fontWeight = '600';
    //             const sub = document.createElement('div');
    //             sub.textContent = (item.size ? humanSize(item.size) + ' • ' : '') + (item.type || '');
    //             sub.style.fontSize = '12px';
    //             sub.style.color = 'var(--muted, #6b7280)';

    //             meta.appendChild(title);
    //             meta.appendChild(sub);

    //             left.appendChild(icon);
    //             left.appendChild(meta);

    //             const right = document.createElement('div');
    //             right.innerHTML = '<i class="fa-solid fa-arrow-up-right-from-square"></i>';

    //             anchor.appendChild(left);
    //             anchor.appendChild(right);
    //             li.appendChild(anchor);
    //             listFragment.appendChild(li);
    //         });

    //         listRoot.appendChild(listFragment);
    //     }

    //     // wire controls
    //     wireSubcards((type) => renderList(type, searchQuery));
    //     wireSearch((type, q) => renderList(type || null, q || ''));

    //     // initial render
    //     renderList(activeType, searchQuery);
    // }



    // --- expose loadFiles globally so subject pages can call it (we use window.loadFiles) ---
    window.loadFiles = loadFiles;

    // --- on DOM ready ---
    document.addEventListener('DOMContentLoaded', function () {
        try {
            hydrateTheme();
            wireBackButton();

            // if subject pages included an inline call like loadFiles('x'), that will run after this script load.
            // otherwise do nothing here.
        } catch (e) {
            console.error('subject.js init error:', e);
        }
    });

})();



document.querySelectorAll('.subcard').forEach(card => {
    card.addEventListener('click', function () {
        // Remove active from all subcards
        document.querySelectorAll('.subcard').forEach(c => c.classList.remove('active'));

        // Add active to clicked
        this.classList.add('active');

        // Load files according to selected type
        const type = this.dataset.type;
        const subjectFolder = window.location.pathname.split('/')[2].slice(0, -5); // extract folder name dynamically
        // console.log(subjectFolder)
        loadFiles(subjectFolder, type);
    });
});

async function loadFiles(subjectFolder, type = 'notes') {
    const listContainer = document.getElementById('pdfList');
    const totalFilesSpan = document.getElementById('totalFiles');
    const lastUpdatedSpan = document.getElementById('lastUpdated');

    try {
        const res = await fetch(`../notes/${subjectFolder}/files.json`);
        const filesData = await res.json();

        // Combine all files for stats
        const allFiles = [...(filesData.notes || []), ...(filesData.extras || [])];
        totalFilesSpan && (totalFilesSpan.textContent = allFiles.length);

        // Last updated
        if (allFiles.length) {
            const latestDate = allFiles.reduce((latest, file) => {
                return new Date(file.date) > new Date(latest) ? file.date : latest;
            }, allFiles[0].date);
            lastUpdatedSpan && (lastUpdatedSpan.textContent = new Date(latestDate).toLocaleDateString());
        } else {
            lastUpdatedSpan && (lastUpdatedSpan.textContent = '-');
        }

        // Filter files by type
        const filtered = type === 'notes' ? filesData.notes : filesData.extras;

        if (!filtered || !filtered.length) {
            listContainer.innerHTML = '<p class="text-muted text-center">No files found.</p>';
            return;
        }

        // Build table
        const tableHTML = `
            <div class="table-responsive">
                <table class="table table-hover table-striped align-middle">
                    <thead>
                        <tr>
                            <th>File Name</th>
                            <th>Type</th>
                            <th>Size</th>
                            <th>Date Uploaded</th>
                            <th>View</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filtered.map(f => `
                            <tr>
                                <td>${f.name}</td>
                                <td>${f.type.toUpperCase()}</td>
                                <td>${f.size}</td>
                                <td>${new Date(f.date).toLocaleDateString()}</td>
                                <td>
                                    <a href="../notes/${subjectFolder}/${f.url}" target="_blank" class="btn btn-sm btn-primary">
                                        View
                                    </a>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        listContainer.innerHTML = tableHTML;
    } catch (err) {
        listContainer.innerHTML = '<p class="text-danger">Error loading files.</p>';
        console.error(err);
    }
}
