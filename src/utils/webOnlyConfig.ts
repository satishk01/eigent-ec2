// ========= Copyright 2025-2026 @ Eigent.ai All Rights Reserved. =========
// Configuration for web-only deployment
// ========= Copyright 2025-2026 @ Eigent.ai All Rights Reserved. =========

// Check if running in web-only mode (not Electron)
export const isWebOnlyMode = () => {
  return typeof window !== 'undefined' && !window.electronAPI;
};

// Skip onboarding screens in web-only mode
export const shouldSkipOnboarding = () => {
  // In web mode, skip the permissions/carousel screens
  return isWebOnlyMode();
};

// Initialize web-only defaults
export const initWebOnlyDefaults = () => {
  if (isWebOnlyMode()) {
    console.log('Running in web-only mode - applying defaults');
    
    // Set initState to 'done' to skip onboarding
    const authStoreData = localStorage.getItem('auth-store');
    if (authStoreData) {
      try {
        const parsed = JSON.parse(authStoreData);
        if (parsed.state) {
          // Skip onboarding screens in web mode
          parsed.state.initState = 'done';
          parsed.state.isFirstLaunch = false;
          localStorage.setItem('auth-store', JSON.stringify(parsed));
          console.log('Web-only mode: Skipped onboarding screens');
        }
      } catch (e) {
        console.error('Failed to parse auth store:', e);
      }
    }
  }
};
