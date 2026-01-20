// Sales functionality
let currentSalesPage = 1;
let salesPerPage = 10;
let currentFilteredSales = [];

document.addEventListener('DOMContentLoaded', function() {
    // Sort sales by date and time (newest first)
    salesData.sort((a, b) => {
        const dateTimeA = new Date(a.date + ' ' + a.time);
        const dateTimeB = new Date(b.date + ' ' + b.time);
        return dateTimeB - dateTimeA; // Newest first
    });
    
    // Check if we're on sales.html or sales-history.html
    const pageTitle = document.body.getAttribute('data-page-title');
    
    if (pageTitle === 'Sales') {
        // Sales page - show only today's sales
        const today = new Date().toISOString().split('T')[0];
        currentFilteredSales = salesData.filter(sale => sale.date === today);
    } else {
        // Sales History page - show all sales
        currentFilteredSales = [...salesData];
    }
    
    updateSalesStats();
    loadSalesHistory();
});

// Filter sales by date range
function filterSalesByDate() {
    const filter = document.getElementById('dateFilter').value;
    const now = new Date();
    let filteredSales = [...salesData];
    
    if (filter === 'today') {
        const today = now.toISOString().split('T')[0];
        filteredSales = salesData.filter(sale => sale.date === today);
    } else if (filter === 'week') {
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        filteredSales = salesData.filter(sale => {
            const saleDate = new Date(sale.date);
            return saleDate >= weekAgo && saleDate <= now;
        });
    } else if (filter === 'month') {
        const monthAgo = new Date(now);
        monthAgo.setMonth(now.getMonth() - 1);
        filteredSales = salesData.filter(sale => {
            const saleDate = new Date(sale.date);
            return saleDate >= monthAgo && saleDate <= now;
        });
    }
    
    currentFilteredSales = filteredSales;
    currentSalesPage = 1;
    loadSalesHistory(filteredSales);
    updateSalesStats(filteredSales);
}

// Handle category change - populate platforms
function handleSaleCategoryChange() {
    const category = document.getElementById('saleCategory').value;
    const platformSelect = document.getElementById('salePlatform');
    const itemSelect = document.getElementById('saleItem');
    
    // Reset dependent dropdowns
    platformSelect.value = '';
    itemSelect.innerHTML = '<option value="">Select Product</option>';
    
    // Reset form fields
    document.getElementById('saleQuantity').value = '';
    document.getElementById('salePrice').value = '';
    document.getElementById('availableQty').textContent = '0';
    document.getElementById('defaultPrice').textContent = 'K 0';
    document.getElementById('serialNumberField').classList.add('hidden');
    document.getElementById('saleSerialNumber').value = '';
    document.getElementById('saleSerialNumber').removeAttribute('required');
    
    calculateSale();
}

// Handle platform change - populate products
function handleSalePlatformChange() {
    const category = document.getElementById('saleCategory').value;
    const platform = document.getElementById('salePlatform').value;
    const itemSelect = document.getElementById('saleItem');
    
    itemSelect.innerHTML = '<option value="">Select Product</option>';
    
    // Reset form fields
    document.getElementById('saleQuantity').value = '';
    document.getElementById('salePrice').value = '';
    document.getElementById('availableQty').textContent = '0';
    document.getElementById('defaultPrice').textContent = 'K 0';
    document.getElementById('serialNumberField').classList.add('hidden');
    document.getElementById('saleSerialNumber').value = '';
    
    if (!category || !platform) return;
    
    // Get available items
    const availableItems = stockData.filter(item => 
        item.category === category && 
        item.platform === platform && 
        item.quantity > 0
    );
    
    if (availableItems.length === 0) {
        const option = document.createElement('option');
        option.value = "";
        option.textContent = "No stock available";
        itemSelect.appendChild(option);
        return;
    }
    
    availableItems.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = `${item.productName} (${item.quantity} available)`;
        itemSelect.appendChild(option);
    });
    
    calculateSale();
}
// Update sale details when item is selected
function updateSaleDetails() {
    const itemId = parseInt(document.getElementById('saleItem').value);
    if (!itemId) {
        document.getElementById('availableQty').textContent = '0';
        document.getElementById('defaultPrice').textContent = 'K 0';
        document.getElementById('serialNumberField').classList.add('hidden');
        document.getElementById('saleSerialNumber').value = '';
        document.getElementById('saleSerialNumber').removeAttribute('required');
        return;
    }
    
    const item = stockData.find(s => s.id === itemId);
    if (item) {
        // Update available quantity
        document.getElementById('availableQty').textContent = item.quantity;
        
        // Update default price
        document.getElementById('defaultPrice').textContent = formatCurrency(item.sellingPrice);
        document.getElementById('salePrice').value = item.sellingPrice;
        
        // Set max quantity
        document.getElementById('saleQuantity').max = item.quantity;
        document.getElementById('saleQuantity').value = '1';
        
        // Show serial number for consoles
        if (item.category === 'Console' && item.serialNumber) {
            document.getElementById('serialNumberField').classList.remove('hidden');
            document.getElementById('saleSerialNumber').value = item.serialNumber;
            document.getElementById('saleSerialNumber').setAttribute('required', 'required');
        } else {
            document.getElementById('serialNumberField').classList.add('hidden');
            document.getElementById('saleSerialNumber').value = '';
            document.getElementById('saleSerialNumber').removeAttribute('required');
        }
        
        calculateSale();
    }
}

// Calculate sale amounts
function calculateSale() {
    const itemId = parseInt(document.getElementById('saleItem').value);
    const quantity = parseInt(document.getElementById('saleQuantity').value) || 0;
    const sellingPrice = parseFloat(document.getElementById('salePrice').value) || 0;
    
    if (!itemId || quantity === 0) {
        document.getElementById('displayTotalAmount').textContent = 'K 0';
        document.getElementById('displayNetProfit').textContent = 'K 0';
        return;
    }
    
    const item = stockData.find(s => s.id === itemId);
    if (!item) return;
    
    const totalAmount = sellingPrice * quantity;
    const netProfit = (sellingPrice - item.buyingPrice) * quantity;
    
    document.getElementById('displayTotalAmount').textContent = formatCurrency(totalAmount);
    document.getElementById('displayNetProfit').textContent = formatCurrency(netProfit);
}

// Handle sale submission
function handleSaleSubmit(event) {
    event.preventDefault();
    
    const itemId = parseInt(document.getElementById('saleItem').value);
    const quantity = parseInt(document.getElementById('saleQuantity').value);
    const sellingPrice = parseFloat(document.getElementById('salePrice').value);
    const paymentMethod = document.getElementById('paymentMethod').value;
    const notes = document.getElementById('saleNotes').value.trim();
    
    const item = stockData.find(s => s.id === itemId);
    if (!item) {
        showError('Item not found!');
        return;
    }
    
    if (quantity > item.quantity) {
        showError(`Insufficient stock! Available: ${item.quantity}`);
        return;
    }
    
    // Create sale record
    const now = new Date();
    const sale = {
        id: getNextId(salesData),
        stockId: itemId,
        stockName: item.productName,
        category: item.category,
        platform: item.platform,
        serialNumber: item.category === 'Console' ? item.serialNumber : null,
        quantity: quantity,
        buyingPrice: item.buyingPrice,
        sellingPrice: sellingPrice,
        totalAmount: sellingPrice * quantity,
        profit: (sellingPrice - item.buyingPrice) * quantity,
        paymentMethod: paymentMethod,
        notes: notes,
        date: now.toISOString().split('T')[0],
        time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
    
    // Update stock quantity
    item.quantity -= quantity;
    
    // Save data
    salesData.unshift(sale);
    
    // Re-sort to maintain newest first order
    salesData.sort((a, b) => {
        const dateTimeA = new Date(a.date + ' ' + a.time);
        const dateTimeB = new Date(b.date + ' ' + b.time);
        return dateTimeB - dateTimeA; // Newest first
    });
    
    saveSalesData();
    saveStockData();
    
    // Reset form
    document.getElementById('salesForm').reset();
    document.getElementById('availableQty').textContent = '0';
    document.getElementById('defaultPrice').textContent = 'K 0';
    document.getElementById('serialNumberField').classList.add('hidden');
    document.getElementById('saleSerialNumber').value = '';
    
    // Reload
    currentFilteredSales = [...salesData];
    currentSalesPage = 1;
    loadSalesHistory();
    updateSalesStats();
    
    showSuccess(`Sale recorded successfully! Total: ${formatCurrency(sale.totalAmount)}`);
}

// Sales pagination and sorting - REMOVED (showing all sales)

// Update sales statistics
function updateSalesStats(salesList = salesData) {
    const totalSales = salesList.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalProfit = salesList.reduce((sum, sale) => sum + sale.profit, 0);
    
    document.getElementById('totalSalesAmount').textContent = formatCurrency(totalSales);
    document.getElementById('totalProfitAmount').textContent = formatCurrency(totalProfit);
    document.getElementById('totalTransactions').textContent = salesList.length;
}

// Load sales history - show all sales without pagination
function loadSalesHistory(salesList = currentFilteredSales) {
    const tbody = document.getElementById('salesTableBody');
    const pageTitle = document.body.getAttribute('data-page-title');
    const isSalesPage = pageTitle === 'Sales';
    
    // Calculate pagination
    const totalItems = salesList.length;
    const totalPages = Math.ceil(totalItems / salesPerPage);
    const startIndex = (currentSalesPage - 1) * salesPerPage;
    const endIndex = Math.min(startIndex + salesPerPage, totalItems);
    const paginatedSales = salesList.slice(startIndex, endIndex);
    
    // Update pagination info (only if elements exist)
    const showingStart = document.getElementById('salesShowingStart');
    const showingEnd = document.getElementById('salesShowingEnd');
    const totalItems El = document.getElementById('totalSalesItems');
    
    if (showingStart) showingStart.textContent = totalItems > 0 ? startIndex + 1 : 0;
    if (showingEnd) showingEnd.textContent = endIndex;
    if (totalItemsEl) totalItemsEl.textContent = totalItems;
    
    const colspan = isSalesPage ? 8 : 9; // Different column counts
    
    if (paginatedSales.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${colspan}" class="px-4 py-8 text-center text-gray-500">No sales recorded yet</td></tr>`;
        updateSalesPaginationButtons(0, 0);
        return;
    }
    
    tbody.innerHTML = paginatedSales.map(sale => {
        // Get serial number - show "-" for accessories or if not available
        const serialNumber = sale.serialNumber || '-';
        
        // Get payment method - show "-" if not available (for old records)
        const paymentMethod = sale.paymentMethod || '-';
        
        if (isSalesPage) {
            // Sales page - simplified columns (no Date, no Buying Price)
            return `
            <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 text-sm text-gray-900">${sale.time}</td>
                <td class="px-4 py-3 text-sm text-gray-900">${sale.stockName}</td>
                <td class="px-4 py-3 text-sm text-gray-600">${serialNumber}</td>
                <td class="px-4 py-3 text-sm text-gray-900">${sale.quantity}</td>
                <td class="px-4 py-3 text-sm text-gray-900">${formatCurrency(sale.sellingPrice)}</td>
                <td class="px-4 py-3 text-sm font-medium text-gray-900">${formatCurrency(sale.totalAmount)}</td>
                <td class="px-4 py-3 text-sm font-medium text-green-600">${formatCurrency(sale.profit)}</td>
                <td class="px-4 py-3 text-sm text-gray-900">${paymentMethod}</td>
            </tr>
            `;
        } else {
            // Sales History page - full columns
            return `
            <tr class="hover:bg-gray-50">
                <td class="px-4 py-3">
                    <div>
                        <p class="text-sm font-medium text-gray-900">${sale.date}</p>
                        <p class="text-xs text-gray-500">${sale.time}</p>
                    </div>
                </td>
                <td class="px-4 py-3 text-sm text-gray-900">${sale.stockName}</td>
                <td class="px-4 py-3 text-sm text-gray-600">${serialNumber}</td>
                <td class="px-4 py-3 text-sm text-gray-900">${sale.quantity}</td>
                <td class="px-4 py-3 text-sm text-gray-900">${formatCurrency(sale.sellingPrice)}</td>
                <td class="px-4 py-3 text-sm font-medium text-gray-900">${formatCurrency(sale.totalAmount)}</td>
                <td class="px-4 py-3 text-sm text-gray-600">${formatCurrency(sale.buyingPrice)}</td>
                <td class="px-4 py-3 text-sm font-medium text-green-600">${formatCurrency(sale.profit)}</td>
                <td class="px-4 py-3 text-sm text-gray-900">${paymentMethod}</td>
            </tr>
            `;
        }
    }).join('');
    
    updateSalesPaginationButtons(currentSalesPage, totalPages);
}

// Pagination functions for sales
function previousSalesPage() {
    if (currentSalesPage > 1) {
        currentSalesPage--;
        loadSalesHistory(currentFilteredSales);
    }
}

function nextSalesPage() {
    const totalPages = Math.ceil(currentFilteredSales.length / salesPerPage);
    if (currentSalesPage < totalPages) {
        currentSalesPage++;
        loadSalesHistory(currentFilteredSales);
    }
}

function goToSalesPage(page) {
    currentSalesPage = page;
    loadSalesHistory(currentFilteredSales);
}

function updateSalesPaginationButtons(current, total) {
    const prevBtn = document.getElementById('salesPrevBtn');
    const nextBtn = document.getElementById('salesNextBtn');
    const pageNumbers = document.getElementById('salesPageNumbers');
    
    // Handle edge case when no data
    if (total === 0) {
        prevBtn.disabled = true;
        nextBtn.disabled = true;
        pageNumbers.innerHTML = '';
        return;
    }
    
    // Update button states
    prevBtn.disabled = current <= 1;
    nextBtn.disabled = current >= total;
    
    // Generate page numbers
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
                onclick="goToSalesPage(${i})" 
                class="px-3 py-1 border rounded-lg text-sm ${i === current ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 hover:bg-gray-50 text-gray-700'}"
            >
                ${i}
            </button>
        `;
    }
    
    pageNumbers.innerHTML = pages;
}
