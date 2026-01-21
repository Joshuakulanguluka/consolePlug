// localStorage Handling Only
const Storage = {
    // Keys
    KEYS: {
        STOCK: 'stock',
        SALES: 'sales',
        EXPENSES: 'expenses',
        USER_EMAIL: 'userEmail',
        IS_LOGGED_IN: 'isLoggedIn',
        LAST_ACTIVITY: 'lastActivity'
    },
    
    // Save stock data
    saveStock(stockData) {
        localStorage.setItem(this.KEYS.STOCK, JSON.stringify(stockData));
        AppState.stock = stockData;
        AppEvents.emit(AppEvents.EVENTS.STOCK_UPDATED, stockData);
    },
    
    // Save sales data
    saveSales(salesData) {
        localStorage.setItem(this.KEYS.SALES, JSON.stringify(salesData));
        AppState.sales = salesData;
        AppEvents.emit(AppEvents.EVENTS.SALE_ADDED, salesData);
    },
    
    // Save expenses data
    saveExpenses(expensesData) {
        localStorage.setItem(this.KEYS.EXPENSES, JSON.stringify(expensesData));
        AppState.expenses = expensesData;
        AppEvents.emit(AppEvents.EVENTS.EXPENSE_ADDED, expensesData);
    },
    
    // Add new stock item
    addStockItem(item) {
        const stock = [...AppState.stock, { ...item, id: Date.now().toString() }];
        this.saveStock(stock);
    },
    
    // Update stock item
    updateStockItem(itemId, updates) {
        const stock = AppState.stock.map(item => 
            item.id === itemId ? { ...item, ...updates } : item
        );
        this.saveStock(stock);
    },
    
    // Delete stock item
    deleteStockItem(itemId) {
        const stock = AppState.stock.filter(item => item.id !== itemId);
        this.saveStock(stock);
    },
    
    // Add new sale
    addSale(sale) {
        const sales = [...AppState.sales, { ...sale, id: Date.now().toString(), date: new Date().toISOString() }];
        this.saveSales(sales);
        
        // Update stock quantity
        const item = AppState.stock.find(s => s.id === sale.itemId);
        if (item) {
            this.updateStockItem(sale.itemId, { quantity: item.quantity - sale.quantity });
        }
    },
    
    // Add new expense
    addExpense(expense) {
        const expenses = [...AppState.expenses, { ...expense, id: Date.now().toString(), date: new Date().toISOString() }];
        this.saveExpenses(expenses);
    },
    
    // Clear all data
    clearAllData() {
        localStorage.removeItem(this.KEYS.STOCK);
        localStorage.removeItem(this.KEYS.SALES);
        localStorage.removeItem(this.KEYS.EXPENSES);
        AppState.stock = [];
        AppState.sales = [];
        AppState.expenses = [];
        AppEvents.emit(AppEvents.EVENTS.DATA_CHANGED, { type: 'clear' });
    }
};
