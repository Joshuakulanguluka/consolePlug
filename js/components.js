// Component loader for sidebar, topbar, and bottom nav
// Optimized to prevent flickering
(function() {
    let componentsLoaded = false;
    
    // Preload components immediately
    const loadComponents = function() {
        if (componentsLoaded) return;
        componentsLoaded = true;
        
        // Use Promise.all for parallel loading
        const sidebarPromise = fetch('../components/sidebar.html').then(r => r.text());
        const topbarPromise = fetch('../components/topbar.html').then(r => r.text());
        const bottomnavPromise = fetch('../components/bottomnav.html').then(r => r.text());
        
        Promise.all([sidebarPromise, topbarPromise, bottomnavPromise])
            .then(([sidebarHTML, topbarHTML, bottomnavHTML]) => {
                // Get all containers first
                const sidebarContainer = document.getElementById('sidebar-container');
                const topbarContainer = document.getElementById('topbar-container');
                const bottomnavContainer = document.getElementById('bottomnav-container');
                
                // Insert all HTML at once to minimize reflows
                if (sidebarContainer) sidebarContainer.innerHTML = sidebarHTML;
                if (topbarContainer) topbarContainer.innerHTML = topbarHTML;
                if (bottomnavContainer) bottomnavContainer.innerHTML = bottomnavHTML;
                
                // Single requestAnimationFrame for all updates
                requestAnimationFrame(() => {
                    // Set active states
                    setActivePage();
                    setActiveBottomNav();
                    setActiveMobileMenu();
                    
                    // Restore sidebar state
                    if (typeof restoreSidebarState === 'function') {
                        restoreSidebarState();
                    }
                    
                    // Update profile and notifications
                    if (typeof updateNotificationCount === 'function') {
                        updateNotificationCount();
                    }
                    if (typeof updateHeaderProfileAvatar === 'function') {
                        updateHeaderProfileAvatar();
                    }
                    
                    // Add body class for mobile
                    if (bottomnavContainer) {
                        document.body.classList.add('has-bottom-nav');
                    }
                    
                    // Mark containers as loaded (triggers fade-in)
                    if (sidebarContainer) sidebarContainer.classList.add('loaded');
                    if (topbarContainer) topbarContainer.classList.add('loaded');
                    if (bottomnavContainer) bottomnavContainer.classList.add('loaded');
                    
                    // Initialize Lucide icons ONCE for all components - AFTER containers are visible
                    requestAnimationFrame(() => {
                        if (typeof lucide !== 'undefined') {
                            lucide.createIcons();
                        }
                    });
                });
            })
            .catch(error => {
                console.error('Error loading components:', error);
                // Show containers even on error to prevent blank page
                ['sidebar-container', 'topbar-container', 'bottomnav-container'].forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.classList.add('loaded');
                });
            });
    };
    
    // Load immediately if DOM is ready, otherwise wait
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadComponents);
    } else {
        loadComponents();
    }
})();

// Function to set active page in sidebar
function setActivePage() {
    // Get current page filename
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
    
    // Get all navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('data-page');
        
        if (linkPage === currentPage) {
            // Set active styles
            link.classList.remove('text-gray-700', 'hover:bg-gray-50');
            link.classList.add('text-blue-600', 'bg-blue-50');
            
            // Make text bold for active page
            const span = link.querySelector('span');
            if (span) {
                span.classList.add('font-medium');
            }
        } else {
            // Set inactive styles
            link.classList.remove('text-blue-600', 'bg-blue-50');
            link.classList.add('text-gray-700', 'hover:bg-gray-50');
            
            // Remove bold for inactive pages
            const span = link.querySelector('span');
            if (span) {
                span.classList.remove('font-medium');
            }
        }
    });
}

// Function to set active page in bottom nav
function setActiveBottomNav() {
    // Get current page filename
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
    
    // Get all bottom nav links
    const bottomNavLinks = document.querySelectorAll('.bottom-nav-link');
    
    bottomNavLinks.forEach(link => {
        const linkPage = link.getAttribute('data-page');
        
        if (linkPage === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Function to set active page in mobile menu
function setActiveMobileMenu() {
    // Get current page filename
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
    
    // Get all mobile menu links
    const mobileMenuLinks = document.querySelectorAll('.mobile-menu-link');
    
    mobileMenuLinks.forEach(link => {
        const linkPage = link.getAttribute('data-page');
        
        if (linkPage === currentPage) {
            // Set active styles
            link.classList.remove('text-gray-700', 'hover:bg-gray-50');
            link.classList.add('text-blue-600', 'bg-blue-50');
            
            // Make text bold for active page
            const span = link.querySelector('span');
            if (span) {
                span.classList.add('font-semibold');
            }
        } else {
            // Set inactive styles
            link.classList.remove('text-blue-600', 'bg-blue-50');
            link.classList.add('text-gray-700', 'hover:bg-gray-50');
            
            // Remove bold for inactive pages
            const span = link.querySelector('span');
            if (span) {
                span.classList.remove('font-semibold');
            }
        }
    });
}
