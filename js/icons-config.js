// Lucide Icons Configuration
// This script configures Lucide icons to appear with bolder strokes for better visibility

document.addEventListener('DOMContentLoaded', function() {
    // Configure Lucide with custom attributes
    if (typeof lucide !== 'undefined') {
        // Override the default createIcons to add stroke-width
        const originalCreateIcons = lucide.createIcons;
        lucide.createIcons = function(options) {
            originalCreateIcons({
                ...options,
                attrs: {
                    'stroke-width': 2.5,
                    ...(options?.attrs || {})
                }
            });
        };
        
        // Initial icon creation with bold stroke
        lucide.createIcons({
            attrs: {
                'stroke-width': 2.5
            }
        });
    }
});

// Helper function to reinitialize icons with bold stroke
function reinitializeLucideIcons() {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons({
            attrs: {
                'stroke-width': 2.5
            }
        });
    }
}
