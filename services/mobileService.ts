// CortexBuild Mobile Optimization Service
export interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop';
  os: 'iOS' | 'Android' | 'Windows' | 'macOS' | 'Linux' | 'Unknown';
  browser: string;
  version: string;
  screenSize: { width: number; height: number };
  orientation: 'portrait' | 'landscape';
  touchSupport: boolean;
  connectionType: 'wifi' | '4g' | '3g' | '2g' | 'slow-2g' | 'unknown';
  isOnline: boolean;
  batteryLevel?: number;
  isLowPowerMode?: boolean;
}

export interface MobileOptimization {
  enableImageCompression: boolean;
  enableDataSaver: boolean;
  enableOfflineMode: boolean;
  enablePushNotifications: boolean;
  enableLocationServices: boolean;
  enableCameraAccess: boolean;
  enableVoiceInput: boolean;
  enableHapticFeedback: boolean;
  enableDarkMode: boolean;
  enableReducedMotion: boolean;
}

export interface OfflineCapability {
  canWorkOffline: boolean;
  syncPending: boolean;
  lastSyncTime: string;
  offlineActions: OfflineAction[];
  cachedData: { [key: string]: any };
  storageUsed: number;
  storageLimit: number;
}

export interface OfflineAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: 'task' | 'project' | 'rfi' | 'document' | 'timeEntry';
  data: any;
  timestamp: string;
  synced: boolean;
  retryCount: number;
}

export interface PushNotificationSettings {
  enabled: boolean;
  types: {
    taskAssignments: boolean;
    projectUpdates: boolean;
    rfiResponses: boolean;
    safetyAlerts: boolean;
    deadlineReminders: boolean;
    teamMessages: boolean;
  };
  schedule: {
    startTime: string; // HH:MM
    endTime: string;   // HH:MM
    weekdays: boolean[];
  };
  sound: boolean;
  vibration: boolean;
  badge: boolean;
}

export interface LocationService {
  enabled: boolean;
  accuracy: 'high' | 'medium' | 'low';
  trackingMode: 'always' | 'foreground' | 'disabled';
  geofencing: GeofenceRegion[];
  currentLocation?: {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: string;
  };
}

export interface GeofenceRegion {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number; // meters
  enabled: boolean;
  actions: {
    onEnter: string[];
    onExit: string[];
  };
}

export interface CameraCapability {
  available: boolean;
  permissions: 'granted' | 'denied' | 'prompt';
  features: {
    photo: boolean;
    video: boolean;
    qrScanner: boolean;
    documentScanner: boolean;
    barcodeScanner: boolean;
  };
  quality: 'high' | 'medium' | 'low';
  compression: boolean;
}

export interface VoiceInput {
  available: boolean;
  permissions: 'granted' | 'denied' | 'prompt';
  languages: string[];
  currentLanguage: string;
  continuous: boolean;
  interimResults: boolean;
}

class MobileService {
  private deviceInfo: DeviceInfo;
  private optimization: MobileOptimization;
  private offlineCapability: OfflineCapability;
  private pushSettings: PushNotificationSettings;
  private locationService: LocationService;
  private cameraCapability: CameraCapability;
  private voiceInput: VoiceInput;

  constructor() {
    this.deviceInfo = this.detectDevice();
    this.optimization = this.getDefaultOptimization();
    this.offlineCapability = this.initializeOfflineCapability();
    this.pushSettings = this.getDefaultPushSettings();
    this.locationService = this.initializeLocationService();
    this.cameraCapability = this.initializeCameraCapability();
    this.voiceInput = this.initializeVoiceInput();
    
    this.initializeMobileFeatures();
  }

  private detectDevice(): DeviceInfo {
    const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : '';
    const screen = typeof window !== 'undefined' ? window.screen : { width: 1920, height: 1080 };
    
    // Detect device type
    let type: 'mobile' | 'tablet' | 'desktop' = 'desktop';
    if (/Mobile|Android|iPhone|iPod/.test(userAgent)) {
      type = 'mobile';
    } else if (/Tablet|iPad/.test(userAgent)) {
      type = 'tablet';
    }

    // Detect OS
    let os: DeviceInfo['os'] = 'Unknown';
    if (/iPhone|iPad|iPod/.test(userAgent)) os = 'iOS';
    else if (/Android/.test(userAgent)) os = 'Android';
    else if (/Windows/.test(userAgent)) os = 'Windows';
    else if (/Mac/.test(userAgent)) os = 'macOS';
    else if (/Linux/.test(userAgent)) os = 'Linux';

    // Detect browser
    let browser = 'Unknown';
    if (/Chrome/.test(userAgent)) browser = 'Chrome';
    else if (/Firefox/.test(userAgent)) browser = 'Firefox';
    else if (/Safari/.test(userAgent)) browser = 'Safari';
    else if (/Edge/.test(userAgent)) browser = 'Edge';

    // Detect connection
    const connection = (navigator as any)?.connection;
    let connectionType: DeviceInfo['connectionType'] = 'unknown';
    if (connection) {
      connectionType = connection.effectiveType || 'unknown';
    }

    return {
      type,
      os,
      browser,
      version: '1.0',
      screenSize: { width: screen.width, height: screen.height },
      orientation: screen.width > screen.height ? 'landscape' : 'portrait',
      touchSupport: 'ontouchstart' in window,
      connectionType,
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      batteryLevel: undefined,
      isLowPowerMode: false
    };
  }

  private getDefaultOptimization(): MobileOptimization {
    const isMobile = this.deviceInfo.type === 'mobile';
    const isSlowConnection = ['2g', 'slow-2g'].includes(this.deviceInfo.connectionType);

    return {
      enableImageCompression: isMobile || isSlowConnection,
      enableDataSaver: isSlowConnection,
      enableOfflineMode: isMobile,
      enablePushNotifications: isMobile,
      enableLocationServices: isMobile,
      enableCameraAccess: isMobile,
      enableVoiceInput: isMobile,
      enableHapticFeedback: isMobile && this.deviceInfo.os === 'iOS',
      enableDarkMode: false,
      enableReducedMotion: false
    };
  }

  private initializeOfflineCapability(): OfflineCapability {
    return {
      canWorkOffline: true,
      syncPending: false,
      lastSyncTime: new Date().toISOString(),
      offlineActions: [],
      cachedData: {},
      storageUsed: 0,
      storageLimit: 50 * 1024 * 1024 // 50MB
    };
  }

  private getDefaultPushSettings(): PushNotificationSettings {
    return {
      enabled: false,
      types: {
        taskAssignments: true,
        projectUpdates: true,
        rfiResponses: true,
        safetyAlerts: true,
        deadlineReminders: true,
        teamMessages: false
      },
      schedule: {
        startTime: '08:00',
        endTime: '18:00',
        weekdays: [true, true, true, true, true, false, false]
      },
      sound: true,
      vibration: true,
      badge: true
    };
  }

  private initializeLocationService(): LocationService {
    return {
      enabled: false,
      accuracy: 'medium',
      trackingMode: 'foreground',
      geofencing: [],
      currentLocation: undefined
    };
  }

  private initializeCameraCapability(): CameraCapability {
    const hasCamera = typeof navigator !== 'undefined' && 'mediaDevices' in navigator;
    
    return {
      available: hasCamera,
      permissions: 'prompt',
      features: {
        photo: hasCamera,
        video: hasCamera,
        qrScanner: hasCamera,
        documentScanner: hasCamera,
        barcodeScanner: hasCamera
      },
      quality: 'medium',
      compression: true
    };
  }

  private initializeVoiceInput(): VoiceInput {
    const hasVoice = typeof window !== 'undefined' && 'webkitSpeechRecognition' in window;
    
    return {
      available: hasVoice,
      permissions: 'prompt',
      languages: ['en-US', 'en-GB'],
      currentLanguage: 'en-US',
      continuous: false,
      interimResults: true
    };
  }

  private initializeMobileFeatures(): void {
    if (typeof window === 'undefined') return;

    // Register service worker for PWA
    this.registerServiceWorker();

    // Setup offline detection
    this.setupOfflineDetection();

    // Setup battery monitoring
    this.setupBatteryMonitoring();

    // Setup orientation change detection
    this.setupOrientationDetection();

    // Setup connection monitoring
    this.setupConnectionMonitoring();
  }

  private async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  private setupOfflineDetection(): void {
    window.addEventListener('online', () => {
      this.deviceInfo.isOnline = true;
      this.syncOfflineActions();
    });

    window.addEventListener('offline', () => {
      this.deviceInfo.isOnline = false;
    });
  }

  private async setupBatteryMonitoring(): Promise<void> {
    if ('getBattery' in navigator) {
      try {
        const battery = await (navigator as any).getBattery();
        this.deviceInfo.batteryLevel = battery.level * 100;
        
        battery.addEventListener('levelchange', () => {
          this.deviceInfo.batteryLevel = battery.level * 100;
          
          // Enable power saving mode when battery is low
          if (battery.level < 0.2) {
            this.enablePowerSavingMode();
          }
        });
      } catch (error) {
        console.warn('Battery API not available');
      }
    }
  }

  private setupOrientationDetection(): void {
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.deviceInfo.orientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
        this.deviceInfo.screenSize = { width: window.innerWidth, height: window.innerHeight };
      }, 100);
    });
  }

  private setupConnectionMonitoring(): void {
    const connection = (navigator as any)?.connection;
    if (connection) {
      connection.addEventListener('change', () => {
        this.deviceInfo.connectionType = connection.effectiveType;
        
        // Adjust optimization based on connection
        if (['2g', 'slow-2g'].includes(connection.effectiveType)) {
          this.optimization.enableDataSaver = true;
          this.optimization.enableImageCompression = true;
        }
      });
    }
  }

  // Public API Methods
  async getDeviceInfo(): Promise<DeviceInfo> {
    return { ...this.deviceInfo };
  }

  async getOptimizationSettings(): Promise<MobileOptimization> {
    return { ...this.optimization };
  }

  async updateOptimizationSettings(settings: Partial<MobileOptimization>): Promise<void> {
    this.optimization = { ...this.optimization, ...settings };
    
    // Apply settings immediately
    if (settings.enableDarkMode !== undefined) {
      this.applyDarkMode(settings.enableDarkMode);
    }
    
    if (settings.enableReducedMotion !== undefined) {
      this.applyReducedMotion(settings.enableReducedMotion);
    }
  }

  async requestPushNotificationPermission(): Promise<boolean> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      this.pushSettings.enabled = permission === 'granted';
      return permission === 'granted';
    }
    return false;
  }

  async requestLocationPermission(): Promise<boolean> {
    if ('geolocation' in navigator) {
      try {
        await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        this.locationService.enabled = true;
        return true;
      } catch (error) {
        this.locationService.enabled = false;
        return false;
      }
    }
    return false;
  }

  async requestCameraPermission(): Promise<boolean> {
    if ('mediaDevices' in navigator) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());
        this.cameraCapability.permissions = 'granted';
        return true;
      } catch (error) {
        this.cameraCapability.permissions = 'denied';
        return false;
      }
    }
    return false;
  }

  async capturePhoto(): Promise<string | null> {
    if (!this.cameraCapability.available || this.cameraCapability.permissions !== 'granted') {
      return null;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      video.srcObject = stream;
      await video.play();

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context?.drawImage(video, 0, 0);

      stream.getTracks().forEach(track => track.stop());

      return canvas.toDataURL('image/jpeg', this.cameraCapability.compression ? 0.8 : 1.0);
    } catch (error) {
      console.error('Photo capture failed:', error);
      return null;
    }
  }

  async getCurrentLocation(): Promise<{ latitude: number; longitude: number } | null> {
    if (!this.locationService.enabled) {
      return null;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: this.locationService.accuracy === 'high',
          timeout: 10000,
          maximumAge: 60000
        });
      });

      const location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };

      this.locationService.currentLocation = {
        ...location,
        accuracy: position.coords.accuracy,
        timestamp: new Date().toISOString()
      };

      return location;
    } catch (error) {
      console.error('Location access failed:', error);
      return null;
    }
  }

  async addOfflineAction(action: Omit<OfflineAction, 'id' | 'timestamp' | 'synced' | 'retryCount'>): Promise<void> {
    const offlineAction: OfflineAction = {
      ...action,
      id: `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      synced: false,
      retryCount: 0
    };

    this.offlineCapability.offlineActions.push(offlineAction);
    this.offlineCapability.syncPending = true;

    // Try to sync immediately if online
    if (this.deviceInfo.isOnline) {
      await this.syncOfflineActions();
    }
  }

  async syncOfflineActions(): Promise<void> {
    if (!this.deviceInfo.isOnline || !this.offlineCapability.syncPending) {
      return;
    }

    const pendingActions = this.offlineCapability.offlineActions.filter(action => !action.synced);
    
    for (const action of pendingActions) {
      try {
        // Simulate API call to sync action
        await this.syncAction(action);
        action.synced = true;
      } catch (error) {
        action.retryCount++;
        console.error('Failed to sync action:', action.id, error);
      }
    }

    // Remove synced actions
    this.offlineCapability.offlineActions = this.offlineCapability.offlineActions.filter(action => !action.synced);
    this.offlineCapability.syncPending = this.offlineCapability.offlineActions.length > 0;
    this.offlineCapability.lastSyncTime = new Date().toISOString();
  }

  private async syncAction(action: OfflineAction): Promise<void> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Synced offline action:', action);
  }

  private enablePowerSavingMode(): void {
    this.optimization.enableDataSaver = true;
    this.optimization.enableImageCompression = true;
    this.optimization.enableReducedMotion = true;
    this.applyReducedMotion(true);
  }

  private applyDarkMode(enabled: boolean): void {
    if (typeof document !== 'undefined') {
      if (enabled) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }

  private applyReducedMotion(enabled: boolean): void {
    if (typeof document !== 'undefined') {
      if (enabled) {
        document.documentElement.style.setProperty('--animation-duration', '0s');
      } else {
        document.documentElement.style.removeProperty('--animation-duration');
      }
    }
  }

  // Voice input methods
  async startVoiceInput(): Promise<string | null> {
    if (!this.voiceInput.available) {
      return null;
    }

    return new Promise((resolve) => {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = this.voiceInput.continuous;
      recognition.interimResults = this.voiceInput.interimResults;
      recognition.lang = this.voiceInput.currentLanguage;

      recognition.onresult = (event: any) => {
        const result = event.results[event.results.length - 1];
        if (result.isFinal) {
          resolve(result[0].transcript);
        }
      };

      recognition.onerror = () => {
        resolve(null);
      };

      recognition.start();
    });
  }

  // Haptic feedback
  async triggerHapticFeedback(type: 'light' | 'medium' | 'heavy' = 'medium'): Promise<void> {
    if (!this.optimization.enableHapticFeedback) {
      return;
    }

    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30]
      };
      navigator.vibrate(patterns[type]);
    }
  }

  // Get mobile-optimized settings
  getMobileOptimizedSettings(): any {
    return {
      imageQuality: this.optimization.enableImageCompression ? 'medium' : 'high',
      animationDuration: this.optimization.enableReducedMotion ? 0 : 300,
      cacheStrategy: this.optimization.enableDataSaver ? 'aggressive' : 'normal',
      offlineMode: this.optimization.enableOfflineMode,
      pushNotifications: this.optimization.enablePushNotifications
    };
  }
}

export const mobileService = new MobileService();
export default mobileService;
