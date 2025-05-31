// Handles loading the events for <model-viewer>'s slotted progress bar
const onProgress = (event) => {
  const progressBar = event.target.querySelector('.progress-bar');
  const updatingBar = event.target.querySelector('.update-bar');
  updatingBar.style.width = `${event.detail.totalProgress * 100}%`;
  if (event.detail.totalProgress === 1) {
    progressBar.classList.add('hide');
    event.target.removeEventListener('progress', onProgress);
  } else {
    progressBar.classList.remove('hide');
  }
};

// Responsive model viewer sizing
const adjustModelViewerSize = () => {
  const modelViewer = document.querySelector('model-viewer');
  const streetViewBtn = document.querySelector('.street-view-btn');
  const footer = document.querySelector('footer');
  
  if (!modelViewer) return;
  
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  // Calculate available space
  const headerHeight = document.querySelector('header').offsetHeight + 
                      document.querySelector('.vit-header-title-header').offsetHeight;
  const footerHeight = footer ? footer.offsetHeight : 0;
  const buttonHeight = streetViewBtn ? streetViewBtn.offsetHeight + 40 : 0; // 40px for margins
  
  const availableHeight = viewportHeight - headerHeight - footerHeight - buttonHeight - 60; // 60px buffer
  const availableWidth = viewportWidth - 40; // 40px total padding
  
  let modelSize;
  
  // Responsive sizing based on device type
  if (viewportWidth <= 480) {
    // Mobile phones
    modelSize = Math.min(availableWidth * 0.9, availableHeight * 0.7, 350);
  } else if (viewportWidth <= 768) {
    // Tablets
    modelSize = Math.min(availableWidth * 0.8, availableHeight * 0.75, 500);
  } else if (viewportWidth <= 1024) {
    // Small laptops
    modelSize = Math.min(availableWidth * 0.7, availableHeight * 0.8, 700);
  } else {
    // Desktop
    modelSize = Math.min(availableWidth * 0.6, availableHeight * 0.8, 900);
  }
  
  // Ensure minimum size
  modelSize = Math.max(modelSize, 250);
  
  modelViewer.style.width = `${modelSize}px`;
  modelViewer.style.height = `${modelSize}px`;
  
  // Adjust container height for mobile
  const centerContainer = document.querySelector('.center-container');
  if (centerContainer && viewportWidth <= 768) {
    centerContainer.style.height = 'auto';
    centerContainer.style.minHeight = `${availableHeight}px`;
    centerContainer.style.justifyContent = 'flex-start';
    centerContainer.style.paddingTop = '20px';
  }
};

// Adjust button position for mobile devices
const adjustButtonPosition = () => {
  const streetViewBtn = document.querySelector('.street-view-btn');
  const viewportWidth = window.innerWidth;
  
  if (!streetViewBtn) return;
  
  if (viewportWidth <= 768) {
    // Mobile: Center the button and adjust size
    streetViewBtn.style.position = 'static';
    streetViewBtn.style.margin = '20px auto';
    streetViewBtn.style.display = 'block';
    streetViewBtn.style.fontSize = '1.2rem';
    streetViewBtn.style.padding = '12px 30px';
    streetViewBtn.style.width = 'auto';
    streetViewBtn.style.maxWidth = '90vw';
  } else {
    // Desktop: Keep original positioning
    streetViewBtn.style.position = 'absolute';
    streetViewBtn.style.top = '16px';
    streetViewBtn.style.right = '16px';
    streetViewBtn.style.margin = '0';
    streetViewBtn.style.fontSize = '1.5rem';
    streetViewBtn.style.padding = '16px 40px';
    streetViewBtn.style.width = 'auto';
    streetViewBtn.style.maxWidth = 'none';
  }
};

// Handle orientation changes
const handleOrientationChange = () => {
  // Small delay to ensure viewport dimensions are updated
  setTimeout(() => {
    adjustModelViewerSize();
    adjustButtonPosition();
  }, 100);
};

// Optimize performance with debounced resize handler
let resizeTimeout;
const debouncedResize = () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    adjustModelViewerSize();
    adjustButtonPosition();
  }, 150);
};

// Touch handling for better mobile experience
const handleTouchStart = (e) => {
  // Prevent zoom on double tap for model viewer
  if (e.target.closest('model-viewer')) {
    e.preventDefault();
  }
};

// Initialize responsive behavior
const initResponsiveBehavior = () => {
  // Initial setup
  adjustModelViewerSize();
  adjustButtonPosition();
  
  // Event listeners
  window.addEventListener('resize', debouncedResize);
  window.addEventListener('orientationchange', handleOrientationChange);
  
  // Touch events for mobile
  document.addEventListener('touchstart', handleTouchStart, { passive: false });
  
  // Handle model viewer loading
  const modelViewer = document.querySelector('model-viewer');
  if (modelViewer) {
    modelViewer.addEventListener('progress', onProgress);
    
    // Adjust size when model loads
    modelViewer.addEventListener('load', () => {
      setTimeout(adjustModelViewerSize, 100);
    });
    
    // Handle AR mode for mobile devices
    modelViewer.addEventListener('ar-status', (event) => {
      if (event.detail.status === 'session-started') {
        console.log('AR session started');
      }
    });
  }
  
  // Street view button functionality
  const streetViewBtn = document.querySelector('.street-view-btn');
  if (streetViewBtn) {
    streetViewBtn.addEventListener('click', () => {
      // Add your street view functionality here
      console.log('Street view clicked');
      // Example: window.open('street-view-page.html', '_blank');
    });
  }
};

// Wait for DOM to be fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initResponsiveBehavior);
} else {
  initResponsiveBehavior();
}

// Additional utility functions for responsive behavior
const getDeviceType = () => {
  const width = window.innerWidth;
  if (width <= 480) return 'mobile';
  if (width <= 768) return 'tablet';
  if (width <= 1024) return 'laptop';
  return 'desktop';
};

// Performance monitoring for mobile devices
const isLowPowerDevice = () => {
  // Simple heuristic based on device characteristics
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  
  if (!gl) return true;
  
  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
  if (debugInfo) {
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    return renderer.toLowerCase().includes('adreno') && 
           !renderer.includes('530') && !renderer.includes('540');
  }
  
  return navigator.hardwareConcurrency < 4;
};

// Optimize model viewer settings for mobile
const optimizeForDevice = () => {
  const modelViewer = document.querySelector('model-viewer');
  if (!modelViewer) return;
  
  const deviceType = getDeviceType();
  
  if (deviceType === 'mobile' || isLowPowerDevice()) {
    // Reduce shadow intensity for better performance
    modelViewer.setAttribute('shadow-intensity', '0.5');
    
    // Disable auto-rotate on mobile to save battery
    if (window.innerWidth <= 480) {
      modelViewer.removeAttribute('auto-rotate');
    }
    
    // Set lower field of view for mobile
    modelViewer.setAttribute('field-of-view', '45deg');
  }
};

// Call optimization after model loads
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(optimizeForDevice, 500);
});