document.addEventListener('DOMContentLoaded', () => {
    // === AUTHENTICATION ===
    const loginScreen = document.getElementById('login-screen');
    const dashboard = document.getElementById('admin-dashboard');
    const loginForm = document.getElementById('login-form');
    const passwordInput = document.getElementById('admin-password');
    const loginError = document.getElementById('login-error');
    const logoutBtn = document.getElementById('logout-btn');

    // === Gallery Management ===
    const uploadBtn = document.getElementById('btn-upload');
    const uploadInput = document.getElementById('image-upload');
    const uploadCat = document.getElementById('upload-category');

    // Expose for HTML onchange
    window.togglePsdOptions = function (val) {
        const container = document.getElementById('psd-options-container');
        if (container) {
            container.style.display = (val === 'vip') ? 'block' : 'none';
        }
    };

    if (uploadBtn) {
        uploadBtn.addEventListener('click', async () => {
            const imageFile = uploadInput.files[0];
            const psdFile = document.getElementById('psd-upload').files[0];
            const sourceLink = document.getElementById('source-link').value.trim();
            const uploadTitle = document.getElementById('upload-title').value.trim();
            const category = uploadCat.value;

            if (!imageFile) {
                alert('Por favor, selecione uma imagem de capa.');
                return;
            }

            // Function to read file as Base64
            const readFile = (file) => new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.readAsDataURL(file);
            });

            try {
                // 1. Process Image (Compress)
                const imgData = await readFile(imageFile);
                const compressedImg = await new Promise((resolve) => {
                    const img = new Image();
                    img.src = imgData;
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        const MAX_SIZE = 800;
                        let width = img.width;
                        let height = img.height;

                        if (width > height) {
                            if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
                        } else {
                            if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
                        }

                        canvas.width = width;
                        canvas.height = height;
                        ctx.drawImage(img, 0, 0, width, height);
                        resolve(canvas.toDataURL('image/jpeg', 0.7));
                    };
                });

                // 2. Process PSD/Source (Only for VIP)
                let finalSource = null;
                if (category === 'vip') {
                    finalSource = sourceLink;
                    if (psdFile) {
                        if (psdFile.size > 2 * 1024 * 1024) { // 2MB Limit
                            alert('O arquivo direto é muito grande! Use um link do Drive/Dropbox para arquivos maiores que 2MB.');
                            return;
                        }
                        finalSource = await readFile(psdFile);
                    }
                }

                // 3. Save
                const gallery = JSON.parse(localStorage.getItem('siteGallery')) || { portfolio: [], vip: [] };
                gallery[category].push({
                    src: compressedImg,
                    download: finalSource,
                    title: uploadTitle || (category === 'vip' ? 'Conteúdo VIP' : 'Arte Adicionada'),
                    category: 'all'
                });

                localStorage.setItem('siteGallery', JSON.stringify(gallery));
                alert('Arte adicionada com sucesso! ✨');

                // Clear
                uploadInput.value = '';
                document.getElementById('psd-upload').value = '';
                document.getElementById('source-link').value = '';
                document.getElementById('upload-title').value = '';
                loadGalleryImages();

            } catch (err) {
                console.error(err);
                alert('Erro ao processar arquivos. Tente novamente.');
            }
        });
    }

    function loadGalleryImages() {
        const pList = document.getElementById('gallery-list-portfolio');
        const vList = document.getElementById('gallery-list-vip');
        if (!pList || !vList) return;

        pList.innerHTML = '';
        vList.innerHTML = '';

        const savedGallery = JSON.parse(localStorage.getItem('siteGallery')) || { portfolio: [], vip: [] };

        // --- Auto-Cleanup (Remove broken or duplicate entries) ---
        const cleanList = (list) => {
            return (list || []).filter(item => {
                const src = typeof item === 'string' ? item : item?.src;
                if (!src || src.length < 10) return false;

                // Check for redundancy with gallery-data.js
                const fileName = src.includes('/') ? src.split('/').pop() : null;
                if (fileName && typeof defaultGallery !== 'undefined') {
                    const isPermanent = defaultGallery.portfolio.some(p => p.src.includes(fileName));
                    if (isPermanent) return false;
                }
                return true;
            });
        };

        const cleanedPortfolio = cleanList(savedGallery.portfolio);
        const cleanedVip = cleanList(savedGallery.vip);

        // Save cleaned version if changed
        if (cleanedPortfolio.length !== (savedGallery.portfolio || []).length ||
            cleanedVip.length !== (savedGallery.vip || []).length) {
            localStorage.setItem('siteGallery', JSON.stringify({ portfolio: cleanedPortfolio, vip: cleanedVip }));
        }

        // Render Local
        renderImages(pList, cleanedPortfolio, 'portfolio', false);
        renderImages(vList, cleanedVip, 'vip', false);

        // Render Permanent
        if (typeof defaultGallery !== 'undefined') {
            const pPerm = defaultGallery.portfolio.map(i => i.src);
            const vPerm = defaultGallery.vip.map(i => i.src);
            renderImages(pList, pPerm, 'portfolio', true);
            renderImages(vList, vPerm, 'vip', true);
        }
    }

    function renderImages(container, images, category, isPermanent) {
        if (!images || images.length === 0) return;

        images.forEach((item, index) => {
            // Handle migration from string to object
            const src = typeof item === 'string' ? item : item.src;
            const download = (item && item.download) ? item.download : null;

            const div = document.createElement('div');
            div.style.position = 'relative';
            div.innerHTML = `
                <img src="${src}" style="width:100%; height:80px; object-fit:cover; border-radius:5px; border:1px solid #ddd; ${isPermanent ? 'border-color: var(--primary-color);' : ''}">
                ${download ? '<span title="Possui PSD" style="position:absolute; top:5px; left:5px; background:white; border-radius:50%; width:15px; height:15px; display:flex; align-items:center; justify-content:center; font-size:10px; box-shadow:0 1px 3px rgba(0,0,0,0.3);">📄</span>' : ''}
                ${isPermanent
                    ? '<span style="position:absolute; bottom:0; width:100%; background:var(--primary-color); color:white; font-size:9px; text-align:center; border-radius:0 0 5px 5px; font-weight:bold; letter-spacing:1px;">FIXO</span>'
                    : `<button onclick="deleteImage('${category}', ${index})" style="position:absolute; top:-5px; right:-5px; background:red; color:white; border:none; border-radius:50%; width:22px; height:22px; font-size:14px; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">×</button>`
                }
            `;
            container.appendChild(div);
        });
    }

    window.deleteImage = (category, index) => {
        if (confirm('Apagar imagem?')) {
            const gallery = JSON.parse(localStorage.getItem('siteGallery'));
            gallery[category].splice(index, 1);
            localStorage.setItem('siteGallery', JSON.stringify(gallery));
            loadGalleryImages();
        }
    };

    // Secret Password
    const ADMIN_PASS = "02012015Eloah9anos";

    // Check if already logged in
    // logic moved to bottom


    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const pass = passwordInput.value;

            if (pass === ADMIN_PASS) {
                localStorage.setItem('adminLoggedIn', 'true');
                showDashboard();
                passwordInput.value = '';
                loginError.style.display = 'none';
            } else {
                loginError.style.display = 'block';
                // Animation reset
                loginError.style.animation = 'none';
                loginError.offsetHeight; /* reflow */
                loginError.style.animation = 'shake 0.3s ease';
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('adminLoggedIn');
            location.reload();
        });
    }

    function showDashboard() {
        if (loginScreen) loginScreen.style.display = 'none';
        if (dashboard) dashboard.style.display = 'block';
        loadSettings();
    }

    // === SETTINGS MANAGEMENT ===

    // Default Values (if nothing in localStorage)
    const defaults = {
        prices: {
            icon: 3.50,
            bust: 5.00,
            fullbody: 7.50
        },
        addons: {
            lineart: 2.00,
            flat: 3.00,
            full: 4.00,
            char: 1.00
        },
        status: 'open',
        contact: {
            tiktok: 'https://www.tiktok.com/@guaxinim_kinny_ofc',
            youtube: 'https://youtube.com/@kinnyheheh'
        },
        visual: {
            color: '#ff6b81', // Approximate pink from screenshot
            avatar: ''
        },
        messages: {
            open: 'Comissões Abertas! Faça seus pedidos :)',
            closed: 'Desculpe mais as comissões estão fechadas no momento... :('
        },
        availability: {
            icon: { active: true, msg: 'Ops, esta opção não estão disponiveis! Desculpe...' },
            bust: { active: true, msg: 'Ops, esta opção não estão disponiveis! Desculpe...' },
            fullbody: { active: true, msg: 'Ops, esta opção não estão disponiveis! Desculpe...' }
        },
        vipStatus: {
            active: true,
            msg: 'Ainda não há novas artes exclusivas esta semana. Fique de olho no TikTok!'
        }
    };

    // Inputs
    const inputs = {
        icon: document.getElementById('price-icon'),
        bust: document.getElementById('price-bust'),
        fullbody: document.getElementById('price-fullbody'),
        lineart: document.getElementById('addon-lineart'),
        flat: document.getElementById('addon-flat'),
        full: document.getElementById('addon-full'),
        char: document.getElementById('addon-char'),
        status: document.getElementById('commissions-status-select'),
        tiktok: document.getElementById('contact-tiktok'),
        youtube: document.getElementById('contact-youtube'),
        color: document.getElementById('theme-color'),
        avatar: document.getElementById('site-avatar'),
        msgOpen: document.getElementById('msg-open'),
        msgClosed: document.getElementById('msg-closed'),
        // Availability
        statusIcon: document.getElementById('status-icon'),
        msgIcon: document.getElementById('msg-icon'),
        statusBust: document.getElementById('status-bust'),
        msgBust: document.getElementById('msg-bust'),
        statusFullbody: document.getElementById('status-fullbody'),
        msgFullbody: document.getElementById('msg-fullbody'),
        msgFullbody: document.getElementById('msg-fullbody'),
        vipActive: document.getElementById('vip-active'),
        vipMsg: document.getElementById('vip-msg-unavailable')
    };

    const saveBtn = document.getElementById('save-settings-btn');
    const toast = document.getElementById('toast');

    function loadSettings() {
        const storedSettings = JSON.parse(localStorage.getItem('siteSettings')) || defaults;

        // Fill inputs
        if (inputs.icon) inputs.icon.value = storedSettings.prices.icon;
        if (inputs.bust) inputs.bust.value = storedSettings.prices.bust;
        if (inputs.fullbody) inputs.fullbody.value = storedSettings.prices.fullbody;

        if (inputs.lineart) inputs.lineart.value = storedSettings.addons.lineart;
        if (inputs.flat) inputs.flat.value = storedSettings.addons.flat;
        if (inputs.full) inputs.full.value = storedSettings.addons.full;
        if (inputs.char) inputs.char.value = storedSettings.addons.char !== undefined ? storedSettings.addons.char : 1.00;

        if (inputs.status) inputs.status.value = storedSettings.status;

        if (inputs.tiktok) inputs.tiktok.value = storedSettings.contact && storedSettings.contact.tiktok ? storedSettings.contact.tiktok : defaults.contact.tiktok;
        if (inputs.youtube) inputs.youtube.value = storedSettings.contact && storedSettings.contact.youtube ? storedSettings.contact.youtube : defaults.contact.youtube;

        // Visuals
        if (inputs.color) inputs.color.value = storedSettings.visual ? storedSettings.visual.color : defaults.visual.color;
        if (inputs.avatar) inputs.avatar.value = storedSettings.visual ? storedSettings.visual.avatar : defaults.visual.avatar;

        // Messages
        if (inputs.msgOpen) inputs.msgOpen.value = storedSettings.messages ? storedSettings.messages.open : defaults.messages.open;
        if (inputs.msgClosed) inputs.msgClosed.value = storedSettings.messages ? storedSettings.messages.closed : defaults.messages.closed;

        // Availability (Safe check for old data)
        const av = storedSettings.availability || defaults.availability;
        if (inputs.statusIcon) inputs.statusIcon.checked = av.icon.active;
        if (inputs.msgIcon) inputs.msgIcon.value = av.icon.msg;
        if (inputs.statusBust) inputs.statusBust.checked = av.bust.active;
        if (inputs.msgBust) inputs.msgBust.value = av.bust.msg;
        if (inputs.statusFullbody) inputs.statusFullbody.checked = av.fullbody.active;
        if (inputs.msgFullbody) inputs.msgFullbody.value = av.fullbody.msg;
        if (inputs.statusFullbody) inputs.statusFullbody.checked = av.fullbody.active;
        if (inputs.msgFullbody) inputs.msgFullbody.value = av.fullbody.msg;

        // VIP Status
        const vip = storedSettings.vipStatus || defaults.vipStatus;
        if (inputs.vipActive) inputs.vipActive.checked = vip.active;
        if (inputs.vipMsg) inputs.vipMsg.value = vip.msg;
    }

    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const newSettings = {
                prices: {
                    icon: parseFloat(inputs.icon.value) || 0,
                    bust: parseFloat(inputs.bust.value) || 0,
                    fullbody: parseFloat(inputs.fullbody.value) || 0
                },
                addons: {
                    lineart: parseFloat(inputs.lineart.value) || 0,
                    flat: parseFloat(inputs.flat.value) || 0,
                    full: parseFloat(inputs.full.value) || 0,
                    char: parseFloat(inputs.char.value) || 0
                },
                status: inputs.status.value,
                contact: {
                    tiktok: inputs.tiktok.value,
                    youtube: inputs.youtube.value
                },
                visual: {
                    color: inputs.color.value,
                    avatar: inputs.avatar.value
                },
                messages: {
                    open: inputs.msgOpen.value,
                    closed: inputs.msgClosed.value
                },
                availability: {
                    icon: { active: inputs.statusIcon.checked, msg: inputs.msgIcon.value },
                    bust: { active: inputs.statusBust.checked, msg: inputs.msgBust.value },
                    fullbody: { active: inputs.statusFullbody.checked, msg: inputs.msgFullbody.value }
                },
                vipStatus: {
                    active: inputs.vipActive.checked,
                    msg: inputs.vipMsg.value
                }
            };

            localStorage.setItem('siteSettings', JSON.stringify(newSettings));

            // Show toast
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        });
    }

    function loadOrders() {
        const ordersList = document.getElementById('orders-list');
        if (!ordersList) return;

        const orders = JSON.parse(localStorage.getItem('siteOrders')) || [];

        if (orders.length === 0) {
            ordersList.innerHTML = '<p style="text-align: center; color: gray;">Nenhum pedido ainda.</p>';
            return;
        }

        ordersList.innerHTML = '';

        orders.forEach((order, index) => {
            const card = document.createElement('div');
            card.style.background = '#f9f9f9';
            card.style.padding = '15px';
            card.style.borderRadius = '10px';
            card.style.border = '1px solid #eee';

            // Status Color
            let statusColor = 'gray';
            if (order.status === 'pending') statusColor = 'orange';
            if (order.status === 'approved') statusColor = 'blue';
            if (order.status === 'wip') statusColor = 'purple';
            if (order.status === 'done') statusColor = 'green';

            card.innerHTML = `
                <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                    <strong>${order.id} - ${order.nick}</strong>
                    <span style="color:${statusColor}; font-weight:bold; text-transform:uppercase;">${order.status}</span>
                </div>
                <div style="font-size:0.9rem; color:#555; margin-bottom:10px;">
                    <p><strong>Tipo:</strong> ${order.type}</p>
                    <p><strong>Contato:</strong> ${order.contact}</p>
                    <p><strong>Ref:</strong> ${order.ref ? `<a href="${order.ref}" target="_blank">Link</a>` : 'Nenhuma'}</p>
                    <p><strong>Desc:</strong> ${order.desc}</p>
                </div>
                
                <div style="display:flex; gap:10px; flex-wrap:wrap; background: white; padding: 10px; border-radius: 8px;">
                     <select class="admin-input" onchange="updateOrderStatus(${index}, this.value)" style="padding:5px;">
                        <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pendente</option>
                        <option value="approved" ${order.status === 'approved' ? 'selected' : ''}>Aprovado</option>
                        <option value="wip" ${order.status === 'wip' ? 'selected' : ''}>Em Andamento (WIP)</option>
                        <option value="done" ${order.status === 'done' ? 'selected' : ''}>Concluído</option>
                     </select>
                     
                     <input type="text" class="admin-input" placeholder="Link de Entrega (Drive/Dropbox)" 
                            value="${order.deliveryLink || ''}" 
                            onblur="updateOrderLink(${index}, this.value)"
                            style="flex-grow:1; padding:5px;">
                     
                     <button class="btn btn-outline" style="padding:5px 10px; font-size:0.8rem; border-color:red; color:red;" onclick="deleteOrder(${index})">Excluir</button>
                </div>
            `;
            ordersList.appendChild(card);
        });
    }

    // Expose functions regarding orders to window so onclick works
    window.updateOrderStatus = (index, newStatus) => {
        const orders = JSON.parse(localStorage.getItem('siteOrders'));
        orders[index].status = newStatus;
        localStorage.setItem('siteOrders', JSON.stringify(orders));
        loadOrders(); // Refresh to update color
    };

    window.updateOrderLink = (index, link) => {
        const orders = JSON.parse(localStorage.getItem('siteOrders'));
        orders[index].deliveryLink = link;
        localStorage.setItem('siteOrders', JSON.stringify(orders));
    };

    window.deleteOrder = (index) => {
        if (confirm('Tem certeza que deseja excluir este pedido?')) {
            const orders = JSON.parse(localStorage.getItem('siteOrders'));
            orders.splice(index, 1);
            localStorage.setItem('siteOrders', JSON.stringify(orders));
            loadOrders();
        }
    };

    // Load orders on startup
    loadOrders();

    // Check if already logged in (Run after everything is initialized)
    if (localStorage.getItem('adminLoggedIn') === 'true') {
        showDashboard();
    }

    // Clear Cache Functionality
    const clearCacheBtn = document.getElementById('btn-clear-cache');
    if (clearCacheBtn) {
        clearCacheBtn.addEventListener('click', () => {
            if (confirm('⚠️ Deseja realmente limpar o cache da galeria? Isso removerá todas as imagens que você subiu pelo painel (as imagens fixas permanecerão).')) {
                localStorage.removeItem('siteGallery');
                alert('Cache limpo com sucesso! ✨');
                loadGalleryImages();
            }
        });
    }
});
