document.addEventListener('DOMContentLoaded', () => {
    // === Hide Page Loader ===
    const pageLoader = document.getElementById('page-loader');
    if (pageLoader) {
        pageLoader.classList.add('hidden');
        setTimeout(() => pageLoader.remove(), 500);
    }

    // === Language System ===
    let currentLang = localStorage.getItem('siteLang') || 'pt';

    function updateLanguage(lang) {
        document.querySelectorAll('[data-lang]').forEach(element => {
            const key = element.getAttribute('data-lang');
            if (translations[lang] && translations[lang][key]) {
                const content = translations[lang][key];
                if (key.includes('_list') || key.includes('title') || content.includes('<')) {
                    element.innerHTML = content;
                } else {
                    element.textContent = content;
                }
            }
        });

        document.querySelectorAll('.lang-switch').forEach(btn => {
            btn.textContent = lang === 'pt' ? 'EN' : 'PT';
        });

        localStorage.setItem('siteLang', lang);
    }

    document.addEventListener('click', (e) => {
        if (e.target.id === 'lang-switch' || e.target.classList.contains('lang-switch')) {
            currentLang = currentLang === 'pt' ? 'en' : 'pt';
            updateLanguage(currentLang);
        }
    });

    updateLanguage(currentLang);

    // === Dynamic Contact Info ===
    function updateContactInfo() {
        const settings = JSON.parse(localStorage.getItem('siteSettings'));
        if (!settings || !settings.contact) return;

        const { tiktok, youtube } = settings.contact;

        document.querySelectorAll('a[title="TikTok"], a[href*="tiktok.com"]').forEach(link => {
            if (tiktok) {
                link.href = tiktok;
                if (link.textContent.includes('@')) {
                    const handle = tiktok.split('/').pop();
                    link.textContent = `TikTok: ${handle}`;
                }
            }
        });

        document.querySelectorAll('a[title="YouTube"], a[href*="youtube.com"]').forEach(link => {
            if (youtube) link.href = youtube;
        });

        if (settings.visual) {
            if (settings.visual.color) {
                const color = settings.visual.color;
                document.documentElement.style.setProperty('--primary-color', color);

                const r = parseInt(color.slice(1, 3), 16);
                const g = parseInt(color.slice(3, 5), 16);
                const b = parseInt(color.slice(5, 7), 16);

                const dark = `rgb(${Math.floor(r * 0.8)}, ${Math.floor(g * 0.8)}, ${Math.floor(b * 0.8)})`;
                document.documentElement.style.setProperty('--primary-dark', dark);

                const light = `rgba(${r}, ${g}, ${b}, 0.15)`;
                document.documentElement.style.setProperty('--primary-light', light);
            }

            const avatarContainer = document.querySelector('.avatar-container');
            if (avatarContainer && settings.visual.avatar) {
                avatarContainer.innerHTML = `<img src="${settings.visual.avatar}" style="width:100%; height:100%; object-fit:cover;" alt="Avatar">`;
            }
        }
    }

    updateContactInfo();

    window.addEventListener('storage', (e) => {
        if (e.key === 'siteSettings') updateContactInfo();
    });

    // === Scroll Animations (Intersection Observer) ===
    const animatedElements = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right, .scale-in, .fade-up, .scale-up');

    if (animatedElements.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        animatedElements.forEach(el => observer.observe(el));
    }

    // === Header Scroll Effect ===
    const header = document.querySelector('.main-header');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;

        if (header) {
            if (currentScroll > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }

        lastScroll = currentScroll;
    }, { passive: true });

    // === Scroll Progress Bar ===
    const progressBar = document.getElementById('scroll-progress');

    if (progressBar) {
        window.addEventListener('scroll', () => {
            const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const progress = (scrollTop / scrollHeight) * 100;
            progressBar.style.width = progress + '%';
        }, { passive: true });
    }

    // === Back to Top Button ===
    const backToTop = document.getElementById('back-to-top');

    if (backToTop) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 400) {
                backToTop.classList.add('show');
            } else {
                backToTop.classList.remove('show');
            }
        }, { passive: true });

        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});
