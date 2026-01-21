// All Math & Totals Logic
const Calculations = {
    // Calculate today's total sales
    getTodaySales() {
        const today = new Date().toDateString();
        return AppState.sales
            .filter(sale => new Date(sale.date).toDateString() === today)
            .reduce((sum, sale) => sum + (sale.totalPrice || 0), 0);
    },
    
    // Calculate today's total expenses
    getTodayExpenses() {
        const today = new Date().toDateString();
        return AppState.expenses
            .filter(expense => new Date(expense.date).toDateString() === today)
            .reduce((sum, expense) => sum + (expense.amount || 0), 0);
    },
    
    // Calculate today's net profit (only from sales: selling price - buying price)
    getTodayProfit() {
        const today = new Date().toDateString();
        return AppState.sales
            .filter(sale => new Date(sale.date).toDateString() === today)
            .reduce((sum, sale) => {
                const profit = (sale.sellingPrice - sale.buyingPrice) * sale.quantity;
                return sum + profit;
            }, 0);
    },
    
    // Get low stock items (below threshold)
    getLowStockItems() {
        return AppState.stock.filter(item => item.quantity <= (item.threshold || 5));
    },
    
    // Get sales for last N days
    getSalesForLastDays(days = 7) {
        const result = [];
        const today = new Date();
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toDateString();
            
            const dayTotal = AppState.sales
                .filter(sale => new Date(sale.date).toDateString() === dateStr)
                .reduce((sum, sale) => sum + (sale.totalPrice || 0), 0);
            
            result.push({
                date: date,
                label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                total: dayTotal
            });
        }
        
        return result;
    },
    
    // Get top selling items today
    getTopSellingToday(limit = 5) {
        const today = new Date().toDateString();
        const todaySales = AppState.sales.filter(sale => 
            new Date(sale.date).toDateString() === today
        );
        
        const itemSales = {};
        todaySales.forEach(sale => {
            if (!itemSales[sale.itemId]) {
                itemSales[sale.itemId] = {
                    itemId: sale.itemId,
                    itemName: sale.itemName,
                    quantity: 0,
                    revenue: 0
                };
            }
            itemSales[sale.itemId].quantity += sale.quantity;
            itemSales[sale.itemId].revenue += sale.totalPrice;
        });
        
        return Object.values(itemSales)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, limit);
    },
    
    // Calculate total stock value (total selling price - money we'll get after selling everything)
    getTotalStockValue() {
        return AppState.stock.reduce((sum, item) => 
            sum + (item.sellingPrice * item.quantity), 0
        );
    },
    
    // Format currency
    formatCurrency(amount) {
        return `K ${amount.toFixed(2)}`;
    },
    
    // Calculate average sale for today
    getAverageSale() {
        const today = new Date().toDateString();
        const todaySales = AppState.sales.filter(sale => 
            new Date(sale.date).toDateString() === today
        );
        if (todaySales.length === 0) return 0;
        const total = todaySales.reduce((sum, sale) => sum + (sale.totalPrice || 0), 0);
        return total / todaySales.length;
    },
    
    // Get today's transaction count
    getTodayTransactionCount() {
        const today = new Date().toDateString();
        return AppState.sales.filter(sale => 
            new Date(sale.date).toDateString() === today
        ).length;
    }
};
