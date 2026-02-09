document.addEventListener('DOMContentLoaded', () => {
    const galleryGrid = document.querySelector('.gallery-grid');
    const filterBtns = document.querySelectorAll('.filter-btn');

    const data = typeof defaultGallery !== 'undefined' ? defaultGallery : { portfolio: [], vip: [] };
    const savedGallery = JSON.parse(localStorage.getItem('siteGallery')) || { portfolio: [] };

    const localPortfolio = Array.isArray(savedGallery.portfolio)
        ? savedGallery.portfolio
            .filter(item => {
                const src = typeof item === 'string' ? item : item?.src;
                return src && src.length > 10;
            })
            .map(item => {
                if (typeof item === 'string') return { src: item, category: 'all', title: 'Arte Adicionada' };
                return item;
            })
        : [];

    const combined = [...data.portfolio, ...localPortfolio];
    const uniqueMap = new Map();
    const cleanStr = (s) => s ? s.toLowerCase().replace(/[^a-z0-9]/g, '').trim() : '';

    combined.forEach(item => {
        if (!item.src) return;
        const isPerm = item.src.includes('images/');
        const fileName = item.src.includes('/') ? item.src.split('/').pop() : '';
        const cleanName = cleanStr(fileName.split('.')[0] || item.title);

        let key = isPerm ? cleanName : (cleanName || item.src.substring(0, 50));

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

    if (fullPortfolio.length > 0 && galleryGrid) {
        galleryGrid.innerHTML = '';
        fullPortfolio.forEach(itemData => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            item.setAttribute('data-category', itemData.category);

            const hasDownload = itemData.download ? true : false;

            item.innerHTML = `
                <img src="${itemData.src}" alt="${itemData.title}" loading="lazy">
                ${hasDownload ? '<div class="download-badge" title="Arquivo PSD Disponível">&#x1F4C4; PSD</div>' : ''}
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

    const galleryItems = document.querySelectorAll('.gallery-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            galleryItems.forEach(item => {
                if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                    item.classList.remove('hide');
                    item.style.animation = 'none';
                    item.offsetHeight;
                    item.style.animation = 'fadeInItem 0.5s ease forwards';
                } else {
                    item.classList.add('hide');
                }
            });
        });
    });

    // === Modal / Lightbox with Navigation ===
    const modal = document.getElementById('gallery-modal');
    const modalImg = document.getElementById('modal-img');
    const modalCaption = document.getElementById('modal-caption');
    const closeBtn = document.querySelector('.modal-close');
    const prevBtn = document.querySelector('.modal-prev');
    const nextBtn = document.querySelector('.modal-next');
    const counterEl = document.querySelector('.modal-counter');

    let currentIndex = 0;

    function getVisibleItems() {
        return Array.from(document.querySelectorAll('.gallery-item:not(.hide)'));
    }

    function openModal(src, title, download = null, index = -1) {
        if (!modal) return;
        modalImg.src = src;
        modalImg.style.display = 'block';
        modalImg.alt = title;
        modalCaption.innerText = title;

        if (download) {
            modalCaption.innerHTML += `<br><a href="${download}" target="_blank" class="btn btn-primary" style="margin-top:15px; display:inline-block; font-size:0.9rem; padding: 12px 25px;">&#x1F4E5; Baixar Arquivo Fonte</a>`;
        }

        const visible = getVisibleItems();
        if (index >= 0) {
            currentIndex = index;
        }

        if (counterEl && visible.length > 1) {
            counterEl.textContent = `${currentIndex + 1} / ${visible.length}`;
            counterEl.style.display = 'block';
        } else if (counterEl) {
            counterEl.style.display = 'none';
        }

        if (prevBtn) prevBtn.style.display = visible.length > 1 ? 'flex' : 'none';
        if (nextBtn) nextBtn.style.display = visible.length > 1 ? 'flex' : 'none';

        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    window.openModal = openModal;

    function navigateModal(direction) {
        const visible = getVisibleItems();
        if (visible.length <= 1) return;

        currentIndex += direction;
        if (currentIndex < 0) currentIndex = visible.length - 1;
        if (currentIndex >= visible.length) currentIndex = 0;

        const item = visible[currentIndex];
        const img = item.querySelector('img');
        const title = item.querySelector('.item-title') ? item.querySelector('.item-title').textContent : 'Arte';
        const download = item.getAttribute('data-download');

        modalImg.src = img.src;
        modalImg.alt = title;
        modalCaption.innerText = title;

        if (download) {
            modalCaption.innerHTML += `<br><a href="${download}" target="_blank" class="btn btn-primary" style="margin-top:15px; display:inline-block; font-size:0.9rem; padding: 12px 25px;">&#x1F4E5; Baixar Arquivo Fonte</a>`;
        }

        if (counterEl) {
            counterEl.textContent = `${currentIndex + 1} / ${visible.length}`;
        }
    }

    if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); navigateModal(-1); });
    if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); navigateModal(1); });

    document.addEventListener('click', (e) => {
        const item = e.target.closest('.gallery-item');
        if (item) {
            const visible = getVisibleItems();
            const index = visible.indexOf(item);
            const img = item.querySelector('img');
            const title = item.querySelector('.item-title') ? item.querySelector('.item-title').textContent : 'Arte';
            const download = item.getAttribute('data-download');
            if (img) openModal(img.src, title, download, index);
        }
    });

    function closeModal() {
        if (modal) {
            modal.classList.remove('open');
            document.body.style.overflow = '';
        }
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (!modal || !modal.classList.contains('open')) return;
        if (e.key === 'Escape') closeModal();
        if (e.key === 'ArrowLeft') navigateModal(-1);
        if (e.key === 'ArrowRight') navigateModal(1);
    });
});
