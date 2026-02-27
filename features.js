// =====================================================
// LSPDFR ELITE STUDIO - ADVANCED FEATURES
// Wishlist, Compare, Quick View, Reviews, Live Chat
// =====================================================

// ==================== WISHLIST ====================
const WISHLIST = {
  add(productId) {
    const email = window.currentUser?.email || 'guest';
    const store = SYNC_ENGINE.getStore();
    if (!store.wishlist[email]) store.wishlist[email] = [];
    if (!store.wishlist[email].includes(productId)) {
      store.wishlist[email].push(productId);
      SYNC_ENGINE.saveStore(store);
      notify('💖', 'Додано до списку бажань!');
      this.updateUI();
    } else {
      notify('ℹ️', 'Вже у списку бажань');
    }
  },
  
  remove(productId) {
    const email = window.currentUser?.email || 'guest';
    const store = SYNC_ENGINE.getStore();
    if (store.wishlist[email]) {
      store.wishlist[email] = store.wishlist[email].filter(id => id !== productId);
      SYNC_ENGINE.saveStore(store);
      this.updateUI();
      notify('🗑️', 'Видалено зі списку бажань');
    }
  },
  
  toggle(productId) {
    const email = window.currentUser?.email || 'guest';
    const store = SYNC_ENGINE.getStore();
    if (store.wishlist[email]?.includes(productId)) {
      this.remove(productId);
    } else {
      this.add(productId);
    }
  },
  
  has(productId) {
    const email = window.currentUser?.email || 'guest';
    const store = SYNC_ENGINE.getStore();
    return store.wishlist[email]?.includes(productId) || false;
  },
  
  getAll() {
    const email = window.currentUser?.email || 'guest';
    const store = SYNC_ENGINE.getStore();
    return store.wishlist[email] || [];
  },
  
  updateUI() {
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
      const productId = parseInt(btn.dataset.productId);
      if (this.has(productId)) {
        btn.classList.add('active');
        btn.innerHTML = '💖';
      } else {
        btn.classList.remove('active');
        btn.innerHTML = '🤍';
      }
    });
    
    const badge = document.getElementById('wishlistBadge');
    const count = this.getAll().length;
    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    }
  }
};

// ==================== COMPARE ====================
const COMPARE = {
  add(productId) {
    const email = window.currentUser?.email || 'guest';
    const store = SYNC_ENGINE.getStore();
    if (!store.compareList[email]) store.compareList[email] = [];
    
    if (store.compareList[email].length >= 4) {
      notify('⚠️', 'Максимум 4 товари для порівняння');
      return;
    }
    
    if (!store.compareList[email].includes(productId)) {
      store.compareList[email].push(productId);
      SYNC_ENGINE.saveStore(store);
      notify('📊', 'Додано до порівняння!');
      this.updateUI();
    }
  },
  
  remove(productId) {
    const email = window.currentUser?.email || 'guest';
    const store = SYNC_ENGINE.getStore();
    if (store.compareList[email]) {
      store.compareList[email] = store.compareList[email].filter(id => id !== productId);
      SYNC_ENGINE.saveStore(store);
      this.updateUI();
    }
  },
  
  toggle(productId) {
    const email = window.currentUser?.email || 'guest';
    const store = SYNC_ENGINE.getStore();
    if (store.compareList[email]?.includes(productId)) {
      this.remove(productId);
    } else {
      this.add(productId);
    }
  },
  
  has(productId) {
    const email = window.currentUser?.email || 'guest';
    const store = SYNC_ENGINE.getStore();
    return store.compareList[email]?.includes(productId) || false;
  },
  
  getAll() {
    const email = window.currentUser?.email || 'guest';
    const store = SYNC_ENGINE.getStore();
    return store.compareList[email] || [];
  },
  
  clear() {
    const email = window.currentUser?.email || 'guest';
    const store = SYNC_ENGINE.getStore();
    store.compareList[email] = [];
    SYNC_ENGINE.saveStore(store);
    this.updateUI();
  },
  
  updateUI() {
    document.querySelectorAll('.compare-btn').forEach(btn => {
      const productId = parseInt(btn.dataset.productId);
      btn.classList.toggle('active', this.has(productId));
    });
    
    const badge = document.getElementById('compareBadge');
    const count = this.getAll().length;
    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    }
  }
};

// ==================== QUICK VIEW ====================
const QUICK_VIEW = {
  open(productId) {
    const product = window.products?.find(p => p.id === productId);
    if (!product) return;
    
    SYNC_ENGINE.trackProductView(productId);
    
    const modal = document.getElementById('quickViewModal');
    if (!modal) return;
    
    const avgRating = this.getAverageRating(productId);
    const reviewCount = this.getReviewCount(productId);
    
    document.getElementById('qvContent').innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:2rem;align-items:start">
        <div>
          <div style="font-size:5rem;text-align:center;padding:3rem;background:var(--bg3);border-radius:12px;margin-bottom:1rem">
            ${product.icon}
          </div>
          <div style="display:flex;gap:0.5rem;margin-top:1rem">
            <button class="btn btn-primary" style="flex:1" onclick="addCart(${product.id}, this); closeM('quickViewModal')">
              🛒 Додати в кошик
            </button>
            <button class="wishlist-btn" data-product-id="${product.id}" onclick="WISHLIST.toggle(${product.id})" 
              style="width:44px;height:44px;border-radius:8px;border:1px solid var(--border);background:var(--bg3);cursor:pointer;font-size:1.3rem;transition:all 0.2s">
              ${WISHLIST.has(product.id) ? '💖' : '🤍'}
            </button>
            <button class="compare-btn" data-product-id="${product.id}" onclick="COMPARE.toggle(${product.id})"
              style="width:44px;height:44px;border-radius:8px;border:1px solid var(--border);background:var(--bg3);cursor:pointer;font-size:1.1rem;transition:all 0.2s">
              📊
            </button>
          </div>
        </div>
        <div>
          <h3 style="font-family:'Orbitron',sans-serif;font-size:1.5rem;margin-bottom:0.5rem;color:var(--accent2)">${product.name}</h3>
          <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:1rem">
            <div style="color:var(--gold);font-size:1rem">${'⭐'.repeat(Math.round(avgRating))}${'☆'.repeat(5-Math.round(avgRating))}</div>
            <span style="font-size:0.85rem;color:var(--text3)">${avgRating.toFixed(1)} (${reviewCount} відгуків)</span>
          </div>
          <div style="display:flex;align-items:baseline;gap:0.5rem;margin-bottom:1.5rem">
            ${product.oldPrice ? `<span style="font-size:1rem;color:var(--text3);text-decoration:line-through">${product.oldPrice} грн</span>` : ''}
            <span style="font-size:1.8rem;font-weight:700;color:var(--gold);font-family:'Orbitron',sans-serif">${product.price} грн</span>
            ${product.oldPrice ? `<span style="background:var(--danger);color:#fff;padding:0.2rem 0.5rem;border-radius:4px;font-size:0.75rem;font-weight:700">-${Math.round((1-product.price/product.oldPrice)*100)}%</span>` : ''}
          </div>
          <div style="background:var(--bg3);padding:1rem;border-radius:8px;margin-bottom:1rem">
            <div style="font-size:0.85rem;font-weight:600;margin-bottom:0.5rem;color:var(--text2)">Опис:</div>
            <p style="font-size:0.9rem;line-height:1.6;color:var(--text2)">
              ${product.desc || 'Високоякісний продукт для LSPDFR. Детальна проробка, оптимізація та повна сумісність з останніми версіями гри.'}
            </p>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;font-size:0.85rem">
            <div style="background:var(--bg3);padding:0.7rem;border-radius:6px">
              <div style="color:var(--text3);font-size:0.75rem">Категорія</div>
              <div style="font-weight:600">${product.cat === 'pack' ? '📦 Пак' : product.cat === 'livery' ? '🎨 Ліверея' : '🚗 Модель'}</div>
            </div>
            <div style="background:var(--bg3);padding:0.7rem;border-radius:6px">
              <div style="color:var(--text3);font-size:0.75rem">Формат</div>
              <div style="font-weight:600">.ytd, .yft, .meta</div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    openM('quickViewModal');
  },
  
  getAverageRating(productId) {
    const store = SYNC_ENGINE.getStore();
    const reviews = (store.reviews || []).filter(r => r.productId === productId);
    if (reviews.length === 0) return 5;
    return reviews.reduce((sum, r) => sum + r.stars, 0) / reviews.length;
  },
  
  getReviewCount(productId) {
    const store = SYNC_ENGINE.getStore();
    return (store.reviews || []).filter(r => r.productId === productId).length;
  }
};

// ==================== REVIEWS ====================
const REVIEWS = {
  add(productId, stars, text) {
    if (!window.currentUser) {
      notify('⚠️', 'Увійдіть, щоб залишити відгук');
      return;
    }
    
    const product = window.products?.find(p => p.id === productId);
    if (!product) return;
    
    const review = {
      id: 'rev_' + Date.now(),
      productId,
      product: product.name,
      author: window.currentUser.name || window.currentUser.email.split('@')[0],
      email: window.currentUser.email,
      stars,
      text,
      date: new Date().toLocaleDateString('uk-UA'),
      likes: [],
      replies: []
    };
    
    SYNC_ENGINE.pushToArray('reviews', review);
    notify('✅', 'Дякуємо за відгук!');
    this.render(productId);
  },
  
  like(reviewId) {
    if (!window.currentUser) {
      notify('⚠️', 'Увійдіть, щоб оцінити відгук');
      return;
    }
    
    const store = SYNC_ENGINE.getStore();
    const review = store.reviews.find(r => r.id === reviewId);
    if (!review) return;
    
    if (!review.likes) review.likes = [];
    const email = window.currentUser.email;
    
    if (review.likes.includes(email)) {
      review.likes = review.likes.filter(e => e !== email);
    } else {
      review.likes.push(email);
    }
    
    SYNC_ENGINE.saveStore(store);
    this.render(review.productId);
  },
  
  render(productId) {
    const container = document.getElementById('reviewsList');
    if (!container) return;
    
    const store = SYNC_ENGINE.getStore();
    const reviews = (store.reviews || []).filter(r => r.productId === productId).reverse();
    
    if (reviews.length === 0) {
      container.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--text3)">Відгуків поки немає. Будьте першим!</div>';
      return;
    }
    
    container.innerHTML = reviews.map(r => `
      <div style="background:var(--bg3);padding:1.2rem;border-radius:10px;margin-bottom:1rem;border:1px solid var(--border)">
        <div style="display:flex;align-items:center;gap:0.8rem;margin-bottom:0.8rem">
          <div style="width:40px;height:40px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:1.1rem">
            ${r.author[0].toUpperCase()}
          </div>
          <div style="flex:1">
            <div style="font-weight:600;font-size:0.95rem">${r.author}</div>
            <div style="font-size:0.8rem;color:var(--text3)">${r.date}</div>
          </div>
          <div style="color:var(--gold);font-size:1rem">${'⭐'.repeat(r.stars)}${'☆'.repeat(5-r.stars)}</div>
        </div>
        <p style="font-size:0.9rem;line-height:1.6;color:var(--text2);margin-bottom:0.8rem">${r.text}</p>
        <div style="display:flex;gap:1rem;align-items:center;font-size:0.85rem">
          <button onclick="REVIEWS.like('${r.id}')" style="background:none;border:none;color:var(--text3);cursor:pointer;display:flex;align-items:center;gap:0.3rem;transition:color 0.2s">
            <span style="font-size:1rem">${(r.likes || []).includes(window.currentUser?.email) ? '👍' : '👍🏻'}</span>
            <span>${(r.likes || []).length}</span>
          </button>
          <span style="color:var(--text3)">💬 ${(r.replies || []).length}</span>
        </div>
      </div>
    `).join('');
  }
};

// ==================== LIVE CHAT ====================
const LIVE_CHAT = {
  isOpen: false,
  unreadCount: 0,
  
  toggle() {
    this.isOpen = !this.isOpen;
    const chatBox = document.getElementById('liveChatBox');
    if (chatBox) {
      chatBox.style.display = this.isOpen ? 'flex' : 'none';
      if (this.isOpen) {
        this.loadMessages();
        this.markAsRead();
        document.getElementById('chatInput')?.focus();
      }
    }
  },
  
  send() {
    const input = document.getElementById('chatInput');
    if (!input) return;
    
    const text = input.value.trim();
    if (!text) return;
    
    const email = window.currentUser?.email || 'guest_' + Date.now();
    const store = SYNC_ENGINE.getStore();
    
    if (!store.chatMessages[email]) store.chatMessages[email] = [];
    
    const time = new Date().toLocaleTimeString('uk-UA', {hour:'2-digit', minute:'2-digit'});
    store.chatMessages[email].push({
      text,
      from: 'user',
      time,
      read: false
    });
    
    SYNC_ENGINE.saveStore(store);
    input.value = '';
    this.loadMessages();
    
    // Автовідповідь (симуляція)
    setTimeout(() => {
      if (Math.random() > 0.3) {
        this.receiveMessage('Дякуємо за повідомлення! Наш менеджер зв\'яжеться з вами найближчим часом. 😊');
      }
    }, 2000);
  },
  
  receiveMessage(text) {
    const email = window.currentUser?.email || 'guest_' + Date.now();
    const store = SYNC_ENGINE.getStore();
    
    if (!store.chatMessages[email]) store.chatMessages[email] = [];
    
    const time = new Date().toLocaleTimeString('uk-UA', {hour:'2-digit', minute:'2-digit'});
    store.chatMessages[email].push({
      text,
      from: 'admin',
      time,
      read: this.isOpen
    });
    
    SYNC_ENGINE.saveStore(store);
    this.loadMessages();
    
    if (!this.isOpen) {
      this.unreadCount++;
      this.updateBadge();
      notify('💬', 'Нове повідомлення від підтримки');
    }
  },
  
  loadMessages() {
    const email = window.currentUser?.email || 'guest_' + Date.now();
    const store = SYNC_ENGINE.getStore();
    const messages = store.chatMessages[email] || [];
    
    const container = document.getElementById('chatMessages');
    if (!container) return;
    
    container.innerHTML = messages.map(m => `
      <div style="display:flex;justify-content:${m.from === 'user' ? 'flex-end' : 'flex-start'};margin-bottom:0.8rem">
        <div style="max-width:75%;background:${m.from === 'user' ? 'var(--accent)' : 'var(--bg3)'};color:${m.from === 'user' ? '#fff' : 'var(--text)'};padding:0.7rem 1rem;border-radius:12px;border-radius:${m.from === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px'}">
          <div style="font-size:0.9rem;line-height:1.4;margin-bottom:0.3rem">${m.text}</div>
          <div style="font-size:0.7rem;opacity:0.7">${m.time}</div>
        </div>
      </div>
    `).join('');
    
    container.scrollTop = container.scrollHeight;
  },
  
  markAsRead() {
    const email = window.currentUser?.email || 'guest_' + Date.now();
    const store = SYNC_ENGINE.getStore();
    
    if (store.chatMessages[email]) {
      store.chatMessages[email].forEach(m => m.read = true);
      SYNC_ENGINE.saveStore(store);
    }
    
    this.unreadCount = 0;
    this.updateBadge();
  },
  
  updateBadge() {
    const badge = document.getElementById('chatBadge');
    if (badge) {
      badge.textContent = this.unreadCount;
      badge.style.display = this.unreadCount > 0 ? 'flex' : 'none';
    }
  },
  
  checkUnread() {
    const email = window.currentUser?.email || 'guest_' + Date.now();
    const store = SYNC_ENGINE.getStore();
    const messages = store.chatMessages[email] || [];
    this.unreadCount = messages.filter(m => !m.read && m.from === 'admin').length;
    this.updateBadge();
  }
};

// Ініціалізація при завантаженні
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    WISHLIST.updateUI();
    COMPARE.updateUI();
    LIVE_CHAT.checkUnread();
  });
  
  // Оновлення UI при синхронізації
  window.addEventListener('lspdfr:sync', () => {
    WISHLIST.updateUI();
    COMPARE.updateUI();
    LIVE_CHAT.checkUnread();
  });
}
