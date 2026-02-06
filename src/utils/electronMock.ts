// ========= Copyright 2025-2026 @ Eigent.ai All Rights Reserved. =========
// Mock Electron APIs for web-only deployment
// ========= Copyright 2025-2026 @ Eigent.ai All Rights Reserved. =========

// Check if we're running in Electron or web browser
export const isElectron = () => {
  return !!(window && window.electronAPI);
};

// Mock IpcRenderer for web environment
const mockIpcRenderer = {
  getPlatform: () => 'web',
  minimizeWindow: () => console.log('Mock: minimizeWindow'),
  toggleMaximizeWindow: () => console.log('Mock: toggleMaximizeWindow'),
  closeWindow: () => console.log('Mock: closeWindow'),
  triggerMenuAction: (action: string) => console.log('Mock: triggerMenuAction', action),
  onExecuteAction: (callback: (action: string) => void) => {},
  invoke: async (channel: string, ...args: any[]) => {
    console.log('Mock IPC invoke:', channel, args);
    
    // Return mock backend port for API calls
    // In web-only mode, the Vite dev server proxies /api to backend on port 8000
    // But some code calls getBaseURL directly, so we need to return a port that works
    if (channel === 'get-backend-port') {
      // Return 8000 (backend port) - Vite proxy will handle the routing
      // If backend is on same host, return 8000
      // If backend is remote, this will be handled by Vite proxy config
      return 8000;
    }
    
    return Promise.resolve(null);
  },
  on: (channel: string, callback: (...args: any[]) => void) => {},
  off: (channel: string, callback: (...args: any[]) => void) => {},
  removeAllListeners: (channel: string) => {},
};

// Mock ElectronAPI for web environment
const mockElectronAPI = {
  closeWindow: (force?: boolean) => console.log('Mock: closeWindow', force),
  minimizeWindow: () => console.log('Mock: minimizeWindow'),
  toggleMaximizeWindow: () => console.log('Mock: toggleMaximizeWindow'),
  isFullScreen: async () => false,
  selectFile: async (options?: any) => ({ success: false, canceled: true }),
  triggerMenuAction: (action: string) => console.log('Mock: triggerMenuAction', action),
  onExecuteAction: (callback: (action: string) => void) => {},
  getPlatform: () => 'web',
  getHomeDir: async () => '/home',
  createWebView: async (id: string, url: string) => null,
  hideWebView: async (id: string) => null,
  changeViewSize: async (id: string, size: any) => null,
  onWebviewNavigated: (callback: (id: string, url: string) => void) => () => {},
  showWebview: async (id: string) => null,
  getActiveWebview: async () => null,
  setSize: async (size: any) => null,
  hideAllWebview: async () => null,
  getShowWebview: async () => null,
  webviewDestroy: async (webviewId: string) => null,
  exportLog: async () => ({ success: false }),
  mcpInstall: async (name: string, mcp: any) => ({ success: false }),
  mcpRemove: async (name: string) => ({ success: false }),
  mcpUpdate: async (name: string, mcp: any) => ({ success: false }),
  mcpList: async () => [],
  envWrite: async (email: string, kv: { key: string; value: string }) => ({ success: false }),
  envRemove: async (email: string, key: string) => ({ success: false }),
  getEnvPath: async (email: string) => '',
  executeCommand: async (command: string, email: string) => ({ success: false }),
  readFile: async (filePath: string) => null,
  readFileAsDataUrl: async (path: string) => '',
  deleteFolder: async (email: string) => ({ success: false }),
  getMcpConfigPath: async (email: string) => '',
  uploadLog: async (email: string, taskId: string, baseUrl: string, token: string) => ({ success: false }),
  startBrowserImport: async (args?: any) => ({ success: false }),
  checkAndInstallDepsOnUpdate: async () => ({ success: false }),
  checkInstallBrowser: async () => ({ data: [] }),
  getInstallationStatus: async () => ({ success: false }),
  getBackendPort: async () => null,
  restartBackend: async () => ({ success: false }),
  onInstallDependenciesStart: (callback: () => void) => {},
  onInstallDependenciesLog: (callback: (data: { type: string; data: string }) => void) => {},
  onInstallDependenciesComplete: (callback: (data: { success: boolean; code?: number; error?: string }) => void) => {},
  onUpdateNotification: (callback: (data: any) => void) => {},
  onBackendReady: (callback: (data: any) => void) => {},
  removeAllListeners: (channel: string) => {},
  getEmailFolderPath: async (email: string) => ({
    MCP_REMOTE_CONFIG_DIR: '',
    MCP_CONFIG_DIR: '',
    tempEmail: email,
  }),
  restartApp: async () => {},
  readGlobalEnv: async (key: string) => ({ value: null }),
  getProjectFolderPath: async (email: string, projectId: string) => '',
  openInIDE: async (folderPath: string, ide: string) => ({ success: false }),
};

// Initialize mocks if not in Electron environment
export const initElectronMocks = () => {
  if (typeof window !== 'undefined' && !window.electronAPI) {
    console.log('Running in web mode - initializing Electron API mocks');
    (window as any).electronAPI = mockElectronAPI;
    (window as any).ipcRenderer = mockIpcRenderer;
  }
};
