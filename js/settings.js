// Settings functionality

// Load threshold settings on page load
document.addEventListener('DOMContentLoaded', function() {
    loadThresholdSettings();
});

// Load threshold settings from localStorage
function loadThresholdSettings() {
    const thresholds = JSON.parse(localStorage.getItem('stockThresholds')) || {
        console: 2,
        controller: 5,
        powerPack: 10,
        headset: 5,
        hardDrive: 3
    };
    
    document.getElementById('consoleThreshold').value = thresholds.console;
    document.getElementById('controllerThreshold').value = thresholds.controller;
    document.getElementById('powerPackThreshold').value = thresholds.powerPack;
    document.getElementById('headsetThreshold').value = thresholds.headset;
    document.getElementById('hardDriveThreshold').value = thresholds.hardDrive;
}

// Save threshold settings
function saveThresholds(event) {
    event.preventDefault();
    
    const thresholds = {
        console: parseInt(document.getElementById('consoleThreshold').value),
        controller: parseInt(document.getElementById('controllerThreshold').value),
        powerPack: parseInt(document.getElementById('powerPackThreshold').value),
        headset: parseInt(document.getElementById('headsetThreshold').value),
        hardDrive: parseInt(document.getElementById('hardDriveThreshold').value)
    };
    
    localStorage.setItem('stockThresholds', JSON.stringify(thresholds));
    showSuccess('Stock threshold settings saved successfully!');
}

// Export data
function exportData() {
    const data = {
        stockData: stockData,
        salesData: salesData,
        expensesData: expensesData,
        notifications: notifications,
        userProfile: userProfile,
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `console-plug-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showSuccess('Data exported successfully!');
}

// Clear all data
function clearData() {
    if (confirm('Are you sure you want to delete all data? This action cannot be undone!')) {
        if (confirm('This will delete all stock, sales, and reports. Are you absolutely sure?')) {
            localStorage.clear();
            showSuccess('All data has been cleared. Redirecting to login page...');
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 2000);
        }
    }
}

// Change Password Modal Functions
function openChangePasswordModal() {
    document.getElementById('changePasswordModal').classList.remove('hidden');
}

function closeChangePasswordModal() {
    document.getElementById('changePasswordModal').classList.add('hidden');
    // Clear form
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
}

function handlePasswordChange(event) {
    event.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validate passwords match
    if (newPassword !== confirmPassword) {
        showError('New passwords do not match!');
        return;
    }
    
    // Validate password length
    if (newPassword.length < 8) {
        showError('Password must be at least 8 characters long!');
        return;
    }
    
    // In a real app, this would verify the current password and update it
    // For this demo, we'll just show success
    showSuccess('Password changed successfully!');
    closeChangePasswordModal();
}

// Two-Factor Authentication Modal Functions
function open2FAModal() {
    document.getElementById('twoFAModal').classList.remove('hidden');
}

function close2FAModal() {
    document.getElementById('twoFAModal').classList.add('hidden');
}

function enable2FA() {
    // In a real app, this would generate a QR code and setup 2FA
    // For this demo, we'll just show success
    showSuccess('Two-Factor Authentication has been enabled!');
    close2FAModal();
}
