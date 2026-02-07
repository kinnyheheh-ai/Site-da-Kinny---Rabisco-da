/**
 * components.js - Centralized Header and Footer for Rabiscos da Kinny
 */

function injectComponents() {
    const headerHTML = `
    <div class="container nav-container">
        <a href="index.html" class="logo"><img src="images/logo.png" alt="Rabiscos da Kinny" style="height: 50px;"></a>
        <nav>
            <ul class="nav-menu">
                <li><a href="index.html" class="nav-link" data-lang="nav_home">Início</a></li>
                <li><a href="portfolio.html" class="nav-link" data-lang="nav_portfolio">Portfólio</a></li>
                <li><a href="commissions.html" class="nav-link" data-lang="nav_commissions">Comissões</a></li>
                <li><a href="vip.html" class="nav-link" data-lang="nav_vip">Área VIP</a></li>
                <li><a href="client.html" class="nav-link" data-lang="nav_client">Área do Cliente</a></li>
            </ul>
        </nav>
        <div class="hamburger" aria-label="Abrir Menu">
            <span class="bar"></span>
            <span class="bar"></span>
            <span class="bar"></span>
        </div>
        <button id="lang-switch" class="lang-switch" aria-label="Mudar Idioma">EN</button>
    </div>`;

    const footerHTML = `
    <div class="container">
        <div class="social-links">
            <a href="https://www.tiktok.com/@guaxinim_kinny_ofc" target="_blank" class="social-icon" title="TikTok" aria-label="TikTok">🎵<span>TikTok</span></a>
            <a href="#" class="social-icon" title="YouTube" aria-label="YouTube">📺<span>YouTube</span></a>
        </div>
        <div class="credits">
            <p data-lang="footer_rights">&copy; 2024 Rabiscos da Kinny. Todos os direitos reservados.</p>
            <p style="margin-top: 10px; font-size: 0.8rem; opacity: 0.7;">Feito com carinho para transformar sonhos em arte ✨</p>
        </div>
    </div>`;

    const header = document.querySelector('.main-header');
    const footer = document.querySelector('footer');

    if (header) header.innerHTML = headerHTML;
    if (footer) footer.innerHTML = footerHTML;

    // Highlight active link
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        } else {
            link.classList.remove('active');
        }
    });

    // Re-initialize mobile menu events since we injected new HTML
    const hamburger = document.querySelector(".hamburger");
    const navMenu = document.querySelector(".nav-menu");

    if (hamburger && navMenu) {
        hamburger.addEventListener("click", () => {
            hamburger.classList.toggle("active");
            navMenu.classList.toggle("active");
        });

        document.querySelectorAll(".nav-link").forEach(n => n.addEventListener("click", () => {
            hamburger.classList.remove("active");
            navMenu.classList.remove("active");
        }));
    }
}

// Run injection
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectComponents);
} else {
    injectComponents();
}
