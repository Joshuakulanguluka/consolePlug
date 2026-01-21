// Global Application State Management
const AppState = {
    // Stock data
    stock: [],
    
    // Sales data
    sales: [],
    
    // Expenses data
    expenses: [],
    
    // Notifications data
    notifications: [],
    
    // User data
    user: {
        email: '',
        isLoggedIn: false
    },
    
    // UI state
    ui: {
        sidebarCollapsed: false,
        currentPage: ''
    },
    
    // Initialize state from localStorage
    init() {
        this.loadFromStorage();
        this.user.isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        this.user.email = localStorage.getItem('userEmail') || '';
        this.initNotifications();
    },
    
    // Load data from localStorage
    loadFromStorage() {
        const stockData = localStorage.getItem('stock');
        const salesData = localStorage.getItem('sales');
        const expensesData = localStorage.getItem('expenses');
        const notificationsData = localStorage.getItem('notifications');
        
        this.stock = stockData ? JSON.parse(stockData) : [];
        this.sales = salesData ? JSON.parse(salesData) : [];
        this.expenses = expensesData ? JSON.parse(expensesData) : [];
        this.notifications = notificationsData ? JSON.parse(notificationsData) : [];
    },
    
    // Initialize default notifications if none exist
    initNotifications() {
        if (this.notifications.length === 0) {
            this.notifications = [
                { id: 1, type: 'warning', title: 'Low Stock Alert', message: 'PlayStation 5 is running low (only 2 left)', date: new Date().toISOString(), read: false },
                { id: 2, type: 'success', title: 'Sale Completed', message: 'New sale recorded successfully - Xbox Controller sold', date: new Date().toISOString(), read: false },
                { id: 3, type: 'info', title: 'System Update', message: 'System updated to latest version', date: new Date(Date.now() - 86400000).toISOString(), read: true },
                { id: 4, type: 'warning', title: 'Low Stock Alert', message: 'PS5 Controller stock is low (only 3 left)', date: new Date(Date.now() - 172800000).toISOString(), read: false },
                { id: 5, type: 'success', title: 'Stock Added', message: 'New stock items added to inventory', date: new Date(Date.now() - 259200000).toISOString(), read: true }
            ];
            localStorage.setItem('notifications', JSON.stringify(this.notifications));
        }
    },
    
    // Get current page from body attribute
    getCurrentPage() {
        return document.body.getAttribute('data-page-title') || '';
    }
};

// Initialize state on load
if (typeof window !== 'undefined') {
    AppState.init();
}
