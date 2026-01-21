// Custom App Update Events
const AppEvents = {
    // Event listeners registry
    listeners: {},
    
    // Subscribe to an event
    on(eventName, callback) {
        if (!this.listeners[eventName]) {
            this.listeners[eventName] = [];
        }
        this.listeners[eventName].push(callback);
    },
    
    // Unsubscribe from an event
    off(eventName, callback) {
        if (!this.listeners[eventName]) return;
        this.listeners[eventName] = this.listeners[eventName].filter(cb => cb !== callback);
    },
    
    // Emit an event
    emit(eventName, data) {
        if (!this.listeners[eventName]) return;
        this.listeners[eventName].forEach(callback => callback(data));
    },
    
    // Predefined event types
    EVENTS: {
        STOCK_UPDATED: 'stock:updated',
        SALE_ADDED: 'sale:added',
        EXPENSE_ADDED: 'expense:added',
        DATA_CHANGED: 'data:changed',
        UI_UPDATE: 'ui:update'
    }
};

// Emit data changed event when state updates
AppEvents.on(AppEvents.EVENTS.STOCK_UPDATED, () => {
    AppEvents.emit(AppEvents.EVENTS.DATA_CHANGED, { type: 'stock' });
});

AppEvents.on(AppEvents.EVENTS.SALE_ADDED, () => {
    AppEvents.emit(AppEvents.EVENTS.DATA_CHANGED, { type: 'sale' });
});

AppEvents.on(AppEvents.EVENTS.EXPENSE_ADDED, () => {
    AppEvents.emit(AppEvents.EVENTS.DATA_CHANGED, { type: 'expense' });
});
