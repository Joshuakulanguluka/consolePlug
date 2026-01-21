// Cash Overview functionality

// Initialize cash transactions from localStorage
let cashTransactions = JSON.parse(localStorage.getItem('cashTransactions')) || [];
let reservedCash = parseFloat(localStorage.getItem('reservedCash')) || 0;
let currentTransactionPage = 1;
let transactionsPerPage = 10;
let currentFilteredTransactions = [];

document.addEventListener('DOMContentLoaded', function() {
    updateCashStats();
    loadTransactionHistory();
});

// Calculate cash available
function getCashAvailable() {
    // Cash Available = Total Sales - Total Expenses + Top-ups - Withdrawals
    const totalSales = salesData.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalExpenses = expensesData.reduce((sum, expense) => sum + expense.amount, 0);
    const totalTopUps = cashTransactions
        .filter(t => t.type === 'topup')
        .reduce((sum, t) => sum + t.amount, 0);
    const totalWithdrawals = cashTransactions
        .filter(t => t.type === 'withdraw')
        .reduce((sum, t) => sum + t.amount, 0);
    
    return totalSales - totalExpenses + totalTopUps - totalWithdrawals;
}

// Calculate spendable cash
function getSpendableCash() {
    const cashAvailable = getCashAvailable();
    return Math.max(0, cashAvailable - reservedCash);
}

// Calculate total profit
function getTotalProfit() {
    const totalRevenue = salesData.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalExpenses = expensesData.reduce((sum, expense) => sum + expense.amount, 0);
    return totalRevenue - totalExpenses;
}

// Calculate cash trend (last 7 days)
function getCashTrend() {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    
    // Get sales and expenses from last 7 days
    const recentSales = salesData.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate >= sevenDaysAgo && saleDate <= today;
    }).reduce((sum, sale) => sum + sale.totalAmount, 0);
    
    const recentExpenses = expensesData.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= sevenDaysAgo && expenseDate <= today;
    }).reduce((sum, expense) => sum + expense.amount, 0);
    
    const recentWithdrawals = cashTransactions.filter(t => {
        const tDate = new Date(t.date);
        return t.type === 'withdraw' && tDate >= sevenDaysAgo && tDate <= today;
    }).reduce((sum, t) => sum + t.amount, 0);
    
    const recentTopUps = cashTransactions.filter(t => {
        const tDate = new Date(t.date);
        return t.type === 'topup' && tDate >= sevenDaysAgo && tDate <= today;
    }).reduce((sum, t) => sum + t.amount, 0);
    
    return recentSales - recentExpenses + recentTopUps - recentWithdrawals;
}

// Update cash statistics
function updateCashStats() {
    const cashAvailable = getCashAvailable();
    const spendableCash = getSpendableCash();
    const totalProfit = getTotalProfit();
    const cashTrend = getCashTrend();
    
    document.getElementById('cashAvailable').textContent = formatCurrency(cashAvailable);
    document.getElementById('spendableCash').textContent = formatCurrency(spendableCash);
    document.getElementById('totalProfit').textContent = formatCurrency(totalProfit);
    document.getElementById('cashTrend').textContent = formatCurrency(Math.abs(cashTrend));
    
    // Update trend icon
    const trendIcon = document.getElementById('trendIcon');
    if (cashTrend > 0) {
        trendIcon.innerHTML = '<i data-lucide="trending-up" class="text-green-600" style="width: 20px; height: 20px;"></i>';
    } else if (cashTrend < 0) {
        trendIcon.innerHTML = '<i data-lucide="trending-down" class="text-red-600" style="width: 20px; height: 20px;"></i>';
    } else {
        trendIcon.innerHTML = '<i data-lucide="minus" class="text-gray-600" style="width: 20px; height: 20px;"></i>';
    }
    
    // Reinitialize icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Load transaction history
function loadTransactionHistory() {
    const container = document.getElementById('transactionHistory');
    const noTransactions = document.getElementById('noTransactions');
    const filter = document.getElementById('historyFilter').value;
    
    let filtered = [...cashTransactions];
    
    if (filter !== 'all') {
        filtered = filtered.filter(t => t.type === filter);
    }
    
    // Sort by date (newest first)
    filtered.sort((a, b) => {
        const dateA = new Date(a.date + ' ' + a.time);
        const dateB = new Date(b.date + ' ' + b.time);
        return dateB - dateA;
    });
    
    currentFilteredTransactions = filtered;
    
    // Calculate pagination
    const totalItems = currentFilteredTransactions.length;
    const totalPages = Math.ceil(totalItems / transactionsPerPage);
    const startIndex = (currentTransactionPage - 1) * transactionsPerPage;
    const endIndex = Math.min(startIndex + transactionsPerPage, totalItems);
    const paginatedTransactions = currentFilteredTransactions.slice(startIndex, endIndex);
    
    // Update pagination info
    document.getElementById('transactionShowingStart').textContent = totalItems > 0 ? startIndex + 1 : 0;
    document.getElementById('transactionShowingEnd').textContent = endIndex;
    document.getElementById('totalTransactionItems').textContent = totalItems;
    
    if (paginatedTransactions.length === 0) {
        container.classList.add('hidden');
        noTransactions.classList.remove('hidden');
        updateTransactionPaginationButtons(0, 0);
        return;
    }
    
    container.classList.remove('hidden');
    noTransactions.classList.add('hidden');
    
    container.innerHTML = paginatedTransactions.map(transaction => {
        const isWithdraw = transaction.type === 'withdraw';
        const bgColor = isWithdraw ? 'bg-red-50' : 'bg-green-50';
        const borderColor = isWithdraw ? 'border-red-200' : 'border-green-200';
        const textColor = isWithdraw ? 'text-red-600' : 'text-green-600';
        const icon = isWithdraw ? 'arrow-down-circle' : 'arrow-up-circle';
        const label = isWithdraw ? 'Withdrawal' : 'Top-up';
        
        return `
            <div class="border ${borderColor} ${bgColor} rounded-lg p-4">
                <div class="flex items-start justify-between">
                    <div class="flex items-start gap-3 flex-1">
                        <div class="w-10 h-10 ${bgColor} rounded-lg flex items-center justify-center">
                            <i data-lucide="${icon}" class="${textColor}" style="width: 20px; height: 20px;"></i>
                        </div>
                        <div class="flex-1">
                            <div class="flex items-center gap-2 mb-1">
                                <span class="font-medium text-gray-900">${label}</span>
                                <span class="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                                    ${transaction.date} ${transaction.time}
                                </span>
                            </div>
                            <p class="text-sm text-gray-600 mb-2">${transaction.reason}</p>
                            <div class="flex items-center gap-2">
                                <i data-lucide="check-circle" class="text-green-600" style="width: 14px; height: 14px;"></i>
                                <span class="text-xs text-green-600">Confirmed</span>
                            </div>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="text-xl font-bold ${textColor}">${isWithdraw ? '-' : '+'}${formatCurrency(transaction.amount)}</p>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    updateTransactionPaginationButtons(currentTransactionPage, totalPages);
    
    // Reinitialize icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Filter history
function filterHistory() {
    currentTransactionPage = 1;
    loadTransactionHistory();
}

// Pagination functions
function previousTransactionPage() {
    if (currentTransactionPage > 1) {
        currentTransactionPage--;
        loadTransactionHistory();
    }
}

function nextTransactionPage() {
    const totalPages = Math.ceil(currentFilteredTransactions.length / transactionsPerPage);
    if (currentTransactionPage < totalPages) {
        currentTransactionPage++;
        loadTransactionHistory();
    }
}

function goToTransactionPage(page) {
    currentTransactionPage = page;
    loadTransactionHistory();
}

function updateTransactionPaginationButtons(current, total) {
    const prevBtn = document.getElementById('transactionPrevBtn');
    const nextBtn = document.getElementById('transactionNextBtn');
    const pageNumbers = document.getElementById('transactionPageNumbers');
    
    if (total === 0) {
        prevBtn.disabled = true;
        nextBtn.disabled = true;
        pageNumbers.innerHTML = '';
        return;
    }
    
    prevBtn.disabled = current <= 1;
    nextBtn.disabled = current >= total;
    
    let pages = '';
    const maxPages = 5;
    let startPage = Math.max(1, current - Math.floor(maxPages / 2));
    let endPage = Math.min(total, startPage + maxPages - 1);
    
    if (endPage - startPage < maxPages - 1) {
        startPage = Math.max(1, endPage - maxPages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        pages += `
            <button 
                onclick="goToTransactionPage(${i})" 
                class="px-3 py-1 border rounded-lg text-sm ${i === current ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 hover:bg-gray-50 text-gray-700'}"
            >
                ${i}
            </button>
        `;
    }
    
    pageNumbers.innerHTML = pages;
}

// Open withdraw modal
function openWithdrawModal() {
    const spendableCash = getSpendableCash();
    document.getElementById('modalSpendableCash').textContent = formatCurrency(spendableCash);
    document.getElementById('withdrawForm').reset();
    document.getElementById('withdrawModal').classList.remove('hidden');
    
    setTimeout(() => {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }, 10);
}

// Close withdraw modal
function closeWithdrawModal() {
    document.getElementById('withdrawModal').classList.add('hidden');
}

// Handle withdraw
function handleWithdraw(event) {
    event.preventDefault();
    
    const amount = parseFloat(document.getElementById('withdrawAmount').value);
    const password = document.getElementById('withdrawPassword').value;
    const reason = document.getElementById('withdrawReason').value.trim();
    const spendableCash = getSpendableCash();
    
    // Validate amount
    if (amount > spendableCash) {
        showError(`Cannot withdraw K ${amount.toFixed(2)}. Only K ${spendableCash.toFixed(2)} is available.`);
        return;
    }
    
    // Simple password validation (in real app, this would be more secure)
    if (password !== 'admin') {
        showError('Invalid password!');
        return;
    }
    
    // Create transaction
    const transaction = {
        id: getNextId(cashTransactions),
        type: 'withdraw',
        amount: amount,
        reason: reason,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        status: 'confirmed'
    };
    
    cashTransactions.push(transaction);
    localStorage.setItem('cashTransactions', JSON.stringify(cashTransactions));
    
    closeWithdrawModal();
    currentTransactionPage = 1;
    updateCashStats();
    loadTransactionHistory();
    
    showSuccess(`Successfully withdrew ${formatCurrency(amount)}`);
}

// Open top-up modal
function openTopUpModal() {
    const cashAvailable = getCashAvailable();
    document.getElementById('modalCashAvailable').textContent = formatCurrency(cashAvailable);
    document.getElementById('topupForm').reset();
    document.getElementById('topupModal').classList.remove('hidden');
    
    setTimeout(() => {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }, 10);
}

// Close top-up modal
function closeTopUpModal() {
    document.getElementById('topupModal').classList.add('hidden');
}

// Handle top-up
function handleTopUp(event) {
    event.preventDefault();
    
    const amount = parseFloat(document.getElementById('topupAmount').value);
    const reason = document.getElementById('topupReason').value.trim();
    
    // Create transaction
    const transaction = {
        id: getNextId(cashTransactions),
        type: 'topup',
        amount: amount,
        reason: reason,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        status: 'confirmed'
    };
    
    cashTransactions.push(transaction);
    localStorage.setItem('cashTransactions', JSON.stringify(cashTransactions));
    
    closeTopUpModal();
    currentTransactionPage = 1;
    updateCashStats();
    loadTransactionHistory();
    
    showSuccess(`Successfully added ${formatCurrency(amount)} to cash`);
}

// Open reserved cash modal
function openReservedCashModal() {
    document.getElementById('currentReserved').textContent = formatCurrency(reservedCash);
    document.getElementById('reservedAmount').value = reservedCash;
    document.getElementById('reservedCashModal').classList.remove('hidden');
    
    setTimeout(() => {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }, 10);
}

// Close reserved cash modal
function closeReservedCashModal() {
    document.getElementById('reservedCashModal').classList.add('hidden');
}

// Handle reserved cash
function handleReservedCash(event) {
    event.preventDefault();
    
    const amount = parseFloat(document.getElementById('reservedAmount').value);
    const cashAvailable = getCashAvailable();
    
    // Validate
    if (amount > cashAvailable) {
        showError(`Cannot reserve K ${amount.toFixed(2)}. Only K ${cashAvailable.toFixed(2)} is available.`);
        return;
    }
    
    reservedCash = amount;
    localStorage.setItem('reservedCash', reservedCash);
    
    closeReservedCashModal();
    updateCashStats();
    
    showSuccess(`Reserved cash set to ${formatCurrency(amount)}`);
}
