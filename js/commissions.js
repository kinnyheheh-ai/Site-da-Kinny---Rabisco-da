document.addEventListener('DOMContentLoaded', () => {
    // IDs in HTML to update
    // We need to add specific IDs to the commissions.html price elements first!

    // Default Values (Fallback)
    const defaults = {
        prices: {
            icon: 3.50,
            bust: 5.00,
            fullbody: 7.50
        },
        addons: { // Not yet displaying addons in UI separately, but good to have
            lineart: 2.00,
            flat: 3.00,
            full: 4.00
        },
        status: 'open'
    };

    function loadCommissionsData() {
        const settings = JSON.parse(localStorage.getItem('siteSettings')) || defaults;

        // Update Status
        const statusBanner = document.getElementById('commissions-status');
        const statusText = document.getElementById('status-text');

        if (statusBanner && statusText) {
            // Remove previous classes
            statusBanner.classList.remove('status-open', 'status-closed');

            if (settings.status === 'open') {
                statusBanner.classList.add('status-open');
                const msg = settings.messages ? settings.messages.open : "Comissões Abertas! ✨";
                statusText.textContent = msg;
                statusText.removeAttribute('data-lang'); // Override translation if custom msg used
            } else {
                statusBanner.classList.add('status-closed');
                const msg = settings.messages ? settings.messages.closed : "Comissões Fechadas 🔒";
                statusText.textContent = msg;
                statusText.removeAttribute('data-lang');
            }
        }

        // Update Prices
        // We will calculate base price + addons usually, but here we probably just show base "starting at"
        // Or we can assume the price displayed is the BASE price

        updateItemAvailability('price-display-icon', 'icon', settings);
        updateItemAvailability('price-display-bust', 'bust', settings);
        updateItemAvailability('price-display-fullbody', 'fullbody', settings);

        // Update Addon Prices (Cards)
        updatePrice('price-display-lineart', settings.addons.lineart);
        updatePrice('price-display-flat', settings.addons.flat);
        updatePrice('price-display-full', settings.addons.full);

        // Update Addon Prices (Global)
        const charPrice = settings.addons && settings.addons.char !== undefined ? settings.addons.char : 1.00;
        document.querySelectorAll('.addon-char-price').forEach(el => {
            el.textContent = `+R$ ${charPrice.toFixed(2).replace('.', ',')}`;
        });
    }

    function updatePrice(elementId, value) {
        const el = document.getElementById(elementId);
        if (el) el.innerText = `R$ ${value.toFixed(2).replace('.', ',')}`;
    }

    function updateItemAvailability(elementId, type, settings) {
        const priceEl = document.getElementById(elementId);
        if (!priceEl) return;

        // Navigate up to the card container
        const card = priceEl.closest('.price-card');
        const btn = card ? card.querySelector('.btn') : null;

        // Default: Open
        let isActive = true;
        let msg = '';
        let price = 0;

        // Get specific settings
        if (settings.availability && settings.availability[type]) {
            isActive = settings.availability[type].active;
            msg = settings.availability[type].msg || "Indisponível";
        }

        if (type === 'icon') price = settings.prices.icon;
        if (type === 'bust') price = settings.prices.bust;
        if (type === 'fullbody') price = settings.prices.fullbody;

        if (isActive) {
            // Restore Price
            priceEl.innerText = `R$ ${price.toFixed(2).replace('.', ',')}`;
            priceEl.style.display = 'block';

            // Restore Button
            if (btn) {
                btn.classList.remove('btn-disabled');
                btn.style.pointerEvents = 'auto';
                btn.style.opacity = '1';
                btn.style.backgroundColor = ''; // Reset inline styles
                btn.style.color = '';
                btn.innerText = "Encomendar";
                // Restore link only if it was removed/changed? 
                // We rely on href being set in HTML, assume we just toggled styles.
                // Actually, if we want to be safe, we should ensure href is correct or just prevent click.
                // CSS pointer-events: auto handles click prevention.
            }
        } else {
            // Unavailable Mode
            // Option 1: Hide Price? Or Strike it? User said "Ops os icons n estao disponiveis".
            // Let's replace the button text or the price text?

            // Replacing Button is cleaner for "Ops..." messages
            if (btn) {
                btn.classList.add('btn-disabled');
                btn.style.pointerEvents = 'none';
                btn.style.opacity = '0.7';
                btn.style.backgroundColor = '#ccc';
                btn.style.color = '#666';
                btn.style.borderColor = '#ccc';
                btn.innerText = msg;
                btn.style.width = '100%'; // Ensure full message fits
                btn.style.whiteSpace = 'normal'; // Allow wrap
            }
        }
    }

    // === Order Form Logic ===
    const orderForm = document.getElementById('commission-form');
    if (orderForm) {
        orderForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const nick = document.getElementById('order-nick').value;
            const contact = document.getElementById('order-contact').value;
            const type = document.getElementById('order-type').value;
            const desc = document.getElementById('order-desc').value;
            const ref = document.getElementById('order-ref').value;

            // Generate ID like #KD2938
            const orderId = '#KD' + Math.floor(1000 + Math.random() * 9000);

            const newOrder = {
                id: orderId,
                nick: nick,
                contact: contact,
                type: type,
                desc: desc,
                ref: ref,
                status: 'pending', // pending, approved, wip, done
                date: new Date().toLocaleDateString(),
                deliveryLink: ''
            };

            // Save to LocalStorage (Global Orders Array)
            const orders = JSON.parse(localStorage.getItem('siteOrders')) || [];
            orders.unshift(newOrder); // Add to top
            localStorage.setItem('siteOrders', JSON.stringify(orders));

            // Show Success
            document.getElementById('order-form-container') ? document.getElementById('order-form-container').style.display = 'none' : orderForm.style.display = 'none';
            document.getElementById('order-success').style.display = 'block';
            document.getElementById('new-order-id').innerText = orderId;
        });
    }

    // Load on start
    loadCommissionsData();

    // Listen for storage changes (if admin tab updates while this is open)
    window.addEventListener('storage', (e) => {
        if (e.key === 'siteSettings') {
            loadCommissionsData();
        }
    });
});
