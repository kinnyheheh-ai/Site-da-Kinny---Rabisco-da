document.addEventListener('DOMContentLoaded', () => {
    // === Language System ===
    let currentLang = localStorage.getItem('siteLang') || 'pt';

    function updateLanguage(lang) {
        document.querySelectorAll('[data-lang]').forEach(element => {
            const key = element.getAttribute('data-lang');
            if (translations[lang] && translations[lang][key]) {
                const content = translations[lang][key];
                // Only use innerHTML for specific elements that need formatting (like lists)
                if (key.includes('_list') || key.includes('title') || content.includes('<')) {
                    element.innerHTML = content;
                } else {
                    element.textContent = content;
                }
            }
        });

        // Update all lang-switch buttons (including centralized one)
        document.querySelectorAll('.lang-switch').forEach(btn => {
            btn.textContent = lang === 'pt' ? 'EN' : 'PT';
        });

        localStorage.setItem('siteLang', lang);
    }

    // Use event delegation for lang-switch since it might be dynamically injected
    document.addEventListener('click', (e) => {
        if (e.target.id === 'lang-switch' || e.target.classList.contains('lang-switch')) {
            currentLang = currentLang === 'pt' ? 'en' : 'pt';
            updateLanguage(currentLang);
        }
    });

    // Initialize Language
    updateLanguage(currentLang);

    // Dynamic Contact Info and Other Logic...

    // === Dynamic Contact Info ===
    function updateContactInfo() {
        const settings = JSON.parse(localStorage.getItem('siteSettings'));
        if (!settings || !settings.contact) return; // Use defaults if nothing saved

        const { tiktok } = settings.contact;

        // Update TikTok Links (Footer & Commissions Page)
        document.querySelectorAll('a[title="TikTok"], a[href*="tiktok.com"]').forEach(link => {
            if (tiktok) {
                link.href = tiktok;
                // Update text if it contains the handle
                if (link.textContent.includes('@')) {
                    // Try to extract handle from URL or just show generic text if complex
                    const handle = tiktok.split('/').pop();
                    link.textContent = `🎵 TikTok: ${handle}`;
                }
            }
        });

        // Apply Visuals
        if (settings.visual) {
            // Theme Color
            if (settings.visual.color) {
                const color = settings.visual.color;
                document.documentElement.style.setProperty('--primary-color', color);

                // Calculate Variations
                const r = parseInt(color.slice(1, 3), 16);
                const g = parseInt(color.slice(3, 5), 16);
                const b = parseInt(color.slice(5, 7), 16);

                // Dark Variation
                const dark = `rgb(${Math.floor(r * 0.8)}, ${Math.floor(g * 0.8)}, ${Math.floor(b * 0.8)})`;
                document.documentElement.style.setProperty('--primary-dark', dark);

                // Light Variation (Translucent)
                const light = `rgba(${r}, ${g}, ${b}, 0.15)`;
                document.documentElement.style.setProperty('--primary-light', light);
            }

            // Avatar (Home Page)
            const avatarContainer = document.querySelector('.avatar-container');
            if (avatarContainer && settings.visual.avatar) {
                avatarContainer.innerHTML = `<img src="${settings.visual.avatar}" style="width:100%; height:100%; object-fit:cover;" alt="Avatar">`;
            }
        }
    }

    updateContactInfo();

    // Listen for storage changes to update immediately if admin changes it in another tab
    window.addEventListener('storage', (e) => {
        if (e.key === 'siteSettings') {
            updateContactInfo();
        }
    });
});
