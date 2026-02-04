document.addEventListener('DOMContentLoaded', () => {
    // === Gallery Filtering ===
    const galleryGrid = document.querySelector('.gallery-grid');
    const filterBtns = document.querySelectorAll('.filter-btn');

    // === Load Dynamic Images ===
    const savedGallery = JSON.parse(localStorage.getItem('siteGallery'));
    if (savedGallery && savedGallery.portfolio) {
        savedGallery.portfolio.forEach(imgSrc => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            item.setAttribute('data-category', 'all'); // Assign 'all' or default category
            item.innerHTML = `<img src="${imgSrc}" alt="Arte do Portfólio">`;
            // Insert at the beginning or end
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

    galleryItems.forEach(item => {
        item.addEventListener('click', function () {
            // Setup for placeholder demonstration
            const placeholder = this.querySelector('.img-placeholder');
            const title = this.querySelector('.item-title').textContent;

            // If real image exists
            const img = this.querySelector('img');

            if (img) {
                modalImg.src = img.src;
                modalImg.style.display = 'block';
                modalImg.style.backgroundColor = 'transparent';
            } else if (placeholder) {
                // Determine color from placeholder style or computed style
                // For demo, just making a colored block
                modalImg.src = '';
                modalImg.style.display = 'block';
                modalImg.style.width = '500px';
                modalImg.style.height = '500px';
                modalImg.style.backgroundColor = getComputedStyle(placeholder).backgroundColor;
                modalImg.alt = "Placeholder view";
            }

            modalCaption.textContent = title;
            modal.classList.add('open');
            document.body.style.overflow = 'hidden'; // Prevent scrolling
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
