// Page Initialization & UI Bindings
const Scripts = {
    // Initialize page
    async init() {
        this.checkAuth();
        await this.loadComponents();
        this.initLucideIcons();
        this.setActiveNavigation();
        initSidebarState();
        initModalHandlers();
        // Update notification count immediately
        updateNotificationCount();
    },
    
    // Check authentication
    checkAuth() {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const currentPath = window.location.pathname;
        
        if (!isLoggedIn && !currentPath.includes('index.html') && currentPath !== '/') {
            window.location.href = '../index.html';
        }
    },
    
    // Load HTML components
    async loadComponents() {
        const components = [
            { id: 'sidebar-container', path: '../components/sidebar.html' },
            { id: 'topbar-container', path: '../components/topbar.html' },
            { id: 'bottomnav-container', path: '../components/bottomnav.html' }
        ];
        
        const promises = components.map(async (component) => {
            const container = document.getElementById(component.id);
            
            if (container) {
                try {
                    // Check sessionStorage cache first
                    const cacheKey = `component_${component.id}`;
                    let html = sessionStorage.getItem(cacheKey);
                    
                    if (!html) {
                        // Fetch if not cached
                        const response = await fetch(component.path);
                        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                        html = await response.text();
                        // Cache for this session
                        sessionStorage.setItem(cacheKey, html);
                    }
                    
                    container.innerHTML = html;
                } catch (error) {
                    console.error(`Failed to load component: ${component.path}`, error);
                }
            }
        });
        
        await Promise.all(promises);
        
        // Initialize icons immediately after loading
        this.initLucideIcons();
    },
    
    // Initialize Lucide icons
    initLucideIcons() {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    },
    
    // Set active navigation based on current page
    setActiveNavigation() {
        const pageTitle = document.body.getAttribute('data-page-title');
        if (!pageTitle) return;
        
        const currentPage = pageTitle.toLowerCase();
        
        // Set active immediately without delay
        document.querySelectorAll('.nav-link').forEach(link => {
            const page = link.getAttribute('data-page');
            if (page && page.toLowerCase() === currentPage) {
                link.classList.add('nav-link--active');
            }
        });
        
        document.querySelectorAll('.bottom-nav-link').forEach(link => {
            const page = link.getAttribute('data-page');
            if (page && page.toLowerCase() === currentPage) {
                link.classList.add('bottom-nav-link--active');
            }
        });
    }
};

// Global UI functions
function toggleSidebar() {
    const sidebarContainer = document.getElementById('sidebar-container');
    if (sidebarContainer) {
        sidebarContainer.classList.toggle('collapsed');
        // Store state
        const isCollapsed = sidebarContainer.classList.contains('collapsed');
        localStorage.setItem('sidebarCollapsed', isCollapsed.toString());
    }
}

function initSidebarState() {
    const sidebarContainer = document.getElementById('sidebar-container');
    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (sidebarContainer && isCollapsed) {
        sidebarContainer.classList.add('collapsed');
    }
}

// Generic Modal Handlers
function initModalHandlers() {
    // Close modals on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
}

function closeAllModals() {
    const modals = document.querySelectorAll('.modal-overlay');
    modals.forEach(modal => {
        if (!modal.classList.contains('hidden')) {
            modal.classList.add('hidden');
            // Reset any forms inside
            const forms = modal.querySelectorAll('form');
            forms.forEach(form => form.reset());
        }
    });
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        // Initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            setTimeout(() => lucide.createIcons(), 50);
        }
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
        // Reset form if exists
        const form = modal.querySelector('form');
        if (form) form.reset();
    }
}

function closeModalOnOverlay(event, modalId) {
    if (event.target.id === modalId) {
        closeModal(modalId);
    }
}

function toggleMobileMenu() {
    const modal = document.getElementById('mobileMenuModal');
    const content = document.getElementById('mobileMenuContent');
    if (modal && content) {
        modal.classList.remove('hidden');
        // Force reflow
        modal.offsetHeight;
        setTimeout(() => {
            content.classList.add('show');
        }, 10);
        // Initialize icons after menu opens
        if (typeof lucide !== 'undefined') {
            setTimeout(() => lucide.createIcons(), 100);
        }
    }
}

function closeMobileMenu(event) {
    if (event) {
        event.stopPropagation();
    }
    const modal = document.getElementById('mobileMenuModal');
    const content = document.getElementById('mobileMenuContent');
    if (content) {
        content.classList.remove('show');
        setTimeout(() => {
            if (modal) modal.classList.add('hidden');
        }, 300);
    }
}

function handleLogout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    window.location.href = '../index.html';
}

// Dashboard Page UI Bindings
let salesChart = null;

function initDashboard() {
    setTimeout(() => {
        updateDashboardStats();
        renderLowStockList();
        renderTopSellingToday();
        initSalesChart();
        
        AppEvents.on(AppEvents.EVENTS.DATA_CHANGED, () => {
            updateDashboardStats();
            renderLowStockList();
            renderTopSellingToday();
            updateSalesChart();
        });
    }, 200);
}

function updateDashboardStats() {
    const todaySales = Calculations.getTodaySales();
    const todayExpenses = Calculations.getTodayExpenses();
    const todayProfit = Calculations.getTodayProfit();
    
    // Calculate items sold today
    const today = new Date().toDateString();
    const itemsSoldToday = AppState.sales
        .filter(sale => new Date(sale.date).toDateString() === today)
        .reduce((sum, sale) => sum + sale.quantity, 0);
    
    const salesEl = document.getElementById('todaySales');
    const expensesEl = document.getElementById('todayExpenses');
    const profitEl = document.getElementById('todayProfit');
    const itemsSoldEl = document.getElementById('itemsSoldToday');
    
    if (salesEl) salesEl.textContent = Calculations.formatCurrency(todaySales);
    if (expensesEl) expensesEl.textContent = Calculations.formatCurrency(todayExpenses);
    if (profitEl) {
        profitEl.textContent = Calculations.formatCurrency(todayProfit);
        // Add color indicator for profit/loss
        profitEl.className = todayProfit >= 0 ? 'stat-value profit-positive' : 'stat-value profit-negative';
    }
    if (itemsSoldEl) {
        itemsSoldEl.textContent = itemsSoldToday;
    }
}

function renderLowStockList() {
    const container = document.getElementById('lowStockList');
    if (!container) return;
    
    const lowStockItems = Calculations.getLowStockItems();
    if (lowStockItems.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-sm">All items are well stocked!</p>';
        return;
    }
    
    container.innerHTML = lowStockItems.map(item => `
        <div class="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
            <div>
                <p class="font-medium text-gray-900">${item.name}</p>
                <p class="text-sm text-gray-600">Only ${item.quantity} left</p>
            </div>
            <span class="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">Low</span>
        </div>
    `).join('');
}

function renderTopSellingToday() {
    const container = document.getElementById('topSellingToday');
    if (!container) return;
    
    const topSelling = Calculations.getTopSellingToday();
    if (topSelling.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-sm">No sales recorded today.</p>';
        return;
    }
    
    container.innerHTML = topSelling.map(item => `
        <div class="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
            <div>
                <p class="font-medium text-gray-900">${item.itemName}</p>
                <p class="text-sm text-gray-600">${item.quantity} units sold</p>
            </div>
            <span class="font-bold text-green-700">${Calculations.formatCurrency(item.revenue)}</span>
        </div>
    `).join('');
}

function initSalesChart() {
    const ctx = document.getElementById('salesChart');
    if (!ctx || typeof Chart === 'undefined') return;
    
    const salesData = Calculations.getSalesForLastDays(7);
    
    salesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: salesData.map(d => d.label),
            datasets: [{
                label: 'Sales (K)',
                data: salesData.map(d => d.total),
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } }
        }
    });
}

function updateSalesChart() {
    if (!salesChart) return;
    const salesData = Calculations.getSalesForLastDays(7);
    salesChart.data.labels = salesData.map(d => d.label);
    salesChart.data.datasets[0].data = salesData.map(d => d.total);
    salesChart.update();
}

function openAddExpenseModal() {
    openModal('expenseModal');
}

function closeDayModal() {
    const todaySales = Calculations.getTodaySales();
    const todayExpenses = Calculations.getTodayExpenses();
    const todayProfit = Calculations.getTodayProfit();
    const today = new Date().toDateString();
    const transactionCount = AppState.sales.filter(sale => 
        new Date(sale.date).toDateString() === today
    ).length;
    
    document.getElementById('closeDaySales').textContent = Calculations.formatCurrency(todaySales);
    document.getElementById('closeDayExpenses').textContent = Calculations.formatCurrency(todayExpenses);
    document.getElementById('closeDayProfit').textContent = Calculations.formatCurrency(todayProfit);
    document.getElementById('closeDayTransactions').textContent = transactionCount;
    
    openModal('closeDayModalDiv');
}

function handleExpenseSubmit(event) {
    event.preventDefault();
    
    // Check which form is being submitted (dashboard or expenses page)
    const itemInput = document.getElementById('expenseItem') || document.getElementById('expenseItemInput');
    const amountInput = document.getElementById('expenseAmount') || document.getElementById('expenseAmountInput');
    const categoryInput = document.getElementById('expenseCategory') || document.getElementById('expenseCategoryInput');
    const dateInput = document.getElementById('expenseDate');
    const notesInput = document.getElementById('expenseNotes');
    
    if (!itemInput || !amountInput || !categoryInput) {
        showError('Form fields not found');
        return;
    }
    
    const item = itemInput.value;
    const amount = parseFloat(amountInput.value);
    const category = categoryInput.value;
    const date = dateInput ? dateInput.value : new Date().toISOString();
    const notes = notesInput ? notesInput.value : '';
    
    Storage.addExpense({ item, amount, category, date, notes });
    showSuccess('Expense added successfully!');
    
    // Close the appropriate modal
    if (document.getElementById('expenseItemInput')) {
        closeModal('expenseModal');
    } else {
        closeModal('expenseModal');
    }
    
    // Update dashboard if on dashboard page
    if (typeof updateDashboardStats === 'function') {
        updateDashboardStats();
    }
}

// Sales Page Functions
let salesCart = [];

function initSalesPage() {
    updateSalesStats();
    loadProductsToSelect();
    updateCartDisplay();
    
    AppEvents.on(AppEvents.EVENTS.DATA_CHANGED, () => {
        updateSalesStats();
        loadProductsToSelect();
    });
}

function updateSalesStats() {
    const todaySales = Calculations.getTodaySales();
    const todayProfit = Calculations.getTodayProfit();
    const transactionCount = Calculations.getTodayTransactionCount();
    const avgSale = Calculations.getAverageSale();
    
    const salesEl = document.getElementById('totalSalesAmount');
    const profitEl = document.getElementById('totalProfitAmount');
    const transEl = document.getElementById('totalTransactions');
    const avgEl = document.getElementById('avgSale');
    
    if (salesEl) salesEl.textContent = Calculations.formatCurrency(todaySales);
    if (profitEl) {
        profitEl.textContent = Calculations.formatCurrency(todayProfit);
        // Add color indicator for profit/loss
        profitEl.className = todayProfit >= 0 ? 'stat-value profit-positive' : 'stat-value profit-negative';
    }
    if (transEl) transEl.textContent = transactionCount;
    if (avgEl) avgEl.textContent = Calculations.formatCurrency(avgSale);
}

function loadProductsToSelect() {
    const select = document.getElementById('quickProductSelect');
    if (!select) return;
    
    const categoryFilter = document.getElementById('quickCategoryFilter')?.value || '';
    const platformFilter = document.getElementById('quickPlatformFilter')?.value || '';
    
    // Only show items with quantity > 0
    let products = AppState.stock.filter(item => item.quantity > 0);
    
    if (categoryFilter) {
        products = products.filter(item => item.category === categoryFilter);
    }
    if (platformFilter) {
        products = products.filter(item => item.platform === platformFilter);
    }
    
    select.innerHTML = '<option value="">Select product...</option>' + 
        products.map(item => 
            `<option value="${item.id}">${item.name} - K ${item.sellingPrice} (${item.quantity} available)</option>`
        ).join('');
}

function quickFilterProducts() {
    loadProductsToSelect();
}

function quickAddProduct() {
    const select = document.getElementById('quickProductSelect');
    if (!select || !select.value) return;
    
    const productId = select.value;
    const product = AppState.stock.find(item => item.id === productId);
    
    if (!product) return;
    
    const existingItem = salesCart.find(item => item.id === productId);
    if (existingItem) {
        if (existingItem.quantity < product.quantity) {
            existingItem.quantity++;
        } else {
            showWarning('Not enough stock available');
            return;
        }
    } else {
        salesCart.push({
            id: product.id,
            name: product.name,
            sellingPrice: product.sellingPrice,
            buyingPrice: product.buyingPrice,
            quantity: 1,
            maxQuantity: product.quantity
        });
    }
    
    select.value = '';
    updateCartDisplay();
}

function updateCartDisplay() {
    const cartList = document.getElementById('cartItemsList');
    const totalItemsEl = document.getElementById('cartTotalItems');
    const totalAmountEl = document.getElementById('cartTotalAmount');
    const totalProfitEl = document.getElementById('cartTotalProfit');
    const submitBtn = document.getElementById('completeSaleBtn');
    
    if (!cartList) return;
    
    if (salesCart.length === 0) {
        cartList.innerHTML = '<div class="px-4 py-8 text-center text-gray-500 text-sm">Cart is empty. Add items above.</div>';
        if (totalItemsEl) totalItemsEl.textContent = '0';
        if (totalAmountEl) totalAmountEl.textContent = 'K 0.00';
        if (totalProfitEl) totalProfitEl.textContent = 'K 0.00';
        if (submitBtn) submitBtn.disabled = true;
        return;
    }
    
    let totalItems = 0;
    let totalAmount = 0;
    let totalProfit = 0;
    
    cartList.innerHTML = salesCart.map((item, index) => {
        const itemTotal = item.sellingPrice * item.quantity;
        const itemProfit = (item.sellingPrice - item.buyingPrice) * item.quantity;
        totalItems += item.quantity;
        totalAmount += itemTotal;
        totalProfit += itemProfit;
        
        return `
            <div class="px-4 py-3 border-b border-gray-200">
                <div class="grid grid-cols-12 gap-2 items-center">
                    <div class="col-span-4 text-sm font-medium text-gray-900">${item.name}</div>
                    <div class="col-span-2 flex items-center justify-center gap-1">
                        <button type="button" onclick="decreaseCartQty(${index})" class="w-6 h-6 flex items-center justify-center bg-gray-100 rounded hover:bg-gray-200">-</button>
                        <span class="w-8 text-center font-medium">${item.quantity}</span>
                        <button type="button" onclick="increaseCartQty(${index})" class="w-6 h-6 flex items-center justify-center bg-gray-100 rounded hover:bg-gray-200">+</button>
                    </div>
                    <div class="col-span-2 text-right text-sm">K ${item.sellingPrice.toFixed(2)}</div>
                    <div class="col-span-3 text-right text-sm font-semibold">K ${itemTotal.toFixed(2)}</div>
                    <div class="col-span-1 text-right">
                        <button type="button" onclick="removeFromCart(${index})" class="text-red-600 hover:text-red-800">
                            <i data-lucide="x" class="w-4 h-4"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    if (totalItemsEl) totalItemsEl.textContent = totalItems;
    if (totalAmountEl) totalAmountEl.textContent = `K ${totalAmount.toFixed(2)}`;
    if (totalProfitEl) totalProfitEl.textContent = `K ${totalProfit.toFixed(2)}`;
    if (submitBtn) submitBtn.disabled = false;
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function increaseCartQty(index) {
    if (salesCart[index].quantity < salesCart[index].maxQuantity) {
        salesCart[index].quantity++;
        updateCartDisplay();
    } else {
        showWarning('Not enough stock available');
    }
}

function decreaseCartQty(index) {
    if (salesCart[index].quantity > 1) {
        salesCart[index].quantity--;
        updateCartDisplay();
    }
}

function removeFromCart(index) {
    salesCart.splice(index, 1);
    updateCartDisplay();
}

function handleSaleSubmit(event) {
    event.preventDefault();
    
    if (salesCart.length === 0) {
        showError('Cart is empty');
        return;
    }
    
    const paymentMethod = document.getElementById('paymentMethod').value;
    const notes = document.getElementById('saleNotes').value;
    
    salesCart.forEach(item => {
        const sale = {
            itemId: item.id,
            itemName: item.name,
            quantity: item.quantity,
            sellingPrice: item.sellingPrice,
            buyingPrice: item.buyingPrice,
            totalPrice: item.sellingPrice * item.quantity,
            paymentMethod: paymentMethod,
            notes: notes
        };
        Storage.addSale(sale);
    });
    
    showSuccess(`Sale completed! ${salesCart.length} item(s) sold`);
    salesCart = [];
    updateCartDisplay();
    document.getElementById('salesForm').reset();
    updateSalesStats();
}

// Stock Page Functions
let stockFilters = { search: '', category: '', subcategory: '', platform: '', condition: '', lowStock: false, addedToday: false };
let stockPage = 1;
const stockPerPage = 10;
let currentEditingStockId = null;

function initStockPage() {
    updateStockStats();
    renderStockTable();
    
    AppEvents.on(AppEvents.EVENTS.DATA_CHANGED, () => {
        updateStockStats();
        renderStockTable();
    });
}

function updateStockStats() {
    const totalItems = AppState.stock.length;
    const lowStock = Calculations.getLowStockItems().length;
    const totalValue = Calculations.getTotalStockValue();
    const today = new Date().toDateString();
    const addedToday = AppState.stock.filter(item => 
        item.dateAdded && new Date(item.dateAdded).toDateString() === today
    ).length;
    
    const totalEl = document.getElementById('totalItems');
    const lowEl = document.getElementById('lowStock');
    const valueEl = document.getElementById('totalValue');
    const todayEl = document.getElementById('addedToday');
    
    if (totalEl) totalEl.textContent = totalItems;
    if (lowEl) lowEl.textContent = lowStock;
    if (valueEl) valueEl.textContent = Calculations.formatCurrency(totalValue);
    if (todayEl) todayEl.textContent = addedToday;
}

function filterStock() {
    stockFilters.search = document.getElementById('searchInput')?.value.toLowerCase() || '';
    stockFilters.category = document.getElementById('categoryFilter')?.value || '';
    stockFilters.subcategory = document.getElementById('subcategoryFilter')?.value || '';
    stockFilters.platform = document.getElementById('platformFilter')?.value || '';
    stockFilters.condition = document.getElementById('conditionFilter')?.value || '';
    stockPage = 1;
    renderStockTable();
}

function handleCategoryFilterChange() {
    const category = document.getElementById('categoryFilter')?.value;
    const subcategoryFilter = document.getElementById('subcategoryFilter');
    if (!subcategoryFilter) return;
    
    if (category === 'Console') {
        subcategoryFilter.innerHTML = '<option value="">All Types</option><option value="Xbox">Xbox</option><option value="PlayStation">PlayStation</option><option value="Nintendo">Nintendo</option>';
    } else if (category === 'Accessory') {
        subcategoryFilter.innerHTML = '<option value="">All Types</option><option value="Controller">Controller</option><option value="Headset">Headset</option><option value="Cable">Cable</option>';
    } else {
        subcategoryFilter.innerHTML = '<option value="">All Types</option>';
    }
    filterStock();
}

function clearAllFilters() {
    stockFilters = { search: '', category: '', subcategory: '', platform: '', condition: '', lowStock: false, addedToday: false };
    if (document.getElementById('searchInput')) document.getElementById('searchInput').value = '';
    if (document.getElementById('categoryFilter')) document.getElementById('categoryFilter').value = '';
    if (document.getElementById('subcategoryFilter')) document.getElementById('subcategoryFilter').value = '';
    if (document.getElementById('platformFilter')) document.getElementById('platformFilter').value = '';
    if (document.getElementById('conditionFilter')) document.getElementById('conditionFilter').value = '';
    stockPage = 1;
    renderStockTable();
}

function filterLowStock() {
    clearAllFilters();
    stockFilters.lowStock = true;
    renderStockTable();
}

function filterAddedToday() {
    clearAllFilters();
    stockFilters.addedToday = true;
    renderStockTable();
}

function getFilteredStock() {
    let filtered = [...AppState.stock];
    
    // Always filter out items with 0 quantity
    filtered = filtered.filter(item => item.quantity > 0);
    
    if (stockFilters.search) {
        filtered = filtered.filter(item => 
            item.name?.toLowerCase().includes(stockFilters.search) ||
            item.category?.toLowerCase().includes(stockFilters.search)
        );
    }
    if (stockFilters.category) filtered = filtered.filter(item => item.category === stockFilters.category);
    if (stockFilters.subcategory) filtered = filtered.filter(item => item.subcategory === stockFilters.subcategory);
    if (stockFilters.platform) filtered = filtered.filter(item => item.platform === stockFilters.platform);
    if (stockFilters.condition) filtered = filtered.filter(item => item.condition === stockFilters.condition);
    if (stockFilters.lowStock) filtered = Calculations.getLowStockItems().filter(item => item.quantity > 0);
    if (stockFilters.addedToday) {
        const today = new Date().toDateString();
        filtered = filtered.filter(item => item.dateAdded && new Date(item.dateAdded).toDateString() === today && item.quantity > 0);
    }
    
    return filtered;
}

function renderStockTable() {
    const tbody = document.getElementById('stockTableBody');
    if (!tbody) return;
    
    const filtered = getFilteredStock();
    const totalPages = Math.ceil(filtered.length / stockPerPage);
    const start = (stockPage - 1) * stockPerPage;
    const end = start + stockPerPage;
    const pageItems = filtered.slice(start, end);
    
    if (pageItems.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="text-center py-8 text-gray-500">No stock items found</td></tr>';
    } else {
        tbody.innerHTML = pageItems.map(item => {
            const profit = item.sellingPrice - item.buyingPrice;
            const profitClass = profit >= 0 ? 'profit-positive' : 'profit-negative';
            const qtyClass = item.quantity <= (item.threshold || 5) ? 'text-orange-600 font-semibold' : '';
            return `
                <tr>
                    <td class="font-medium">${item.name || 'N/A'}</td>
                    <td>${item.category || 'N/A'}</td>
                    <td>${item.platform || 'N/A'}</td>
                    <td>${item.condition || 'N/A'}</td>
                    <td class="${qtyClass}">${item.quantity}</td>
                    <td>K ${(item.buyingPrice || 0).toFixed(2)}</td>
                    <td>K ${(item.sellingPrice || 0).toFixed(2)}</td>
                    <td class="${profitClass} font-semibold">K ${profit.toFixed(2)}</td>
                    <td>
                        <div class="flex gap-2">
                            <button onclick="editStock('${item.id}')" class="text-blue-600 hover:text-blue-800" title="Edit">
                                <i data-lucide="edit" class="w-4 h-4"></i>
                            </button>
                            <button onclick="openAdjustModal('${item.id}')" class="text-purple-600 hover:text-purple-800" title="Adjust Qty">
                                <i data-lucide="package" class="w-4 h-4"></i>
                            </button>
                            <button onclick="deleteStock('${item.id}')" class="text-red-600 hover:text-red-800" title="Delete">
                                <i data-lucide="trash-2" class="w-4 h-4"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }
    
    document.getElementById('showingStart').textContent = filtered.length > 0 ? start + 1 : 0;
    document.getElementById('showingEnd').textContent = Math.min(end, filtered.length);
    document.getElementById('totalStockItems').textContent = filtered.length;
    
    renderStockPagination(totalPages);
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function renderStockPagination(totalPages) {
    const container = document.getElementById('pageNumbers');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (!container) return;
    
    container.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.className = `pagination-btn ${i === stockPage ? 'bg-blue-600 text-white' : ''}`;
        btn.textContent = i;
        btn.onclick = () => { stockPage = i; renderStockTable(); };
        container.appendChild(btn);
    }
    
    if (prevBtn) prevBtn.disabled = stockPage === 1;
    if (nextBtn) nextBtn.disabled = stockPage === totalPages || totalPages === 0;
}

function previousPage() {
    if (stockPage > 1) {
        stockPage--;
        renderStockTable();
    }
}

function nextPage() {
    const filtered = getFilteredStock();
    const totalPages = Math.ceil(filtered.length / stockPerPage);
    if (stockPage < totalPages) {
        stockPage++;
        renderStockTable();
    }
}

function openAddStockModal() {
    currentEditingStockId = null;
    document.getElementById('modalTitle').textContent = 'Add New Stock';
    document.getElementById('stockForm').reset();
    document.getElementById('stockId').value = '';
    document.getElementById('netProfitDisplay').textContent = 'K 0';
    openModal('stockModal');
}

function editStock(id) {
    const item = AppState.stock.find(s => s.id === id);
    if (!item) return;
    
    currentEditingStockId = id;
    document.getElementById('modalTitle').textContent = 'Edit Stock';
    document.getElementById('stockId').value = id;
    document.getElementById('productName').value = item.name || '';
    document.getElementById('itemCategory').value = item.category || '';
    document.getElementById('itemPlatform').value = item.platform || '';
    document.getElementById('condition').value = item.condition || '';
    document.getElementById('itemQuantity').value = item.quantity || 0;
    document.getElementById('buyingPrice').value = item.buyingPrice || 0;
    document.getElementById('sellingPrice').value = item.sellingPrice || 0;
    document.getElementById('notes').value = item.notes || '';
    
    calculateNetProfit();
    openModal('stockModal');
}

function openAdjustModal(id) {
    const item = AppState.stock.find(s => s.id === id);
    if (!item) return;
    
    document.getElementById('adjustStockId').value = id;
    document.getElementById('adjustProductName').textContent = item.name;
    document.getElementById('adjustCurrentQty').textContent = item.quantity;
    document.getElementById('adjustQuantity').value = '';
    document.getElementById('adjustReason').value = '';
    openModal('adjustModal');
}

function deleteStock(id) {
    if (confirm('Are you sure you want to delete this item?')) {
        Storage.deleteStockItem(id);
        showSuccess('Stock item deleted');
        renderStockTable();
    }
}

function calculateNetProfit() {
    const buying = parseFloat(document.getElementById('buyingPrice')?.value) || 0;
    const selling = parseFloat(document.getElementById('sellingPrice')?.value) || 0;
    const profit = selling - buying;
    const display = document.getElementById('netProfitDisplay');
    if (display) {
        display.textContent = `K ${profit.toFixed(2)}`;
        display.className = profit >= 0 ? 'text-lg font-bold profit-positive' : 'text-lg font-bold profit-negative';
    }
}

function handleStockSubmit(event) {
    event.preventDefault();
    
    const stockData = {
        name: document.getElementById('productName').value,
        category: document.getElementById('itemCategory').value,
        platform: document.getElementById('itemPlatform').value,
        condition: document.getElementById('condition').value,
        quantity: parseInt(document.getElementById('itemQuantity').value),
        buyingPrice: parseFloat(document.getElementById('buyingPrice').value),
        sellingPrice: parseFloat(document.getElementById('sellingPrice').value),
        notes: document.getElementById('notes').value,
        dateAdded: new Date().toISOString()
    };
    
    if (currentEditingStockId) {
        Storage.updateStockItem(currentEditingStockId, stockData);
        showSuccess('Stock updated successfully');
    } else {
        Storage.addStockItem(stockData);
        showSuccess('Stock added successfully');
    }
    
    closeModal('stockModal');
    renderStockTable();
}

function handleAdjustSubmit(event) {
    event.preventDefault();
    
    const id = document.getElementById('adjustStockId').value;
    const type = document.getElementById('adjustType').value;
    const qty = parseInt(document.getElementById('adjustQuantity').value);
    const item = AppState.stock.find(s => s.id === id);
    
    if (!item) return;
    
    let newQty = item.quantity;
    if (type === 'add') {
        newQty += qty;
    } else {
        newQty -= qty;
        if (newQty < 0) {
            showError('Cannot reduce below 0');
            return;
        }
    }
    
    Storage.updateStockItem(id, { quantity: newQty });
    showSuccess('Quantity adjusted successfully');
    closeModal('adjustModal');
    renderStockTable();
}

// Initialize on DOM load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        Scripts.init();
        const pageTitle = document.body.getAttribute('data-page-title');
        if (pageTitle === 'Dashboard') initDashboard();
        if (pageTitle === 'Sales') initSalesPage();
        if (pageTitle === 'Manage Stock') initStockPage();
        if (pageTitle === 'Expenses') initExpensesPage();
        if (pageTitle === 'Sales History') initSalesHistoryPage();
        if (pageTitle === 'Settings') initSettingsPage();
        if (pageTitle === 'Profile') initProfilePage();
        if (pageTitle === 'Notifications') initNotificationsPage();
        if (pageTitle === 'Cash Overview') initCashPage();
        if (pageTitle === 'Reports') initReportsPage();
    });
} else {
    Scripts.init();
    const pageTitle = document.body.getAttribute('data-page-title');
    if (pageTitle === 'Dashboard') initDashboard();
    if (pageTitle === 'Sales') initSalesPage();
    if (pageTitle === 'Manage Stock') initStockPage();
    if (pageTitle === 'Expenses') initExpensesPage();
    if (pageTitle === 'Sales History') initSalesHistoryPage();
    if (pageTitle === 'Settings') initSettingsPage();
    if (pageTitle === 'Profile') initProfilePage();
    if (pageTitle === 'Notifications') initNotificationsPage();
    if (pageTitle === 'Cash Overview') initCashPage();
    if (pageTitle === 'Reports') initReportsPage();
}


// Expenses Page Functions
let expensesPage = 1;
const expensesPerPage = 10;
let expensesDateFilter = 'all';
let expensesCategoryFilter = '';

function initExpensesPage() {
    updateExpensesStats();
    renderExpensesTable();
    setTodayDate();
    
    AppEvents.on(AppEvents.EVENTS.DATA_CHANGED, () => {
        updateExpensesStats();
        renderExpensesTable();
    });
}

function setTodayDate() {
    const dateInput = document.getElementById('expenseDate');
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
}

function updateExpensesStats() {
    const today = new Date().toDateString();
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    
    const todayExpenses = AppState.expenses.filter(e => new Date(e.date).toDateString() === today)
        .reduce((sum, e) => sum + e.amount, 0);
    
    const monthExpenses = AppState.expenses.filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    }).reduce((sum, e) => sum + e.amount, 0);
    
    const categoryTotals = {};
    AppState.expenses.forEach(e => {
        categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });
    const highestCategory = Object.keys(categoryTotals).reduce((a, b) => 
        categoryTotals[a] > categoryTotals[b] ? a : b, '-');
    
    const daysInMonth = new Date(thisYear, thisMonth + 1, 0).getDate();
    const avgDaily = monthExpenses / daysInMonth;
    
    if (document.getElementById('todayExpenses')) 
        document.getElementById('todayExpenses').textContent = Calculations.formatCurrency(todayExpenses);
    if (document.getElementById('totalMonthExpenses')) 
        document.getElementById('totalMonthExpenses').textContent = Calculations.formatCurrency(monthExpenses);
    if (document.getElementById('highestCategory')) 
        document.getElementById('highestCategory').textContent = highestCategory;
    if (document.getElementById('avgDailyExpense')) 
        document.getElementById('avgDailyExpense').textContent = Calculations.formatCurrency(avgDaily);
}

function filterExpenses() {
    expensesDateFilter = document.getElementById('dateFilter')?.value || 'all';
    expensesCategoryFilter = document.getElementById('categoryFilter')?.value || '';
    expensesPage = 1;
    renderExpensesTable();
}

function filterToday() {
    document.getElementById('dateFilter').value = 'today';
    filterExpenses();
}

function filterThisMonth() {
    document.getElementById('dateFilter').value = 'month';
    filterExpenses();
}

function filterHighestCategory() {
    const categoryTotals = {};
    AppState.expenses.forEach(e => {
        categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });
    const highest = Object.keys(categoryTotals).reduce((a, b) => 
        categoryTotals[a] > categoryTotals[b] ? a : b, '');
    document.getElementById('categoryFilter').value = highest;
    filterExpenses();
}

function getFilteredExpenses() {
    let filtered = [...AppState.expenses];
    const today = new Date();
    
    if (expensesDateFilter === 'today') {
        filtered = filtered.filter(e => new Date(e.date).toDateString() === today.toDateString());
    } else if (expensesDateFilter === 'week') {
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(e => new Date(e.date) >= weekAgo);
    } else if (expensesDateFilter === 'month') {
        filtered = filtered.filter(e => 
            new Date(e.date).getMonth() === today.getMonth() &&
            new Date(e.date).getFullYear() === today.getFullYear()
        );
    }
    
    if (expensesCategoryFilter) {
        filtered = filtered.filter(e => e.category === expensesCategoryFilter);
    }
    
    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
}

function renderExpensesTable() {
    const container = document.getElementById('expensesListContainer');
    if (!container) return;
    
    const filtered = getFilteredExpenses();
    const totalPages = Math.ceil(filtered.length / expensesPerPage);
    const start = (expensesPage - 1) * expensesPerPage;
    const pageItems = filtered.slice(start, start + expensesPerPage);
    
    // Category color mapping
    const categoryColors = {
        'Transport': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-500' },
        'Utilities': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-500' },
        'Repairs': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-500' },
        'Rent': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-500' },
        'Salaries': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-500' },
        'Marketing': { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-500' },
        'Supplies': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-500' },
        'Other': { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-500' }
    };
    
    if (pageItems.length === 0) {
        container.innerHTML = '<div class="p-8 text-center text-gray-500">No expenses found</div>';
    } else {
        container.innerHTML = pageItems.map(expense => {
            const colors = categoryColors[expense.category] || categoryColors['Other'];
            return `
                <div class="bg-white border-l-4 ${colors.border} p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <div class="flex items-start justify-between gap-4">
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2 mb-1.5">
                                <h3 class="font-medium text-gray-900 text-sm">${expense.item}</h3>
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}">${expense.category}</span>
                            </div>
                            <div class="flex items-center gap-3 text-xs text-gray-500">
                                <span class="flex items-center gap-1">
                                    <i data-lucide="calendar" class="w-3 h-3"></i>
                                    ${new Date(expense.date).toLocaleDateString()}
                                </span>
                                ${expense.notes ? `<span class="truncate max-w-xs">• ${expense.notes}</span>` : ''}
                            </div>
                        </div>
                        <div class="flex items-center gap-3 flex-shrink-0">
                            <div class="text-right">
                                <p class="font-semibold text-gray-900 text-base">K ${expense.amount.toFixed(2)}</p>
                            </div>
                            <button onclick="deleteExpense('${expense.id}')" class="text-gray-400 hover:text-red-600 transition-colors p-1.5 hover:bg-red-50 rounded" title="Delete">
                                <i data-lucide="trash-2" class="w-4 h-4"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    document.getElementById('expensesShowingStart').textContent = filtered.length > 0 ? start + 1 : 0;
    document.getElementById('expensesShowingEnd').textContent = Math.min(start + expensesPerPage, filtered.length);
    document.getElementById('totalExpensesItems').textContent = filtered.length;
    
    renderExpensesPagination(totalPages);
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function renderExpensesPagination(totalPages) {
    const container = document.getElementById('expensesPageNumbers');
    const prevBtn = document.getElementById('expensesPrevBtn');
    const nextBtn = document.getElementById('expensesNextBtn');
    
    if (!container) return;
    
    container.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.className = `pagination-btn ${i === expensesPage ? 'bg-blue-600 text-white' : ''}`;
        btn.textContent = i;
        btn.onclick = () => { expensesPage = i; renderExpensesTable(); };
        container.appendChild(btn);
    }
    
    if (prevBtn) prevBtn.disabled = expensesPage === 1;
    if (nextBtn) nextBtn.disabled = expensesPage === totalPages || totalPages === 0;
}

function previousExpensesPage() {
    if (expensesPage > 1) {
        expensesPage--;
        renderExpensesTable();
    }
}

function nextExpensesPage() {
    const filtered = getFilteredExpenses();
    const totalPages = Math.ceil(filtered.length / expensesPerPage);
    if (expensesPage < totalPages) {
        expensesPage++;
        renderExpensesTable();
    }
}

function openExpenseModal() {
    setTodayDate();
    openModal('expenseModal');
}

function deleteExpense(id) {
    if (confirm('Delete this expense?')) {
        const expenses = AppState.expenses.filter(e => e.id !== id);
        Storage.saveExpenses(expenses);
        showSuccess('Expense deleted');
    }
}

// Sales History Page Functions
let salesHistoryPage = 1;
const salesHistoryPerPage = 10;
let salesHistoryDateFilter = 'all';

function initSalesHistoryPage() {
    updateSalesHistoryStats();
    renderSalesHistory();
    
    AppEvents.on(AppEvents.EVENTS.DATA_CHANGED, () => {
        updateSalesHistoryStats();
        renderSalesHistory();
    });
}

function updateSalesHistoryStats() {
    const filtered = getFilteredSalesHistory();
    const totalSales = filtered.reduce((sum, s) => sum + s.totalPrice, 0);
    
    // Calculate profit from sales (selling price - buying price)
    const totalProfit = filtered.reduce((sum, s) => {
        const profit = (s.sellingPrice - s.buyingPrice) * s.quantity;
        return sum + profit;
    }, 0);
    
    const avgSale = filtered.length > 0 ? totalSales / filtered.length : 0;
    
    if (document.getElementById('totalSalesAmount')) 
        document.getElementById('totalSalesAmount').textContent = Calculations.formatCurrency(totalSales);
    
    const profitEl = document.getElementById('totalProfitAmount');
    if (profitEl) {
        profitEl.textContent = Calculations.formatCurrency(totalProfit);
        // Add color indicator for profit/loss
        profitEl.className = totalProfit >= 0 ? 'stat-value profit-positive' : 'stat-value profit-negative';
    }
    
    if (document.getElementById('totalTransactions')) 
        document.getElementById('totalTransactions').textContent = filtered.length;
    if (document.getElementById('avgSaleHistory')) 
        document.getElementById('avgSaleHistory').textContent = Calculations.formatCurrency(avgSale);
}

function filterSalesByDate() {
    salesHistoryDateFilter = document.getElementById('dateFilter')?.value || 'all';
    salesHistoryPage = 1;
    renderSalesHistory();
}

function getFilteredSalesHistory() {
    let filtered = [...AppState.sales];
    const today = new Date();
    
    if (salesHistoryDateFilter === 'today') {
        filtered = filtered.filter(s => new Date(s.date).toDateString() === today.toDateString());
    } else if (salesHistoryDateFilter === 'week') {
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(s => new Date(s.date) >= weekAgo);
    } else if (salesHistoryDateFilter === 'month') {
        filtered = filtered.filter(s => 
            new Date(s.date).getMonth() === today.getMonth() &&
            new Date(s.date).getFullYear() === today.getFullYear()
        );
    }
    
    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
}

function renderSalesHistory() {
    const container = document.getElementById('salesHistoryContainer');
    if (!container) return;
    
    const filtered = getFilteredSalesHistory();
    const totalPages = Math.ceil(filtered.length / salesHistoryPerPage);
    const start = (salesHistoryPage - 1) * salesHistoryPerPage;
    const pageItems = filtered.slice(start, start + salesHistoryPerPage);
    
    if (pageItems.length === 0) {
        container.innerHTML = '<p class="text-center py-8 text-gray-500">No sales found</p>';
    } else {
        container.innerHTML = pageItems.map(sale => {
            const profit = (sale.sellingPrice - sale.buyingPrice) * sale.quantity;
            const profitClass = profit >= 0 ? 'profit-positive' : 'profit-negative';
            return `
                <div class="border border-gray-200 rounded-lg p-4 bg-white">
                    <div class="flex justify-between items-start mb-2">
                        <div>
                            <h3 class="font-semibold text-gray-900">${sale.itemName}</h3>
                            <p class="text-sm text-gray-500">${new Date(sale.date).toLocaleString()}</p>
                        </div>
                        <span class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                            K ${sale.totalPrice.toFixed(2)}
                        </span>
                    </div>
                    <div class="grid grid-cols-2 gap-2 text-sm">
                        <div><span class="text-gray-600">Quantity:</span> <span class="font-medium">${sale.quantity}</span></div>
                        <div><span class="text-gray-600">Payment:</span> <span class="font-medium">${sale.paymentMethod || 'N/A'}</span></div>
                        <div><span class="text-gray-600">Unit Price:</span> <span class="font-medium">K ${sale.sellingPrice.toFixed(2)}</span></div>
                        <div><span class="text-gray-600">Profit:</span> <span class="font-medium ${profitClass}">K ${profit.toFixed(2)}</span></div>
                    </div>
                    ${sale.notes ? `<p class="text-sm text-gray-600 mt-2 italic">${sale.notes}</p>` : ''}
                </div>
            `;
        }).join('');
    }
    
    document.getElementById('salesShowingStart').textContent = filtered.length > 0 ? start + 1 : 0;
    document.getElementById('salesShowingEnd').textContent = Math.min(start + salesHistoryPerPage, filtered.length);
    document.getElementById('totalSalesItems').textContent = filtered.length;
    
    renderSalesHistoryPagination(totalPages);
}

function renderSalesHistoryPagination(totalPages) {
    const container = document.getElementById('salesPageNumbers');
    const prevBtn = document.getElementById('salesPrevBtn');
    const nextBtn = document.getElementById('salesNextBtn');
    
    if (!container) return;
    
    container.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.className = `pagination-btn ${i === salesHistoryPage ? 'bg-blue-600 text-white' : ''}`;
        btn.textContent = i;
        btn.onclick = () => { salesHistoryPage = i; renderSalesHistory(); };
        container.appendChild(btn);
    }
    
    if (prevBtn) prevBtn.disabled = salesHistoryPage === 1;
    if (nextBtn) nextBtn.disabled = salesHistoryPage === totalPages || totalPages === 0;
}

function previousSalesPage() {
    if (salesHistoryPage > 1) {
        salesHistoryPage--;
        renderSalesHistory();
    }
}

function nextSalesPage() {
    const filtered = getFilteredSalesHistory();
    const totalPages = Math.ceil(filtered.length / salesHistoryPerPage);
    if (salesHistoryPage < totalPages) {
        salesHistoryPage++;
        renderSalesHistory();
    }
}

// Settings, Profile, Notifications, Cash, Reports - Complete implementations

// Cash Page Functions
let cashTransactionPage = 1;
const cashTransactionsPerPage = 10;
let cashHistoryFilter = 'all';

function initCashPage() {
    updateCashStats();
    renderCashTransactions();
    
    AppEvents.on(AppEvents.EVENTS.DATA_CHANGED, () => {
        updateCashStats();
        renderCashTransactions();
    });
}

function updateCashStats() {
    // Cash Available = Total sales revenue (all money from sales)
    const cashAvailable = AppState.sales.reduce((sum, s) => sum + s.totalPrice, 0);
    
    // Total Profit = Profit from sales only (selling price - buying price)
    const totalProfit = AppState.sales.reduce((sum, s) => {
        const profit = (s.sellingPrice - s.buyingPrice) * s.quantity;
        return sum + profit;
    }, 0);
    
    // Calculate total expenses
    const totalExpenses = AppState.expenses.reduce((sum, e) => sum + e.amount, 0);
    
    // Spendable Cash = Cash Available - Expenses
    const spendableCash = Math.max(0, cashAvailable - totalExpenses);
    
    // Calculate 7-day trend (sales revenue - expenses)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentSales = AppState.sales
        .filter(s => new Date(s.date) >= sevenDaysAgo)
        .reduce((sum, s) => sum + s.totalPrice, 0);
    
    const recentExpenses = AppState.expenses
        .filter(e => new Date(e.date) >= sevenDaysAgo)
        .reduce((sum, e) => sum + e.amount, 0);
    
    const cashTrend = recentSales - recentExpenses;
    
    if (document.getElementById('cashAvailable')) 
        document.getElementById('cashAvailable').textContent = Calculations.formatCurrency(cashAvailable);
    
    const profitEl = document.getElementById('totalProfit');
    if (profitEl) {
        profitEl.textContent = Calculations.formatCurrency(totalProfit);
        profitEl.className = totalProfit >= 0 ? 'stat-value profit-positive' : 'stat-value profit-negative';
    }
    
    if (document.getElementById('spendableCash')) 
        document.getElementById('spendableCash').textContent = Calculations.formatCurrency(spendableCash);
    
    const trendEl = document.getElementById('cashTrend');
    if (trendEl) {
        trendEl.textContent = Calculations.formatCurrency(cashTrend);
        trendEl.className = cashTrend >= 0 ? 'stat-value profit-positive' : 'stat-value profit-negative';
    }
    
    if (document.getElementById('modalSpendableCash')) 
        document.getElementById('modalSpendableCash').textContent = Calculations.formatCurrency(spendableCash);
    if (document.getElementById('modalCashAvailable')) 
        document.getElementById('modalCashAvailable').textContent = Calculations.formatCurrency(cashAvailable);
}

function renderCashTransactions() {
    const container = document.getElementById('transactionHistory');
    const noTransactions = document.getElementById('noTransactions');
    if (!container) return;
    
    // Get withdrawals and top-ups from expenses
    let transactions = AppState.expenses
        .filter(e => e.category === 'Withdrawal' || e.category === 'Top-up')
        .map(e => ({
            id: e.id,
            type: e.category === 'Withdrawal' ? 'withdraw' : 'topup',
            amount: Math.abs(e.amount),
            reason: e.notes || e.item,
            date: e.date
        }))
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Apply filter
    if (cashHistoryFilter === 'withdraw') {
        transactions = transactions.filter(t => t.type === 'withdraw');
    } else if (cashHistoryFilter === 'topup') {
        transactions = transactions.filter(t => t.type === 'topup');
    }
    
    if (transactions.length === 0) {
        container.classList.add('hidden');
        if (noTransactions) noTransactions.classList.remove('hidden');
        document.getElementById('transactionShowingStart').textContent = '0';
        document.getElementById('transactionShowingEnd').textContent = '0';
        document.getElementById('totalTransactionItems').textContent = '0';
        return;
    }
    
    container.classList.remove('hidden');
    if (noTransactions) noTransactions.classList.add('hidden');
    
    const totalPages = Math.ceil(transactions.length / cashTransactionsPerPage);
    const start = (cashTransactionPage - 1) * cashTransactionsPerPage;
    const pageItems = transactions.slice(start, start + cashTransactionsPerPage);
    
    container.innerHTML = pageItems.map(transaction => `
        <div class="border border-gray-200 rounded-lg p-4 bg-white">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-lg flex items-center justify-center ${
                        transaction.type === 'withdraw' ? 'bg-red-50' : 'bg-green-50'
                    }">
                        <i data-lucide="${transaction.type === 'withdraw' ? 'arrow-down-circle' : 'arrow-up-circle'}" 
                           class="${transaction.type === 'withdraw' ? 'text-red-600' : 'text-green-600'}"></i>
                    </div>
                    <div>
                        <p class="font-medium text-gray-900">${transaction.type === 'withdraw' ? 'Withdrawal' : 'Top-up'}</p>
                        <p class="text-sm text-gray-600">${transaction.reason}</p>
                        <p class="text-xs text-gray-400">${new Date(transaction.date).toLocaleString()}</p>
                    </div>
                </div>
                <span class="font-bold ${transaction.type === 'withdraw' ? 'text-red-600' : 'text-green-600'}">
                    ${transaction.type === 'withdraw' ? '-' : '+'} K ${transaction.amount.toFixed(2)}
                </span>
            </div>
        </div>
    `).join('');
    
    document.getElementById('transactionShowingStart').textContent = transactions.length > 0 ? start + 1 : 0;
    document.getElementById('transactionShowingEnd').textContent = Math.min(start + cashTransactionsPerPage, transactions.length);
    document.getElementById('totalTransactionItems').textContent = transactions.length;
    
    renderCashTransactionPagination(totalPages);
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function renderCashTransactionPagination(totalPages) {
    const container = document.getElementById('transactionPageNumbers');
    const prevBtn = document.getElementById('transactionPrevBtn');
    const nextBtn = document.getElementById('transactionNextBtn');
    
    if (!container) return;
    
    container.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.className = `pagination-btn ${i === cashTransactionPage ? 'bg-blue-600 text-white' : ''}`;
        btn.textContent = i;
        btn.onclick = () => { cashTransactionPage = i; renderCashTransactions(); };
        container.appendChild(btn);
    }
    
    if (prevBtn) prevBtn.disabled = cashTransactionPage === 1;
    if (nextBtn) nextBtn.disabled = cashTransactionPage === totalPages || totalPages === 0;
}

function filterHistory() {
    cashHistoryFilter = document.getElementById('historyFilter')?.value || 'all';
    cashTransactionPage = 1;
    renderCashTransactions();
}

function previousTransactionPage() {
    if (cashTransactionPage > 1) {
        cashTransactionPage--;
        renderCashTransactions();
    }
}

function nextTransactionPage() {
    const transactions = AppState.expenses.filter(e => e.category === 'Withdrawal' || e.category === 'Top-up');
    const totalPages = Math.ceil(transactions.length / cashTransactionsPerPage);
    if (cashTransactionPage < totalPages) {
        cashTransactionPage++;
        renderCashTransactions();
    }
}

function openWithdrawModal() {
    updateCashStats();
    openModal('withdrawModal');
}

function openTopUpModal() {
    updateCashStats();
    openModal('topupModal');
}

function handleWithdraw(event) {
    event.preventDefault();
    const amount = parseFloat(document.getElementById('withdrawAmount').value);
    const password = document.getElementById('withdrawPassword').value;
    const reason = document.getElementById('withdrawReason').value;
    
    if (password !== 'admin123') {
        showError('Incorrect password');
        return;
    }
    
    // Cash Available = Total sales revenue
    const cashAvailable = AppState.sales.reduce((sum, s) => sum + s.totalPrice, 0);
    
    // Total expenses
    const totalExpenses = AppState.expenses.reduce((sum, e) => sum + e.amount, 0);
    
    // Spendable Cash = Cash Available - Expenses
    const spendableCash = Math.max(0, cashAvailable - totalExpenses);
    
    if (amount > spendableCash) {
        showError('Insufficient spendable cash');
        return;
    }
    
    Storage.addExpense({ item: 'Cash Withdrawal', amount: amount, category: 'Withdrawal', notes: reason });
    showSuccess(`Withdrawn K ${amount.toFixed(2)}`);
    closeModal('withdrawModal');
    updateCashStats();
    renderCashTransactions();
}

function handleTopUp(event) {
    event.preventDefault();
    const amount = parseFloat(document.getElementById('topupAmount').value);
    const reason = document.getElementById('topupReason').value;
    
    // Add as negative expense (income)
    Storage.addExpense({ item: 'Cash Top-up', amount: -amount, category: 'Top-up', notes: reason });
    showSuccess(`Added K ${amount.toFixed(2)} to cash`);
    closeModal('topupModal');
    updateCashStats();
    renderCashTransactions();
}

// Reports Page Functions
let reportsPage = 1;
const reportsPerPage = 10;
let reportStartDate = '';
let reportEndDate = '';

function initReportsPage() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    
    if (document.getElementById('startDate')) 
        document.getElementById('startDate').value = firstDay.toISOString().split('T')[0];
    if (document.getElementById('endDate')) 
        document.getElementById('endDate').value = today.toISOString().split('T')[0];
    
    generateReport();
}

function generateReport() {
    reportStartDate = document.getElementById('startDate')?.value || '';
    reportEndDate = document.getElementById('endDate')?.value || '';
    
    const start = reportStartDate ? new Date(reportStartDate) : new Date(0);
    const end = reportEndDate ? new Date(reportEndDate) : new Date();
    end.setHours(23, 59, 59);
    
    const filteredSales = AppState.sales.filter(s => {
        const date = new Date(s.date);
        return date >= start && date <= end;
    });
    
    const filteredExpenses = AppState.expenses.filter(e => {
        const date = new Date(e.date);
        return date >= start && date <= end;
    });
    
    const revenue = filteredSales.reduce((sum, s) => sum + s.totalPrice, 0);
    const expenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    
    // Calculate profit from sales only (selling price - buying price)
    const salesProfit = filteredSales.reduce((sum, s) => {
        const profit = (s.sellingPrice - s.buyingPrice) * s.quantity;
        return sum + profit;
    }, 0);
    
    // Net profit = sales profit - expenses
    const profit = salesProfit - expenses;
    
    if (document.getElementById('reportRevenue')) 
        document.getElementById('reportRevenue').textContent = Calculations.formatCurrency(revenue);
    if (document.getElementById('reportExpenses')) 
        document.getElementById('reportExpenses').textContent = Calculations.formatCurrency(expenses);
    
    const profitEl = document.getElementById('reportProfit');
    if (profitEl) {
        profitEl.textContent = Calculations.formatCurrency(profit);
        // Add color indicator for profit/loss
        profitEl.className = profit >= 0 ? 'stat-value profit-positive' : 'stat-value profit-negative';
    }
    
    if (document.getElementById('reportTransactions')) 
        document.getElementById('reportTransactions').textContent = filteredSales.length;
    
    renderReportTable(filteredSales, filteredExpenses);
}

function renderReportTable(sales, expenses) {
    const tbody = document.getElementById('reportTableBody');
    if (!tbody) return;
    
    const dateMap = {};
    
    sales.forEach(sale => {
        const date = new Date(sale.date).toDateString();
        if (!dateMap[date]) dateMap[date] = { sales: 0, expenses: 0, qty: 0, salesProfit: 0 };
        dateMap[date].sales += sale.totalPrice;
        dateMap[date].qty += sale.quantity;
        // Calculate profit from this sale
        const saleProfit = (sale.sellingPrice - sale.buyingPrice) * sale.quantity;
        dateMap[date].salesProfit += saleProfit;
    });
    
    expenses.forEach(expense => {
        const date = new Date(expense.date).toDateString();
        if (!dateMap[date]) dateMap[date] = { sales: 0, expenses: 0, qty: 0, salesProfit: 0 };
        dateMap[date].expenses += expense.amount;
    });
    
    const rows = Object.entries(dateMap).sort((a, b) => new Date(b[0]) - new Date(a[0]));
    const totalPages = Math.ceil(rows.length / reportsPerPage);
    const start = (reportsPage - 1) * reportsPerPage;
    const pageRows = rows.slice(start, start + reportsPerPage);
    
    if (pageRows.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" class="text-center py-8 text-gray-500">No data for selected period</td></tr>';
    } else {
        tbody.innerHTML = pageRows.map(([date, data]) => {
            const profit = data.salesProfit - data.expenses;
            const profitClass = profit >= 0 ? 'profit-positive' : 'profit-negative';
            return `
                <tr>
                    <td>${new Date(date).toLocaleDateString()}</td>
                    <td>-</td>
                    <td>${data.qty}</td>
                    <td>-</td>
                    <td>K ${data.sales.toFixed(2)}</td>
                    <td>K ${data.salesProfit.toFixed(2)}</td>
                    <td>K ${data.expenses.toFixed(2)}</td>
                    <td>-</td>
                    <td class="${profitClass} font-semibold">K ${profit.toFixed(2)}</td>
                    <td>-</td>
                </tr>
            `;
        }).join('');
    }
    
    document.getElementById('reportShowingStart').textContent = rows.length > 0 ? start + 1 : 0;
    document.getElementById('reportShowingEnd').textContent = Math.min(start + reportsPerPage, rows.length);
    document.getElementById('reportTotalItems').textContent = rows.length;
    
    renderReportPagination(totalPages);
}

function renderReportPagination(totalPages) {
    const container = document.getElementById('reportPageNumbers');
    const prevBtn = document.getElementById('reportPrevBtn');
    const nextBtn = document.getElementById('reportNextBtn');
    
    if (!container) return;
    
    container.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.className = `pagination-btn ${i === reportsPage ? 'bg-blue-600 text-white' : ''}`;
        btn.textContent = i;
        btn.onclick = () => { reportsPage = i; generateReport(); };
        container.appendChild(btn);
    }
    
    if (prevBtn) prevBtn.disabled = reportsPage === 1;
    if (nextBtn) nextBtn.disabled = reportsPage === totalPages || totalPages === 0;
}

function previousReportPage() {
    if (reportsPage > 1) {
        reportsPage--;
        generateReport();
    }
}

function nextReportPage() {
    reportsPage++;
    generateReport();
}

function downloadPDF() {
    if (typeof jspdf === 'undefined' || !jspdf.jsPDF) {
        showWarning('PDF library not loaded. Please refresh the page.');
        return;
    }
    
    try {
        const { jsPDF } = jspdf;
        const doc = new jsPDF();
        
        // Add title
        doc.setFontSize(18);
        doc.text('Console Plug Manager - Report', 14, 20);
        
        // Add date range
        doc.setFontSize(12);
        const startDate = document.getElementById('startDate')?.value || 'N/A';
        const endDate = document.getElementById('endDate')?.value || 'N/A';
        doc.text(`Period: ${startDate} to ${endDate}`, 14, 30);
        
        // Add summary
        doc.setFontSize(14);
        doc.text('Summary', 14, 45);
        doc.setFontSize(10);
        const revenue = document.getElementById('reportRevenue')?.textContent || 'K 0';
        const expenses = document.getElementById('reportExpenses')?.textContent || 'K 0';
        const profit = document.getElementById('reportProfit')?.textContent || 'K 0';
        const transactions = document.getElementById('reportTransactions')?.textContent || '0';
        
        doc.text(`Total Revenue: ${revenue}`, 14, 55);
        doc.text(`Total Expenses: ${expenses}`, 14, 62);
        doc.text(`Net Profit: ${profit}`, 14, 69);
        doc.text(`Total Transactions: ${transactions}`, 14, 76);
        
        // Save the PDF
        doc.save(`console-plug-report-${new Date().toISOString().split('T')[0]}.pdf`);
        showSuccess('PDF downloaded successfully');
    } catch (error) {
        console.error('PDF generation error:', error);
        showError('Failed to generate PDF');
    }
}

// Notifications Page Functions
let notificationsPage = 1;
const notificationsPerPage = 10;
let notificationsFilter = 'all';

function initNotificationsPage() {
    renderNotifications();
    updateNotificationCount();
}

function filterNotifications(filter) {
    notificationsFilter = filter;
    notificationsPage = 1;
    
    document.querySelectorAll('[data-filter]').forEach(btn => {
        btn.classList.remove('filter-btn--active');
        btn.classList.add('filter-btn--inactive');
    });
    document.querySelector(`[data-filter="${filter}"]`)?.classList.add('filter-btn--active');
    document.querySelector(`[data-filter="${filter}"]`)?.classList.remove('filter-btn--inactive');
    
    renderNotifications();
}

function getFilteredNotifications() {
    let filtered = [...AppState.notifications];
    if (notificationsFilter === 'unread') filtered = filtered.filter(n => !n.read);
    if (notificationsFilter === 'warning') filtered = filtered.filter(n => n.type === 'warning');
    if (notificationsFilter === 'success') filtered = filtered.filter(n => n.type === 'success');
    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
}

function renderNotifications() {
    const container = document.getElementById('notificationsList');
    if (!container) return;
    
    const filtered = getFilteredNotifications();
    const totalPages = Math.ceil(filtered.length / notificationsPerPage);
    const start = (notificationsPage - 1) * notificationsPerPage;
    const pageItems = filtered.slice(start, start + notificationsPerPage);
    
    if (pageItems.length === 0) {
        container.innerHTML = '<div class="content-card content-card--md text-center py-8 text-gray-500">No notifications</div>';
    } else {
        // Show ALL notifications in ONE card with pagination at bottom
        container.innerHTML = `
            <div class="content-card content-card--md">
                <div class="divide-y divide-gray-200">
                    ${pageItems.map(notif => `
                        <div class="py-4 first:pt-0 ${notif.read ? 'opacity-60' : ''}">
                            <div class="flex items-start gap-3">
                                <div class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                    notif.type === 'warning' ? 'bg-orange-50' :
                                    notif.type === 'success' ? 'bg-green-50' : 'bg-blue-50'
                                }">
                                    <i data-lucide="${
                                        notif.type === 'warning' ? 'alert-triangle' :
                                        notif.type === 'success' ? 'check-circle' : 'info'
                                    }" class="${
                                        notif.type === 'warning' ? 'text-orange-600' :
                                        notif.type === 'success' ? 'text-green-600' : 'text-blue-600'
                                    }"></i>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <div class="flex items-start justify-between gap-2 mb-1">
                                        <h3 class="font-semibold text-gray-900">${notif.title}</h3>
                                        <div class="flex items-center gap-2 flex-shrink-0">
                                            ${!notif.read ? '<span class="w-2 h-2 bg-blue-600 rounded-full"></span>' : ''}
                                            ${!notif.read ? `<button onclick="markNotificationAsRead(${notif.id})" class="text-xs text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap" title="Mark as read">Mark read</button>` : ''}
                                        </div>
                                    </div>
                                    <p class="text-sm text-gray-600 mb-1">${notif.message}</p>
                                    <p class="text-xs text-gray-400">${new Date(notif.date).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <!-- Pagination inside the same card -->
                <div class="border-t border-gray-200 pt-4 mt-4">
                    <div class="flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div class="text-sm text-gray-700">
                            Showing <span id="notifShowingStart">0</span> to <span id="notifShowingEnd">0</span> of <span id="notifTotalItems">0</span> notifications
                        </div>
                        <div class="flex items-center gap-2">
                            <button onclick="previousNotifPage()" id="notifPrevBtn" class="pagination-btn" ${notificationsPage === 1 ? 'disabled' : ''}>
                                <i data-lucide="chevron-left"></i>
                            </button>
                            <div id="notifPageNumbers" class="flex gap-1">
                                ${Array.from({length: totalPages}, (_, i) => i + 1).map(i => `
                                    <button onclick="notificationsPage = ${i}; renderNotifications();" class="pagination-btn ${i === notificationsPage ? 'bg-blue-600 text-white' : ''}">${i}</button>
                                `).join('')}
                            </div>
                            <button onclick="nextNotifPage()" id="notifNextBtn" class="pagination-btn" ${notificationsPage === totalPages || totalPages === 0 ? 'disabled' : ''}>
                                <i data-lucide="chevron-right"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    document.getElementById('notifShowingStart').textContent = filtered.length > 0 ? start + 1 : 0;
    document.getElementById('notifShowingEnd').textContent = Math.min(start + notificationsPerPage, filtered.length);
    document.getElementById('notifTotalItems').textContent = filtered.length;
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function markNotificationAsRead(notifId) {
    const notif = AppState.notifications.find(n => n.id === notifId);
    if (notif) {
        notif.read = true;
        localStorage.setItem('notifications', JSON.stringify(AppState.notifications));
        renderNotifications();
        updateNotificationCount();
        showSuccess('Notification marked as read');
    }
}

function renderNotificationsPagination(totalPages) {
    // This function is no longer needed as pagination is now inside the card
    // Keeping it for backwards compatibility but it does nothing
}

function previousNotifPage() {
    if (notificationsPage > 1) {
        notificationsPage--;
        renderNotifications();
    }
}

function nextNotifPage() {
    const filtered = getFilteredNotifications();
    const totalPages = Math.ceil(filtered.length / notificationsPerPage);
    if (notificationsPage < totalPages) {
        notificationsPage++;
        renderNotifications();
    }
}

function markAllAsRead() {
    AppState.notifications.forEach(n => n.read = true);
    localStorage.setItem('notifications', JSON.stringify(AppState.notifications));
    showSuccess('All notifications marked as read');
    renderNotifications();
    updateNotificationCount();
}

function updateNotificationCount() {
    // Ensure AppState.notifications exists
    if (!AppState.notifications || !Array.isArray(AppState.notifications)) {
        return;
    }
    
    const unreadCount = AppState.notifications.filter(n => !n.read).length;
    const countEl = document.getElementById('notificationCount');
    if (countEl) {
        countEl.textContent = unreadCount;
        if (unreadCount > 0) {
            countEl.classList.remove('hidden');
        } else {
            countEl.classList.add('hidden');
        }
    }
}

// Settings Page
function initSettingsPage() {
    // Settings page is mostly static forms
}

// Profile Page
function initProfilePage() {
    const email = localStorage.getItem('userEmail') || 'admin@consoleplug.com';
    if (document.getElementById('profileEmail')) document.getElementById('profileEmail').textContent = email;
    if (document.getElementById('profileName')) document.getElementById('profileName').textContent = 'Admin User';
    if (document.getElementById('inputEmail')) document.getElementById('inputEmail').value = email;
    if (document.getElementById('inputName')) document.getElementById('inputName').value = 'Admin User';
    if (document.getElementById('inputPhone')) document.getElementById('inputPhone').value = '';
    if (document.getElementById('inputDob')) document.getElementById('inputDob').value = '';
    if (document.getElementById('inputAddress')) document.getElementById('inputAddress').value = '';
}

function toggleEditMode() {
    const inputs = document.querySelectorAll('#profileForm input');
    const editButtons = document.getElementById('editButtons');
    inputs.forEach(input => {
        input.disabled = !input.disabled;
        input.classList.toggle('input--readonly');
    });
    if (editButtons) editButtons.classList.toggle('hidden');
}

function cancelEdit() {
    toggleEditMode();
}

function handleProfileUpdate(event) {
    event.preventDefault();
    showSuccess('Profile updated successfully');
    toggleEditMode();
}

function saveThresholds(event) {
    event.preventDefault();
    showSuccess('Thresholds saved successfully');
}

function openChangePasswordModal() {
    openModal('changePasswordModal');
}

function handlePasswordChange(event) {
    event.preventDefault();
    const current = document.getElementById('currentPassword').value;
    const newPass = document.getElementById('newPassword').value;
    const confirm = document.getElementById('confirmPassword').value;
    
    if (newPass !== confirm) {
        showError('Passwords do not match');
        return;
    }
    
    showSuccess('Password changed successfully');
    closeModal('changePasswordModal');
}

function open2FAModal() {
    openModal('twoFAModal');
}

function enable2FA() {
    showSuccess('2FA enabled successfully');
    closeModal('twoFAModal');
}

function exportData() {
    const data = {
        stock: AppState.stock,
        sales: AppState.sales,
        expenses: AppState.expenses
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `console-plug-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    showSuccess('Data exported successfully');
}

function clearData() {
    if (confirm('Are you sure? This will delete ALL data permanently!')) {
        if (confirm('This cannot be undone. Continue?')) {
            Storage.clearAllData();
            showSuccess('All data cleared');
        }
    }
}

// Loading State Helpers
function showLoading(message = 'Loading...') {
    const existing = document.getElementById('loadingOverlay');
    if (existing) return;
    
    const overlay = document.createElement('div');
    overlay.id = 'loadingOverlay';
    overlay.className = 'loading-overlay';
    overlay.innerHTML = `
        <div class="loading-overlay__content">
            <div class="spinner spinner--primary spinner--xl loading-overlay__spinner"></div>
            <p class="loading-overlay__text">${message}</p>
        </div>
    `;
    document.body.appendChild(overlay);
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.remove();
    }
}

function setButtonLoading(buttonId, loading = true) {
    const btn = document.getElementById(buttonId);
    if (!btn) return;
    
    if (loading) {
        btn.classList.add('btn-loading');
        btn.disabled = true;
    } else {
        btn.classList.remove('btn-loading');
        btn.disabled = false;
    }
}
