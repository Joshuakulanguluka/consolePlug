// Notifications functionality
let notifCurrentPage = 1;
let notifItemsPerPage = 5;
let filteredNotifications = [];
let currentNotificationId = null;
let currentFilter = 'all'; // Track current filter

document.addEventListener('DOMContentLoaded', function() {
    // Sort notifications by date and time (newest first)
    notifications.sort((a, b) => {
        const dateA = new Date(a.date + ' ' + a.time);
        const dateB = new Date(b.date + ' ' + b.time);
        return dateB - dateA;
    });
    
    filteredNotifications = [...notifications];
    updateNotificationCount(); // Update badge count
    loadNotifications();
});

// Load notifications with pagination
function loadNotifications(filter = 'all') {
    const container = document.getElementById('notificationsList');
    
    let filtered = notifications;
    
    if (filter === 'unread') {
        filtered = notifications.filter(n => !n.read);
    } else if (filter !== 'all') {
        filtered = notifications.filter(n => n.type === filter);
    }
    
    filteredNotifications = filtered;
    
    // Calculate pagination
    const totalItems = filteredNotifications.length;
    const totalPages = Math.ceil(totalItems / notifItemsPerPage);
    const startIndex = (notifCurrentPage - 1) * notifItemsPerPage;
    const endIndex = Math.min(startIndex + notifItemsPerPage, totalItems);
    const paginatedData = filteredNotifications.slice(startIndex, endIndex);
    
    // Update pagination info
    document.getElementById('notifShowingStart').textContent = totalItems > 0 ? startIndex + 1 : 0;
    document.getElementById('notifShowingEnd').textContent = endIndex;
    document.getElementById('notifTotalItems').textContent = totalItems;
    
    if (paginatedData.length === 0) {
        container.innerHTML = `
            <div class="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <i data-lucide="bell-off" class="text-gray-300 mx-auto mb-4" style="width: 48px; height: 48px;"></i>
                <p class="text-gray-500">No notifications found</p>
            </div>
        `;
        updateNotifPagination(0, 0);
        return;
    }
    
    container.innerHTML = paginatedData.map(notification => {
        const iconName = getNotificationIcon(notification.type);
        const iconColor = getNotificationIconColor(notification.type);
        const bgClass = getNotificationBg(notification.type);
        
        return `
            <div onclick="openNotificationModal(${notification.id})" class="bg-white rounded-xl border border-gray-200 p-4 md:p-6 hover:shadow-sm transition cursor-pointer ${notification.read ? 'opacity-75' : ''}">
                <div class="flex items-start gap-4">
                    <div class="w-12 h-12 ${bgClass} rounded-lg flex items-center justify-center flex-shrink-0">
                        <i data-lucide="${iconName}" class="${iconColor}" style="width: 24px; height: 24px;"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-start justify-between mb-2 gap-2">
                            <h3 class="font-medium text-gray-900">${notification.title}</h3>
                            ${!notification.read ? '<span class="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></span>' : ''}
                        </div>
                        <p class="text-gray-600 text-sm mb-3 line-clamp-2">${notification.message}</p>
                        <div class="flex items-center justify-between">
                            <span class="text-xs text-gray-500">${notification.date} at ${notification.time}</span>
                            <button onclick="event.stopPropagation(); markAsRead(${notification.id})" class="text-xs text-blue-600 hover:text-blue-700">
                                ${notification.read ? 'Mark as unread' : 'Mark as read'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    updateNotifPagination(notifCurrentPage, totalPages);
}

// Get notification icon
function getNotificationIcon(type) {
    const icons = {
        'warning': 'alert-triangle',
        'success': 'check-circle',
        'info': 'info',
        'error': 'x-circle'
    };
    return icons[type] || icons['info'];
}

// Get notification icon color
function getNotificationIconColor(type) {
    const colors = {
        'warning': 'text-orange-600',
        'success': 'text-green-600',
        'info': 'text-blue-600',
        'error': 'text-red-600'
    };
    return colors[type] || colors['info'];
}

// Get notification background
function getNotificationBg(type) {
    const backgrounds = {
        'warning': 'bg-orange-50',
        'success': 'bg-green-50',
        'info': 'bg-blue-50',
        'error': 'bg-red-50'
    };
    return backgrounds[type] || backgrounds['info'];
}

// Mark notification as read
function markAsRead(id) {
    const notification = notifications.find(n => n.id === id);
    if (notification) {
        notification.read = !notification.read;
        saveNotifications();
        updateNotificationCount();
        loadNotifications(currentFilter);
    }
}

// Mark all as read
function markAllAsRead() {
    const unreadCount = notifications.filter(n => !n.read).length;
    
    if (unreadCount === 0) {
        showInfo('All notifications are already marked as read!');
        return;
    }
    
    notifications.forEach(n => n.read = true);
    saveNotifications();
    updateNotificationCount();
    loadNotifications(currentFilter);
    
    showSuccess(`${unreadCount} notification${unreadCount > 1 ? 's' : ''} marked as read!`);
}

// Filter notifications
function filterNotifications(filter) {
    currentFilter = filter; // Save current filter
    notifCurrentPage = 1;
    
    // Update filter button styles
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        const btnFilter = btn.getAttribute('data-filter');
        if (btnFilter === filter) {
            btn.classList.remove('text-gray-600', 'hover:bg-gray-100');
            btn.classList.add('bg-blue-50', 'text-blue-600', 'font-medium');
        } else {
            btn.classList.remove('bg-blue-50', 'text-blue-600', 'font-medium');
            btn.classList.add('text-gray-600', 'hover:bg-gray-100');
        }
    });
    
    loadNotifications(filter);
}


// Open notification modal
function openNotificationModal(id) {
    const notification = notifications.find(n => n.id === id);
    if (!notification) return;
    
    currentNotificationId = id;
    
    document.getElementById('modalNotifTitle').textContent = notification.title;
    document.getElementById('modalNotifMessage').textContent = notification.message;
    document.getElementById('modalNotifDate').textContent = notification.date;
    document.getElementById('modalNotifTime').textContent = notification.time;
    
    const iconName = getNotificationIcon(notification.type);
    const iconColor = getNotificationIconColor(notification.type);
    const bgClass = getNotificationBg(notification.type);
    const iconContainer = document.getElementById('modalNotifIcon');
    iconContainer.className = `w-12 h-12 ${bgClass} rounded-lg flex items-center justify-center`;
    iconContainer.innerHTML = `<i data-lucide="${iconName}" class="${iconColor}" style="width: 24px; height: 24px;"></i>`;
    
    const markReadBtn = document.getElementById('modalMarkReadBtn');
    markReadBtn.textContent = notification.read ? 'Mark as Unread' : 'Mark as Read';
    
    document.getElementById('notificationModal').classList.remove('hidden');
}

// Close notification modal
function closeNotificationModal() {
    document.getElementById('notificationModal').classList.add('hidden');
    currentNotificationId = null;
}

// Mark notification as read from modal
function markModalNotifAsRead() {
    if (currentNotificationId) {
        markAsRead(currentNotificationId);
        closeNotificationModal();
    }
}

// Pagination functions
function previousNotifPage() {
    if (notifCurrentPage > 1) {
        notifCurrentPage--;
        loadNotifications();
    }
}

function nextNotifPage() {
    const totalPages = Math.ceil(filteredNotifications.length / notifItemsPerPage);
    if (notifCurrentPage < totalPages) {
        notifCurrentPage++;
        loadNotifications();
    }
}

function goToNotifPage(page) {
    notifCurrentPage = page;
    loadNotifications();
}

function updateNotifPagination(current, total) {
    const prevBtn = document.getElementById('notifPrevBtn');
    const nextBtn = document.getElementById('notifNextBtn');
    const pageNumbers = document.getElementById('notifPageNumbers');
    
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
                onclick="goToNotifPage(${i})" 
                class="px-3 py-1 border rounded-lg text-sm ${i === current ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 hover:bg-gray-50 text-gray-700'}"
            >
                ${i}
            </button>
        `;
    }
    
    pageNumbers.innerHTML = pages;
}
