function injectComponents() {
    const headerHTML = `
    <div class="container nav-container">
        <a href="index.html" class="logo">Rabiscos da Kinny</a>
        <nav>
            <ul class="nav-menu">
                <li><a href="index.html" class="nav-link" data-lang="nav_home">Início</a></li>
                <li><a href="portfolio.html" class="nav-link" data-lang="nav_portfolio">Portfólio</a></li>
                <li><a href="commissions.html" class="nav-link" data-lang="nav_commissions">Comissões</a></li>
                <li><a href="vip.html" class="nav-link" data-lang="nav_vip">Área VIP</a></li>
                <li><a href="client.html" class="nav-link" data-lang="nav_client">Área do Cliente</a></li>
            </ul>
        </nav>
        <div class="header-actions">
            <button id="lang-switch" class="lang-switch" aria-label="Mudar Idioma">EN</button>
            <div class="hamburger" aria-label="Abrir Menu">
                <span class="bar"></span>
                <span class="bar"></span>
                <span class="bar"></span>
            </div>
        </div>
    </div>`;

    const footerHTML = `
    <div class="container">
        <div class="footer-grid">
            <div class="footer-brand">
                <h3 class="footer-logo">Rabiscos da Kinny</h3>
                <p class="footer-desc" data-lang="footer_desc">Transformando seus sonhos em arte digital com carinho e dedicação.</p>
            </div>
            <div class="footer-links">
                <h4 data-lang="footer_nav">Navegação</h4>
                <ul>
                    <li><a href="index.html" data-lang="nav_home">Início</a></li>
                    <li><a href="portfolio.html" data-lang="nav_portfolio">Portfólio</a></li>
                    <li><a href="commissions.html" data-lang="nav_commissions">Comissões</a></li>
                    <li><a href="terms.html" data-lang="terms_title">Termos de Uso</a></li>
                </ul>
            </div>
            <div class="footer-social">
                <h4 data-lang="footer_follow">Me Siga</h4>
                <div class="social-links">
                    <a href="https://www.tiktok.com/@guaxinim_kinny_ofc" target="_blank" class="social-icon" title="TikTok" aria-label="TikTok">&#x1F3B5;<span>TikTok</span></a>
                    <a href="#" class="social-icon" title="YouTube" aria-label="YouTube">&#x1F4FA;<span>YouTube</span></a>
                </div>
            </div>
        </div>
        <div class="footer-bottom">
            <p data-lang="footer_rights">&copy; 2024 Rabiscos da Kinny. Todos os direitos reservados.</p>
        </div>
    </div>`;

    const header = document.querySelector('.main-header');
    const footer = document.querySelector('footer');

    if (header) header.innerHTML = headerHTML;
    if (footer) footer.innerHTML = footerHTML;

    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        } else {
            link.classList.remove('active');
        }
    });

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

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectComponents);
} else {
    injectComponents();
}
