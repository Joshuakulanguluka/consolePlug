// Dashboard functionality - POS focused
document.addEventListener('DOMContentLoaded', function() {
    // Update today's stats cards
    updateTodayStats();
    
    // Initialize sales chart (last 7 days)
    initSalesChart();
    
    // Load low stock alert list
    loadLowStockList();
    
    // Load top selling items today
    loadTopSellingToday();
});

// Update today's statistics
function updateTodayStats() {
    const today = new Date().toISOString().split('T')[0];
    
    // Today's sales
    const todaySales = salesData
        .filter(sale => sale.date === today)
        .reduce((sum, sale) => sum + sale.totalAmount, 0);
    document.getElementById('todaySales').textContent = formatCurrency(todaySales);
    
    // Today's expenses
    const todayExpenses = expensesData
        .filter(expense => expense.date === today)
        .reduce((sum, expense) => sum + expense.amount, 0);
    document.getElementById('todayExpenses').textContent = formatCurrency(todayExpenses);
    
    // Today's net profit (sales profit - expenses)
    const todayProfit = salesData
        .filter(sale => sale.date === today)
        .reduce((sum, sale) => sum + sale.profit, 0) - todayExpenses;
    document.getElementById('todayProfit').textContent = formatCurrency(todayProfit);
    
    // Low stock count
    const lowStockCount = stockData.filter(item => item.quantity <= item.lowStockThreshold).length;
    document.getElementById('lowStockCount').textContent = lowStockCount;
}

// Initialize sales chart - Last 7 days bar chart
function initSalesChart() {
    const ctx = document.getElementById('salesChart').getContext('2d');
    
    // Generate data for last 7 days
    const labels = [];
    const salesValues = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        labels.push(date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }));
        
        // Calculate actual sales for this date
        const daySales = salesData
            .filter(sale => sale.date === dateStr)
            .reduce((sum, sale) => sum + sale.totalAmount, 0);
        
        salesValues.push(daySales);
    }
    
    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, '#3B82F6');
    gradient.addColorStop(1, '#60A5FA');
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Sales',
                data: salesValues,
                backgroundColor: gradient,
                borderRadius: 12,
                borderSkipped: false,
                barPercentage: 0.7,
                categoryPercentage: 0.8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    cornerRadius: 8,
                    titleFont: {
                        size: 13,
                        weight: '600'
                    },
                    bodyFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return 'K ' + context.parsed.y.toLocaleString();
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    border: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 12,
                            weight: '500'
                        },
                        color: '#6B7280'
                    }
                },
                y: {
                    beginAtZero: true,
                    border: {
                        display: false,
                        dash: [5, 5]
                    },
                    grid: {
                        color: '#F3F4F6',
                        drawTicks: false
                    },
                    ticks: {
                        font: {
                            size: 12
                        },
                        color: '#9CA3AF',
                        padding: 8,
                        callback: function(value) {
                            if (value === 0) return '0';
                            if (value >= 1000) return 'K ' + (value / 1000).toFixed(0) + 'k';
                            return 'K ' + value.toLocaleString();
                        }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

// Load low stock alert list
function loadLowStockList() {
    const container = document.getElementById('lowStockList');
    const lowStockItems = stockData
        .filter(item => item.quantity <= item.lowStockThreshold)
        .sort((a, b) => a.quantity - b.quantity)
        .slice(0, 5);
    
    if (lowStockItems.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-sm">All items are well stocked</p>';
        return;
    }
    
    container.innerHTML = lowStockItems.map(item => `
        <div class="flex items-center justify-between p-3 border border-orange-200 bg-orange-50 rounded-lg">
            <div class="flex items-center">
                <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <i data-lucide="${getCategoryIcon(item.category)}" class="text-orange-600" style="width: 20px; height: 20px;"></i>
                </div>
                <div class="ml-3">
                    <p class="font-medium text-gray-900 text-sm">${item.productName}</p>
                    <p class="text-xs text-gray-600">${item.platform}</p>
                </div>
            </div>
            <div class="text-right">
                <p class="font-bold text-orange-600 text-sm">${item.quantity} left</p>
                <span class="text-xs px-2 py-1 bg-orange-200 text-orange-800 rounded-full">Low</span>
            </div>
        </div>
    `).join('');
}

// Load top selling items today
function loadTopSellingToday() {
    const container = document.getElementById('topSellingToday');
    const today = new Date().toISOString().split('T')[0];
    
    // Get today's sales
    const todaySales = salesData.filter(sale => sale.date === today);
    
    if (todaySales.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-sm">No sales recorded today</p>';
        return;
    }
    
    // Calculate sales count per item today
    const salesCount = {};
    todaySales.forEach(sale => {
        if (salesCount[sale.stockId]) {
            salesCount[sale.stockId] += sale.quantity;
        } else {
            salesCount[sale.stockId] = sale.quantity;
        }
    });
    
    // Sort and get top 3
    const topItems = Object.entries(salesCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([stockId, count]) => {
            const item = stockData.find(s => s.id == stockId);
            return item ? { ...item, soldCount: count } : null;
        })
        .filter(item => item !== null);
    
    container.innerHTML = topItems.map(item => `
        <div class="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
            <div class="flex items-center">
                <div class="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                    <i data-lucide="${getCategoryIcon(item.category)}" class="text-green-600" style="width: 20px; height: 20px;"></i>
                </div>
                <div class="ml-3">
                    <p class="font-medium text-gray-900 text-sm">${item.productName}</p>
                    <p class="text-xs text-gray-500">${item.soldCount} sold today</p>
                </div>
            </div>
            <div class="text-right">
                <p class="font-medium text-green-600 text-sm">${formatCurrency(item.sellingPrice * item.soldCount)}</p>
            </div>
        </div>
    `).join('');
}

// Get icon based on category
function getCategoryIcon(category) {
    const icons = {
        'Console': 'gamepad-2',
        'Controller': 'hand',
        'Power Pack': 'battery-charging'
    };
    return icons[category] || 'package';
}

// Open add expense modal
function openAddExpenseModal() {
    document.getElementById('expenseModal').classList.remove('hidden');
    document.getElementById('expenseForm').reset();
}

// Close add expense modal
function closeAddExpenseModal() {
    document.getElementById('expenseModal').classList.add('hidden');
}

// Handle expense submission
function handleExpenseSubmit(event) {
    event.preventDefault();
    
    const item = document.getElementById('expenseItemInput').value.trim();
    const amount = parseFloat(document.getElementById('expenseAmountInput').value);
    const category = document.getElementById('expenseCategoryInput').value;
    
    if (!item || !amount || amount <= 0) {
        showError('Please fill in all fields correctly');
        return;
    }
    
    // Add expense
    const expense = {
        id: getNextId(expensesData),
        item: item,
        amount: amount,
        date: new Date().toISOString().split('T')[0],
        category: category
    };
    
    expensesData.push(expense);
    saveExpensesData();
    
    closeAddExpenseModal();
    updateTodayStats();
    
    showSuccess(`Expense added: ${item} - ${formatCurrency(amount)}`);
}

// Open close day modal
function closeDayModal() {
    const today = new Date().toISOString().split('T')[0];
    
    // Calculate today's stats
    const todaySales = salesData
        .filter(sale => sale.date === today)
        .reduce((sum, sale) => sum + sale.totalAmount, 0);
    
    const todayExpenses = expensesData
        .filter(expense => expense.date === today)
        .reduce((sum, expense) => sum + expense.amount, 0);
    
    const todayProfit = salesData
        .filter(sale => sale.date === today)
        .reduce((sum, sale) => sum + sale.profit, 0) - todayExpenses;
    
    const todayTransactions = salesData.filter(sale => sale.date === today).length;
    
    // Update modal
    document.getElementById('closeDaySales').textContent = formatCurrency(todaySales);
    document.getElementById('closeDayExpenses').textContent = formatCurrency(todayExpenses);
    document.getElementById('closeDayProfit').textContent = formatCurrency(todayProfit);
    document.getElementById('closeDayTransactions').textContent = todayTransactions;
    
    document.getElementById('closeDayModalDiv').classList.remove('hidden');
}

// Close close day modal
function closeCloseDayModal() {
    document.getElementById('closeDayModalDiv').classList.add('hidden');
}
