// Main Application Entry Point and Coordination

// Global state variables
window.currentMapData = null;
window.currentMapId = null;

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 System Mapper initializing...');
    
    try {
        // Load maps from API
        await loadMaps();
        
        // Initialize parent node container structure
        initializeParentNodeContainer();
        
        console.log('✅ System Mapper initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize System Mapper:', error);
        showMessage('Failed to initialize application', 'error');
    }
});

// Initialize parent node container structure
function initializeParentNodeContainer() {
    const container = document.getElementById('parentNodeContainer');
    const firstSelect = container.querySelector('.parent-node-select');
    
    if (firstSelect && !firstSelect.parentElement.classList.contains('parent-node-select-row')) {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'parent-node-select-row';
        rowDiv.appendChild(firstSelect);
        container.appendChild(rowDiv);
    }
    
    updateRemoveParentButtons();
}

// Handle window resize - refresh visualization
window.addEventListener('resize', () => {
    if (window.currentMapData && typeof initVisualization === 'function') {
        // Debounce resize events
        clearTimeout(window.resizeTimeout);
        window.resizeTimeout = setTimeout(() => {
            console.log('🔄 Window resized, refreshing visualization');
            initVisualization();
        }, 300);
    }
});

// Handle browser back/forward buttons
window.addEventListener('popstate', (event) => {
    console.log('🔄 Browser navigation detected');
    // Could implement URL-based map selection here
});

// Global error handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Unhandled promise rejection:', event.reason);
    showMessage('An unexpected error occurred', 'error');
    // Prevent the default browser console error
    event.preventDefault();
});

// Global error handler for JavaScript errors
window.addEventListener('error', (event) => {
    console.error('❌ JavaScript error:', event.error);
    showMessage('An unexpected error occurred', 'error');
});

// Keyboard shortcuts
document.addEventListener('keydown', (event) => {
    // Ctrl/Cmd + S to save
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        saveMap();
    }
    
    // Ctrl/Cmd + N to create new map
    if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
        event.preventDefault();
        createNewMap();
    }
    
    // Ctrl/Cmd + E to export
    if ((event.ctrlKey || event.metaKey) && event.key === 'e') {
        event.preventDefault();
        exportMap();
    }
    
    // Escape to close forms
    if (event.key === 'Escape') {
        // Close any open tool panels
        document.getElementById('nodeConfig').classList.remove('active');
        document.getElementById('editNodeConfig').classList.remove('active');
        
        // Remove tool highlighting
        document.querySelectorAll('.tool-item').forEach(item => {
            item.style.background = '';
            item.style.borderColor = '';
        });
    }
});

// Utility function to debounce API calls
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Auto-save functionality (could be enabled for frequent saves)
const autoSave = debounce(() => {
    if (window.currentMapData && window.currentMapId) {
        console.log('💾 Auto-saving map...');
        // Could implement auto-save here
    }
}, 5000);

// Performance monitoring
const performanceObserver = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
        if (entry.duration > 100) {
            console.warn(`⚠️ Slow operation detected: ${entry.name} took ${entry.duration}ms`);
        }
    });
});

// Start observing performance
try {
    performanceObserver.observe({ entryTypes: ['measure', 'navigation'] });
} catch (e) {
    // Performance Observer not supported in all browsers
    console.log('Performance monitoring not available');
}

// Feature detection and graceful degradation
function checkBrowserSupport() {
    const features = {
        fetch: typeof fetch !== 'undefined',
        localStorage: typeof Storage !== 'undefined',
        d3: typeof d3 !== 'undefined',
        webgl: !!document.createElement('canvas').getContext('webgl')
    };
    
    console.log('🔍 Browser feature support:', features);
    
    if (!features.fetch) {
        showMessage('Your browser may not support all features', 'error');
    }
    
    return features;
}

// Initialize browser support check
checkBrowserSupport();

// Export global functions for console debugging
window.SystemMapper = {
    // Expose useful functions for debugging
    getCurrentMap: () => window.currentMapData,
    getCurrentMapId: () => window.currentMapId,
    reloadMap: loadSelectedMap,
    refreshVisualization: initVisualization,
    clearVisualization: clearVisualization,
    showMessage: showMessage,
    
    // Development helpers
    debug: {
        logState: () => {
            console.log('📊 Current State:', {
                mapId: window.currentMapId,
                nodeCount: window.currentMapData?.nodes?.length || 0,
                linkCount: window.currentMapData?.links?.length || 0
            });
        },
        exportDebugInfo: () => {
            return {
                timestamp: new Date().toISOString(),
                currentMap: window.currentMapData,
                browserInfo: navigator.userAgent,
                performance: performance.timing
            };
        }
    }
};

console.log('🔧 System Mapper debug tools available via window.SystemMapper');