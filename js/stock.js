// Stock management functionality - Simplified for Console & Accessories
let currentPage = 1;
let itemsPerPage = 10;
let currentSort = { field: null, direction: 'asc' };
let filteredStockData = [];

document.addEventListener('DOMContentLoaded', function() {
    updateStockStats();
    
    // Sort stock by date added (newest first)
    stockData.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
    
    filteredStockData = [...stockData];
    loadStockTable();
    
    // Initialize subcategory filter
    handleCategoryFilterChange();
});

// Update stock statistics
function updateStockStats() {
    const today = new Date().toISOString().split('T')[0];
    
    // Total items
    document.getElementById('totalItems').textContent = stockData.reduce((sum, item) => sum + item.quantity, 0);
    
    // Total value
    document.getElementById('totalValue').textContent = formatCurrency(getTotalStockValue());
    
    // Low stock count
    document.getElementById('lowStock').textContent = getLowStockCount();
    
    // Stock added today
    const addedToday = stockData.filter(item => item.dateAdded === today).length;
    document.getElementById('addedToday').textContent = addedToday;
}

// Load stock table with pagination
function loadStockTable(filteredData = null) {
    const data = filteredData || filteredStockData;
    const tbody = document.getElementById('stockTableBody');
    
    // Calculate pagination
    const totalItems = data.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const paginatedData = data.slice(startIndex, endIndex);
    
    // Update pagination info
    document.getElementById('showingStart').textContent = totalItems > 0 ? startIndex + 1 : 0;
    document.getElementById('showingEnd').textContent = endIndex;
    document.getElementById('totalStockItems').textContent = totalItems;
    
    // Render table rows
    if (paginatedData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" class="px-6 py-8 text-center text-gray-500">No items found</td></tr>';
        updatePaginationButtons(0, 0);
        return;
    }
    
    tbody.innerHTML = paginatedData.map(item => {
        const isLowStock = item.quantity <= item.lowStockThreshold;
        
        // Determine status
        let status = 'Active';
        let statusClass = 'bg-green-100 text-green-700';
        
        if (item.quantity === 0) {
            status = 'Inactive';
            statusClass = 'bg-gray-100 text-gray-700';
        } else if (isLowStock) {
            status = 'Low Stock';
            statusClass = 'bg-orange-100 text-orange-700';
        }
        
        // Condition display
        const conditionDisplay = item.condition 
            ? `<span class="px-3 py-1 text-xs font-medium rounded-full ${item.condition === 'New' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}">${item.condition}</span>` 
            : '<span class="text-sm text-gray-400">-</span>';
        
        return `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4">
                    <div class="flex items-center">
                        <div class="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                            <i data-lucide="${getCategoryIcon(item.category)}" class="text-blue-600" style="width: 20px; height: 20px;"></i>
                        </div>
                        <div class="ml-3">
                            <p class="font-medium text-gray-900">${item.productName}</p>
                            <p class="text-xs text-gray-500">${item.platform}</p>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <span class="px-3 py-1 text-xs font-medium rounded-full ${getCategoryColor(item.category)}">
                        ${item.category}
                    </span>
                </td>
                <td class="px-6 py-4">
                    <span class="text-sm text-gray-900">${item.platform}</span>
                </td>
                <td class="px-6 py-4">
                    ${conditionDisplay}
                </td>
                <td class="px-6 py-4">
                    <span class="font-medium text-gray-900">${item.quantity}</span>
                </td>
                <td class="px-6 py-4 text-gray-900">${formatCurrency(item.buyingPrice)}</td>
                <td class="px-6 py-4 text-gray-900">${formatCurrency(item.sellingPrice)}</td>
                <td class="px-6 py-4">
                    <span class="text-sm text-gray-900">${item.serialNumber || '-'}</span>
                </td>
                <td class="px-6 py-4">
                    <span class="px-3 py-1 text-xs font-medium rounded-full ${statusClass}">
                        ${status}
                    </span>
                </td>
                <td class="px-6 py-4">
                    <div class="flex gap-2">
                        <button onclick="editStock(${item.id})" class="text-blue-600 hover:text-blue-800" title="Edit">
                            <i data-lucide="pencil" style="width: 16px; height: 16px;"></i>
                        </button>
                        <button onclick="openAdjustModal(${item.id})" class="text-green-600 hover:text-green-800" title="Adjust Quantity">
                            <i data-lucide="plus-minus" style="width: 16px; height: 16px;"></i>
                        </button>
                        <button onclick="deleteStock(${item.id})" class="text-red-600 hover:text-red-800" title="Delete">
                            <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    updatePaginationButtons(currentPage, totalPages);
}

// Get category color
function getCategoryColor(category) {
    const colors = {
        'Console': 'bg-purple-100 text-purple-700',
        'Accessory': 'bg-green-100 text-green-700'
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
}

// Get icon based on category
function getCategoryIcon(category) {
    const icons = {
        'Console': 'gamepad-2',
        'Accessories': 'package'
    };
    return icons[category] || 'package';
}

// Open add stock modal
function openAddStockModal() {
    document.getElementById('modalTitle').textContent = 'Add New Stock';
    document.getElementById('stockForm').reset();
    document.getElementById('stockId').value = '';
    document.getElementById('productName').value = '';
    
    // Hide console fields by default
    document.getElementById('consoleFields').classList.add('hidden');
    document.getElementById('serialNumber').removeAttribute('required');
    
    document.getElementById('stockModal').classList.remove('hidden');
}

// Handle category change
function handleCategoryChange() {
    const category = document.getElementById('itemCategory').value;
    const subcategoryField = document.getElementById('subcategoryField');
    const subcategorySelect = document.getElementById('itemSubcategory');
    const platformSelect = document.getElementById('itemPlatform');
    const modelSelect = document.getElementById('itemModel');
    const consoleFields = document.getElementById('consoleFields');
    const serialNumber = document.getElementById('serialNumber');
    
    // Reset fields
    subcategorySelect.innerHTML = '<option value="">Select Type</option>';
    subcategorySelect.removeAttribute('required');
    platformSelect.innerHTML = '<option value="">Select Platform</option>';
    platformSelect.disabled = true;
    modelSelect.innerHTML = '<option value="">Select Model</option>';
    modelSelect.disabled = true;
    
    if (category === 'Console') {
        // Show console fields
        consoleFields.classList.remove('hidden');
        serialNumber.setAttribute('required', 'required');
        
        // Hide subcategory for consoles
        subcategoryField.classList.add('hidden');
        
        // Enable platform selection
        platformSelect.disabled = false;
        const platforms = ['Xbox', 'PlayStation', 'Other'];
        platforms.forEach(platform => {
            const option = document.createElement('option');
            option.value = platform;
            option.textContent = platform;
            platformSelect.appendChild(option);
        });
    } else if (category === 'Accessory') {
        // Hide console fields
        consoleFields.classList.add('hidden');
        serialNumber.removeAttribute('required');
        serialNumber.value = '';
        
        // Show and populate subcategory for accessories
        subcategoryField.classList.remove('hidden');
        subcategorySelect.setAttribute('required', 'required');
        
        const accessoryTypes = ['Controller', 'Power Pack', 'Headset', 'Hard Drive'];
        accessoryTypes.forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            subcategorySelect.appendChild(option);
        });
        
        // Enable platform selection
        platformSelect.disabled = false;
        const platforms = ['Xbox', 'PlayStation', 'Other'];
        platforms.forEach(platform => {
            const option = document.createElement('option');
            option.value = platform;
            option.textContent = platform;
            platformSelect.appendChild(option);
        });
    } else {
        // No category selected
        consoleFields.classList.add('hidden');
        serialNumber.removeAttribute('required');
        serialNumber.value = '';
        subcategoryField.classList.add('hidden');
    }
}

// Handle platform change
function handlePlatformChange() {
    const category = document.getElementById('itemCategory').value;
    const platform = document.getElementById('itemPlatform').value;
    const modelSelect = document.getElementById('itemModel');
    
    modelSelect.innerHTML = '<option value="">Select Model</option>';
    modelSelect.disabled = true;
    
    if (!platform) return;
    
    let models = [];
    
    if (category === 'Console') {
        const consoleModels = {
            'PlayStation': ['PS3', 'PS4', 'PS4 Pro', 'PS5'],
            'Xbox': ['Xbox 360', 'One', 'One X', 'Series S', 'Series X'],
            'Other': ['Switch', 'Switch Lite', 'Switch OLED']
        };
        models = consoleModels[platform] || [];
    } else if (category === 'Accessory') {
        const subcategory = document.getElementById('itemSubcategory').value;
        
        if (subcategory === 'Controller') {
            const controllerModels = {
                'PlayStation': ['DualShock 3', 'DualShock 4', 'DualSense', 'DualSense Edge'],
                'Xbox': ['Wireless Controller', 'Elite Controller', 'Elite Controller Series 2'],
                'Other': ['Joy-Con Pair', 'Pro Controller']
            };
            models = controllerModels[platform] || [];
        } else if (subcategory === 'Power Pack') {
            const powerPackModels = {
                'PlayStation': ['Charging Station', 'Portable Charger', 'Battery Pack'],
                'Xbox': ['Play & Charge Kit', 'Rechargeable Battery', 'Charging Station'],
                'Other': ['Portable Charger', 'USB-C Charger', 'Power Bank']
            };
            models = powerPackModels[platform] || [];
        } else if (subcategory === 'Headset') {
            models = ['Wireless Headset', 'Wired Headset', 'Gaming Headset Pro'];
        } else if (subcategory === 'Hard Drive') {
            models = ['500GB', '1TB', '2TB', '4TB'];
        }
    }
    
    if (models.length > 0) {
        modelSelect.disabled = false;
        models.forEach(model => {
            const option = document.createElement('option');
            option.value = model;
            option.textContent = model;
            modelSelect.appendChild(option);
        });
    }
}

// Update product name (auto-generate)
function updateProductName() {
    const category = document.getElementById('itemCategory').value;
    const platform = document.getElementById('itemPlatform').value;
    const model = document.getElementById('itemModel').value;
    const subcategory = document.getElementById('itemSubcategory').value;
    
    let productName = '';
    
    if (category && platform && model) {
        if (category === 'Console') {
            productName = `${platform} ${model} Console`;
        } else if (category === 'Accessory' && subcategory) {
            productName = `${platform} ${model} ${subcategory}`;
        }
    }
    
    document.getElementById('productName').value = productName;
}

// Handle category filter change (for filtering table)
function handleCategoryFilterChange() {
    const category = document.getElementById('categoryFilter').value;
    const subcategoryFilter = document.getElementById('subcategoryFilter');
    
    // Reset subcategory filter
    subcategoryFilter.innerHTML = '<option value="">All Types</option>';
    
    if (category === 'Console') {
        // For consoles, subcategory is platform
        const platforms = ['Xbox', 'PlayStation', 'Other'];
        platforms.forEach(platform => {
            const option = document.createElement('option');
            option.value = platform;
            option.textContent = platform;
            subcategoryFilter.appendChild(option);
        });
    } else if (category === 'Accessory') {
        // For accessories, subcategory is product type
        const types = ['Controller', 'Power Pack', 'Headset', 'Hard Drive'];
        types.forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            subcategoryFilter.appendChild(option);
        });
    }
    
    // Trigger filter
    filterStock();
}

// Close stock modal
function closeStockModal() {
    document.getElementById('stockModal').classList.add('hidden');
}

// Handle stock form submission
function handleStockSubmit(event) {
    event.preventDefault();
    
    const stockId = document.getElementById('stockId').value;
    const category = document.getElementById('itemCategory').value;
    const platform = document.getElementById('itemPlatform').value;
    const model = document.getElementById('itemModel').value;
    const productName = document.getElementById('productName').value.trim();
    const condition = document.getElementById('condition').value;
    const quantity = parseInt(document.getElementById('itemQuantity').value);
    const buyingPrice = parseFloat(document.getElementById('buyingPrice').value);
    const sellingPrice = parseFloat(document.getElementById('sellingPrice').value);
    const supplier = document.getElementById('supplier').value.trim();
    const notes = document.getElementById('notes').value.trim();
    
    // Validation: Selling price must be >= Buying price
    if (sellingPrice < buyingPrice) {
        showError('Selling price must be greater than or equal to buying price!');
        return;
    }
    
    // Get threshold settings from localStorage
    const thresholdSettings = JSON.parse(localStorage.getItem('stockThresholds')) || {
        console: 2,
        controller: 5,
        powerPack: 10,
        headset: 5,
        hardDrive: 3
    };
    
    // Determine low stock threshold based on category/subcategory
    let lowStockThreshold = 5; // default
    if (category === 'Console') {
        lowStockThreshold = thresholdSettings.console;
    } else if (category === 'Accessory') {
        const subcategory = document.getElementById('itemSubcategory').value;
        if (subcategory === 'Controller') {
            lowStockThreshold = thresholdSettings.controller;
        } else if (subcategory === 'Power Pack') {
            lowStockThreshold = thresholdSettings.powerPack;
        } else if (subcategory === 'Headset') {
            lowStockThreshold = thresholdSettings.headset;
        } else if (subcategory === 'Hard Drive') {
            lowStockThreshold = thresholdSettings.hardDrive;
        }
    }
    
    // Build stock item
    const stockItem = {
        id: stockId ? parseInt(stockId) : getNextId(stockData),
        category: category,
        platform: platform,
        model: model,
        productName: productName,
        condition: condition,
        quantity: quantity,
        buyingPrice: buyingPrice,
        sellingPrice: sellingPrice,
        lowStockThreshold: lowStockThreshold,
        dateAdded: new Date().toISOString().split('T')[0], // Automatically set to today
        supplier: supplier,
        notes: notes
    };
    
    // Add subcategory for accessories
    if (category === 'Accessory') {
        const subcategory = document.getElementById('itemSubcategory').value;
        if (!subcategory) {
            showError('Please select a product type for accessories!');
            return;
        }
        stockItem.subcategory = subcategory;
    }
    
    // Add serial number for consoles
    if (category === 'Console') {
        const serialNumber = document.getElementById('serialNumber').value.trim();
        
        if (!serialNumber) {
            showError('Serial number is required for consoles!');
            return;
        }
        
        // Check for duplicate serial numbers
        const duplicate = stockData.find(item => 
            item.serialNumber === serialNumber && 
            item.id !== stockItem.id
        );
        
        if (duplicate) {
            showError('Serial number already exists! Each console must have a unique serial number.');
            return;
        }
        
        stockItem.serialNumber = serialNumber;
    }
    
    if (stockId) {
        // Update existing stock - preserve original date
        const existingItem = stockData.find(item => item.id === parseInt(stockId));
        if (existingItem) {
            stockItem.dateAdded = existingItem.dateAdded; // Keep original date when editing
        }
        const index = stockData.findIndex(item => item.id === parseInt(stockId));
        stockData[index] = stockItem;
        showSuccess('Stock updated successfully!');
    } else {
        // Add new stock - use today's date
        stockData.push(stockItem);
        showSuccess('Stock added successfully!');
    }
    
    saveStockData();
    updateStockStats();
    
    // Re-sort and filter
    stockData.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
    filteredStockData = [...stockData];
    loadStockTable();
    
    closeStockModal();
}

// Edit stock
function editStock(id) {
    const item = stockData.find(stock => stock.id === id);
    if (!item) return;
    
    document.getElementById('modalTitle').textContent = 'Edit Stock';
    document.getElementById('stockId').value = item.id;
    
    // Set category
    document.getElementById('itemCategory').value = item.category;
    handleCategoryChange();
    
    // Set subcategory for accessories
    if (item.category === 'Accessory' && item.subcategory) {
        document.getElementById('itemSubcategory').value = item.subcategory;
        handlePlatformChange(); // This will populate models based on subcategory
    }
    
    // Set platform
    document.getElementById('itemPlatform').value = item.platform;
    handlePlatformChange();
    
    // Set model
    document.getElementById('itemModel').value = item.model;
    updateProductName();
    
    // Set other fields
    document.getElementById('condition').value = item.condition || '';
    document.getElementById('itemQuantity').value = item.quantity;
    document.getElementById('buyingPrice').value = item.buyingPrice;
    document.getElementById('sellingPrice').value = item.sellingPrice;
    document.getElementById('supplier').value = item.supplier || '';
    document.getElementById('notes').value = item.notes || '';
    
    // Set serial number for consoles
    if (item.category === 'Console' && item.serialNumber) {
        document.getElementById('serialNumber').value = item.serialNumber;
    }
    
    document.getElementById('stockModal').classList.remove('hidden');
}

// Delete stock
function deleteStock(id) {
    if (confirm('Are you sure you want to delete this stock item?')) {
        stockData = stockData.filter(item => item.id !== id);
        filteredStockData = filteredStockData.filter(item => item.id !== id);
        saveStockData();
        updateStockStats();
        loadStockTable();
        showSuccess('Stock deleted successfully!');
    }
}

// Sort table
function sortTable(field) {
    if (currentSort.field === field) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.field = field;
        currentSort.direction = 'asc';
    }
    
    filteredStockData.sort((a, b) => {
        let aVal = a[field];
        let bVal = b[field];
        
        // String comparison
        if (typeof aVal === 'string') {
            aVal = aVal.toLowerCase();
            bVal = bVal.toLowerCase();
        }
        
        if (currentSort.direction === 'asc') {
            return aVal > bVal ? 1 : -1;
        } else {
            return aVal < bVal ? 1 : -1;
        }
    });
    
    currentPage = 1;
    loadStockTable();
}

// Filter stock with all filters
function filterStock() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    const subcategoryFilter = document.getElementById('subcategoryFilter').value;
    const platformFilter = document.getElementById('platformFilter').value;
    const conditionFilter = document.getElementById('conditionFilter').value;
    
    filteredStockData = stockData.filter(item => {
        // Search filter - searches in product name, platform, model, serial number
        const matchesSearch = !searchTerm || 
                            item.productName.toLowerCase().includes(searchTerm) || 
                            item.platform.toLowerCase().includes(searchTerm) ||
                            (item.model && item.model.toLowerCase().includes(searchTerm)) ||
                            (item.serialNumber && item.serialNumber.toLowerCase().includes(searchTerm));
        
        // Category filter
        const matchesCategory = !categoryFilter || item.category === categoryFilter;
        
        // Subcategory filter (dynamic based on category)
        let matchesSubcategory = true;
        if (subcategoryFilter) {
            if (categoryFilter === 'Console') {
                // For consoles, subcategory is platform
                matchesSubcategory = item.platform === subcategoryFilter;
            } else if (categoryFilter === 'Accessories') {
                // For accessories, subcategory is product type
                matchesSubcategory = item.subcategory === subcategoryFilter;
            }
        }
        
        // Platform filter
        const matchesPlatform = !platformFilter || item.platform === platformFilter;
        
        // Condition filter
        const matchesCondition = !conditionFilter || item.condition === conditionFilter;
        
        return matchesSearch && matchesCategory && matchesSubcategory && matchesPlatform && matchesCondition;
    });
    
    currentPage = 1;
    loadStockTable();
}

// Change items per page
function changeItemsPerPage() {
    itemsPerPage = parseInt(document.getElementById('itemsPerPage').value);
    currentPage = 1;
    loadStockTable();
}

// Pagination functions
function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        loadStockTable();
    }
}

function nextPage() {
    const totalPages = Math.ceil(filteredStockData.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        loadStockTable();
    }
}

function goToPage(page) {
    currentPage = page;
    loadStockTable();
}

function updatePaginationButtons(current, total) {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const pageNumbers = document.getElementById('pageNumbers');
    
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
                onclick="goToPage(${i})" 
                class="px-3 py-1 border rounded-lg text-sm ${i === current ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 hover:bg-gray-50 text-gray-700'}"
            >
                ${i}
            </button>
        `;
    }
    
    pageNumbers.innerHTML = pages;
}

// Open adjust quantity modal
function openAdjustModal(id) {
    const item = stockData.find(stock => stock.id === id);
    if (!item) return;
    
    document.getElementById('adjustStockId').value = item.id;
    document.getElementById('adjustProductName').textContent = item.productName;
    document.getElementById('adjustCurrentQty').textContent = item.quantity;
    document.getElementById('adjustType').value = 'add';
    document.getElementById('adjustQuantity').value = '';
    document.getElementById('adjustReason').value = '';
    
    document.getElementById('adjustModal').classList.remove('hidden');
}

// Close adjust quantity modal
function closeAdjustModal() {
    document.getElementById('adjustModal').classList.add('hidden');
}

// Handle adjust quantity submission
function handleAdjustSubmit(event) {
    event.preventDefault();
    
    const stockId = parseInt(document.getElementById('adjustStockId').value);
    const adjustType = document.getElementById('adjustType').value;
    const adjustQty = parseInt(document.getElementById('adjustQuantity').value);
    const reason = document.getElementById('adjustReason').value.trim();
    
    const item = stockData.find(stock => stock.id === stockId);
    if (!item) {
        showError('Item not found!');
        return;
    }
    
    const oldQuantity = item.quantity;
    
    if (adjustType === 'add') {
        item.quantity += adjustQty;
        showSuccess(`Added ${adjustQty} units. New quantity: ${item.quantity}`);
    } else {
        if (adjustQty > item.quantity) {
            showError(`Cannot remove ${adjustQty} units. Only ${item.quantity} available.`);
            return;
        }
        item.quantity -= adjustQty;
        showSuccess(`Removed ${adjustQty} units. New quantity: ${item.quantity}`);
    }
    
    saveStockData();
    updateStockStats();
    filteredStockData = [...stockData];
    loadStockTable();
    closeAdjustModal();
}


// Clear all filters and show all stock
function clearAllFilters() {
    // Reset all filter inputs
    document.getElementById('searchInput').value = '';
    document.getElementById('categoryFilter').value = '';
    document.getElementById('subcategoryFilter').value = '';
    document.getElementById('platformFilter').value = '';
    document.getElementById('conditionFilter').value = '';
    
    // Reset subcategory options
    document.getElementById('subcategoryFilter').innerHTML = '<option value="">All Types</option>';
    
    // Apply filter (which will show all items)
    filterStock();
    
    // Scroll to table
    document.querySelector('.bg-white.rounded-xl.border').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Filter to show only low stock items
function filterLowStock() {
    // Clear other filters
    document.getElementById('searchInput').value = '';
    document.getElementById('categoryFilter').value = '';
    document.getElementById('subcategoryFilter').value = '';
    document.getElementById('platformFilter').value = '';
    document.getElementById('conditionFilter').value = '';
    
    // Reset subcategory options
    document.getElementById('subcategoryFilter').innerHTML = '<option value="">All Types</option>';
    
    // Filter by low stock
    filteredStockData = stockData.filter(item => item.quantity <= item.lowStockThreshold);
    
    currentPage = 1;
    loadStockTable();
    
    // Scroll to table
    document.querySelector('.bg-white.rounded-xl.border').scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    // Show toast
    const lowStockCount = getLowStockCount();
    if (lowStockCount > 0) {
        showInfo(`Showing ${lowStockCount} low stock item${lowStockCount > 1 ? 's' : ''}`);
    } else {
        showSuccess('No low stock items found!');
    }
}

// Filter to show items added today
function filterAddedToday() {
    const today = new Date().toISOString().split('T')[0];
    
    // Clear other filters
    document.getElementById('searchInput').value = '';
    document.getElementById('categoryFilter').value = '';
    document.getElementById('subcategoryFilter').value = '';
    document.getElementById('platformFilter').value = '';
    document.getElementById('conditionFilter').value = '';
    
    // Reset subcategory options
    document.getElementById('subcategoryFilter').innerHTML = '<option value="">All Types</option>';
    
    // Filter by today's date
    filteredStockData = stockData.filter(item => item.dateAdded === today);
    
    currentPage = 1;
    loadStockTable();
    
    // Scroll to table
    document.querySelector('.bg-white.rounded-xl.border').scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    // Show toast
    const addedTodayCount = filteredStockData.length;
    if (addedTodayCount > 0) {
        showInfo(`Showing ${addedTodayCount} item${addedTodayCount > 1 ? 's' : ''} added today`);
    } else {
        showInfo('No items added today');
    }
}
