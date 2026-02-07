document.addEventListener('DOMContentLoaded', () => {
    // === Gallery Filtering ===
    const galleryGrid = document.querySelector('.gallery-grid');
    const filterBtns = document.querySelectorAll('.filter-btn');

    // === Gallery Data (Permanent + Local) ===
    const data = typeof defaultGallery !== 'undefined' ? defaultGallery : { portfolio: [], vip: [] };

    const savedGallery = JSON.parse(localStorage.getItem('siteGallery')) || { portfolio: [] };

    // Convert old simple array to object if necessary or handle both
    const localPortfolio = Array.isArray(savedGallery.portfolio)
        ? savedGallery.portfolio
            .filter(item => {
                const src = typeof item === 'string' ? item : item?.src;
                return src && src.length > 10; // Filter out broken/empty
            })
            .map(item => {
                if (typeof item === 'string') return { src: item, category: 'all', title: 'Arte Adicionada' };
                return item;
            })
        : [];

    // Merge and remove duplicates (Aggressive Fuzzy Deduplication)
    const combined = [...data.portfolio, ...localPortfolio];
    const uniqueMap = new Map();
    const cleanStr = (s) => s ? s.toLowerCase().replace(/[^a-z0-9]/g, '').trim() : '';

    combined.forEach(item => {
        if (!item.src) return;
        const isPerm = item.src.includes('images/');
        const fileName = item.src.includes('/') ? item.src.split('/').pop() : '';
        const cleanName = cleanStr(fileName.split('.')[0] || item.title);

        let key = isPerm ? cleanName : (cleanName || item.src.substring(0, 50));

        // Fuzzy check
        let foundKey = null;
        for (let existingKey of uniqueMap.keys()) {
            if (existingKey && key && (existingKey.includes(key) || key.includes(existingKey))) {
                foundKey = existingKey;
                break;
            }
        }

        if (foundKey) {
            const existingIsPerm = uniqueMap.get(foundKey).src.includes('images/');
            if (!existingIsPerm && isPerm) {
                uniqueMap.delete(foundKey);
                uniqueMap.set(key, item);
            }
        } else {
            uniqueMap.set(key, item);
        }
    });

    const fullPortfolio = Array.from(uniqueMap.values());

    // === Load All Images ===
    if (fullPortfolio.length > 0) {
        galleryGrid.innerHTML = ''; // Clear placeholders
        fullPortfolio.forEach(itemData => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            item.setAttribute('data-category', itemData.category);

            // Handle metadata if present
            const hasDownload = itemData.download ? true : false;

            item.innerHTML = `
                <img src="${itemData.src}" alt="${itemData.title}" loading="lazy">
                ${hasDownload ? '<div class="download-badge" title="Arquivo PSD Disponível">📄 PSD</div>' : ''}
                <div class="item-overlay">
                    <h3 class="item-title">${itemData.title}</h3>
                </div>
            `;
            if (hasDownload) {
                item.setAttribute('data-download', itemData.download);
            }

            galleryGrid.appendChild(item);
        });
    }

    // Re-query gallery items after dynamic content might have been added
    const galleryItems = document.querySelectorAll('.gallery-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active to clicked
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            galleryItems.forEach(item => {
                if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                    item.classList.remove('hide');
                    // Reset animation
                    item.style.animation = 'none';
                    item.offsetHeight; /* trigger reflow */
                    item.style.animation = 'fadeInItem 0.5s ease forwards';
                } else {
                    item.classList.add('hide');
                }
            });
        });
    });

    // === Modal / Lightbox ===
    const modal = document.getElementById('gallery-modal');
    const modalImg = document.getElementById('modal-img');
    const modalCaption = document.getElementById('modal-caption');
    const closeBtn = document.querySelector('.modal-close');

    function openModal(src, title, download = null) {
        if (!modal) return;
        modalImg.src = src;
        modalImg.style.display = 'block';
        modalImg.alt = title;
        modalCaption.innerText = title;

        if (download) {
            modalCaption.innerHTML += `<br><a href="${download}" target="_blank" class="btn btn-primary" style="margin-top:20px; display:inline-block; font-size:0.9rem; padding: 12px 25px;">📥 Baixar Arquivo Fonte (PSD/Original)</a>`;
        }

        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    // Expose for dynamic content
    window.openModal = openModal;

    // Delegate click for gallery items
    document.addEventListener('click', (e) => {
        const item = e.target.closest('.gallery-item');
        if (item) {
            const img = item.querySelector('img');
            const title = item.querySelector('.item-title') ? item.querySelector('.item-title').textContent : 'Arte';
            const download = item.getAttribute('data-download');
            if (img) openModal(img.src, title, download);
        }
    });

    function closeModal() {
        if (modal) {
            modal.classList.remove('open');
            document.body.style.overflow = '';
        }
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    // Close on click outside
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('open')) {
            closeModal();
        }
    });
});
