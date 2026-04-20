// ============================================================
// 200 RACING – shared.js
// Cart management, auth state, nav rendering, toasts
// ============================================================

// ── CART ─────────────────────────────────────────────────────
const Cart = {
  get() {
    try { return JSON.parse(localStorage.getItem('cart_200racing') || '[]'); }
    catch { return []; }
  },
  save(items) {
    localStorage.setItem('cart_200racing', JSON.stringify(items));
    Cart.updateUI();
  },
  add(product) {
    const items = Cart.get();
    const idx = items.findIndex(i => i.id === product.id);
    if (idx > -1) items[idx].qty++;
    else items.push({ ...product, qty: 1 });
    Cart.save(items);
    showToast(`${product.name} adicionado ao carrinho`, 'success');
  },
  remove(id) {
    Cart.save(Cart.get().filter(i => i.id !== id));
  },
  updateQty(id, delta) {
    const items = Cart.get();
    const idx = items.findIndex(i => i.id === id);
    if (idx > -1) {
      items[idx].qty = Math.max(1, items[idx].qty + delta);
      Cart.save(items);
    }
  },
  total() {
    return Cart.get().reduce((s, i) => s + i.price * i.qty, 0);
  },
  count() {
    return Cart.get().reduce((s, i) => s + i.qty, 0);
  },
  clear() {
    Cart.save([]);
  },
  updateUI() {
    const count = Cart.count();
    document.querySelectorAll('.cart-count').forEach(el => {
      el.textContent = count;
      el.classList.toggle('visible', count > 0);
    });
    Cart.renderSidebar();
  },
  renderSidebar() {
    const container = document.getElementById('cart-items-list');
    if (!container) return;
    const items = Cart.get();
    if (items.length === 0) {
      container.innerHTML = '<div class="cart-empty">🛒<br><br>Carrinho vazio</div>';
    } else {
      container.innerHTML = items.map(item => `
        <div class="cart-item">
          <div class="cart-item-img">${item.imageUrl
            ? `<img src="${item.imageUrl}" alt="${item.name}" style="width:100%;height:100%;object-fit:cover">`
            : '🏍️'}</div>
          <div>
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-price">R$ ${(item.price * item.qty).toFixed(2).replace('.', ',')}</div>
            <div class="cart-item-qty">
              <button class="qty-btn" onclick="Cart.updateQty('${item.id}', -1)">−</button>
              <span class="qty-val">${item.qty}</span>
              <button class="qty-btn" onclick="Cart.updateQty('${item.id}', 1)">+</button>
            </div>
          </div>
          <button class="cart-remove" onclick="Cart.remove('${item.id}')">×</button>
        </div>
      `).join('');
    }
    const totalEl = document.getElementById('cart-total-val');
    if (totalEl) totalEl.textContent = `R$ ${Cart.total().toFixed(2).replace('.', ',')}`;
  }
};

// ── CART SIDEBAR TOGGLE ──────────────────────────────────────
function openCart() {
  document.getElementById('cart-sidebar')?.classList.add('open');
  document.getElementById('cart-overlay')?.classList.add('open');
  Cart.renderSidebar();
}
function closeCart() {
  document.getElementById('cart-sidebar')?.classList.remove('open');
  document.getElementById('cart-overlay')?.classList.remove('open');
}

// ── TOASTS ───────────────────────────────────────────────────
function showToast(msg, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icons = { success: '✓', info: 'ℹ', error: '✕' };
  toast.innerHTML = `<span>${icons[type] || 'ℹ'}</span> ${msg}`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity .4s'; }, 3000);
  setTimeout(() => toast.remove(), 3500);
}

// ── AUTH UI UPDATER ───────────────────────────────────────────
function updateNavAuth(user, role) {
  const loginBtn = document.getElementById('nav-login-btn');
  const userArea = document.getElementById('nav-user-area');
  const adminLink = document.getElementById('nav-admin-link');

  if (user) {
    if (loginBtn) loginBtn.style.display = 'none';
    if (userArea) {
      userArea.style.display = 'flex';
      const photo = userArea.querySelector('.nav-user-photo');
      const name = userArea.querySelector('.nav-user-name');
      if (photo) photo.src = user.photoURL || '';
      if (name) name.textContent = user.displayName?.split(' ')[0] || 'Usuário';
    }
    if (adminLink) adminLink.style.display = role === 'admin' ? 'block' : 'none';
  } else {
    if (loginBtn) loginBtn.style.display = 'flex';
    if (userArea) userArea.style.display = 'none';
    if (adminLink) adminLink.style.display = 'none';
  }
}

// ── FORMAT CURRENCY ──────────────────────────────────────────
function formatBRL(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

// ── CATEGORY LABELS ──────────────────────────────────────────
const CATEGORIES = [
  { id: 'pneus',             label: 'Pneus',              icon: '🔘' },
  { id: 'escapamentos',      label: 'Escapamentos',       icon: '💨' },
  { id: 'capacetes',         label: 'Capacetes',          icon: '⛑️' },
  { id: 'macacoes',          label: 'Macacões',           icon: '🏁' },
  { id: 'luvas',             label: 'Luvas',              icon: '🧤' },
  { id: 'pastilhas',         label: 'Pastilhas de Freio', icon: '🔩' },
  { id: 'oleos',             label: 'Óleos & Fluidos',    icon: '🛢️' },
  { id: 'cavaletes',         label: 'Cavaletes',          icon: '🔧' },
  { id: 'pecas',             label: 'Peças',              icon: '⚙️' },
  { id: 'limpeza',           label: 'Produtos de Limpeza',icon: '🧴' },
];

function getCategoryLabel(id) {
  return CATEGORIES.find(c => c.id === id)?.label || id;
}
function getCategoryIcon(id) {
  return CATEGORIES.find(c => c.id === id)?.icon || '📦';
}
