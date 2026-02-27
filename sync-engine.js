// =====================================================
// LSPDFR ELITE STUDIO - SYNC ENGINE
// Система синхронізації даних між головним сайтом та адмін-панеллю
// =====================================================

const SYNC_ENGINE = {
  STORE_KEY: 'lspdfr_store',
  SYNC_INTERVAL: 2000, // 2 секунди
  
  // Ініціалізація
  init() {
    this.ensureStore();
    this.startAutoSync();
    this.listenForChanges();
  },
  
  // Створення базової структури даних
  ensureStore() {
    let store = this.getStore();
    if (!store.users) store.users = {};
    if (!store.orders) store.orders = [];
    if (!store.reviews) store.reviews = [];
    if (!store.chatMessages) store.chatMessages = {};
    if (!store.promos) store.promos = { 'ELITE10':10, 'WELCOME5':5, 'HOT15':15, 'NEW20':20 };
    if (!store.wishlist) store.wishlist = {}; // email -> [productIds]
    if (!store.compareList) store.compareList = {}; // email -> [productIds]
    if (!store.viewHistory) store.viewHistory = {}; // email -> [{productId, date}]
    if (!store.analytics) store.analytics = {
      pageViews: 0,
      uniqueVisitors: new Set(),
      productViews: {},
      cartAdds: {},
      purchases: {},
      revenue: { daily: {}, weekly: {}, monthly: {} }
    };
    if (!store.notifications) store.notifications = [];
    if (!store.flashSales) store.flashSales = [];
    this.saveStore(store);
  },
  
  // Отримати дані
  getStore() {
    try {
      return JSON.parse(localStorage.getItem(this.STORE_KEY)) || {};
    } catch {
      return {};
    }
  },
  
  // Зберегти дані
  saveStore(data) {
    localStorage.setItem(this.STORE_KEY, JSON.stringify(data));
    localStorage.setItem(this.STORE_KEY + '_timestamp', Date.now());
    this.triggerSyncEvent();
  },
  
  // Оновити частину даних
  updateStore(path, value) {
    const store = this.getStore();
    const keys = path.split('.');
    let current = store;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    this.saveStore(store);
  },
  
  // Додати елемент до масиву
  pushToArray(path, item) {
    const store = this.getStore();
    const keys = path.split('.');
    let current = store;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    
    if (!Array.isArray(current[keys[keys.length - 1]])) {
      current[keys[keys.length - 1]] = [];
    }
    
    current[keys[keys.length - 1]].push(item);
    this.saveStore(store);
  },
  
  // Автосинхронізація
  startAutoSync() {
    setInterval(() => {
      const event = new CustomEvent('lspdfr:sync', { 
        detail: { timestamp: Date.now(), store: this.getStore() } 
      });
      window.dispatchEvent(event);
    }, this.SYNC_INTERVAL);
  },
  
  // Слухати зміни в localStorage з інших вкладок
  listenForChanges() {
    window.addEventListener('storage', (e) => {
      if (e.key === this.STORE_KEY) {
        const event = new CustomEvent('lspdfr:external-sync', {
          detail: { newValue: e.newValue }
        });
        window.dispatchEvent(event);
      }
    });
  },
  
  // Тригер події синхронізації
  triggerSyncEvent() {
    const event = new CustomEvent('lspdfr:data-changed', {
      detail: { timestamp: Date.now() }
    });
    window.dispatchEvent(event);
  },
  
  // Аналітика
  trackPageView() {
    const store = this.getStore();
    if (!store.analytics) store.analytics = {};
    store.analytics.pageViews = (store.analytics.pageViews || 0) + 1;
    this.saveStore(store);
  },
  
  trackProductView(productId) {
    const store = this.getStore();
    if (!store.analytics.productViews) store.analytics.productViews = {};
    store.analytics.productViews[productId] = (store.analytics.productViews[productId] || 0) + 1;
    this.saveStore(store);
  },
  
  trackCartAdd(productId) {
    const store = this.getStore();
    if (!store.analytics.cartAdds) store.analytics.cartAdds = {};
    store.analytics.cartAdds[productId] = (store.analytics.cartAdds[productId] || 0) + 1;
    this.saveStore(store);
  },
  
  trackPurchase(productId, amount) {
    const store = this.getStore();
    if (!store.analytics.purchases) store.analytics.purchases = {};
    store.analytics.purchases[productId] = (store.analytics.purchases[productId] || 0) + 1;
    
    const today = new Date().toISOString().split('T')[0];
    if (!store.analytics.revenue.daily[today]) store.analytics.revenue.daily[today] = 0;
    store.analytics.revenue.daily[today] += amount;
    
    this.saveStore(store);
  }
};

// Автоматична ініціалізація
if (typeof window !== 'undefined') {
  SYNC_ENGINE.init();
}
