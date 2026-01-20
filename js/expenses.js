// Expenses functionality
let currentExpensesPage = 1;
let expensesPerPage = 10;
let currentFilteredExpenses = [];
let highestCategoryName = '';

document.addEventListener('DOMContentLoaded', function() {
    // Sort expenses by date (newest first)
    expensesData.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA;
    });
    
    currentFilteredExpenses = [...expensesData];
    updateExpenseStats();
    loadExpensesTable();
});

// Open add expense modal
function openAddExpenseModal() {
    document.getElementById('expenseForm').reset();
    document.getElementById('expenseDate').valueAsDate = new Date();
    document.getElementById('expenseModal').classList.remove('hidden');
    
    // Reinitialize icons after modal opens
    setTimeout(() => {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }, 10);
}

// Close expense modal
function closeExpenseModal() {
    document.getElementById('expenseModal').classList.add('hidden');
}

// Update expense statistics
function updateExpenseStats() {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Total expenses this month
    const monthExpenses = expensesData.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    });
    const totalMonth = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    document.getElementById('totalMonthExpenses').textContent = formatCurrency(totalMonth);
    
    // Expenses today
    const todayExpenses = expensesData.filter(expense => expense.date === today);
    const totalToday = todayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    document.getElementById('todayExpenses').textContent = formatCurrency(totalToday);
    
    // Highest expense category (this month)
    const categoryTotals = {};
    monthExpenses.forEach(expense => {
        if (!categoryTotals[expense.category]) {
            categoryTotals[expense.category] = 0;
        }
        categoryTotals[expense.category] += expense.amount;
    });
    
    let highestCategory = '-';
    let highestAmount = 0;
    for (const [category, amount] of Object.entries(categoryTotals)) {
        if (amount > highestAmount) {
            highestAmount = amount;
            highestCategory = category;
        }
    }
    highestCategoryName = highestCategory;
    document.getElementById('highestCategory').textContent = highestCategory;
    
    // Average daily expense (this month)
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const avgDaily = totalMonth / daysInMonth;
    document.getElementById('avgDailyExpense').textContent = formatCurrency(avgDaily);
}

// Filter expenses
function filterExpenses() {
    const dateFilter = document.getElementById('dateFilter').value;
    const categoryFilter = document.getElementById('categoryFilter').value;
    
    const now = new Date();
    let filtered = [...expensesData];
    
    // Date filter
    if (dateFilter === 'today') {
        const today = now.toISOString().split('T')[0];
        filtered = filtered.filter(expense => expense.date === today);
    } else if (dateFilter === 'week') {
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        filtered = filtered.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate >= weekAgo && expenseDate <= now;
        });
    } else if (dateFilter === 'month') {
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        filtered = filtered.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
        });
    }
    
    // Category filter
    if (categoryFilter) {
        filtered = filtered.filter(expense => expense.category === categoryFilter);
    }
    
    currentFilteredExpenses = filtered;
    currentExpensesPage = 1;
    loadExpensesTable();
}

// Filter functions for stat cards
function filterToday() {
    document.getElementById('dateFilter').value = 'today';
    document.getElementById('categoryFilter').value = '';
    filterExpenses();
    showInfo('Showing today\'s expenses');
}

function filterThisMonth() {
    document.getElementById('dateFilter').value = 'month';
    document.getElementById('categoryFilter').value = '';
    filterExpenses();
    showInfo('Showing this month\'s expenses');
}

function filterHighestCategory() {
    if (highestCategoryName === '-') {
        showInfo('No expenses recorded this month');
        return;
    }
    document.getElementById('dateFilter').value = 'month';
    document.getElementById('categoryFilter').value = highestCategoryName;
    filterExpenses();
    showInfo(`Showing ${highestCategoryName} expenses`);
}

// Load expenses table
function loadExpensesTable() {
    const tbody = document.getElementById('expensesTableBody');
    
    // Calculate pagination
    const totalItems = currentFilteredExpenses.length;
    const totalPages = Math.ceil(totalItems / expensesPerPage);
    const startIndex = (currentExpensesPage - 1) * expensesPerPage;
    const endIndex = Math.min(startIndex + expensesPerPage, totalItems);
    const paginatedExpenses = currentFilteredExpenses.slice(startIndex, endIndex);
    
    // Update pagination info
    document.getElementById('expensesShowingStart').textContent = totalItems > 0 ? startIndex + 1 : 0;
    document.getElementById('expensesShowingEnd').textContent = endIndex;
    document.getElementById('totalExpensesItems').textContent = totalItems;
    
    if (paginatedExpenses.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="px-4 py-8 text-center text-gray-500">No expenses recorded yet</td></tr>';
        updateExpensesPaginationButtons(0, 0);
        return;
    }
    
    tbody.innerHTML = paginatedExpenses.map(expense => `
        <tr class="hover:bg-gray-50">
            <td class="px-4 py-3 text-sm text-gray-900">${expense.date}</td>
            <td class="px-4 py-3">
                <span class="px-3 py-1 text-xs font-medium rounded-full ${getCategoryColor(expense.category)}">
                    ${expense.category}
                </span>
            </td>
            <td class="px-4 py-3 text-sm text-gray-900">${expense.item}</td>
            <td class="px-4 py-3 text-sm font-medium text-gray-900">${formatCurrency(expense.amount)}</td>
            <td class="px-4 py-3 text-sm text-gray-600">${expense.notes || '-'}</td>
            <td class="px-4 py-3">
                <div class="flex gap-2">
                    <button onclick="deleteExpense(${expense.id})" class="text-red-600 hover:text-red-800" title="Delete">
                        <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    
    // Reinitialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    updateExpensesPaginationButtons(currentExpensesPage, totalPages);
}

// Get category color
function getCategoryColor(category) {
    const colors = {
        'Transport': 'bg-blue-100 text-blue-700',
        'Utilities': 'bg-yellow-100 text-yellow-700',
        'Repairs': 'bg-red-100 text-red-700',
        'Rent': 'bg-purple-100 text-purple-700',
        'Salaries': 'bg-green-100 text-green-700',
        'Marketing': 'bg-pink-100 text-pink-700',
        'Supplies': 'bg-indigo-100 text-indigo-700',
        'Other': 'bg-gray-100 text-gray-700'
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
}

// Handle expense submission
function handleExpenseSubmit(event) {
    event.preventDefault();
    
    const category = document.getElementById('expenseCategory').value;
    const description = document.getElementById('expenseDescription').value.trim();
    const amount = parseFloat(document.getElementById('expenseAmount').value);
    const date = document.getElementById('expenseDate').value;
    const notes = document.getElementById('expenseNotes').value.trim();
    
    const expense = {
        id: getNextId(expensesData),
        item: description,
        category: category,
        amount: amount,
        date: date,
        notes: notes
    };
    
    expensesData.unshift(expense);
    
    // Re-sort
    expensesData.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA;
    });
    
    saveExpensesData();
    
    // Reset form and close modal
    document.getElementById('expenseForm').reset();
    closeExpenseModal();
    
    // Reload
    currentFilteredExpenses = [...expensesData];
    currentExpensesPage = 1;
    updateExpenseStats();
    loadExpensesTable();
    
    showSuccess(`Expense added successfully! Amount: ${formatCurrency(amount)}`);
}

// Delete expense
function deleteExpense(id) {
    if (confirm('Are you sure you want to delete this expense?')) {
        expensesData = expensesData.filter(expense => expense.id !== id);
        currentFilteredExpenses = currentFilteredExpenses.filter(expense => expense.id !== id);
        saveExpensesData();
        updateExpenseStats();
        loadExpensesTable();
        showSuccess('Expense deleted successfully!');
    }
}

// Pagination functions
function previousExpensesPage() {
    if (currentExpensesPage > 1) {
        currentExpensesPage--;
        loadExpensesTable();
    }
}

function nextExpensesPage() {
    const totalPages = Math.ceil(currentFilteredExpenses.length / expensesPerPage);
    if (currentExpensesPage < totalPages) {
        currentExpensesPage++;
        loadExpensesTable();
    }
}

function goToExpensesPage(page) {
    currentExpensesPage = page;
    loadExpensesTable();
}

function updateExpensesPaginationButtons(current, total) {
    const prevBtn = document.getElementById('expensesPrevBtn');
    const nextBtn = document.getElementById('expensesNextBtn');
    const pageNumbers = document.getElementById('expensesPageNumbers');
    
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
                onclick="goToExpensesPage(${i})" 
                class="px-3 py-1 border rounded-lg text-sm ${i === current ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 hover:bg-gray-50 text-gray-700'}"
            >
                ${i}
            </button>
        `;
    }
    
    pageNumbers.innerHTML = pages;
}
