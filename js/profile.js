// Profile functionality
document.addEventListener('DOMContentLoaded', function() {
    loadProfile();
});

// Load profile data
function loadProfile() {
    document.getElementById('profileName').textContent = userProfile.name;
    document.getElementById('profileEmail').textContent = userProfile.email;
    document.getElementById('profileJoinDate').textContent = new Date(userProfile.joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    document.getElementById('inputName').value = userProfile.name;
    document.getElementById('inputEmail').value = userProfile.email;
    document.getElementById('inputPhone').value = userProfile.phone;
    document.getElementById('inputRole').value = userProfile.role;
    document.getElementById('inputDob').value = userProfile.dob || '';
    document.getElementById('inputAddress').value = userProfile.address || '';
    
    // Update avatar display
    updateAvatarDisplay();
}

// Update avatar display
function updateAvatarDisplay() {
    const avatarContainer = document.getElementById('profileAvatar');
    
    if (userProfile.avatar) {
        avatarContainer.innerHTML = `<img src="${userProfile.avatar}" alt="Profile" class="w-full h-full object-cover">`;
    } else {
        const initial = userProfile.name.charAt(0).toUpperCase();
        avatarContainer.innerHTML = `<span class="text-3xl font-bold">${initial}</span>`;
    }
}

// Handle avatar upload
function handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showError('Please select a valid image file');
        return;
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
        showError('Image size should be less than 2MB');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        userProfile.avatar = e.target.result;
        saveUserProfile();
        updateAvatarDisplay();
        updateHeaderProfileAvatar();
        showSuccess('Profile picture updated successfully!');
    };
    reader.readAsDataURL(file);
}

// Toggle edit mode
function toggleEditMode() {
    const inputs = document.querySelectorAll('#profileForm input:not(#inputRole)');
    const editButtons = document.getElementById('editButtons');
    
    inputs.forEach(input => {
        input.disabled = false;
    });
    
    editButtons.classList.remove('hidden');
}

// Cancel edit
function cancelEdit() {
    const inputs = document.querySelectorAll('#profileForm input:not(#inputRole)');
    const editButtons = document.getElementById('editButtons');
    
    inputs.forEach(input => {
        input.disabled = true;
    });
    
    editButtons.classList.add('hidden');
    loadProfile();
}

// Handle profile update
function handleProfileUpdate(event) {
    event.preventDefault();
    
    // Validate required fields
    const name = document.getElementById('inputName').value.trim();
    const email = document.getElementById('inputEmail').value.trim();
    const phone = document.getElementById('inputPhone').value.trim();
    
    if (!name) {
        showError('Full name is required');
        return;
    }
    
    if (!email) {
        showError('Email address is required');
        return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError('Please enter a valid email address');
        return;
    }
    
    if (!phone) {
        showError('Phone number is required');
        return;
    }
    
    // Update profile
    userProfile.name = name;
    userProfile.email = email;
    userProfile.phone = phone;
    userProfile.dob = document.getElementById('inputDob').value;
    userProfile.address = document.getElementById('inputAddress').value;
    
    saveUserProfile();
    
    const inputs = document.querySelectorAll('#profileForm input:not(#inputRole)');
    inputs.forEach(input => {
        input.disabled = true;
    });
    
    document.getElementById('editButtons').classList.add('hidden');
    loadProfile();
    
    showSuccess('Profile updated successfully!');
}

