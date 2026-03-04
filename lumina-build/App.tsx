
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { MOCK_DEVICES, MOCK_ROOMS, OFFLINE_GRADIENTS } from './constants';
import { AppState, Device, DeviceType, Room, HubitatConfig, Favorite, Notification, IPCamera, HomeWidget, SlideshowConfig, QRCodeConfig, TextWidgetConfig, VideoWidgetConfig } from './types';
import { GlassCard } from './components/GlassCard';
import { DeviceControl } from './components/DeviceControl';
import { ImageEditorModal } from './components/ImageEditorModal';
import { AuthLock } from './components/AuthLock';
import { DenonRemote } from './components/DenonRemote';
import { LGRemote } from './components/LGRemote';
import { ACRemote } from './components/ACRemote';
import { 
    saveConfig, getConfig, fetchHubitatDevices, testConnection, 
    saveDeviceMapping, getDeviceMapping, saveLogo, getLogo, 
    saveActionMapping, getActionMapping, getNameMapping, saveNameMapping,
    saveBackgroundMapping, getBackgroundMapping, saveRoomImageMapping, getRoomImageMapping,
    saveRooms, getSavedRooms, saveLayouts, getLayouts, GridItem,
    syncToHubitat, syncFromHubitat, exportFullConfig, importFullConfig,
    saveCustomDevice, getCustomDevices, removeCustomDevice,
    // v1.6 Premium
    getFavorites, saveFavorites, getNotifications, addNotification, getEnergyConfig,
    // Câmeras IP
    getCameras, addCamera, updateCamera, removeCamera, getCamerasByRoom,
    // Home Widgets
    getHomeWidgets, saveHomeWidgets, addHomeWidget, removeHomeWidget, updateHomeWidget,
    // Room Import
    fetchHubitatRooms, importRoomsFromHubitat
} from './services/hubitatService';
import { CameraCard } from './components/CameraCard';
import { AddCameraModal } from './components/AddCameraModal';
import { EnergyCard } from './components/EnergyCard';
import { FavoritesBar } from './components/FavoritesBar';
import { NotificationsPanel } from './components/NotificationsPanel';
import { 
    SlideshowWidget, QRCodeWidget, TextWidget, VideoWidget,
    SlideshowEditor, QRCodeEditor, TextEditor, VideoEditor 
} from './components/HomeWidgets';
import { 
    generateInstallId, validateLicense, saveLicense, isAppRegistered 
} from './services/licenseService';
import { 
  getWeather, searchCity, getSavedWeatherConfig, saveWeatherConfig, getWeatherInfo, getDayName,
  WeatherConfig, WeatherData 
} from './services/weatherService';
import { ArrowLeft, Home, Grid, Settings, Zap, Shield, Thermometer, Save, X, LayoutDashboard, CloudSun, Droplets, Wind, Sun, CheckCircle, AlertTriangle, Wifi, Globe, Lock, WifiOff, Copy, Sliders, EyeOff, ChevronRight, ChevronUp, ChevronDown, Image as ImageIcon, Trash2, Upload, PenLine, Camera, Plus, LayoutTemplate, RefreshCcw, Cloud, Download, Terminal, MapPin, Search, Ban, Tv, Blinds, Layout, Layers, Bell, Star } from 'lucide-react';
import { getIconForDevice } from './components/Icons';

// Initialize React Grid Layout
const ResponsiveGridLayout = WidthProvider(Responsive);

// Updated Tab Type: Removed individual tabs, added 'devices'
type Tab = 'home' | 'rooms' | 'scenes' | 'devices' | 'media' | 'settings';

const App = () => {
  // --- CONFIGURAÇÃO DE BLOQUEIO ---
  // Mude para 'false' quando quiser liberar o acesso ao cliente novamente.
  const BLOCK_ACCESS = false; 

  // --- State ---
  const [isLocked, setIsLocked] = useState(() => {
    const saved = getConfig();
    return saved?.enableLock === true; // Default false
  });
  const [state, setState] = useState<AppState>({
    currentRoomId: null,
    rooms: getSavedRooms() || MOCK_ROOMS,
    devices: MOCK_DEVICES,
  });

  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [isHttps, setIsHttps] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [currentOrigin, setCurrentOrigin] = useState('');
  const [customLogo, setCustomLogo] = useState<string | null>(null);
  const [newRoomName, setNewRoomName] = useState('');
  
  // Custom Backgrounds State
  const [customBackgrounds, setCustomBackgrounds] = useState<Record<string, string>>({});
  const [customRoomImages, setCustomRoomImages] = useState<Record<string, string>>({});
  
  // Image Editor State
  const [isImageEditorOpen, setIsImageEditorOpen] = useState(false);
  const [editingTarget, setEditingTarget] = useState<{ type: 'tab' | 'room', id: string } | null>(null);

  // Menu State
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pollingPaused = useRef(false);
  const pollingPauseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cloudSyncDone = useRef(false);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Settings State
  const [configForm, setConfigForm] = useState<HubitatConfig>({
    hubIp: '',
    appId: '',
    accessToken: '',
    hubUuid: '',
    useCloud: false
  });
  const [connectionStatus, setConnectionStatus] = useState<{status: 'idle' | 'testing' | 'success' | 'error', message?: string}>({ status: 'idle' });
  const [showDeviceManager, setShowDeviceManager] = useState(false);
  
  // Sync State
  const [syncStatus, setSyncStatus] = useState<string>('');
  const [backupJson, setBackupJson] = useState<string>('');
  const [showBackupModal, setShowBackupModal] = useState(false);

  // --- Weather State ---
  const [weatherConfig, setWeatherConfig] = useState<WeatherConfig | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [showWeatherSettings, setShowWeatherSettings] = useState(false);
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [citySearchResults, setCitySearchResults] = useState<any[]>([]);
  const [isSearchingCity, setIsSearchingCity] = useState(false);

  // --- Grid Layout State ---
  const [isEditMode, setIsEditMode] = useState(false);
  const [layouts, setLayouts] = useState<Record<string, GridItem[]>>({});

  // --- Registration State ---
  const [isRegistered, setIsRegistered] = useState(true); // Default true to avoid flash, check in effect
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [registrationKey, setRegistrationKey] = useState('');
  const [installId, setInstallId] = useState('');

  // --- v1.6 Premium State ---
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // --- Câmeras IP State ---
  const [cameras, setCameras] = useState<IPCamera[]>([]);
  const [showAddCameraModal, setShowAddCameraModal] = useState(false);
  const [editingCamera, setEditingCamera] = useState<IPCamera | null>(null);

  // --- Home Widgets State ---
  const [homeWidgets, setHomeWidgets] = useState<HomeWidget[]>([]);
  const [showAddWidgetMenu, setShowAddWidgetMenu] = useState(false);
  const [editingWidget, setEditingWidget] = useState<{ type: string; widget?: HomeWidget } | null>(null);

  // --- Effects ---
  useEffect(() => {
    // Check Protocol and Origin
    setIsHttps(window.location.protocol === 'https:');
    setCurrentOrigin(window.location.origin);

    // Clock Timer
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    // AUTO-SETUP: Check URL for ?config= parameter (generated by Lumina Installer)
    const urlParams = new URLSearchParams(window.location.search);
    const configParam = urlParams.get('config');
    if (configParam) {
      try {
        const decoded = decodeURIComponent(escape(atob(configParam)));
        const setupConfig = JSON.parse(decoded);
        console.log('[Lumina] Auto-setup: Config received from URL!');
        
        // Apply connection settings
        if (setupConfig.hubIp && setupConfig.appId && setupConfig.accessToken) {
          const newConfig: HubitatConfig = {
            hubIp: setupConfig.hubIp,
            appId: setupConfig.appId,
            accessToken: setupConfig.accessToken,
            hubUuid: setupConfig.hubUuid || '',
            useCloud: false
          };
          saveConfig(newConfig);
          setConfigForm(newConfig);
          console.log('[Lumina] Auto-setup: Connection configured!');
          
          // Apply license if provided
          if (setupConfig.license) {
            saveLicense(setupConfig.license, newConfig.accessToken);
            console.log('[Lumina] Auto-setup: License applied!');
          }
        }
        
        // Clean URL to hide config param (security)
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (e) {
        console.error('[Lumina] Auto-setup: Invalid config parameter', e);
      }
    }

    // Load config on startup
    const savedConfig = getConfig();
    if (savedConfig) {
      setConfigForm(savedConfig);
      
      // Check Registration
      if (savedConfig.accessToken) {
          const registered = isAppRegistered(savedConfig.accessToken);
          setIsRegistered(registered);
          if (!registered) {
              setInstallId(generateInstallId(savedConfig.accessToken));
              setShowRegistrationModal(true);
          }
      }
    }

    // Load Weather Config
    const savedWeather = getSavedWeatherConfig();
    if (savedWeather) {
        setWeatherConfig(savedWeather);
        fetchWeather(savedWeather.lat, savedWeather.lon);
    } else {
        // Default to Sao Paulo if nothing saved
        const defaultW = { city: 'São Paulo', lat: -23.5505, lon: -46.6333 };
        setWeatherConfig(defaultW);
        fetchWeather(defaultW.lat, defaultW.lon);
    }

    // Load Custom Assets & Layouts
    const savedLogo = getLogo();
    if (savedLogo) setCustomLogo(savedLogo);

    setCustomBackgrounds(getBackgroundMapping());
    setCustomRoomImages(getRoomImageMapping());
    setLayouts(getLayouts());

    // Load Custom Devices initially
    const customDevices = getCustomDevices();
    if (Object.keys(customDevices).length > 0) {
        setState(prev => ({
            ...prev,
            devices: { ...prev.devices, ...customDevices }
        }));
    }

    // v1.6 Premium: Load Favorites and Notifications
    setFavorites(getFavorites());
    setNotifications(getNotifications());
    
    // v1.6: Load IP Cameras
    setCameras(getCameras());

    // v1.6: Load Home Widgets
    setHomeWidgets(getHomeWidgets());

    return () => clearInterval(timer);
  }, []);

  // Weather Fetcher
  const fetchWeather = async (lat: number, lon: number) => {
    const data = await getWeather(lat, lon);
    if (data) setWeatherData(data);
  };

  // Weather Polling (Every 30 mins)
  useEffect(() => {
      if (!weatherConfig) return;
      const interval = setInterval(() => {
          fetchWeather(weatherConfig.lat, weatherConfig.lon);
      }, 1000 * 60 * 30);
      return () => clearInterval(interval);
  }, [weatherConfig]);

  // Polling Effect for Hubitat Data
  useEffect(() => {
  const config = getConfig();
  if (!config || (!config.hubIp && !config.useCloud)) return;
  if (showDeviceManager) return;
  
  loadRealDevices(true);

  const interval = setInterval(() => {
    if (!pollingPaused.current) {
      loadRealDevices(true);
    }
  }, 2000); 

  return () => clearInterval(interval);
}, [configForm.hubIp, configForm.useCloud, showDeviceManager]);

  // AUTO-SYNC: Load config from Hubitat on first successful connection
  useEffect(() => {
    const autoLoadFromCloud = async () => {
      if (cloudSyncDone.current) return;
      const config = getConfig();
      if (!config || !config.accessToken) return;
      
      // Try to load from Hubitat
      console.log('[Lumina] Auto-sync: Loading config from Hubitat...');
      const result = await syncFromHubitat('LuminaData');
      
      if (result.success) {
        console.log('[Lumina] Auto-sync: Config loaded from Hubitat!');
        // Reload state after import
        setState(prev => ({ ...prev, rooms: getSavedRooms() || MOCK_ROOMS }));
        setCustomBackgrounds(getBackgroundMapping());
        setCustomRoomImages(getRoomImageMapping());
        setLayouts(getLayouts());
      } else {
        console.log('[Lumina] Auto-sync: No cloud config found, using local.');
      }
      cloudSyncDone.current = true;
    };
    
    // Only run after connection is established
    if (!isOffline && configForm.accessToken) {
      autoLoadFromCloud();
    }
  }, [isOffline, configForm.accessToken]);

  // AUTO-SAVE: Debounced save to Hubitat when config changes
  const triggerAutoSave = () => {
    if (!configForm.accessToken) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    
    autoSaveTimer.current = setTimeout(async () => {
      console.log('[Lumina] Auto-sync: Saving config to Hubitat...');
      const result = await syncToHubitat('LuminaData');
      if (result.success) {
        console.log('[Lumina] Auto-sync: Config saved!');
      }
    }, 5000); // 5 seconds debounce
  };

  // v1.6 Premium: Previous sensor states for comparison
  const prevSensorStates = useRef<Record<string, boolean>>({});

  // v1.6 Premium: Auto-notifications for security sensors
  useEffect(() => {
    const securityTypes = [DeviceType.WATER, DeviceType.SMOKE, DeviceType.MOTION, DeviceType.PRESENCE, DeviceType.LOCK];
    const securityDevices = Object.values(state.devices).filter(d => securityTypes.includes(d.type));
    
    securityDevices.forEach(device => {
      const prevState = prevSensorStates.current[device.id];
      let currentAlertState = false;
      let alertMessage = '';
      let alertType: 'alert' | 'warning' | 'info' = 'info';
      
      // Check for alert conditions
      if (device.type === DeviceType.WATER && device.state.water === 'wet') {
        currentAlertState = true;
        alertMessage = `💧 ${device.name}: Vazamento detectado!`;
        alertType = 'alert';
      } else if (device.type === DeviceType.SMOKE && (device.state.smoke === 'detected' || device.state.carbonMonoxide === 'detected')) {
        currentAlertState = true;
        alertMessage = `🔥 ${device.name}: ${device.state.smoke === 'detected' ? 'Fumaça' : 'CO'} detectado!`;
        alertType = 'alert';
      } else if (device.type === DeviceType.LOCK && device.state.isLocked === false) {
        currentAlertState = true;
        alertMessage = `🔓 ${device.name}: Destrancada`;
        alertType = 'warning';
      }
      
      // Create notification only when state changes to alert
      if (currentAlertState && prevState === false) {
        addNotification({ deviceId: device.id, type: alertType, message: alertMessage });
        setNotifications(getNotifications());
      }
      
      prevSensorStates.current[device.id] = currentAlertState;
    });
  }, [state.devices]);

  // Close Menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);
  const pausePolling = (ms = 4000) => {
  pollingPaused.current = true;
  if (pollingPauseTimer.current) clearTimeout(pollingPauseTimer.current);
  pollingPauseTimer.current = setTimeout(() => {
    pollingPaused.current = false;
  }, ms);
};

  const loadRealDevices = async (silent = false) => {
    if (!silent) setLoading(true);
    const devices = await fetchHubitatDevices();
    const customDevices = getCustomDevices();
    
    if (devices) {
      setIsOffline(false);
      // Merge: Hubitat Devices + Custom Virtual Devices
      // We prioritize real devices if ID conflicts (unlikely given naming)
      const mergedDevices = { ...devices };
      Object.keys(customDevices).forEach(key => {
          if (!mergedDevices[key]) {
              mergedDevices[key] = customDevices[key];
          }
      });

      setState(prev => ({
        ...prev,
        devices: mergedDevices
      }));
      if (!silent) setLoading(false);
      return true;
    } else {
      // Offline: keep mocks or custom
      if (silent) setIsOffline(true);
      if (!silent) setLoading(false);
      return false;
    }
  };

  // --- Derived State ---
  const currentRoom = useMemo(() => 
    state.rooms.find(r => r.id === state.currentRoomId), 
  [state.currentRoomId, state.rooms]);

  const activeDevicesCount = useMemo(() => 
    Object.values(state.devices).filter((d: Device) => d.state.isOn).length,
  [state.devices]);

  const allDevices = useMemo(() => Object.values(state.devices) as Device[], [state.devices]);

  // --- Background Logic ---
  const getDefaultBackgroundImage = (target: string) => {
      if (target === 'scenes') return 'https://images.unsplash.com/photo-1528109966604-5a6a4a964e8d?auto=format&fit=crop&w=1920&q=80';
      if (target === 'devices') return 'https://images.unsplash.com/photo-1518112390430-f4ab02e9c2c8?auto=format&fit=crop&w=1920&q=80'; // Unified Devices BG
      if (target === 'media') return 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=1920&q=80';
      if (target === 'rooms') return 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1920&q=80';
      if (target === 'settings') return 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80';
      return 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1920&q=80'; // Home
  };

  const getActiveBackgroundImage = () => {
      if (customBackgrounds[activeTab]) {
          return customBackgrounds[activeTab];
      }
      return getDefaultBackgroundImage(activeTab);
  };

  const getRoomImage = (room: Room) => {
      if (customRoomImages[room.id]) {
          return customRoomImages[room.id];
      }
      return room.image;
  };

  // Helper para formatar backgroundImage (suporta gradientes CSS e URLs)
  // Quando é URL, adiciona gradiente como fallback (aparece se imagem não carregar)
  const formatBgImage = (imageOrGradient: string) => {
      if (!imageOrGradient) return OFFLINE_GRADIENTS.default;
      // Se começa com linear-gradient, radial-gradient, etc - usar diretamente
      if (imageOrGradient.startsWith('linear-gradient') || 
          imageOrGradient.startsWith('radial-gradient') ||
          imageOrGradient.startsWith('conic-gradient')) {
          return imageOrGradient;
      }
      // Se é URL (http/https ou data:), adiciona gradiente como fallback
      // CSS multiple backgrounds: imagem na frente, gradiente atrás
      return `url(${imageOrGradient}), ${OFFLINE_GRADIENTS.default}`;
  };

  // --- Handlers ---
  const handleRoomSelect = (roomId: string) => {
    setState(prev => ({ ...prev, currentRoomId: roomId }));
  };

  const handleBackToHome = () => {
    setState(prev => ({ ...prev, currentRoomId: null }));
  };

  const handleDeviceUpdate = (deviceId: string, newState: Partial<Device['state']>) => {
    setState(prev => ({
      ...prev,
      devices: {
        ...prev.devices,
        [deviceId]: {
          ...prev.devices[deviceId],
          state: {
            ...prev.devices[deviceId].state,
            ...newState
          }
        }
      }
    }));
  };

  const handleTestConnection = async () => {
    setConnectionStatus({ status: 'testing', message: 'Verificando...' });
    const result = await testConnection(configForm);
    if (result.success) {
        setConnectionStatus({ status: 'success', message: result.message });
        setIsOffline(false);
    } else {
        setConnectionStatus({ status: 'error', message: result.message });
    }
  };

  const handleSaveSettings = async () => {
    console.log('[Lumina] Saving config:', JSON.stringify(configForm));
    saveConfig(configForm);
    console.log('[Lumina] Saved! Verify:', localStorage.getItem('lumina_hubitat_config'));
    
    if (configForm.enableLock === false) {
        setIsLocked(false);
    }
    
    // Check Registration on Save
    if (configForm.accessToken) {
        const registered = isAppRegistered(configForm.accessToken);
        setIsRegistered(registered);
        if (!registered) {
            setInstallId(generateInstallId(configForm.accessToken));
            setShowRegistrationModal(true);
            setConnectionStatus({ status: 'idle' }); // Don't connect if not registered
            return;
        }
    }

    setConnectionStatus({ status: 'testing', message: 'Salvando e conectando...' });
    const success = await loadRealDevices();
    if (success) {
        setConnectionStatus({ status: 'success', message: 'Conectado com sucesso!' });
    } else {
        setConnectionStatus({ status: 'error', message: 'Salvo, mas sem conexão.' });
    }
  };

  const handleSwitchToHttp = () => {
    const httpUrl = window.location.href.replace('https:', 'http:');
    window.location.href = httpUrl;
  };

  // Sync Handlers
  const handleCloudUpload = async () => {
      setSyncStatus('Otimizando...');
      const result = await syncToHubitat('LuminaData');
      setSyncStatus(result.message);
      setTimeout(() => setSyncStatus(''), 8000);
  };

  const handleCloudDownload = async () => {
      setSyncStatus('Baixando...');
      const result = await syncFromHubitat('LuminaData');
      setSyncStatus(result.message);
      if (result.success) {
          // Reload State
          setState(prev => ({ ...prev, rooms: getSavedRooms() || MOCK_ROOMS }));
          setCustomBackgrounds(getBackgroundMapping());
          setCustomRoomImages(getRoomImageMapping());
          setLayouts(getLayouts());
          loadRealDevices();
      }
      setTimeout(() => setSyncStatus(''), 5000);
  };

  const handleGenerateBackup = () => {
      setBackupJson(exportFullConfig());
      setShowBackupModal(true);
  };

  const handleImportBackup = () => {
      if (!backupJson) return;
      const success = importFullConfig(backupJson);
      if (success) {
          alert('Backup restaurado com sucesso!');
          setShowBackupModal(false);
          // Reload State
          setState(prev => ({ ...prev, rooms: getSavedRooms() || MOCK_ROOMS }));
          setCustomBackgrounds(getBackgroundMapping());
          setCustomRoomImages(getRoomImageMapping());
          setLayouts(getLayouts());
          loadRealDevices();
      } else {
          alert('Erro ao restaurar backup. Verifique o formato do JSON.');
      }
  };

  // Grid Layout Handler - Modified to support Sections
  const handleLayoutChange = (newLayout: GridItem[], sectionKey?: string) => {
      // If we are in a room, the key is room_ID.
      // If we are in the 'devices' tab, we need separate keys for sub-sections.
      let layoutKey = state.currentRoomId ? `room_${state.currentRoomId}` : activeTab;
      
      if (!state.currentRoomId && sectionKey) {
          layoutKey = `${activeTab}_${sectionKey}`;
      }

      const updatedLayouts = { ...layouts, [layoutKey]: newLayout };
      setLayouts(updatedLayouts);
      saveLayouts(updatedLayouts);
      triggerAutoSave();
  };

  const generateDefaultLayout = (devices: any[], keyPrefix: string) => {
      return devices.map((d, index) => ({
          i: d.id || `${keyPrefix}_${index}`,
          x: (index % 4) * 1, // Standard 4 columns
          y: Math.floor(index / 4),
          w: 1,
          h: (d.type === DeviceType.AC || d.type === DeviceType.AVR || d.type === DeviceType.TV || d.type === DeviceType.IR_REMOTE) ? 2 : 1 // Remotes are taller
      }));
  };

  const handleRoomAssignmentChange = (deviceId: string, newRoomId: string) => {
     setState(prev => ({
         ...prev,
         devices: {
             ...prev.devices,
             [deviceId]: { ...prev.devices[deviceId], roomId: newRoomId }
         }
     }));
     const currentMapping = getDeviceMapping();
     currentMapping[deviceId] = newRoomId;
     saveDeviceMapping(currentMapping);
     triggerAutoSave();
  };

  const handleDuplicateDevice = (device: Device) => {
    const newId = `${device.id}_copy_${Date.now()}`;
    const newDevice: Device = {
        ...device,
        id: newId,
        name: `${device.name} (Cópia)`,
    };
    setState(prev => ({
        ...prev,
        devices: { ...prev.devices, [newId]: newDevice }
    }));
    const currentMapping = getDeviceMapping();
    currentMapping[newId] = device.roomId;
    saveDeviceMapping(currentMapping);
    
    if (newId.startsWith('virtual_')) saveCustomDevice(newDevice);
    triggerAutoSave();
  };

  const handleDeleteDevice = (deviceId: string) => {
    // If it's a virtual device, completely remove it
    if (deviceId.startsWith('virtual_')) {
        if(confirm('Excluir este dispositivo virtual permanentemente?')) {
            const newDevices = { ...state.devices };
            delete newDevices[deviceId];
            setState(prev => ({ ...prev, devices: newDevices }));
            removeCustomDevice(deviceId);
            triggerAutoSave();
        }
    } else {
        // Just hide it
        handleRoomAssignmentChange(deviceId, 'hidden');
    }
  };

  const handleAssignAction = (deviceId: string, targetId: string) => {
      setState(prev => ({
        ...prev,
        devices: {
            ...prev.devices,
            [deviceId]: {
                ...prev.devices[deviceId],
                targetDeviceId: targetId === 'none' ? undefined : targetId
            }
        }
      }));
      const currentMapping = getActionMapping();
      if (targetId === 'none') {
          delete currentMapping[deviceId];
      } else {
          currentMapping[deviceId] = targetId;
      }
      saveActionMapping(currentMapping);
      triggerAutoSave();
  };

  const handleRenameDevice = (deviceId: string, newName: string) => {
      setState(prev => ({
          ...prev,
          devices: {
              ...prev.devices,
              [deviceId]: {
                  ...prev.devices[deviceId],
                  name: newName
              }
          }
      }));
      const currentMapping = getNameMapping();
      currentMapping[deviceId] = newName;
      saveNameMapping(currentMapping);
      
      // Update custom storage if needed
      if(deviceId.startsWith('virtual_')) {
          const d = state.devices[deviceId];
          if(d) saveCustomDevice({ ...d, name: newName });
      }
      triggerAutoSave();
  };

  // --- Virtual Device Creation ---
  const handleAddVirtualDevice = (type: DeviceType, targetRoomId?: string) => {
      const roomId = targetRoomId || state.currentRoomId || state.rooms[0]?.id;
      
      if (!roomId) {
          alert("Crie um ambiente primeiro!");
          return;
      }
      
      const newId = `virtual_${type.toLowerCase()}_${Date.now()}`;
      let name = 'Novo Dispositivo';
      let initialState = { isOn: false, level: 0 };
      
      if (type === DeviceType.BLIND) {
          name = 'Nova Persiana';
          initialState = { isOn: false, level: 0, windowShade: 'closed' } as any;
      } else if (type === DeviceType.TV) {
          name = 'Nova TV';
      } else if (type === DeviceType.AC) {
          name = 'Novo Ar Condicionado';
          initialState = { isOn: false, mode: 'off', setpoint: 24, temperature: 24, fanMode: 'auto' } as any;
      } else if (type === DeviceType.AVR) {
          name = 'Novo Receiver';
      } else if (type === DeviceType.LOCK) {
          name = 'Nova Fechadura';
          initialState = { isOn: false, isLocked: true } as any;
      } else if (type === DeviceType.MOTION) {
          name = 'Novo Sensor de Movimento';
          initialState = { isOn: false, motion: 'inactive' } as any;
      } else if (type === DeviceType.PRESENCE) {
          name = 'Novo Sensor de Presença';
          initialState = { isOn: false, presence: 'not present' } as any;
      } else if (type === DeviceType.WATER) {
          name = 'Novo Sensor de Inundação';
          initialState = { isOn: false, water: 'dry' } as any;
      } else if (type === DeviceType.SMOKE) {
          name = 'Novo Sensor de Fumaça';
          initialState = { isOn: false, smoke: 'clear' } as any;
      }

      const newDevice: Device = {
          id: newId,
          hubitatId: newId,
          name: name,
          type: type,
          roomId: roomId,
          state: initialState
      };

      // 1. Calculate Grid Position to ensure it appears
      // Determine layout key based on context
      let layoutKey = '';
      if (state.currentRoomId) {
          layoutKey = `room_${state.currentRoomId}`;
      } else if (activeTab === 'devices') {
          if (type === DeviceType.AC || type === DeviceType.THERMOSTAT) layoutKey = 'devices_climate';
          else if (type === DeviceType.BLIND) layoutKey = 'devices_blinds';
          else if (type === DeviceType.LOCK || type === DeviceType.WATER || type === DeviceType.SMOKE || type === DeviceType.MOTION || type === DeviceType.PRESENCE) layoutKey = 'devices_security';
      } else if (activeTab === 'media') {
          layoutKey = 'media';
      }

      if (layoutKey) {
          const currentLayout = layouts[layoutKey] || [];
          const maxY = currentLayout.length > 0 ? Math.max(...currentLayout.map(i => i.y + i.h)) : 0;
          
          const newItem: GridItem = {
              i: newId,
              x: 0,
              y: maxY,
              w: 1,
              h: (type === DeviceType.AC || type === DeviceType.TV || type === DeviceType.AVR || type === DeviceType.IR_REMOTE) ? 2 : 1
          };

          const newLayouts = {
              ...layouts,
              [layoutKey]: [...currentLayout, newItem]
          };
          setLayouts(newLayouts);
          saveLayouts(newLayouts);
      }

      // 3. Save Device
      setState(prev => ({
          ...prev,
          devices: { ...prev.devices, [newId]: newDevice }
      }));

      // 4. Save Mapping & Persist
      const mapping = getDeviceMapping();
      mapping[newId] = roomId;
      saveDeviceMapping(mapping);
      saveCustomDevice(newDevice);
      triggerAutoSave();

      setShowMenu(false);
  };


  const handleAddRoom = () => {
    if (!newRoomName.trim()) return;
    const newRoom: Room = {
        id: `room_${Date.now()}`,
        name: newRoomName.trim(),
        image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1920&q=80',
        deviceIds: []
    };
    const updatedRooms = [...state.rooms, newRoom];
    setState(prev => ({ ...prev, rooms: updatedRooms }));
    saveRooms(updatedRooms);
    setNewRoomName('');
    triggerAutoSave();
  };

  const handleDeleteRoom = (roomId: string) => {
    if (confirm('Tem certeza? Dispositivos neste ambiente ficarão ocultos.')) {
        const updatedRooms = state.rooms.filter(r => r.id !== roomId);
        setState(prev => ({ ...prev, rooms: updatedRooms }));
        saveRooms(updatedRooms);
        triggerAutoSave();
    }
  };

  const [importingRooms, setImportingRooms] = useState(false);
  const handleImportRooms = async () => {
    if (!getConfig()) {
      alert('Configure a conexão com o Hubitat primeiro!');
      return;
    }
    if (!confirm('Importar ambientes do Hubitat? Isso criará novos ambientes baseados nos rooms configurados no seu hub.')) return;
    setImportingRooms(true);
    try {
      // 1. Buscar rooms do Hubitat
      const hubitatData = await fetchHubitatRooms();
      if (!hubitatData || hubitatData.rooms.length === 0) {
        alert('❌ Nenhum room encontrado no Hubitat.\n\nVerifique se seus dispositivos têm rooms atribuídos no Hubitat.');
        return;
      }
      
      // 2. Importar rooms
      const { newRooms, updatedDeviceMapping } = await importRoomsFromHubitat(
        hubitatData.rooms,
        hubitatData.deviceRoomMap,
        state.rooms
      );
      
      if (newRooms.length === 0) {
        alert('ℹ️ Todos os ambientes do Hubitat já existem no Lumina.');
        return;
      }
      
      // 3. Atualizar estado
      const allRooms = [...state.rooms, ...newRooms];
      setState(prev => ({ ...prev, rooms: allRooms }));
      saveRooms(allRooms);
      saveDeviceMapping(updatedDeviceMapping);
      triggerAutoSave();
      
      const devicesMapped = Object.keys(updatedDeviceMapping).length;
      alert(`✅ Importação concluída!\n\n🏠 Ambientes criados: ${newRooms.length}\n📱 Dispositivos mapeados: ${devicesMapped}`);
    } catch (e: any) {
      alert(`Erro ao importar: ${e.message}`);
    } finally {
      setImportingRooms(false);
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'image/png') { alert('Por favor, envie apenas imagens PNG.'); return; }
      const reader = new FileReader();
      reader.onloadend = () => { const result = reader.result as string; setCustomLogo(result); saveLogo(result); };
      reader.readAsDataURL(file);
    }
  };
  const handleRemoveLogo = () => { setCustomLogo(null); saveLogo(null); };

  // v1.6 Premium: Favorites Handler
  const handleToggleFavorite = (deviceId: string) => {
    const currentFavorites = [...favorites];
    const existingIndex = currentFavorites.findIndex(f => f.deviceId === deviceId);
    
    if (existingIndex >= 0) {
      // Remove from favorites
      currentFavorites.splice(existingIndex, 1);
    } else {
      // Add to favorites (max 5)
      if (currentFavorites.length >= 5) {
        alert('Máximo de 5 favoritos. Remova um antes de adicionar outro.');
        return;
      }
      currentFavorites.push({ deviceId, order: currentFavorites.length });
    }
    
    setFavorites(currentFavorites);
    saveFavorites(currentFavorites);
    triggerAutoSave();
  };

  const isFavorite = (deviceId: string) => favorites.some(f => f.deviceId === deviceId);

  // v1.6: Reorder Favorites
  const handleMoveFavorite = (deviceId: string, direction: 'up' | 'down') => {
    const currentFavorites = [...favorites];
    const index = currentFavorites.findIndex(f => f.deviceId === deviceId);
    if (index === -1) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= currentFavorites.length) return;
    
    // Swap positions
    [currentFavorites[index], currentFavorites[newIndex]] = [currentFavorites[newIndex], currentFavorites[index]];
    
    // Update order numbers
    currentFavorites.forEach((fav, i) => fav.order = i);
    
    setFavorites(currentFavorites);
    saveFavorites(currentFavorites);
    triggerAutoSave();
  };

  // v1.6: Camera Handlers
  const handleAddCamera = (cameraData: Omit<IPCamera, 'id' | 'order'>) => {
    if (editingCamera) {
      // Editing existing camera
      updateCamera(editingCamera.id, cameraData);
      setCameras(getCameras());
      setEditingCamera(null);
      triggerAutoSave();
    } else {
      // Adding new camera
      const newCamera = addCamera(cameraData);
      if (newCamera) {
        setCameras(getCameras());
        triggerAutoSave();
      } else {
        alert('Limite de 4 câmeras atingido.');
      }
    }
  };

  const handleEditCamera = (camera: IPCamera) => {
    setEditingCamera(camera);
    setShowAddCameraModal(true);
  };

  const handleCloseAddCameraModal = () => {
    setShowAddCameraModal(false);
    setEditingCamera(null);
  };

  const handleRemoveCamera = (cameraId: string) => {
    if (confirm('Remover esta câmera?')) {
      removeCamera(cameraId);
      setCameras(getCameras());
      triggerAutoSave();
    }
  };

  // v1.6: Home Widget Handlers
  const handleAddWidget = (type: string) => {
    const defaultConfigs: Record<string, any> = {
      slideshow: { images: [], interval: 10, transition: 'fade', showCaption: false },
      qrcode: { content: '', size: 150, label: '' },
      text: { content: '', fontSize: 'md', textAlign: 'left', scrolling: false },
      video: { url: '', autoplay: false, muted: true, loop: false, showControls: true }
    };
    
    const newWidget = addHomeWidget({
      type: type as any,
      enabled: true,
      config: defaultConfigs[type] || {},
      x: 0, y: 0, w: 2, h: 2
    });
    setHomeWidgets(getHomeWidgets());
    setShowAddWidgetMenu(false);
    // Open editor immediately
    setEditingWidget({ type, widget: newWidget });
    triggerAutoSave();
  };

  const handleUpdateWidget = (widgetId: string, config: any) => {
    updateHomeWidget(widgetId, { config });
    setHomeWidgets(getHomeWidgets());
    setEditingWidget(null);
    triggerAutoSave();
  };

  const handleRemoveWidget = (widgetId: string) => {
    if (confirm('Remover este widget?')) {
      removeHomeWidget(widgetId);
      setHomeWidgets(getHomeWidgets());
      triggerAutoSave();
    }
  };

  const handleCitySearch = async () => {
      if (!citySearchQuery || citySearchQuery.length < 3) return;
      setIsSearchingCity(true);
      const results = await searchCity(citySearchQuery);
      setCitySearchResults(results);
      setIsSearchingCity(false);
  };

  const handleSelectCity = (city: any) => {
      const newConfig: WeatherConfig = {
          city: city.name,
          lat: city.latitude,
          lon: city.longitude
      };
      setWeatherConfig(newConfig);
      saveWeatherConfig(newConfig);
      fetchWeather(newConfig.lat, newConfig.lon);
      setShowWeatherSettings(false);
      setCitySearchQuery('');
      setCitySearchResults([]);
  };

  const openRoomBgEditor = (e: React.MouseEvent, roomId: string) => {
      e.stopPropagation();
      setEditingTarget({ type: 'room', id: roomId });
      setIsImageEditorOpen(true);
      setShowMenu(false);
  };

  const openTabBgEditor = () => {
      setEditingTarget({ type: 'tab', id: activeTab });
      setIsImageEditorOpen(true);
  };

  const handleSaveImage = (imageData: string | null) => {
      if (!editingTarget) return;

      if (editingTarget.type === 'tab') {
          const newMap = { ...customBackgrounds };
          if (imageData) {
              newMap[editingTarget.id] = imageData;
          } else {
              delete newMap[editingTarget.id];
          }
          setCustomBackgrounds(newMap);
          saveBackgroundMapping(newMap);
      } else if (editingTarget.type === 'room') {
          const newMap = { ...customRoomImages };
          if (imageData) {
              newMap[editingTarget.id] = imageData;
          } else {
              delete newMap[editingTarget.id];
          }
          setCustomRoomImages(newMap);
          saveRoomImageMapping(newMap);
      }
      setIsImageEditorOpen(false);
      setEditingTarget(null);
      triggerAutoSave();
  };

  // Render Grid Wrapper
  const renderGridLayout = (devices: Device[], sectionKey?: string) => {
      // Determine the unique key for this grid layout
      let layoutKey = state.currentRoomId ? `room_${state.currentRoomId}` : activeTab;
      
      // If we are in the main tab but using subsections (like devices_climate, devices_security)
      if (!state.currentRoomId && sectionKey) {
          layoutKey = `${activeTab}_${sectionKey}`;
      }
      
      // Force default layout if saved layout is empty or doesn't match device count
      let currentLayout = layouts[layoutKey];
      if (!currentLayout || currentLayout.length === 0 || currentLayout.length < devices.length) {
          currentLayout = generateDefaultLayout(devices, layoutKey);
      }

      return (
          <ResponsiveGridLayout
              className="layout"
              layouts={{ lg: currentLayout, md: currentLayout, sm: currentLayout }}
              breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
              cols={{ lg: 4, md: 3, sm: 2, xs: 1, xxs: 1 }}
              rowHeight={180} 
              isDraggable={isEditMode}
              isResizable={isEditMode}
              onLayoutChange={(layout) => handleLayoutChange(layout, sectionKey)}
              margin={[16, 16]}
          >
              {devices.map(device => {
                  return (
                    <div key={device.id} className="relative">
                        {device.type === DeviceType.AC ? (
                             <ACRemote 
                                device={device} 
                                allDevices={allDevices}
                                rooms={state.rooms}
                                onUpdate={handleDeviceUpdate} 
                                onDuplicate={handleDuplicateDevice}
                                onRename={handleRenameDevice}
                                onAssignAction={handleRoomAssignmentChange}
                                onDelete={handleDeleteDevice}
                                onBeforeCommand={() => pausePolling(4000)}
                            />
                        ) : device.type === DeviceType.TV ? (
                            <LGRemote 
                                device={device}
                                onUpdate={handleDeviceUpdate}
                                allDevices={allDevices}
                                rooms={state.rooms}
                                onDuplicate={handleDuplicateDevice}
                                onRename={handleRenameDevice}
                                onAssignAction={handleRoomAssignmentChange}
                                onDelete={handleDeleteDevice}
                                onBeforeCommand={() => pausePolling(4000)}
                            />
                        ) : device.type === DeviceType.AVR ? (
                            <DenonRemote 
                                device={device} 
                                onUpdate={handleDeviceUpdate}
                                allDevices={allDevices}
                                rooms={state.rooms}
                                onDuplicate={handleDuplicateDevice}
                                onRename={handleRenameDevice}
                                onAssignAction={handleRoomAssignmentChange}
                                onDelete={handleDeleteDevice}
                                onBeforeCommand={() => pausePolling(4000)}
                            />
                        ) : device.type === DeviceType.CAMERA ? (
                            <CameraCard 
                                device={device}
                                onUpdate={handleDeviceUpdate}
                            />
                        ) : device.type === DeviceType.ENERGY ? (
                            <EnergyCard 
                                device={device}
                                onUpdate={handleDeviceUpdate}
                            />
                        ) : (
                            <DeviceControl 
                                device={device} 
                                allDevices={allDevices}
                                onUpdate={handleDeviceUpdate} 
                                onDuplicate={handleDuplicateDevice}
                                onDelete={handleDeleteDevice}
                                onAssignAction={handleAssignAction}
                                onRename={handleRenameDevice}
                                onBeforeCommand={() => pausePolling(4000)}
                                className="h-full"
                                
                            />
                        )}
                    </div>
                  );
              })}
          </ResponsiveGridLayout>
      );
  };

  // --- Views Helpers ---
  const renderHeader = (title: string, subtitle?: string, actions?: React.ReactNode) => (
    <div className="flex justify-between items-end mb-8">
        <div>
            <h1 className="text-3xl font-extralight tracking-tight mb-2 drop-shadow-md">{title}</h1>
            {subtitle && (
                <p className="text-white/80 text-sm flex items-center gap-2 drop-shadow-md font-medium">
                    {subtitle}
                </p>
            )}
        </div>
        <div className="flex flex-col items-end gap-1">
            {actions && <div className="mb-2">{actions}</div>}
            {loading && <div className="text-xs text-white/50 animate-pulse">Atualizando...</div>}
            {isOffline && !loading && (
                <div className="flex items-center gap-1.5 text-red-400 bg-red-500/10 px-2 py-1 rounded-md border border-red-500/20">
                    <WifiOff size={12} />
                    <span className="text-[10px] uppercase font-bold tracking-wider">Offline</span>
                </div>
            )}
        </div>
    </div>
  );

  // --- 0. BLOCK SCREEN (MAINTENANCE MODE) ---
  if (BLOCK_ACCESS) {
      return (
          <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
               {/* Ambient Background */}
               <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1635002962487-2c1d4319639f?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20" />
               <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
               <GlassCard className="w-full max-w-md p-8 text-center flex flex-col items-center gap-6 relative z-10 bg-black/60 border-red-500/20 shadow-2xl">
                   <div className="p-4 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 drop-shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                       <Ban size={48} strokeWidth={1.5} />
                   </div>
                   <div>
                       <h1 className="text-2xl font-light text-white mb-3 tracking-widest uppercase">Acesso Bloqueado</h1>
                       <p className="text-white/50 text-xs leading-relaxed max-w-[280px] mx-auto">O acesso a este dashboard foi temporariamente suspenso.</p>
                   </div>
                   <div className="h-1 w-20 bg-red-500/20 rounded-full mt-2" />
               </GlassCard>
          </div>
      )
  }

  const handleRegistration = () => {
      // Validate using the service
      if (validateLicense(configForm.accessToken, registrationKey)) {
          saveLicense(registrationKey);
          setIsRegistered(true);
          setShowRegistrationModal(false);
          alert('Lumina Registrado com Sucesso!');
          // If we were in the middle of saving settings, we might want to continue, 
          // but usually registration happens on load or when settings change.
      } else {
          alert('Chave de Ativação Inválida.');
      }
  };

  // --- 0.4 REGISTRATION MODAL ---
  if (showRegistrationModal) {
      return (
          <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-4">
              <GlassCard className="w-full max-w-md bg-zinc-900 border-white/10 p-8 flex flex-col gap-6 items-center text-center">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-2">
                      <Shield size={32} className="text-blue-400" />
                  </div>
                  <div>
                      <h2 className="text-2xl font-light text-white mb-2">Ativação Necessária</h2>
                      <p className="text-xs text-white/50">Esta cópia do Lumina Dashboard precisa ser ativada.</p>
                  </div>
                  
                  <div className="w-full bg-black/50 p-4 rounded-lg border border-white/5">
                      <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2">Seu ID de Instalação</p>
                      <p className="text-xl font-mono text-blue-300 tracking-wider select-all cursor-pointer" onClick={() => navigator.clipboard.writeText(installId)} title="Clique para copiar">{installId}</p>
                  </div>

                  <div className="w-full text-left">
                      <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2">Chave de Ativação</p>
                      <input 
                          type="text" 
                          value={registrationKey}
                          onChange={(e) => setRegistrationKey(e.target.value.toUpperCase())}
                          placeholder="XXXX-XXXX-XXXX-XXXX"
                          className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-center text-white font-mono text-lg focus:outline-none focus:border-blue-500/50 uppercase"
                      />
                  </div>

                  <button 
                      onClick={handleRegistration}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-colors uppercase tracking-widest text-xs"
                  >
                      Ativar Sistema
                  </button>
                  
                  <p className="text-[9px] text-white/20 mt-4">
                      Envie o ID de Instalação para o suporte para receber sua chave.
                  </p>
              </GlassCard>
          </div>
      )
  }

  // --- 0.5 LOCK SCREEN (SECURITY) ---
  if (isLocked) {
      return <AuthLock onUnlock={() => setIsLocked(false)} />;
  }

  // --- Main Content Renderer ---
  const renderContent = () => {
    // 1. Home View (v1.6 Premium - with Favorites and Energy Summary)
    if (activeTab === 'home') {
        // Get energy devices for summary
        const energyDevices = allDevices.filter(d => d.type === DeviceType.ENERGY);
        const totalPower = energyDevices.reduce((sum, d) => sum + (d.state.power || 0), 0);
        
        return (
            <div className="flex flex-col items-center w-full animate-in fade-in duration-700 pt-8">
                {/* Favorites Bar (v1.6 Premium) */}
                {favorites.length > 0 && (
                    <div className="w-full max-w-4xl px-4 mb-8">
                        <FavoritesBar 
                            favorites={favorites}
                            devices={state.devices}
                            onDeviceUpdate={handleDeviceUpdate}
                        />
                    </div>
                )}

                {/* Clock & Date */}
                <div className="flex flex-col items-center justify-center flex-1 gap-8">
                    <div className="text-center relative">
                       <h1 className="text-5xl md:text-7xl font-thin tracking-tighter text-white drop-shadow-2xl">
                         {currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                       </h1>
                       <div className="flex items-center justify-center gap-2 mt-2">
                            <div className="h-px w-6 bg-white/30" />
                            <p className="text-xs font-light text-white/80 tracking-[0.2em] uppercase">
                                {currentTime.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                            </p>
                            <div className="h-px w-6 bg-white/30" />
                       </div>
                       <p className="mt-4 text-[10px] text-white/50 font-light">
                           {activeDevicesCount} dispositivos ativos
                       </p>
                    </div>

                    {/* Weather Widget (Home) */}
                    {weatherData && (
                        <div 
                            onClick={() => setShowWeatherSettings(true)}
                            className="flex items-center gap-4 px-6 py-3 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 cursor-pointer hover:bg-white/10 transition-all"
                        >
                            {(() => {
                                const info = getWeatherInfo(weatherData.current.code, weatherData.current.isDay);
                                const WeatherIcon = info.icon;
                                return (
                                    <>
                                        <WeatherIcon size={32} className={`${info.color} drop-shadow-lg`} strokeWidth={1.5} />
                                        <div className="flex flex-col">
                                            <span className="text-2xl font-light tracking-tight leading-none">
                                                {weatherData.current.temperature}°
                                            </span>
                                            <span className="text-[9px] uppercase tracking-widest text-white/50 mt-0.5">
                                                {info.label}
                                            </span>
                                        </div>
                                        <div className="h-8 w-px bg-white/10 mx-2" />
                                        <div className="flex flex-col items-start">
                                            <span className="text-xs font-medium">{weatherConfig?.city || '--'}</span>
                                            <div className="flex gap-2 text-[10px] text-white/40">
                                                <span>↑ {weatherData.daily[0]?.max}°</span>
                                                <span>↓ {weatherData.daily[0]?.min}°</span>
                                            </div>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    )}

                    {/* Energy Summary Widget (v1.6 Premium) */}
                    {energyDevices.length > 0 && totalPower > 0 && (
                        <div className="flex items-center gap-3 px-4 py-2 bg-white/5 backdrop-blur-lg rounded-full border border-white/10">
                            <Zap size={16} className="text-yellow-400" />
                            <span className="text-sm text-white/80">
                                {totalPower.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} W
                            </span>
                            <span className="text-[10px] text-white/40">consumo atual</span>
                        </div>
                    )}
                </div>
                
                {/* v1.6: IP Cameras Grid */}
                {cameras.length > 0 && (
                    <div className="w-full max-w-6xl px-4 mt-8">
                        <div className="flex items-center gap-2 mb-4">
                            <Camera size={16} className="text-blue-400" />
                            <h3 className="text-sm font-medium text-white/80">Câmeras</h3>
                        </div>
                        <div className={`grid gap-4 ${cameras.length === 1 ? 'grid-cols-1 max-w-md mx-auto' : cameras.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2'}`}>
                            {cameras.map(cam => (
                                <CameraCard 
                                    key={cam.id} 
                                    camera={cam} 
                                    compact={cameras.length > 2}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* v1.6: Home Widgets Grid */}
                {homeWidgets.length > 0 && (
                    <div className="w-full max-w-6xl px-4 mt-8">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <LayoutTemplate size={16} className="text-purple-400" />
                                <h3 className="text-sm font-medium text-white/80">Widgets</h3>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {homeWidgets.map(widget => (
                                <div key={widget.id} className="relative group h-48">
                                    {widget.type === 'slideshow' && (
                                        <SlideshowWidget 
                                            config={widget.config as SlideshowConfig}
                                            onEdit={() => setEditingWidget({ type: 'slideshow', widget })}
                                        />
                                    )}
                                    {widget.type === 'qrcode' && (
                                        <QRCodeWidget 
                                            config={widget.config as QRCodeConfig}
                                            onEdit={() => setEditingWidget({ type: 'qrcode', widget })}
                                        />
                                    )}
                                    {widget.type === 'text' && (
                                        <TextWidget 
                                            config={widget.config as TextWidgetConfig}
                                            onEdit={() => setEditingWidget({ type: 'text', widget })}
                                        />
                                    )}
                                    {widget.type === 'video' && (
                                        <VideoWidget 
                                            config={widget.config as VideoWidgetConfig}
                                            onEdit={() => setEditingWidget({ type: 'video', widget })}
                                        />
                                    )}
                                    {/* Delete button */}
                                    <button
                                        onClick={() => handleRemoveWidget(widget.id)}
                                        className="absolute top-2 left-2 p-1.5 bg-red-500/80 hover:bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all z-20"
                                    >
                                        <Trash2 size={12} className="text-white" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Add Widget Button */}
                <div className="w-full max-w-6xl px-4 mt-8 pb-24">
                    <div className="relative">
                        <button
                            onClick={() => setShowAddWidgetMenu(!showAddWidgetMenu)}
                            className="w-full py-4 border-2 border-dashed border-white/20 hover:border-white/40 rounded-2xl flex items-center justify-center gap-2 text-white/40 hover:text-white/60 transition-all"
                        >
                            <Plus size={20} />
                            <span className="text-sm">Adicionar Widget</span>
                        </button>
                        
                        {/* Widget Type Menu */}
                        {showAddWidgetMenu && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-900/95 border border-white/10 backdrop-blur-xl rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                                <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white/40 border-b border-white/5">
                                    Escolha o tipo
                                </div>
                                <button
                                    onClick={() => handleAddWidget('slideshow')}
                                    className="w-full text-left px-4 py-3 text-sm text-white hover:bg-white/10 flex items-center gap-3"
                                >
                                    <ImageIcon size={18} className="text-blue-400" />
                                    <div>
                                        <div className="font-medium">Slideshow</div>
                                        <div className="text-[10px] text-white/40">Fotos rotativas com transição</div>
                                    </div>
                                </button>
                                <button
                                    onClick={() => handleAddWidget('video')}
                                    className="w-full text-left px-4 py-3 text-sm text-white hover:bg-white/10 flex items-center gap-3"
                                >
                                    <Tv size={18} className="text-red-400" />
                                    <div>
                                        <div className="font-medium">Vídeo</div>
                                        <div className="text-[10px] text-white/40">YouTube embed</div>
                                    </div>
                                </button>
                                <button
                                    onClick={() => handleAddWidget('qrcode')}
                                    className="w-full text-left px-4 py-3 text-sm text-white hover:bg-white/10 flex items-center gap-3"
                                >
                                    <Grid size={18} className="text-green-400" />
                                    <div>
                                        <div className="font-medium">QR Code</div>
                                        <div className="text-[10px] text-white/40">Gerador de QR Code</div>
                                    </div>
                                </button>
                                <button
                                    onClick={() => handleAddWidget('text')}
                                    className="w-full text-left px-4 py-3 text-sm text-white hover:bg-white/10 flex items-center gap-3"
                                >
                                    <LayoutDashboard size={18} className="text-yellow-400" />
                                    <div>
                                        <div className="font-medium">Texto</div>
                                        <div className="text-[10px] text-white/40">Notas e avisos</div>
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // 2. Rooms View
    if (activeTab === 'rooms') {
        return (
            <>
                {renderHeader("Ambientes", "Gerencie sua casa por cômodo")}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20 overflow-y-auto custom-scrollbar animate-in slide-in-from-bottom-4 duration-500">
                    {state.rooms.map((room) => {
                        const activeInRoom = (Object.values(state.devices) as Device[])
                            .filter(d => d.roomId === room.id && d.state.isOn)
                            .length;
                        
                        const bgImage = getRoomImage(room);

                        return (
                            <div 
                                key={room.id}
                                onClick={() => handleRoomSelect(room.id)}
                                className="group relative h-64 rounded-3xl overflow-hidden cursor-pointer border border-white/20 shadow-2xl transition-transform duration-500 hover:scale-[1.01]"
                            >
                                <div 
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                    style={{ backgroundImage: formatBgImage(bgImage) }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                                <button
                                    onClick={(e) => openRoomBgEditor(e, room.id)}
                                    className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white/50 hover:text-white transition-all opacity-0 group-hover:opacity-100 z-20 border border-white/10"
                                >
                                    <PenLine size={14} />
                                </button>
                                <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-between items-end">
                                    <div>
                                        <h3 className="text-xl font-medium tracking-wide mb-1 group-hover:text-white transition-colors text-white/90 drop-shadow-md">
                                            {room.name}
                                        </h3>
                                        <p className="text-white/80 text-xs drop-shadow-md">
                                            {activeInRoom > 0 ? `${activeInRoom} Ativos` : 'Tudo desligado'}
                                        </p>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-4 group-hover:translate-y-0 duration-300">
                                        <ArrowLeft className="rotate-180" size={18} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </>
        );
    }

    // 3. Scenes
    if (activeTab === 'scenes') {
        const scenes = allDevices.filter(d => d.type === DeviceType.SCENE && d.roomId !== 'hidden');
        return <>{renderHeader("Cenas")}{renderGridLayout(scenes)}</>;
    }

    // 4. UNIFIED DEVICES TAB (Climate + Security + Blinds + Cameras + Energy)
    if (activeTab === 'devices') {
        const climateDevices = allDevices.filter(d => (d.type === DeviceType.THERMOSTAT || d.type === DeviceType.AC) && d.roomId !== 'hidden');
        const blindDevices = allDevices.filter(d => d.type === DeviceType.BLIND && d.roomId !== 'hidden');
        const securityDevices = allDevices.filter(d => (d.type === DeviceType.LOCK || d.type === DeviceType.MOTION || d.type === DeviceType.PRESENCE || d.type === DeviceType.WATER || d.type === DeviceType.SMOKE) && d.roomId !== 'hidden');
        // v1.6 Premium: Cameras and Energy
        const cameraDevices = allDevices.filter(d => d.type === DeviceType.CAMERA && d.roomId !== 'hidden');
        const energyDevices = allDevices.filter(d => d.type === DeviceType.ENERGY && d.roomId !== 'hidden');
        
        const currentWeatherInfo = weatherData ? getWeatherInfo(weatherData.current.code, weatherData.current.isDay) : { icon: Sun, label: '--', color: 'text-white' };
        const CurrentIcon = currentWeatherInfo.icon;

        return (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
                {renderHeader("Dispositivos", "Controle Centralizado", (
                    <div className="relative">
                        <button 
                            onClick={() => setShowMenu(!showMenu)} 
                            className={`p-2 rounded-full backdrop-blur-lg border transition-colors ${showMenu ? 'bg-white/20 text-white border-white/30' : 'bg-white/10 border-white/10 hover:bg-white/20'}`}
                        >
                            <Settings size={20} />
                        </button>
                        {showMenu && (
                            <div ref={menuRef} className="absolute top-12 right-0 w-56 bg-black/90 border border-white/10 backdrop-blur-xl rounded-lg shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white/40 border-b border-white/5">Adicionar Dispositivo</div>
                                <button 
                                    onClick={() => handleAddVirtualDevice(DeviceType.AC)}
                                    className="w-full text-left px-4 py-3 text-xs text-white hover:bg-white/10 flex items-center gap-2"
                                >
                                    <Wind size={14} className="text-cyan-400" /> Adicionar Ar Cond.
                                </button>
                                <button 
                                    onClick={() => handleAddVirtualDevice(DeviceType.BLIND)}
                                    className="w-full text-left px-4 py-3 text-xs text-white hover:bg-white/10 flex items-center gap-2"
                                >
                                    <Blinds size={14} className="text-green-400" /> Adicionar Persiana
                                </button>
                                <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white/40 border-b border-white/5 border-t border-white/5 mt-1">Segurança</div>
                                <button 
                                    onClick={() => handleAddVirtualDevice(DeviceType.LOCK)}
                                    className="w-full text-left px-4 py-3 text-xs text-white hover:bg-white/10 flex items-center gap-2"
                                >
                                    <Lock size={14} className="text-red-400" /> Adicionar Fechadura
                                </button>
                                <button 
                                    onClick={() => handleAddVirtualDevice(DeviceType.MOTION)}
                                    className="w-full text-left px-4 py-3 text-xs text-white hover:bg-white/10 flex items-center gap-2"
                                >
                                    <Shield size={14} className="text-yellow-400" /> Adicionar Sensor Mov.
                                </button>
                                <button 
                                    onClick={() => handleAddVirtualDevice(DeviceType.PRESENCE)}
                                    className="w-full text-left px-4 py-3 text-xs text-white hover:bg-white/10 flex items-center gap-2"
                                >
                                    <Shield size={14} className="text-orange-400" /> Adicionar Sensor Pres.
                                </button>
                                <button 
                                    onClick={() => handleAddVirtualDevice(DeviceType.WATER)}
                                    className="w-full text-left px-4 py-3 text-xs text-white hover:bg-white/10 flex items-center gap-2"
                                >
                                    💧 Adicionar Sensor Inundação
                                </button>
                                <button 
                                    onClick={() => handleAddVirtualDevice(DeviceType.SMOKE)}
                                    className="w-full text-left px-4 py-3 text-xs text-white hover:bg-white/10 flex items-center gap-2"
                                >
                                    🔥 Adicionar Sensor Fumaça
                                </button>
                            </div>
                        )}
                    </div>
                ))}
                
                {/* Weather Widget */}
                <div className="flex justify-center mb-10">
                     <GlassCard className="flex flex-col gap-0 px-6 py-5 bg-white/5 border-white/10 rounded-3xl cursor-default backdrop-blur-md w-full max-w-xl relative overflow-visible transition-all duration-300">
                        {/* Settings Trigger */}
                        <button 
                            onClick={() => setShowWeatherSettings(!showWeatherSettings)}
                            className="absolute top-4 right-4 text-white/20 hover:text-white transition-colors z-20"
                        >
                            <Settings size={16} />
                        </button>

                        {/* Current Weather Row */}
                        <div className="flex flex-row items-center justify-between gap-5 mb-6">
                            <div className="flex items-center gap-4">
                                <CurrentIcon size={42} className={`${currentWeatherInfo.color} drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]`} strokeWidth={1.5} />
                                <div className="flex flex-col">
                                    <span className="text-4xl font-light tracking-tighter leading-none">
                                        {weatherData ? weatherData.current.temperature : '--'}°
                                    </span>
                                    <span className="text-[10px] uppercase tracking-widest text-white/60 mt-1">
                                        {currentWeatherInfo.label}
                                    </span>
                                </div>
                            </div>
                            <div className="h-10 w-px bg-white/10 hidden md:block" />
                            <div className="flex flex-col items-end md:items-start">
                                <span className="text-sm font-medium tracking-wide">{weatherConfig?.city || 'Local não definido'}</span>
                                <span className="text-[10px] text-white/40">Atualizado agora</span>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-4" />

                        {/* 5-Day Forecast Row */}
                        <div className="grid grid-cols-5 gap-2">
                            {weatherData ? weatherData.daily.map((day, i) => {
                                const info = getWeatherInfo(day.code);
                                const Icon = info.icon;
                                const isToday = i === 0;
                                return (
                                    <div key={i} className={`flex flex-col items-center gap-1 py-2 rounded-xl transition-colors ${isToday ? 'bg-white/5 border border-white/5' : ''}`}>
                                        <span className={`text-[9px] uppercase tracking-wider ${isToday ? 'text-white font-bold' : 'text-white/50'}`}>
                                            {getDayName(day.date)}
                                        </span>
                                        <Icon size={18} className={`${info.color} my-1`} />
                                        <div className="flex flex-col items-center text-[10px] leading-tight">
                                            <span className="font-medium">{day.max}°</span>
                                            <span className="text-white/40">{day.min}°</span>
                                        </div>
                                    </div>
                                )
                            }) : ([...Array(5)].map((_, i) => <div key={i} className="flex flex-col items-center gap-2 opacity-30"><div className="h-2 w-6 bg-white rounded" /><div className="h-4 w-4 bg-white rounded-full" /><div className="h-2 w-4 bg-white rounded" /></div>))}
                        </div>
                    </GlassCard>
                </div>

                {/* Climate Grid */}
                {climateDevices.length > 0 && (
                    <div className="mb-10">
                        <div className="flex items-center gap-2 mb-4 px-1 opacity-70">
                            <Wind size={16} />
                            <h2 className="text-sm font-medium uppercase tracking-widest">Climatização</h2>
                        </div>
                        {renderGridLayout(climateDevices, 'climate')}
                    </div>
                )}

                {/* Blinds Grid */}
                {blindDevices.length > 0 && (
                    <div className="mb-10">
                        <div className="flex items-center gap-2 mb-4 px-1 opacity-70">
                            <Blinds size={16} />
                            <h2 className="text-sm font-medium uppercase tracking-widest">Persianas</h2>
                        </div>
                        {renderGridLayout(blindDevices, 'blinds')}
                    </div>
                )}

                {/* Security Grid */}
                {securityDevices.length > 0 && (
                    <div className="mb-10">
                        <div className="flex items-center gap-2 mb-4 px-1 opacity-70">
                            <Shield size={16} />
                            <h2 className="text-sm font-medium uppercase tracking-widest">Segurança</h2>
                        </div>
                        {renderGridLayout(securityDevices, 'security')}
                    </div>
                )}

                {/* v1.6 Premium: Cameras Grid */}
                {cameraDevices.length > 0 && (
                    <div className="mb-10">
                        <div className="flex items-center gap-2 mb-4 px-1 opacity-70">
                            <Camera size={16} />
                            <h2 className="text-sm font-medium uppercase tracking-widest">Câmeras</h2>
                        </div>
                        {renderGridLayout(cameraDevices, 'cameras')}
                    </div>
                )}

                {/* v1.6 Premium: Energy Grid */}
                {energyDevices.length > 0 && (
                    <div className="mb-10">
                        <div className="flex items-center gap-2 mb-4 px-1 opacity-70">
                            <Zap size={16} />
                            <h2 className="text-sm font-medium uppercase tracking-widest">Energia</h2>
                        </div>
                        {renderGridLayout(energyDevices, 'energy')}
                    </div>
                )}

                {climateDevices.length === 0 && blindDevices.length === 0 && securityDevices.length === 0 && cameraDevices.length === 0 && energyDevices.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-white/30">
                        <p>Nenhum dispositivo encontrado.</p>
                        <p className="text-xs mt-1">Adicione-os nos menus de cada ambiente.</p>
                    </div>
                )}
            </div>
        );
    }

    // Media Tab
    if (activeTab === 'media') {
        const mediaDevices = allDevices.filter(d => (d.type === DeviceType.MEDIA || d.type === DeviceType.AVR || d.type === DeviceType.TV || d.type === DeviceType.IR_REMOTE) && d.roomId !== 'hidden');
        return (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
                {renderHeader("Mídia", "Áudio e Vídeo", (
                    <div className="relative">
                        <button 
                            onClick={() => setShowMenu(!showMenu)} 
                            className={`p-2 rounded-full backdrop-blur-lg border transition-colors ${showMenu ? 'bg-white/20 text-white border-white/30' : 'bg-white/10 border-white/10 hover:bg-white/20'}`}
                        >
                            <Settings size={20} />
                        </button>
                        {showMenu && (
                            <div ref={menuRef} className="absolute top-12 right-0 w-56 bg-black/90 border border-white/10 backdrop-blur-xl rounded-lg shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white/40 border-b border-white/5">Adicionar Dispositivo</div>
                                <button 
                                    onClick={() => handleAddVirtualDevice(DeviceType.TV)}
                                    className="w-full text-left px-4 py-3 text-xs text-white hover:bg-white/10 flex items-center gap-2"
                                >
                                    <Tv size={14} className="text-purple-400" /> Adicionar TV
                                </button>
                                <button 
                                    onClick={() => handleAddVirtualDevice(DeviceType.AVR)}
                                    className="w-full text-left px-4 py-3 text-xs text-white hover:bg-white/10 flex items-center gap-2"
                                >
                                    <Tv size={14} className="text-orange-400" /> Adicionar Receiver
                                </button>
                                <button 
                                    onClick={() => handleAddVirtualDevice(DeviceType.IR_REMOTE)}
                                    className="w-full text-left px-4 py-3 text-xs text-white hover:bg-white/10 flex items-center gap-2"
                                >
                                    <Tv size={14} className="text-purple-400" /> Adicionar Controle IR
                                </button>
                            </div>
                        )}
                    </div>
                ))}
                {renderGridLayout(mediaDevices)}
            </div>
        );
    }

    // 6. Settings View (No Grid needed)
    if (activeTab === 'settings') {
        // ... (Keep existing Settings Logic) ...
        // Device Manager Sub-View
        if (showDeviceManager) {
            return (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500 h-full flex flex-col">
                    <div className="flex items-center gap-4 mb-8">
                         <button onClick={() => setShowDeviceManager(false)} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"><ArrowLeft size={20} /></button>
                         <h1 className="text-2xl font-light">Gerenciar Dispositivos</h1>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar pb-20">
                         <div className="grid grid-cols-1 gap-3 max-w-3xl mx-auto">
                            {allDevices.sort((a,b) => a.name.localeCompare(b.name)).map(device => (
                                <div key={device.id} className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center justify-between hover:bg-white/10 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-white/10 rounded-lg text-white/70">{getIconForDevice(device.type, true)}</div>
                                        <div>
                                            <p className="font-medium text-sm">{device.name}</p>
                                            <p className="text-[10px] text-white/40 uppercase tracking-wider">{device.type}</p>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <select value={device.roomId || 'living'} onChange={(e) => handleRoomAssignmentChange(device.id, e.target.value)} className="appearance-none bg-black/40 border border-white/20 text-white text-xs py-2 pl-3 pr-8 rounded-lg focus:outline-none focus:border-white/50 cursor-pointer hover:bg-black/60 transition-colors w-40">
                                            <option value="hidden" className="text-gray-400">🚫 Oculto</option>
                                            <option disabled>──────────</option>
                                            {state.rooms.map(r => (<option key={r.id} value={r.id}>{r.name}</option>))}
                                        </select>
                                    </div>
                                </div>
                            ))}
                         </div>
                    </div>
                </div>
            );
        }
        if (showBackupModal) {
            return (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
                    <GlassCard className="w-full max-w-lg bg-zinc-900 border-white/10 p-6 flex flex-col gap-4">
                        <div className="flex justify-between items-center"><h2 className="text-lg font-medium flex items-center gap-2"><Settings size={18} /> Backup & Restore</h2><button onClick={() => setShowBackupModal(false)}><X size={20} /></button></div>
                        <p className="text-xs text-white/60">Copie o código abaixo para salvar em outro local, ou cole um código existente para restaurar. Este backup <strong>inclui imagens</strong> (pode ser grande).</p>
                        <textarea value={backupJson} onChange={(e) => setBackupJson(e.target.value)} className="w-full h-48 bg-black/50 border border-white/10 rounded-lg p-3 text-[10px] font-mono text-white/80 focus:outline-none focus:border-blue-500/50" />
                        <div className="flex gap-2"><button onClick={() => { navigator.clipboard.writeText(backupJson); alert('Copiado!'); }} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 py-2 rounded text-xs">Copiar</button><button onClick={handleImportBackup} className="flex-1 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-200 py-2 rounded text-xs font-bold">Restaurar</button></div>
                    </GlassCard>
                </div>
            )
        }
        return (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
                {renderHeader("Ajustes", "Configuração de conexão")}
                <div className="flex justify-center mt-6">
                    <GlassCard className="w-full max-w-lg p-8 bg-white/5 border-white/10">
                         <h2 className="text-xl font-light mb-6 flex items-center gap-2"><Zap size={20} /> Conexão Maker API</h2>
                        {isHttps && !configForm.useCloud && !window.location.hostname.includes('web.app') && !window.location.hostname.includes('firebaseapp.com') && (<div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 text-xs"><p className="flex items-center gap-2 font-bold mb-2 text-red-100"><Lock size={14} /> HTTPS Detectado</p><button onClick={handleSwitchToHttp} className="w-full bg-red-500/20 hover:bg-red-500/30 text-white border border-red-500/30 py-2 rounded px-4 transition-colors flex items-center justify-center gap-2"><Globe size={14} /> Mudar para HTTP (Recomendado)</button></div>)}
                        <div className="space-y-4 mb-6">
                            {/* CONNECTION MODE TOGGLE */}
                            <div className="flex items-center gap-2 mb-4 bg-black/20 p-1 rounded-lg border border-white/5">
                                <button 
                                    onClick={() => setConfigForm({...configForm, useCloud: false})}
                                    className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${!configForm.useCloud ? 'bg-white text-black shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                                >
                                    Local (Casa)
                                </button>
                                <button 
                                    onClick={() => setConfigForm({...configForm, useCloud: true})}
                                    className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${configForm.useCloud ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                                >
                                    Nuvem (Remoto)
                                </button>
                            </div>

                            {configForm.useCloud ? (
                                <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                                    <label className="block text-[10px] uppercase tracking-widest text-blue-300/70 mb-2 font-semibold flex justify-between">
                                        <span>Hub UUID (Cloud ID)</span>
                                        <span className="text-[9px] opacity-50">Obrigatório para acesso externo</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        value={configForm.hubUuid || ''} 
                                        onChange={e => setConfigForm({...configForm, hubUuid: e.target.value})} 
                                        placeholder="Ex: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                                        className="w-full bg-blue-900/10 border border-blue-500/30 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500/60 transition-colors text-sm font-mono" 
                                    />
                                    <p className="text-[9px] text-white/30 mt-1.5 leading-relaxed">
                                        Encontre este ID na URL "Get All Devices" (Cloud) do Maker API.<br/>
                                        Ex: https://cloud.hubitat.com/api/<strong>SEU-UUID</strong>/apps/...
                                    </p>
                                </div>
                            ) : (
                                <div className="animate-in fade-in slide-in-from-right-2 duration-300">
                                    <label className="block text-[10px] uppercase tracking-widest text-white/50 mb-2 font-semibold">Hubitat IP (Local)</label>
                                    <input 
                                        type="text" 
                                        value={configForm.hubIp} 
                                        onChange={e => setConfigForm({...configForm, hubIp: e.target.value})} 
                                        placeholder="Ex: 192.168.1.50"
                                        className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white/30 transition-colors text-sm font-mono" 
                                    />
                                </div>
                            )}

                            {/* CUSTOM API TOGGLE */}
                            <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/10 mt-4">
                                <div>
                                    <p className="text-xs font-bold text-white/80">Usar App Customizado (Groovy)</p>
                                    <p className="text-[9px] text-white/40">Para quando o Maker API não é suficiente</p>
                                </div>
                                <button 
                                    onClick={() => setConfigForm({...configForm, useLegacyApi: !configForm.useLegacyApi})}
                                    className={`w-10 h-5 rounded-full relative transition-colors ${configForm.useLegacyApi ? 'bg-green-500' : 'bg-white/20'}`}
                                >
                                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${configForm.useLegacyApi ? 'left-6' : 'left-1'}`} />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest text-white/50 mb-2 font-semibold">
                                        {configForm.useLegacyApi ? 'Custom App ID' : 'App ID (Maker API)'}
                                    </label>
                                    <input 
                                        type="text" 
                                        value={configForm.useLegacyApi ? (configForm.customAppId || '') : configForm.appId} 
                                        onChange={e => configForm.useLegacyApi ? setConfigForm({...configForm, customAppId: e.target.value}) : setConfigForm({...configForm, appId: e.target.value})} 
                                        placeholder="ID" 
                                        className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white/30 transition-colors text-sm" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest text-white/50 mb-2 font-semibold">Access Token</label>
                                    <input type="password" value={configForm.accessToken} onChange={e => setConfigForm({...configForm, accessToken: e.target.value})} placeholder="Token" className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white/30 transition-colors text-sm" />
                                </div>
                            </div>
                        </div>
                         <div className="flex flex-col gap-3 pt-2 mb-8 border-b border-white/10 pb-6"><div className="flex gap-3"><button onClick={handleTestConnection} className="flex-1 bg-white/10 text-white text-xs py-3 rounded-lg hover:bg-white/20">Testar</button><button onClick={handleSaveSettings} className="flex-1 bg-white text-black font-bold text-xs py-3 rounded-lg hover:bg-white/90">Salvar</button></div><div className={`text-center text-xs py-3 rounded-lg border font-medium flex items-center justify-center gap-2 transition-all duration-300 ${connectionStatus.status === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-200' : connectionStatus.status === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-200' : connectionStatus.status === 'testing' ? 'bg-blue-500/10 border-blue-500/20 text-blue-200' : 'opacity-0 h-0 py-0 overflow-hidden border-0'}`}>{connectionStatus.status === 'testing' && <RefreshCcw size={12} className="animate-spin" />}{connectionStatus.status === 'success' && <CheckCircle size={14} />}{connectionStatus.status === 'error' && <AlertTriangle size={14} />}{connectionStatus.message}</div></div>
                        <div className="space-y-4 mb-8 border-b border-white/10 pb-8">
                            <h2 className="text-xl font-light flex items-center gap-2"><Shield size={20} /> Segurança</h2>
                            <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/10">
                                <div>
                                    <p className="text-xs font-bold text-white/80">Lumina Lock</p>
                                    <p className="text-[9px] text-white/40">Bloqueio de tela ao iniciar</p>
                                </div>
                                <button 
                                    onClick={() => setConfigForm({...configForm, enableLock: configForm.enableLock === false ? true : false})}
                                    className={`w-10 h-5 rounded-full relative transition-colors ${configForm.enableLock !== false ? 'bg-green-500' : 'bg-white/20'}`}
                                >
                                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${configForm.enableLock !== false ? 'left-6' : 'left-1'}`} />
                                </button>
                            </div>
                        </div>
                        <div className="space-y-4 mb-8 border-b border-white/10 pb-8">
                            <h2 className="text-xl font-light flex items-center gap-2"><Cloud size={20} /> Nuvem & Backup</h2>
                            <p className="text-[10px] text-white/60 leading-relaxed">
                                Para sincronizar, instale o <strong>Lumina Installer</strong> no Hubitat e clique em <strong>"🔧 Configurar Auto-Sync"</strong> para criar as variáveis automaticamente.
                            </p>
                            <div className="flex gap-2 mt-3">
                                <button onClick={handleCloudUpload} className="flex-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-200 border border-blue-500/20 p-3 rounded-lg flex flex-col items-center gap-1 transition-colors"><Upload size={16} /><span className="text-[9px] uppercase font-bold">Enviar p/ Hub</span></button>
                                <button onClick={handleCloudDownload} className="flex-1 bg-green-500/10 hover:bg-green-500/20 text-green-200 border border-green-500/20 p-3 rounded-lg flex flex-col items-center gap-1 transition-colors"><Download size={16} /><span className="text-[9px] uppercase font-bold">Baixar do Hub</span></button>
                                <button onClick={handleGenerateBackup} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 p-3 rounded-lg flex flex-col items-center gap-1 transition-colors"><Settings size={16} /><span className="text-[9px] uppercase font-bold">Manual</span></button>
                            </div>
                            {syncStatus && <p className="text-center text-xs text-white/80 animate-pulse mt-2">{syncStatus}</p>}
                        </div>
                        <div className="space-y-4 mb-8 border-b border-white/10 pb-8"><h2 className="text-xl font-light flex items-center gap-2"><LayoutTemplate size={20} /> Ambientes</h2><div className="flex gap-2"><input type="text" value={newRoomName} onChange={(e) => setNewRoomName(e.target.value)} placeholder="Novo ambiente..." className="flex-1 bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white/30 text-sm" /><button onClick={handleAddRoom} className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-lg border border-white/5"><Plus size={20} /></button></div><button onClick={handleImportRooms} disabled={importingRooms} className="w-full mt-3 bg-gradient-to-r from-green-600/20 to-emerald-400/20 border border-green-400/20 text-green-200 font-medium text-sm py-3 rounded-xl flex items-center justify-center gap-2 hover:from-green-600/30 hover:to-emerald-400/30 transition-all disabled:opacity-50">{importingRooms ? <RefreshCcw size={16} className="animate-spin" /> : <Download size={16} />}<span>{importingRooms ? 'Importando...' : 'Importar do Hubitat'}</span></button><div className="space-y-2 mt-4 max-h-40 overflow-y-auto custom-scrollbar">{state.rooms.map(room => (<div key={room.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5"><span className="text-sm">{room.name}</span><button onClick={() => handleDeleteRoom(room.id)} className="text-white/30 hover:text-red-300 p-1"><Trash2 size={14} /></button></div>))}</div></div>
                        <div className="space-y-4"><h2 className="text-xl font-light flex items-center gap-2"><Sliders size={20} /> Personalização</h2><button onClick={() => setShowDeviceManager(true)} className="w-full bg-gradient-to-r from-blue-600/20 to-blue-400/20 border border-blue-400/20 text-white font-medium text-sm py-4 rounded-xl flex items-center justify-between px-6"><span className="flex flex-col items-start"><span>Gerenciar Dispositivos</span><span className="text-[10px] text-white/60 font-normal">Atribuir cômodos e ocultar itens</span></span><ChevronRight size={16} /></button><div className="bg-white/5 border border-white/10 rounded-xl p-4"><div className="flex items-center justify-between mb-3"><div className="flex items-center gap-2"><ImageIcon size={16} className="text-white/60" /><p className="font-medium text-sm">Logo da Empresa</p></div>{customLogo && <button onClick={handleRemoveLogo} className="p-2 bg-red-500/20 text-red-200 rounded-lg"><Trash2 size={16} /></button>}</div><label className="w-full border border-dashed border-white/20 bg-black/20 rounded-lg h-24 flex flex-col items-center justify-center cursor-pointer hover:bg-black/30 transition-all group">{customLogo ? (<img src={customLogo} alt="Logo" className="h-16 object-contain opacity-80 group-hover:opacity-100" />) : (<><Upload size={20} className="text-white/40 mb-2 group-hover:text-white" /><span className="text-[10px] uppercase text-white/40">Clique para enviar (PNG)</span></>)}<input type="file" accept="image/png" onChange={handleLogoUpload} className="hidden" /></label></div></div>
                        
                        {/* v1.6 Premium: Favorites Editor */}
                        <div className="space-y-4 mt-8 border-t border-white/10 pt-8">
                            <h2 className="text-xl font-light flex items-center gap-2"><Star size={20} className="text-yellow-400" /> Favoritos</h2>
                            <p className="text-[10px] text-white/60">Selecione até 5 dispositivos para acesso rápido na tela inicial. Use as setas para reordenar.</p>
                            
                            {/* Current Favorites with Reorder */}
                            {favorites.length > 0 && (
                                <div className="space-y-2 mb-4">
                                    <p className="text-[10px] uppercase tracking-widest text-white/40">Favoritos Atuais ({favorites.length}/5)</p>
                                    {favorites.map((fav, index) => {
                                        const device = state.devices[fav.deviceId];
                                        if (!device) return null;
                                        return (
                                            <div key={fav.deviceId} className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                                                <div className="flex items-center gap-3">
                                                    {/* Reorder Buttons */}
                                                    <div className="flex flex-col gap-0.5">
                                                        <button 
                                                            onClick={() => handleMoveFavorite(fav.deviceId, 'up')}
                                                            disabled={index === 0}
                                                            className={`p-0.5 rounded ${index === 0 ? 'text-white/20 cursor-not-allowed' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
                                                        >
                                                            <ChevronUp size={12} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleMoveFavorite(fav.deviceId, 'down')}
                                                            disabled={index === favorites.length - 1}
                                                            className={`p-0.5 rounded ${index === favorites.length - 1 ? 'text-white/20 cursor-not-allowed' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
                                                        >
                                                            <ChevronDown size={12} />
                                                        </button>
                                                    </div>
                                                    <div>
                                                        <span className="text-sm text-yellow-200">{device.name}</span>
                                                        <span className="text-[9px] text-white/40 block">{device.type}</span>
                                                    </div>
                                                </div>
                                                <button onClick={() => handleToggleFavorite(fav.deviceId)} className="text-red-400 hover:text-red-300 p-1"><X size={14} /></button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                            
                            {/* Add Favorites - Expanded device types */}
                            {favorites.length < 5 && (
                                <div className="space-y-2">
                                    <p className="text-[10px] uppercase tracking-widest text-white/40">Adicionar aos Favoritos</p>
                                    <div className="max-h-64 overflow-y-auto custom-scrollbar space-y-1">
                                        {Object.values(state.devices)
                                            .filter(d => d.roomId !== 'hidden' && !isFavorite(d.id))
                                            .sort((a, b) => a.name.localeCompare(b.name))
                                            .map(device => (
                                                <button 
                                                    key={device.id}
                                                    onClick={() => handleToggleFavorite(device.id)}
                                                    className="w-full flex items-center justify-between p-2 bg-white/5 rounded hover:bg-white/10 transition-colors"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-white/80">{device.name}</span>
                                                        <span className="text-[8px] text-white/30 uppercase">{device.type}</span>
                                                    </div>
                                                    <Star size={12} className="text-white/30" />
                                                </button>
                                            ))
                                        }
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        {/* v1.6: Câmeras IP */}
                        <div className="space-y-4 mt-8 border-t border-white/10 pt-8">
                            <h2 className="text-xl font-light flex items-center gap-2"><Camera size={20} className="text-blue-400" /> Câmeras IP</h2>
                            <p className="text-[10px] text-white/60">Adicione até 4 câmeras IP com MJPEG ou snapshot HTTP.</p>
                            
                            {/* Lista de Câmeras */}
                            {cameras.length > 0 && (
                                <div className="space-y-2 mb-4">
                                    <p className="text-[10px] uppercase tracking-widest text-white/40">Câmeras Configuradas ({cameras.length}/4)</p>
                                    {cameras.map(cam => (
                                        <div key={cam.id} className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                            <div className="flex-1 min-w-0">
                                                <span className="text-sm text-blue-200 block truncate">{cam.name}</span>
                                                <span className="text-[9px] text-white/40 block truncate">{cam.url}</span>
                                            </div>
                                            <div className="flex items-center gap-2 ml-2">
                                                <span className="px-2 py-0.5 bg-white/10 rounded text-[8px] uppercase">{cam.streamType}</span>
                                                <button onClick={() => handleEditCamera(cam)} className="text-blue-400 hover:text-blue-300 p-1"><PenLine size={14} /></button>
                                                <button onClick={() => handleRemoveCamera(cam.id)} className="text-red-400 hover:text-red-300 p-1"><Trash2 size={14} /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            {/* Botão Adicionar Câmera */}
                            {cameras.length < 4 && (
                                <button 
                                    onClick={() => { setEditingCamera(null); setShowAddCameraModal(true); }}
                                    className="w-full bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-200 py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Plus size={16} />
                                    Adicionar Câmera IP
                                </button>
                            )}
                        </div>
                    </GlassCard>
                </div>
                
                {/* Add Camera Modal */}
                <AddCameraModal 
                    isOpen={showAddCameraModal}
                    onClose={handleCloseAddCameraModal}
                    onSave={handleAddCamera}
                    rooms={state.rooms}
                    editingCamera={editingCamera || undefined}
                />
            </div>
        );
    }
  };

  // ... (Detail View: Current Room)
  if (currentRoom) {
    let roomDevices: Device[] = [];
    const isUsingRealDevices = Object.keys(state.devices).some(k => !isNaN(Number(k)) || k.startsWith('virtual_')); 
    if (isUsingRealDevices) {
        roomDevices = (Object.values(state.devices) as Device[]).filter(d => d.roomId === currentRoom.id);
    } else {
        roomDevices = currentRoom.deviceIds.map(id => state.devices[id]).filter((d): d is Device => !!d);
    }
    const roomBg = getRoomImage(currentRoom);

    return (
      <div className="relative min-h-screen w-full text-white font-sans selection:bg-white/30">
        <div className="fixed inset-0 bg-cover bg-center z-0 transition-all duration-700 ease-in-out scale-105" style={{ backgroundImage: formatBgImage(roomBg) }} />
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-0" />
        {customLogo && (<img src={customLogo} alt="Brand Logo" className="fixed bottom-8 right-8 w-24 h-auto object-contain z-50 opacity-80 pointer-events-none" />)}
        <ImageEditorModal isOpen={isImageEditorOpen} onClose={() => setIsImageEditorOpen(false)} onSave={handleSaveImage} currentImage={editingTarget?.type === 'room' && editingTarget.id === currentRoom.id ? roomBg : undefined} defaultImage={currentRoom.image} title={editingTarget?.type === 'room' ? 'Editar Fundo do Quarto' : 'Editar Fundo'} />

        <div className="relative z-10 flex flex-col h-screen">
            <header className="px-6 py-6 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent relative z-50">
                <button onClick={handleBackToHome} className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"><div className="p-2 rounded-full bg-white/10 backdrop-blur-lg border border-white/10"><ArrowLeft size={20} /></div><span className="text-xs font-medium tracking-wide uppercase">Voltar</span></button>
                <div className="text-center"><h1 className="text-xl font-light tracking-wider drop-shadow-md">{currentRoom.name}</h1></div>
                <div className="flex gap-2 relative">
                    <button onClick={() => setIsEditMode(!isEditMode)} className={`p-2 rounded-full backdrop-blur-lg border transition-colors ${isEditMode ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' : 'bg-white/10 border-white/10 hover:bg-white/20'}`}><Layout size={20} /></button>
                    
                    {/* ROOM SETTINGS MENU TOGGLE */}
                    <button 
                        onClick={() => setShowMenu(!showMenu)} 
                        className={`p-2 rounded-full backdrop-blur-lg border transition-colors ${showMenu ? 'bg-white/20 text-white border-white/30' : 'bg-white/10 border-white/10 hover:bg-white/20'}`}
                    >
                        <Settings size={20} />
                    </button>

                    {/* ROOM SETTINGS DROPDOWN */}
                    {showMenu && (
                        <div ref={menuRef} className="absolute top-12 right-0 w-56 bg-black/90 border border-white/10 backdrop-blur-xl rounded-lg shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                             <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white/40 border-b border-white/5">Configurações</div>
                             <button 
                                onClick={(e) => openRoomBgEditor(e, currentRoom.id)}
                                className="w-full text-left px-4 py-3 text-xs text-white hover:bg-white/10 flex items-center gap-2"
                             >
                                 <ImageIcon size={14} className="text-blue-400" /> Editar Fundo
                             </button>
                             
                             <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white/40 border-b border-white/5 border-t mt-1">Adicionar Dispositivo</div>
                             
                             <button 
                                onClick={() => handleAddVirtualDevice(DeviceType.BLIND)}
                                className="w-full text-left px-4 py-3 text-xs text-white hover:bg-white/10 flex items-center gap-2"
                             >
                                 <Blinds size={14} className="text-green-400" /> Adicionar Persiana
                             </button>
                             <button 
                                onClick={() => handleAddVirtualDevice(DeviceType.TV)}
                                className="w-full text-left px-4 py-3 text-xs text-white hover:bg-white/10 flex items-center gap-2"
                             >
                                <Tv size={14} className="text-purple-400" /> Adicionar TV
                             </button>
                             <button 
                                onClick={() => handleAddVirtualDevice(DeviceType.AC)}
                                className="w-full text-left px-4 py-3 text-xs text-white hover:bg-white/10 flex items-center gap-2"
                             >
                                 <Wind size={14} className="text-cyan-400" /> Adicionar Ar Cond.
                             </button>
                             <button 
                                onClick={() => handleAddVirtualDevice(DeviceType.WATER)}
                                className="w-full text-left px-4 py-3 text-xs text-white hover:bg-white/10 flex items-center gap-2"
                             >
                                💧 Adicionar Sensor de Água
                             </button>
                             <button 
                               onClick={() => handleAddVirtualDevice(DeviceType.SMOKE)}
                               className="w-full text-left px-4 py-3 text-xs text-white hover:bg-white/10 flex items-center gap-2"
                             >   
                                 🔥 Adicionar Sensor de Fumaça
                            </button>
                            
                            <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white/40 border-b border-white/5 border-t mt-1">Câmeras</div>
                            <button 
                               onClick={() => { setShowMenu(false); setEditingCamera(null); setShowAddCameraModal(true); }}
                               className="w-full text-left px-4 py-3 text-xs text-white hover:bg-white/10 flex items-center gap-2"
                             >   
                                <Camera size={14} className="text-blue-400" /> Adicionar Câmera IP
                            </button>
                        </div>
                    )}
                </div>
            </header>

            <main className="flex-1 overflow-y-auto px-6 pb-24">
                <div className="max-w-5xl mx-auto">
                    {roomDevices.length === 0 && cameras.filter(c => c.roomId === currentRoom.id).length === 0 ? (
                         <div className="flex flex-col items-center justify-center h-64 text-white/40"><EyeOff size={32} className="mb-4 opacity-50" /><p>Nenhum dispositivo neste ambiente.</p><p className="text-xs mt-2">Use o menu de configurações (⚙️) para criar controles.</p></div>
                    ) : (
                        <>
                            {roomDevices.length > 0 && (
                                <div className="mb-8">
                                    <h2 className="text-white/80 text-xs uppercase tracking-widest mb-4 font-medium pl-1 drop-shadow-sm">Controles</h2>
                                    {renderGridLayout(roomDevices)}
                                </div>
                            )}
                            
                            {/* Room Cameras */}
                            {cameras.filter(c => c.roomId === currentRoom.id).length > 0 && (
                                <div className="mb-8">
                                    <h2 className="text-white/80 text-xs uppercase tracking-widest mb-4 font-medium pl-1 drop-shadow-sm flex items-center gap-2">
                                        <Camera size={14} className="text-blue-400" /> Câmeras
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {cameras.filter(c => c.roomId === currentRoom.id).map(cam => (
                                            <CameraCard 
                                                key={cam.id} 
                                                camera={cam}
                                                onRemove={handleRemoveCamera}
                                                onEdit={handleEditCamera}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
        
        {/* Add Camera Modal (Room Context) */}
        <AddCameraModal 
            isOpen={showAddCameraModal}
            onClose={handleCloseAddCameraModal}
            onSave={(camData) => handleAddCamera({ ...camData, roomId: currentRoom?.id })}
            rooms={state.rooms}
            editingCamera={editingCamera || undefined}
        />
      </div>
    );
  }

  // Final Render (Main Tabs)
  return (
    <div className="relative min-h-screen w-full bg-black text-white font-sans overflow-hidden">
      <div className={`fixed inset-0 bg-cover bg-center z-0 transition-all duration-1000 ease-in-out ${activeTab === 'home' ? 'blur-[4px]' : 'blur-0'}`} style={{ backgroundImage: formatBgImage(getActiveBackgroundImage()) }} />
      
      {/* Top Right Controls */}
      <div className="fixed top-6 right-6 z-20 flex gap-3">
          {/* Notification Bell (v1.6 Premium) */}
          <button 
            onClick={() => setShowNotifications(true)}
            className="relative p-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 text-white/50 hover:text-white transition-all"
          >
            <Bell size={20} />
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center text-white">
                {notifications.filter(n => !n.read).length}
              </span>
            )}
          </button>
          {activeTab !== 'home' && activeTab !== 'settings' && (
              <button 
                onClick={() => setIsEditMode(!isEditMode)}
                className={`p-2 rounded-full backdrop-blur-md border transition-all group ${isEditMode ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' : 'bg-black/40 border-white/10 text-white/50 hover:text-white'}`}
              >
                <Layout size={20} />
              </button>
          )}
          <button onClick={openTabBgEditor} className="p-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 text-white/50 hover:text-white transition-all group">
            <Settings size={20} className="group-hover:rotate-45 transition-transform duration-500" />
          </button>
      </div>

      {/* Notifications Panel (v1.6 Premium) */}
      {showNotifications && (
        <NotificationsPanel 
          notifications={notifications}
          onUpdate={() => setNotifications(getNotifications())}
          onClose={() => setShowNotifications(false)}
        />
      )}

      {/* Weather Settings Modal (Global) */}
      {showWeatherSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-zinc-900/95 border border-white/10 rounded-2xl p-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <MapPin size={18} className="text-blue-400" />
                Configurar Local
              </h3>
              <button onClick={() => setShowWeatherSettings(false)} className="p-1 hover:bg-white/10 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex gap-2 mb-4">
              <input 
                type="text" 
                value={citySearchQuery}
                onChange={(e) => setCitySearchQuery(e.target.value)}
                placeholder="Buscar cidade..."
                onKeyDown={(e) => e.key === 'Enter' && handleCitySearch()}
                className="flex-1 bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50"
              />
              <button 
                onClick={handleCitySearch} 
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 rounded-lg flex items-center justify-center transition-colors"
              >
                {isSearchingCity ? <RefreshCcw size={18} className="animate-spin"/> : <Search size={18} />}
              </button>
            </div>
            
            {weatherConfig && (
              <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/5">
                <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Local Atual</p>
                <p className="text-sm font-medium">{weatherConfig.city}</p>
              </div>
            )}
            
            <div className="max-h-64 overflow-y-auto custom-scrollbar flex flex-col gap-1">
              {citySearchResults.length > 0 ? (
                citySearchResults.map((city, idx) => (
                  <button 
                    key={idx}
                    onClick={() => handleSelectCity(city)}
                    className="text-left px-4 py-3 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <span className="font-medium text-white block">{city.name}</span>
                    <span className="text-xs text-white/50">{city.admin1}, {city.country}</span>
                  </button>
                ))
              ) : (
                <p className="text-center text-white/40 text-sm py-4">
                  Digite o nome de uma cidade e pressione Enter
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <ImageEditorModal isOpen={isImageEditorOpen} onClose={() => setIsImageEditorOpen(false)} onSave={handleSaveImage} currentImage={editingTarget?.type === 'tab' ? getActiveBackgroundImage() : undefined} defaultImage={editingTarget?.type === 'tab' ? getDefaultBackgroundImage(editingTarget.id) : ''} title={editingTarget?.type === 'tab' ? `Fundo: ${activeTab}` : 'Editar Imagem'} />

      {/* Widget Editors */}
      {editingWidget?.type === 'slideshow' && (
        <SlideshowEditor
          isOpen={true}
          onClose={() => setEditingWidget(null)}
          onSave={(config) => editingWidget.widget && handleUpdateWidget(editingWidget.widget.id, config)}
          config={(editingWidget.widget?.config as SlideshowConfig) || { images: [], interval: 10, transition: 'fade', showCaption: false }}
          title="Configurar Slideshow"
        />
      )}
      {editingWidget?.type === 'qrcode' && (
        <QRCodeEditor
          isOpen={true}
          onClose={() => setEditingWidget(null)}
          onSave={(config) => editingWidget.widget && handleUpdateWidget(editingWidget.widget.id, config)}
          config={(editingWidget.widget?.config as QRCodeConfig) || { content: '', size: 150, label: '' }}
          title="Configurar QR Code"
        />
      )}
      {editingWidget?.type === 'text' && (
        <TextEditor
          isOpen={true}
          onClose={() => setEditingWidget(null)}
          onSave={(config) => editingWidget.widget && handleUpdateWidget(editingWidget.widget.id, config)}
          config={(editingWidget.widget?.config as TextWidgetConfig) || { content: '', fontSize: 'md', textAlign: 'left', scrolling: false }}
          title="Configurar Texto"
        />
      )}
      {editingWidget?.type === 'video' && (
        <VideoEditor
          isOpen={true}
          onClose={() => setEditingWidget(null)}
          onSave={(config) => editingWidget.widget && handleUpdateWidget(editingWidget.widget.id, config)}
          config={(editingWidget.widget?.config as VideoWidgetConfig) || { url: '', autoplay: false, muted: true, loop: false, showControls: true }}
          title="Configurar Vídeo"
        />
      )}
      <div className="fixed inset-0 bg-gradient-to-t from-black via-black/40 to-black/20 z-0" />
      {customLogo && (<img src={customLogo} alt="Brand Logo" className="fixed bottom-8 right-8 w-24 h-auto object-contain z-50 opacity-80 pointer-events-none" />)}

      <div className="relative z-10 px-6 py-8 max-w-6xl mx-auto h-screen flex flex-col">
        <div className="flex-1 overflow-y-auto custom-scrollbar">
             {renderContent()}
        </div>

        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full px-6 py-4 flex gap-6 md:gap-8 shadow-2xl z-50">
            <button onClick={() => setActiveTab('home')} className={`text-white flex flex-col items-center gap-1 group transition-all duration-300 ${activeTab === 'home' ? 'text-white scale-110 drop-shadow-lg' : 'text-white/60 hover:text-white'}`}><Home size={24} strokeWidth={activeTab === 'home' ? 2 : 1.5} /><span className={`text-[8px] uppercase tracking-wider transition-opacity font-semibold ${activeTab === 'home' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>Home</span></button>
            <button onClick={() => setActiveTab('rooms')} className={`text-white flex flex-col items-center gap-1 group transition-all duration-300 ${activeTab === 'rooms' ? 'text-white scale-110 drop-shadow-lg' : 'text-white/60 hover:text-white'}`}><LayoutDashboard size={24} strokeWidth={activeTab === 'rooms' ? 2 : 1.5} /><span className={`text-[8px] uppercase tracking-wider transition-opacity font-semibold ${activeTab === 'rooms' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>Ambientes</span></button>
            <button onClick={() => setActiveTab('scenes')} className={`flex flex-col items-center gap-1 group transition-all duration-300 ${activeTab === 'scenes' ? 'text-white scale-110 drop-shadow-lg' : 'text-white/60 hover:text-white'}`}><Grid size={24} strokeWidth={activeTab === 'scenes' ? 2 : 1.5} /><span className={`text-[8px] uppercase tracking-wider transition-opacity font-semibold ${activeTab === 'scenes' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>Cenas</span></button>
            
            {/* UNIFIED DEVICES BUTTON */}
            <button onClick={() => setActiveTab('devices')} className={`flex flex-col items-center gap-1 group transition-all duration-300 ${activeTab === 'devices' ? 'text-white scale-110 drop-shadow-lg' : 'text-white/60 hover:text-white'}`}><Layers size={24} strokeWidth={activeTab === 'devices' ? 2 : 1.5} /><span className={`text-[8px] uppercase tracking-wider transition-opacity font-semibold ${activeTab === 'devices' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>Dispositivos</span></button>
            
            <button onClick={() => setActiveTab('media')} className={`flex flex-col items-center gap-1 group transition-all duration-300 ${activeTab === 'media' ? 'text-white scale-110 drop-shadow-lg' : 'text-white/60 hover:text-white'}`}><Tv size={24} strokeWidth={activeTab === 'media' ? 2 : 1.5} /><span className={`text-[8px] uppercase tracking-wider transition-opacity font-semibold ${activeTab === 'media' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>Mídia</span></button>
            <button onClick={() => setActiveTab('settings')} className={`flex flex-col items-center gap-1 group transition-all duration-300 ${activeTab === 'settings' ? 'text-white scale-110 drop-shadow-lg' : 'text-white/60 hover:text-white'}`}><Settings size={24} strokeWidth={activeTab === 'settings' ? 2 : 1.5} /><span className={`text-[8px] uppercase tracking-wider transition-opacity font-semibold ${activeTab === 'settings' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>Ajustes</span></button>
        </div>
      </div>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');
const root = createRoot(rootElement);
root.render(<App />);
