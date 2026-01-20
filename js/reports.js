// Reports functionality
document.addEventListener('DOMContentLoaded', function() {
    // Set default dates
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    document.getElementById('startDate').value = weekAgo.toISOString().split('T')[0];
    document.getElementById('endDate').value = today.toISOString().split('T')[0];
    
    generateReport();
});

// Generate report based on filters
function generateReport() {
    const startDate = new Date(document.getElementById('startDate').value);
    const endDate = new Date(document.getElementById('endDate').value);
    
    // Filter sales data by date range
    const filteredSales = salesData.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate >= startDate && saleDate <= endDate;
    });
    
    // Filter expenses by date range
    const filteredExpenses = expensesData.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= startDate && expenseDate <= endDate;
    });
    
    // Calculate summary
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const netProfit = filteredSales.reduce((sum, sale) => sum + sale.profit, 0) - totalExpenses;
    
    // Update summary cards
    document.getElementById('reportRevenue').textContent = formatCurrency(totalRevenue);
    document.getElementById('reportExpenses').textContent = formatCurrency(totalExpenses);
    document.getElementById('reportProfit').textContent = formatCurrency(netProfit);
    document.getElementById('reportTransactions').textContent = filteredSales.length;
    
    // Generate report table
    generateReportTable(filteredSales, filteredExpenses, startDate, endDate);
}

// Download report as PDF
function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('l', 'mm', 'a4'); // Landscape orientation
    
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const revenue = document.getElementById('reportRevenue').textContent;
    const expenses = document.getElementById('reportExpenses').textContent;
    const profit = document.getElementById('reportProfit').textContent;
    const transactions = document.getElementById('reportTransactions').textContent;
    
    // Header
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('Console Plug Manager', 148, 15, { align: 'center' });
    
    doc.setFontSize(16);
    doc.text('Sales Report', 148, 23, { align: 'center' });
    
    // Date range
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text(`Report Period: ${startDate} to ${endDate}`, 148, 30, { align: 'center' });
    
    // Summary boxes
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    
    // Revenue box
    doc.setFillColor(59, 130, 246);
    doc.rect(14, 36, 65, 18, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text('Total Revenue', 46.5, 43, { align: 'center' });
    doc.setFontSize(14);
    doc.text(revenue, 46.5, 50, { align: 'center' });
    
    // Expenses box
    doc.setFillColor(239, 68, 68);
    doc.rect(84, 36, 65, 18, 'F');
    doc.text('Total Expenses', 116.5, 43, { align: 'center' });
    doc.setFontSize(14);
    doc.text(expenses, 116.5, 50, { align: 'center' });
    
    // Profit box
    doc.setFillColor(34, 197, 94);
    doc.rect(154, 36, 65, 18, 'F');
    doc.text('Net Profit', 186.5, 43, { align: 'center' });
    doc.setFontSize(14);
    doc.text(profit, 186.5, 50, { align: 'center' });
    
    // Transactions box
    doc.setFillColor(168, 85, 247);
    doc.rect(224, 36, 58, 18, 'F');
    doc.setFontSize(10);
    doc.text('Transactions', 253, 43, { align: 'center' });
    doc.setFontSize(14);
    doc.text(transactions, 253, 50, { align: 'center' });
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    
    // Get table data
    const tbody = document.getElementById('reportTableBody');
    const rows = [];
    
    tbody.querySelectorAll('tr').forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length > 0) {
            rows.push([
                cells[0].textContent.trim(), // Date
                cells[1].textContent.trim(), // Opening Balance
                cells[2].textContent.trim(), // Qty Sold
                cells[3].textContent.trim(), // Buying Price
                cells[4].textContent.trim(), // Sales Amount
                cells[5].textContent.trim(), // Expense Item
                cells[6].textContent.trim(), // Expense Amount
                cells[7].textContent.trim(), // New Stock
                cells[8].textContent.trim(), // Net Profit
                cells[9].textContent.trim()  // Difference
            ]);
        }
    });
    
    // Add table
    doc.autoTable({
        startY: 60,
        head: [[
            'Date', 
            'Opening Balance', 
            'Qty Sold', 
            'Buying Price', 
            'Sales Amount', 
            'Expense Item', 
            'Expense Amt', 
            'New Stock', 
            'Net Profit', 
            'Difference'
        ]],
        body: rows,
        theme: 'grid',
        styles: { 
            fontSize: 8,
            cellPadding: 2,
            overflow: 'linebreak',
            halign: 'left'
        },
        headStyles: { 
            fillColor: [59, 130, 246],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'center'
        },
        columnStyles: {
            0: { cellWidth: 22 },  // Date
            1: { cellWidth: 25, halign: 'right' },  // Opening Balance
            2: { cellWidth: 18, halign: 'center' }, // Qty Sold
            3: { cellWidth: 25, halign: 'right' },  // Buying Price
            4: { cellWidth: 25, halign: 'right' },  // Sales Amount
            5: { cellWidth: 30 },  // Expense Item
            6: { cellWidth: 25, halign: 'right' },  // Expense Amount
            7: { cellWidth: 30 },  // New Stock
            8: { cellWidth: 25, halign: 'right' },  // Net Profit
            9: { cellWidth: 25, halign: 'right' }   // Difference
        },
        alternateRowStyles: {
            fillColor: [245, 247, 250]
        },
        margin: { top: 60, left: 14, right: 14 }
    });
    
    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont(undefined, 'normal');
        doc.text(
            `Page ${i} of ${pageCount}`,
            148,
            doc.internal.pageSize.height - 10,
            { align: 'center' }
        );
        doc.text(
            `Generated on: ${new Date().toLocaleString()}`,
            14,
            doc.internal.pageSize.height - 10
        );
        doc.text(
            'Console Plug Manager',
            doc.internal.pageSize.width - 14,
            doc.internal.pageSize.height - 10,
            { align: 'right' }
        );
    }
    
    // Save PDF
    const filename = `console-plug-report-${startDate}-to-${endDate}.pdf`;
    doc.save(filename);
    
    // Show success message
    showSuccess(`Report downloaded successfully! Filename: ${filename}`);
}


// Reports pagination and sorting
let reportCurrentPage = 1;
let reportItemsPerPage = 10;
let reportCurrentSort = { field: null, direction: 'asc' };
let reportData = [];

// Generate detailed report table with pagination
function generateReportTable(sales, expenses, startDate, endDate) {
    const tbody = document.getElementById('reportTableBody');
    
    // Group data by date
    const dateMap = {};
    
    // Add sales to date map
    sales.forEach(sale => {
        if (!dateMap[sale.date]) {
            dateMap[sale.date] = {
                date: sale.date,
                sales: [],
                expenses: [],
                newStock: []
            };
        }
        dateMap[sale.date].sales.push(sale);
    });
    
    // Add expenses to date map
    expenses.forEach(expense => {
        if (!dateMap[expense.date]) {
            dateMap[expense.date] = {
                date: expense.date,
                sales: [],
                expenses: [],
                newStock: []
            };
        }
        dateMap[expense.date].expenses.push(expense);
    });
    
    // Add new stock to date map
    stockData.forEach(stock => {
        const stockDate = stock.dateAdded;
        const addedDate = new Date(stockDate);
        if (addedDate >= startDate && addedDate <= endDate) {
            if (!dateMap[stockDate]) {
                dateMap[stockDate] = {
                    date: stockDate,
                    sales: [],
                    expenses: [],
                    newStock: []
                };
            }
            dateMap[stockDate].newStock.push(stock);
        }
    });
    
    // Sort dates
    const sortedDates = Object.keys(dateMap).sort((a, b) => new Date(b) - new Date(a));
    
    let openingBalance = getTotalStockValue();
    
    // Build report data array
    reportData = sortedDates.map(date => {
        const data = dateMap[date];
        
        const totalQuantitySold = data.sales.reduce((sum, sale) => sum + sale.quantity, 0);
        const totalBuyingPrice = data.sales.reduce((sum, sale) => sum + (sale.buyingPrice * sale.quantity), 0);
        const totalSalesAmount = data.sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        const totalExpenseAmount = data.expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const expenseItems = data.expenses.map(e => e.item).join(', ') || '-';
        const newStockValue = data.newStock.reduce((sum, stock) => sum + (stock.quantity * stock.buyingPrice), 0);
        const newStockItems = data.newStock.map(s => s.name).join(', ') || '-';
        const dailyProfit = data.sales.reduce((sum, sale) => sum + sale.profit, 0) - totalExpenseAmount;
        const difference = totalSalesAmount - totalBuyingPrice - totalExpenseAmount + newStockValue;
        
        const row = {
            date: date,
            openingBalance: openingBalance,
            quantitySold: totalQuantitySold,
            buyingPrice: totalBuyingPrice,
            salesAmount: totalSalesAmount,
            expenseItems: expenseItems,
            expenseAmount: totalExpenseAmount,
            newStockItems: newStockItems,
            netProfit: dailyProfit,
            difference: difference
        };
        
        const closingBalance = openingBalance + newStockValue - totalBuyingPrice + totalSalesAmount - totalExpenseAmount;
        openingBalance = closingBalance;
        
        return row;
    });
    
    renderReportTable();
}

function renderReportTable() {
    const tbody = document.getElementById('reportTableBody');
    
    if (reportData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" class="px-4 py-8 text-center text-gray-500">No data available for selected period</td></tr>';
        updateReportPagination(0, 0);
        return;
    }
    
    // Calculate pagination
    const totalItems = reportData.length;
    const totalPages = Math.ceil(totalItems / reportItemsPerPage);
    const startIndex = (reportCurrentPage - 1) * reportItemsPerPage;
    const endIndex = Math.min(startIndex + reportItemsPerPage, totalItems);
    const paginatedData = reportData.slice(startIndex, endIndex);
    
    // Update pagination info
    document.getElementById('reportShowingStart').textContent = totalItems > 0 ? startIndex + 1 : 0;
    document.getElementById('reportShowingEnd').textContent = endIndex;
    document.getElementById('reportTotalItems').textContent = totalItems;
    
    tbody.innerHTML = paginatedData.map(row => `
        <tr class="hover:bg-gray-50">
            <td class="px-4 py-3 text-sm text-gray-900">${row.date}</td>
            <td class="px-4 py-3 text-sm text-gray-900">${formatCurrency(row.openingBalance)}</td>
            <td class="px-4 py-3 text-sm text-gray-900">${row.quantitySold}</td>
            <td class="px-4 py-3 text-sm text-gray-900">${formatCurrency(row.buyingPrice)}</td>
            <td class="px-4 py-3 text-sm font-medium text-green-600">${formatCurrency(row.salesAmount)}</td>
            <td class="px-4 py-3 text-sm text-gray-700">${row.expenseItems}</td>
            <td class="px-4 py-3 text-sm text-red-600">${formatCurrency(row.expenseAmount)}</td>
            <td class="px-4 py-3 text-sm text-gray-700">${row.newStockItems}</td>
            <td class="px-4 py-3 text-sm font-medium ${row.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}">${formatCurrency(row.netProfit)}</td>
            <td class="px-4 py-3 text-sm font-medium ${row.difference >= 0 ? 'text-green-600' : 'text-red-600'}">${formatCurrency(row.difference)}</td>
        </tr>
    `).join('');
    
    updateReportPagination(reportCurrentPage, totalPages);
}

// Sort report
function sortReport(field) {
    if (reportCurrentSort.field === field) {
        reportCurrentSort.direction = reportCurrentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        reportCurrentSort.field = field;
        reportCurrentSort.direction = 'asc';
    }
    
    reportData.sort((a, b) => {
        let aVal = a[field];
        let bVal = b[field];
        
        if (typeof aVal === 'string') {
            aVal = aVal.toLowerCase();
            bVal = bVal.toLowerCase();
        }
        
        if (reportCurrentSort.direction === 'asc') {
            return aVal > bVal ? 1 : -1;
        } else {
            return aVal < bVal ? 1 : -1;
        }
    });
    
    reportCurrentPage = 1;
    renderReportTable();
}

// Change items per page
function changeReportItemsPerPage() {
    reportItemsPerPage = parseInt(document.getElementById('reportItemsPerPage').value);
    reportCurrentPage = 1;
    renderReportTable();
}

// Pagination functions
function previousReportPage() {
    if (reportCurrentPage > 1) {
        reportCurrentPage--;
        renderReportTable();
    }
}

function nextReportPage() {
    const totalPages = Math.ceil(reportData.length / reportItemsPerPage);
    if (reportCurrentPage < totalPages) {
        reportCurrentPage++;
        renderReportTable();
    }
}

function goToReportPage(page) {
    reportCurrentPage = page;
    renderReportTable();
}

function updateReportPagination(current, total) {
    const prevBtn = document.getElementById('reportPrevBtn');
    const nextBtn = document.getElementById('reportNextBtn');
    const pageNumbers = document.getElementById('reportPageNumbers');
    
    // Handle edge case when no data
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
                onclick="goToReportPage(${i})" 
                class="px-3 py-1 border rounded-lg text-sm ${i === current ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 hover:bg-gray-50 text-gray-700'}"
            >
                ${i}
            </button>
        `;
    }
    
    pageNumbers.innerHTML = pages;
}
