document.addEventListener('DOMContentLoaded', () => {
    // === Gallery Filtering ===
    const galleryGrid = document.querySelector('.gallery-grid');
    const filterBtns = document.querySelectorAll('.filter-btn');

    // === Gallery Data (Permanent + Local) ===
    const defaultGallery = {
        portfolio: [
            { src: 'images/portfolio/YAN DESENHO!!!.png', category: 'oc', title: 'Minha OC' }
            // Adicione mais artes aqui seguindo o padrão acima!
        ]
    };

    const savedGallery = JSON.parse(localStorage.getItem('siteGallery')) || { portfolio: [] };

    // Convert old simple array to object if necessary or handle both
    const localPortfolio = Array.isArray(savedGallery.portfolio)
        ? savedGallery.portfolio.map(src => ({ src, category: 'all', title: 'Arte Adicionada' }))
        : [];

    // Merge and remove duplicates (by src)
    const combined = [...defaultGallery.portfolio, ...localPortfolio];
    const uniqueMap = new Map();
    combined.forEach(item => {
        if (!uniqueMap.has(item.src)) {
            uniqueMap.set(item.src, item);
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

            item.innerHTML = `
                <img src="${itemData.src}" alt="${itemData.title}" loading="lazy">
                <div class="item-overlay">
                    <h3 class="item-title">${itemData.title}</h3>
                </div>
            `;

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

    // As we are using placeholders, we'll clone the content or set bg color
    // For real images: modalImg.src = this.querySelector('img').src;

    // Re-highlight or re-query for modal usage
    const itemsForModal = document.querySelectorAll('.gallery-item');

    itemsForModal.forEach(item => {
        item.addEventListener('click', function () {
            const img = this.querySelector('img');
            const title = this.querySelector('.item-title') ? this.querySelector('.item-title').textContent : 'Arte';

            if (img && img.src) {
                modalImg.src = img.src;
                modalImg.style.display = 'block';
                modalImg.alt = title;
                modalCaption.textContent = title;
                modal.classList.add('open');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    function closeModal() {
        modal.classList.remove('open');
        document.body.style.overflow = '';
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
