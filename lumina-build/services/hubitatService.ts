import { HubitatCommand, HubitatConfig, Device, DeviceType, Room, Favorite, Notification, EventLog, KioskConfig, EnergyConfig, IPCamera, CamerasConfig, HomeWidget, HomeWidgetsConfig } from '../types';
import { MOCK_DEVICES } from '../constants';

// ============================================================
// PROXY PARA CORS - Intercepta requests quando em hosting externo
// ============================================================
const PROXY_URL = 'https://us-central1-lumina-cloud-c8d21.cloudfunctions.net/hubitat';

const isExternalHosting = (): boolean => {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return host.includes('web.app') || host.includes('firebaseapp.com') || host.includes('domotika.com');
};

// Intercepta fetch para usar proxy quando necessário
const originalFetch = window.fetch.bind(window);
if (isExternalHosting()) {
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    
    // Se é request para cloud.hubitat.com, usa proxy
    if (url.includes('cloud.hubitat.com/api/')) {
      try {
        const urlObj = new URL(url);
        const uuid = urlObj.pathname.split('/')[2]; // /api/{uuid}/...
        const path = urlObj.pathname.split('/').slice(3).join('/'); // apps/{appId}/devices/etc
        const token = urlObj.searchParams.get('access_token');
        
        if (uuid && path && token) {
          const proxyUrl = `${PROXY_URL}?uuid=${uuid}&path=${encodeURIComponent(path)}&token=${encodeURIComponent(token)}`;
          console.log('[Lumina Proxy]', path);
          return originalFetch(proxyUrl, init);
        }
      } catch (e) {
        console.error('[Lumina Proxy Error]', e);
      }
    }
    
    return originalFetch(input, init);
  };
  console.log('[Lumina] Proxy mode enabled for external hosting');
}
// ============================================================

const STORAGE_KEY = 'lumina_hubitat_config';
const MAPPING_STORAGE_KEY = 'lumina_device_mapping';
const ACTION_MAPPING_KEY = 'lumina_action_mapping';
const NAME_MAPPING_KEY = 'lumina_name_mapping';
const LOGO_STORAGE_KEY = 'lumina_custom_logo';
const BG_IMAGES_KEY = 'lumina_bg_images';
const ROOM_IMAGES_KEY = 'lumina_room_images';
const ROOMS_LIST_KEY = 'lumina_saved_rooms';
const BUTTON_MAPPING_KEY = 'lumina_button_mapping';
const LAYOUT_STORAGE_KEY = 'lumina_grid_layouts';
const CUSTOM_DEVICES_KEY = 'lumina_custom_devices';
// NOVOS v1.6
const FAVORITES_KEY = 'lumina_favorites';
const NOTIFICATIONS_KEY = 'lumina_notifications';
const EVENT_LOG_KEY = 'lumina_event_log';
const KIOSK_CONFIG_KEY = 'lumina_kiosk_config';
const ENERGY_CONFIG_KEY = 'lumina_energy_config';
const CAMERAS_CONFIG_KEY = 'lumina_cameras_config';

const buildBaseUrl = (config: HubitatConfig): string => {
  if (config.useCloud && config.hubUuid) {
    const appId = config.useLegacyApi ? config.customAppId : config.appId;
    return `https://cloud.hubitat.com/api/${config.hubUuid}/apps/${appId}`;
  }
  const ip = config.hubIp.trim();
  const base = ip.startsWith('http') ? ip : `http://${ip}`;
  const appId = config.useLegacyApi ? config.customAppId : config.appId;
  return `${base.replace(/\/$/, '')}/apps/api/${appId}`;
};

export const saveConfig = (config: HubitatConfig) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
};

export const getConfig = (): HubitatConfig | null => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : null;
};

// --- Custom Virtual Devices Logic ---
export const getCustomDevices = (): Record<string, Device> => {
  const data = localStorage.getItem(CUSTOM_DEVICES_KEY);
  return data ? JSON.parse(data) : {};
};

export const saveCustomDevice = (device: Device) => {
  const current = getCustomDevices();
  current[device.id] = device;
  localStorage.setItem(CUSTOM_DEVICES_KEY, JSON.stringify(current));
};

export const removeCustomDevice = (deviceId: string) => {
  const current = getCustomDevices();
  if (current[deviceId]) {
    delete current[deviceId];
    localStorage.setItem(CUSTOM_DEVICES_KEY, JSON.stringify(current));
  }
};

// --- Rooms Storage Logic ---
export const saveRooms = (rooms: Room[]) => {
  localStorage.setItem(ROOMS_LIST_KEY, JSON.stringify(rooms));
};

export const getSavedRooms = (): Room[] | null => {
  const data = localStorage.getItem(ROOMS_LIST_KEY);
  return data ? JSON.parse(data) : null;
};

// --- Logo Storage Logic ---
export const saveLogo = (base64Image: string | null) => {
  if (base64Image) {
    localStorage.setItem(LOGO_STORAGE_KEY, base64Image);
  } else {
    localStorage.removeItem(LOGO_STORAGE_KEY);
  }
};

export const getLogo = (): string | null => {
  return localStorage.getItem(LOGO_STORAGE_KEY);
};

// --- Background Images Logic (Global/Tabs) ---
export const saveBackgroundMapping = (mapping: Record<string, string>) => {
  localStorage.setItem(BG_IMAGES_KEY, JSON.stringify(mapping));
};

export const getBackgroundMapping = (): Record<string, string> => {
  const data = localStorage.getItem(BG_IMAGES_KEY);
  return data ? JSON.parse(data) : {};
};

// --- Room Images Logic ---
export const saveRoomImageMapping = (mapping: Record<string, string>) => {
  localStorage.setItem(ROOM_IMAGES_KEY, JSON.stringify(mapping));
};

export const getRoomImageMapping = (): Record<string, string> => {
  const data = localStorage.getItem(ROOM_IMAGES_KEY);
  return data ? JSON.parse(data) : {};
};

// --- Device Mapping Logic (Rooms) ---
export const saveDeviceMapping = (mapping: Record<string, string>) => {
  localStorage.setItem(MAPPING_STORAGE_KEY, JSON.stringify(mapping));
};

export const getDeviceMapping = (): Record<string, string> => {
  const data = localStorage.getItem(MAPPING_STORAGE_KEY);
  return data ? JSON.parse(data) : {};
};

// --- Action Mapping Logic (Target Devices) ---
export const saveActionMapping = (mapping: Record<string, string>) => {
  localStorage.setItem(ACTION_MAPPING_KEY, JSON.stringify(mapping));
};

export const getActionMapping = (): Record<string, string> => {
  const data = localStorage.getItem(ACTION_MAPPING_KEY);
  return data ? JSON.parse(data) : {};
};

// --- Name Mapping Logic (Custom Names) ---
export const saveNameMapping = (mapping: Record<string, string>) => {
  localStorage.setItem(NAME_MAPPING_KEY, JSON.stringify(mapping));
};

export const getNameMapping = (): Record<string, string> => {
  const data = localStorage.getItem(NAME_MAPPING_KEY);
  return data ? JSON.parse(data) : {};
};

// --- Button Mapping Logic (Remote Controls) ---
export const saveButtonMapping = (mapping: Record<string, string>) => {
  localStorage.setItem(BUTTON_MAPPING_KEY, JSON.stringify(mapping));
};

export const getButtonMapping = (): Record<string, string> => {
  const data = localStorage.getItem(BUTTON_MAPPING_KEY);
  return data ? JSON.parse(data) : {};
};

// --- Grid Layout Logic ---
export interface GridItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
}
export type Layouts = { [key: string]: GridItem[] };

export const saveLayouts = (layouts: Record<string, GridItem[]>) => {
  localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layouts));
};

export const getLayouts = (): Record<string, GridItem[]> => {
  const data = localStorage.getItem(LAYOUT_STORAGE_KEY);
  return data ? JSON.parse(data) : {};
};

// ═══════════════════════════════════════════════════════════════════════════
//  NOVOS STORAGE v1.6 - Favorites, Notifications, Events, Kiosk, Energy
// ═══════════════════════════════════════════════════════════════════════════

// --- Favorites Logic ---
export const saveFavorites = (favorites: Favorite[]) => {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
};

export const getFavorites = (): Favorite[] => {
  const data = localStorage.getItem(FAVORITES_KEY);
  return data ? JSON.parse(data) : [];
};

// --- Notifications Logic ---
export const saveNotifications = (notifications: Notification[]) => {
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
};

export const getNotifications = (): Notification[] => {
  const data = localStorage.getItem(NOTIFICATIONS_KEY);
  return data ? JSON.parse(data) : [];
};

export const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
  const notifications = getNotifications();
  const newNotification: Notification = {
    ...notification,
    id: `notif_${Date.now()}`,
    timestamp: Date.now(),
    read: false
  };
  notifications.unshift(newNotification);
  // Keep only last 50 notifications
  if (notifications.length > 50) notifications.pop();
  saveNotifications(notifications);
  return newNotification;
};

export const markNotificationRead = (id: string) => {
  const notifications = getNotifications();
  const idx = notifications.findIndex(n => n.id === id);
  if (idx >= 0) {
    notifications[idx].read = true;
    saveNotifications(notifications);
  }
};

export const clearAllNotifications = () => {
  saveNotifications([]);
};

// --- Event Log Logic ---
export const saveEventLog = (events: EventLog[]) => {
  localStorage.setItem(EVENT_LOG_KEY, JSON.stringify(events));
};

export const getEventLog = (): EventLog[] => {
  const data = localStorage.getItem(EVENT_LOG_KEY);
  return data ? JSON.parse(data) : [];
};

export const addEventLog = (deviceId: string, deviceName: string, action: string, value?: string | number) => {
  const events = getEventLog();
  const newEvent: EventLog = {
    id: `evt_${Date.now()}`,
    deviceId,
    deviceName,
    action,
    value,
    timestamp: Date.now()
  };
  events.unshift(newEvent);
  // Keep only last 100 events
  if (events.length > 100) events.pop();
  saveEventLog(events);
  return newEvent;
};

// --- Kiosk Config Logic ---
export const saveKioskConfig = (config: KioskConfig) => {
  localStorage.setItem(KIOSK_CONFIG_KEY, JSON.stringify(config));
};

export const getKioskConfig = (): KioskConfig => {
  const data = localStorage.getItem(KIOSK_CONFIG_KEY);
  return data ? JSON.parse(data) : {
    enabled: false,
    hideSettingsAfter: 60,
    requirePinForSettings: false,
    autoRefresh: false,
    refreshInterval: 300
  };
};

// --- Energy Config Logic ---
export const saveEnergyConfig = (config: EnergyConfig) => {
  localStorage.setItem(ENERGY_CONFIG_KEY, JSON.stringify(config));
};

export const getEnergyConfig = (): EnergyConfig => {
  const data = localStorage.getItem(ENERGY_CONFIG_KEY);
  return data ? JSON.parse(data) : {
    currency: 'BRL',
    kwhPrice: 0.85,
    showCost: true
  };
};

const getBaseUrl = (config: HubitatConfig) => {
  if (config.useCloud && config.hubUuid) {
    const appId = config.useLegacyApi ? config.customAppId : config.appId;
    return `https://cloud.hubitat.com/api/${config.hubUuid}/apps/${appId}`;
  }
  const cleanIp = config.hubIp.trim();
  const protocol = cleanIp.startsWith('http') ? '' : 'http://';
  const sanitizedIp = `${protocol}${cleanIp}`.replace(/\/$/, '');
  const appId = config.useLegacyApi ? config.customAppId : config.appId;
  return `${sanitizedIp}/apps/api/${appId}`;
};

export const exportFullConfig = (): string => {
    const hubConfig = getConfig();
    const data: any = {
        r: getSavedRooms() || [],
        dm: getDeviceMapping(),
        nm: getNameMapping(),
        am: getActionMapping(),
        bg: getBackgroundMapping(),
        ri: getRoomImageMapping(),
        bm: getButtonMapping(),
        ly: getLayouts(),
        cd: getCustomDevices(),
        // NOVOS v1.6
        fav: getFavorites(),
        kiosk: getKioskConfig(),
        energy: getEnergyConfig(),
        // v2.0 - Cameras e Hub Config
        cameras: getCamerasConfig(),
        hub: hubConfig ? {
            hubIp: hubConfig.hubIp,
            appId: hubConfig.appId,
            accessToken: hubConfig.accessToken
        } : null
    };
    return JSON.stringify(data);
};

export const exportConfigForCloud = (): string => {
    const rooms = getSavedRooms() || [];
    const cleanRooms = rooms.map(r => ({
        ...r,
        image: r.image.startsWith('data:') ? 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1920&q=80' : r.image
    }));
    const data: any = {
        r: cleanRooms,
        dm: getDeviceMapping(),
        nm: getNameMapping(),
        am: getActionMapping(),
        bg: {},
        ri: {},
        bm: getButtonMapping(),
        ly: getLayouts(),
        cd: getCustomDevices()
    };
    return JSON.stringify(data);
};

export const importFullConfig = (jsonString: string): boolean => {
    try {
        const data: any = JSON.parse(jsonString);
        if (data.r) saveRooms(data.r);
        if (data.dm) saveDeviceMapping(data.dm);
        if (data.nm) saveNameMapping(data.nm);
        if (data.am) saveActionMapping(data.am);
        if (data.bm) saveButtonMapping(data.bm);
        if (data.ly) saveLayouts(data.ly);
        if (data.cd) { Object.values(data.cd).forEach((d: any) => saveCustomDevice(d)); }
        if (data.bg && Object.keys(data.bg).length > 0) saveBackgroundMapping(data.bg);
        if (data.ri && Object.keys(data.ri).length > 0) saveRoomImageMapping(data.ri);
        // NOVOS v1.6
        if (data.fav) saveFavorites(data.fav);
        if (data.kiosk) saveKioskConfig(data.kiosk);
        if (data.energy) saveEnergyConfig(data.energy);
        // v2.0 - Cameras e Hub Config
        if (data.cameras) saveCamerasConfig(data.cameras);
        if (data.hub && data.hub.hubIp) {
            saveConfig({
                hubIp: data.hub.hubIp,
                appId: data.hub.appId,
                accessToken: data.hub.accessToken
            });
        }
        return true;
    } catch (e) {
        console.error("Failed to import config", e);
        return false;
    }
};

export const syncToHubitat = async (variableName: string = 'LuminaData'): Promise<{success: boolean, message: string}> => {
    const config = getConfig();
    if (!config) return { success: false, message: 'Não configurado' };
    const json = exportConfigForCloud();
    let base64 = '';
    try { base64 = btoa(unescape(encodeURIComponent(json))); } catch (e) { return { success: false, message: 'Erro ao codificar.' }; }
    const CHUNK_SIZE = 1000;
    const chunks = [];
    for (let i = 0; i < base64.length; i += CHUNK_SIZE) { chunks.push(base64.substring(i, i + CHUNK_SIZE)); }
    if (chunks.length > 15) return { success: false, message: 'Configuração muito grande (max 15KB). Remova imagens customizadas ou dispositivos não utilizados.' };
    try {
        // Endpoint correto: /hubvariables/{name}/{value}
        const metaUrl = `${getBaseUrl(config)}/hubvariables/${variableName}/${encodeURIComponent('CHUNKS:' + chunks.length)}?access_token=${config.accessToken}`;
        await fetch(metaUrl);
        for (let i = 0; i < chunks.length; i++) {
            const chunkUrl = `${getBaseUrl(config)}/hubvariables/${variableName}_${i}/${encodeURIComponent(chunks[i])}?access_token=${config.accessToken}`;
            await fetch(chunkUrl);
        }
        return { success: true, message: 'Salvo com sucesso!' };
    } catch (e: any) { return { success: false, message: `Erro: ${e.message}` }; }
};

export const syncFromHubitat = async (variableName: string = 'LuminaData'): Promise<{success: boolean, message: string}> => {
    const config = getConfig();
    if (!config) return { success: false, message: 'Não configurado' };
    try {
        // Endpoint correto: /hubvariables/{name}
        const mainUrl = `${getBaseUrl(config)}/hubvariables/${variableName}?access_token=${config.accessToken}`;
        const mainRes = await fetch(mainUrl);
        if (!mainRes.ok) return { success: false, message: 'Erro ao ler dados' };
        const mainData = await mainRes.json();
        const mainValue = mainData.value;
        let fullBase64 = '';
        if (mainValue && mainValue.startsWith('CHUNKS:')) {
            const count = parseInt(mainValue.split(':')[1]);
            for (let i = 0; i < count; i++) {
                const chunkRes = await fetch(`${getBaseUrl(config)}/hubvariables/${variableName}_${i}?access_token=${config.accessToken}`);
                const chunkData = await chunkRes.json();
                fullBase64 += chunkData.value;
            }
        } else { fullBase64 = mainValue; }
        if (!fullBase64 || fullBase64 === 'null') return { success: false, message: 'Sem dados.' };
        let jsonStr = fullBase64;
        if (!fullBase64.trim().startsWith('{')) {
             try { jsonStr = decodeURIComponent(escape(window.atob(fullBase64))); } catch (e) { jsonStr = fullBase64; }
        }
        return importFullConfig(jsonStr) ? { success: true, message: 'Carregado!' } : { success: false, message: 'Dados inválidos.' };
    } catch (e: any) { return { success: false, message: `Erro: ${e.message}` }; }
};

/**
 * Mapeia os atributos crus do Hubitat para o estado da aplicação
 */
export const mapAttributesToState = (attributes: any[]) => {
  const state: Device['state'] = {};
  attributes.forEach(attr => {
    const name = attr.name;
    const value = attr.currentValue;
    const valStr = String(value).toLowerCase();

    if (name === 'switch') state.isOn = valStr === 'on';
    if (name === 'level' || name === 'position') state.level = typeof value === 'number' ? value : parseInt(value);
    
    if (name === 'windowShade') {
      state.windowShade = valStr;
      state.isOn = ['open', 'opening', 'partially open'].includes(valStr);
    }
    
    // MolSmart GW3/GW8 online status
    if (name === 'gw3Online' || name === 'gw8Online') {
      state.gwOnline = valStr; // online, offline, unknown
    }
    
    if (name === 'temperature') state.temperature = value;
    if (name === 'thermostatSetpoint' || name === 'coolingSetpoint') state.setpoint = value;
    if (name === 'thermostatMode') {
      state.mode = valStr === 'off' ? 'off' : valStr;
      state.isOn = !['off', 'emergency heat'].includes(valStr);
    }
    if (name === 'thermostatFanMode') state.fanMode = valStr;
    
    if (name === 'lock') {
      state.isLocked = valStr === 'locked';
      state.isOn = valStr === 'unlocked';
    }
    
    if (name === 'volume') {
      state.volume = typeof value === 'number' ? value : parseInt(value);
      state.level = state.volume;
    }
    if (name === 'mute') state.mute = valStr;
    
    // SoundSmart/Multiroom Audio
    if (name === 'status') state.status = valStr; // playing, paused, stopped, loading
    if (name === 'trackname') state.trackname = value;
    if (name === 'trackDescription') state.trackDescription = value;
    if (name === 'URLLargeCoverFile') state.URLLargeCoverFile = value;
    if (name === 'ImageLargeCover') state.ImageLargeCover = value;
    
    // Media & TV
    if (name === 'Input') state.input = value;
    if (name === 'AudioMode') state.audioMode = value;
    if (name === 'transportStatus') state.transportStatus = valStr;
    if (name === 'currentActivity') state.currentApp = value;
    if (name === 'channelName') state.channelName = value;

    // Sensors
    if (name === 'motion') {
      state.motion = valStr;
      state.isOn = valStr === 'active';
    }
    if (name === 'occupancy') {
      state.motion = valStr === 'occupied' ? 'active' : 'inactive';
      state.isOn = state.motion === 'active';
    }
    if (name === 'presence') {
      state.presence = valStr;
      state.isOn = valStr === 'present';
    }
    if (name === 'humanMotionState') {
       if (['moving', 'small', 'large', 'static', 'present', 'occupied', 'active'].includes(valStr)) {
          state.isOn = true; state.motion = 'active';
       } else if (['none', 'inactive', 'not present'].includes(valStr)) {
          state.isOn = false; state.motion = 'inactive';
       }
    }
    
    if (name === 'illuminance') state.illuminance = typeof value === 'number' ? value : parseInt(value);
    if (name === 'battery') state.battery = typeof value === 'number' ? value : parseInt(value);

    // Water & Smoke
    if (name === 'water') {
        state.water = valStr;
        state.isOn = valStr === 'wet';
    }
    if (name === 'smoke') {
        state.smoke = valStr;
        state.isOn = valStr === 'detected';
    }
    if (name === 'carbonMonoxide') {
        state.carbonMonoxide = valStr;
        state.isOn = valStr === 'detected';
    }
    
    // Valves
    if (name === 'valve') {
      state.valve = valStr;
      state.isOn = valStr === 'open';
    }
    if (name === 'waterConsumed') state.waterConsumed = typeof value === 'number' ? value : parseFloat(value);
    if (name === 'timerTimeLeft') state.timerTimeLeft = typeof value === 'number' ? value : parseInt(value);

    // Vibration/Tilt
    if (name === 'acceleration') {
        state.acceleration = valStr;
        if (valStr === 'active') state.motion = 'active';
    }
    if (name === 'tilt') state.tilt = valStr;
    
    // Radar
    if (name === 'distance') state.distance = typeof value === 'number' ? value : parseFloat(value);

    // IR Remote (Molsmart GW8)
    if (name === 'numberOfButtons') state.numberOfButtons = typeof value === 'number' ? value : parseInt(value);
    if (name === 'action' || name === 'lastAction') state.lastAction = value;

    // Camera (NOVO v1.6)
    if (name === 'image' || name === 'snapshot' || name === 'imageUrl') state.snapshotUrl = value;
    if (name === 'stream' || name === 'streamUrl' || name === 'rtspUrl') state.streamUrl = value;

    // Energy Meter (NOVO v1.6)
    if (name === 'power') state.power = typeof value === 'number' ? value : parseFloat(value);
    if (name === 'energy') state.energy = typeof value === 'number' ? value : parseFloat(value);
    if (name === 'voltage') state.voltage = typeof value === 'number' ? value : parseFloat(value);
    if (name === 'amperage' || name === 'current') state.current = typeof value === 'number' ? value : parseFloat(value);
    if (name === 'energyToday') state.energyToday = typeof value === 'number' ? value : parseFloat(value);
  });
  return state;
};

/**
 * Função unificada e robusta para detectar tipos de dispositivo
 * ORDEM CORRIGIDA: TV antes de AC, BLIND antes de SCENE
 */
export const mapHubitatTypeToAppType = (capabilities: string[] | string, name: string, model?: string, manufacturer?: string): DeviceType => {
  const caps = Array.isArray(capabilities) 
    ? capabilities.map(c => c.toLowerCase()) 
    : (typeof capabilities === 'string' ? [capabilities.toLowerCase()] : []);
    
  const lowerName = name ? name.toLowerCase() : '';
  const lowerModel = model ? model.toLowerCase() : '';

  // 1. Modelos Específicos (Prioridade Máxima)
  if (lowerModel === 'sml001' || lowerModel === 'sml002') return DeviceType.MOTION;
  if (lowerName.includes('mmwave') || lowerName.includes('radar') || lowerModel.includes('ts0601') || lowerModel.includes('ts0225')) return DeviceType.PRESENCE;

  // 2. Molsmart IR/RF Remotes (ANTES de sensores para capturar child buttons)
  // Parent device: MolSmart GW8 com PushableButton + TV/Thermostat/Switch
  const isMolsmart = lowerName.includes('molsmart') || lowerName.includes('gw8') || lowerName.includes('gw3');
  const isIrRemote = lowerName.includes('ir ') || lowerName.includes(' ir') || lowerName.includes('(irweb)') || lowerName.includes('infravermelho');
  
  // Child buttons from Molsmart (TV - Power On, TV - Mute, Cortina - Subir, etc)
  if (caps.includes('switch') && !caps.includes('switchlevel') && (
    lowerName.startsWith('tv -') || lowerName.startsWith('ac -') || lowerName.startsWith('audio -') ||
    lowerName.startsWith('cortina -') || lowerName.startsWith('persiana -') || lowerName.startsWith('blind -') ||
    lowerName.includes('- power') || lowerName.includes('- mute') || lowerName.includes('- volume') ||
    lowerName.includes('- channel') || lowerName.includes('- hdmi') || lowerName.includes('- netflix') ||
    lowerName.includes('- youtube') || lowerName.includes('- amazon') || lowerName.includes('- ir') ||
    lowerName.includes('- subir') || lowerName.includes('- parar') || lowerName.includes('- descer') ||
    lowerName.includes('- up') || lowerName.includes('- stop') || lowerName.includes('- down')
  )) return DeviceType.BUTTON;

  // Parent IR Remote devices (Molsmart GW8)
  if (caps.includes('pushablebutton') && (isMolsmart || isIrRemote)) {
    // Se também tem TV ou SamsungTV capability, é um controle de TV IR
    if (caps.includes('tv') || caps.includes('samsungtv')) return DeviceType.IR_REMOTE;
    // Se tem Thermostat, é um controle de AC IR
    if (caps.includes('thermostat')) return DeviceType.IR_REMOTE;
    // Caso genérico (RF, outros)
    return DeviceType.IR_REMOTE;
  }

  // 3. Câmeras (NOVO v1.6)
  // IMPORTANTE: TVs podem ter imagecapture/videostream - excluir dispositivos com características de TV
  const isTvDevice = caps.includes('tv') || caps.includes('samsungtv') || caps.includes('audiovolume') || 
                     lowerName.includes('tv') || lowerName.includes('samsung') || lowerName.includes('lg ') || lowerName.includes('webos');
  if (!isTvDevice && (caps.includes('imagecapture') || caps.includes('videostream') || lowerName.includes('camera') || lowerName.includes('câmera') || lowerName.includes('cam ') || lowerName.includes('ipcam'))) return DeviceType.CAMERA;

  // 4. Medidores de Energia (NOVO v1.6)
  if (caps.includes('powermeter') || caps.includes('energymeter') || lowerName.includes('energy') || lowerName.includes('energia') || lowerName.includes('power meter') || lowerName.includes('medidor')) return DeviceType.ENERGY;

  // 5. Sensores de Segurança (Água, Fumaça, Fechadura)
  if (caps.includes('watersensor') || caps.includes('water sensor')) return DeviceType.WATER;
  if (caps.includes('smokedetector') || caps.includes('smokesensor') || caps.includes('carbonmonoxidedetector') || caps.includes('carbondioxidesensor')) return DeviceType.SMOKE;
  if (caps.includes('lock')) return DeviceType.LOCK;

  // 3. CORTINAS/PERSIANAS (ANTES de TV/AC/SCENE para evitar conflitos)
  if (caps.includes('windowshade') || caps.includes('windowblind') || caps.includes('window shade') || caps.includes('window blind')) return DeviceType.BLIND;
  // Também detectar por nome se tiver capability de switch/level
  if ((caps.includes('switchlevel') || caps.includes('switch')) && (lowerName.includes('persiana') || lowerName.includes('cortina') || lowerName.includes('blind') || lowerName.includes('shade'))) return DeviceType.BLIND;

  // 4. MULTIMÍDIA - TV (ANTES de AC, pois TVs podem ter sensores de temperatura)
  // IMPORTANTE: Só detectar como TV se tiver capability de TV ou audiovolume
  // Switches simples com "TV" no nome (ex: "TV Mute", "TV Netflix") devem ser SWITCH, não TV
  
  // 4a. Samsung TV - detectar primeiro (usa WOL para ligar)
  if (caps.includes('samsungtv')) return DeviceType.SAMSUNG_TV;
  if (caps.includes('audiovolume') && lowerName.includes('samsung')) return DeviceType.SAMSUNG_TV;
  
  // 4b. LG TV - webOS (padrão para outros TVs também)
  if (caps.includes('tv')) return DeviceType.TV;
  if (caps.includes('audiovolume') && (lowerName.includes('tv') || lowerName.includes('lg'))) return DeviceType.TV;
  
  // 5. SoundSmart/Multiroom Audio Players (NOVO v1.6)
  if (lowerName.includes('soundsmart') || lowerName.includes('molsmart audio') || 
      (caps.includes('musicplayer') && caps.includes('audiovolume') && caps.includes('pushablebutton'))) {
    return DeviceType.SOUNDSMART;
  }

  // 6. Áudio/AVR/Multiroom (genérico)
  if (caps.includes('audiovolume') || caps.includes('musicplayer') || lowerName.includes('receiver') || lowerName.includes('avr') || lowerName.includes('sonos') || lowerName.includes('multiroom') || lowerName.includes('group -')) return DeviceType.AVR;

  // 6. Climatização (AC/Thermostat) - DEPOIS de TV
  if (caps.includes('thermostat') || caps.includes('thermostatcooling') || caps.includes('thermostatheating')) return DeviceType.AC;
  // Detectar AC por nome também
  if ((lowerName.includes('ar ') || lowerName.includes(' ar') || lowerName.includes('ar-') || lowerName.includes('clima') || lowerName.includes('split')) && caps.includes('switch')) return DeviceType.AC;

  // 7. Sensores de Movimento/Presença
  if (caps.includes('presencesensor') || caps.includes('presence sensor')) return DeviceType.PRESENCE;
  if (caps.includes('motionsensor') || caps.includes('motion sensor')) return DeviceType.MOTION;

  // 8. Iluminação
  // Dimmers
  if (caps.includes('switchlevel') || caps.includes('changelevel')) return DeviceType.DIMMER;
  // Detecção por nome para child devices de dimmer
  if (caps.includes('switch') && lowerName.includes('dimmer')) return DeviceType.DIMMER;
  // Luzes RGB/CCT
  if (caps.includes('colorcontrol') || caps.includes('colortemperature')) return DeviceType.LIGHT;
  // Luzes por nome
  if (caps.includes('switch') && (lowerName.includes('luz') || lowerName.includes('led') || lowerName.includes('abajur') || lowerName.includes('light') || lowerName.includes('lustre') || lowerName.includes('arandela') || lowerName.includes('spot') || lowerName.includes('lamp'))) return DeviceType.LIGHT;

  // 9. Botões/Cenas (DEPOIS de BLIND para evitar que persianas virem cenas)
  if (caps.includes('pushablebutton') || caps.includes('holdablebutton')) return DeviceType.SCENE;
  if (lowerName.includes('cena') || lowerName.includes('scene') || lowerName.includes('botão') || lowerName.includes('button')) return DeviceType.SCENE;

  // 10. Switch genérico (fallback) - inclui Molsmart Relays
  if (caps.includes('switch')) return DeviceType.SWITCH;
  // Molsmart Relay child switches (Switch-01, Relay-01, etc)
  if (lowerName.includes('relay') || lowerName.includes('switch-0') || lowerName.includes('switch-1') || lowerName.includes('switch-2') || lowerName.includes('switch-3')) return DeviceType.SWITCH;
  
  return DeviceType.SWITCH;
};

/**
 * Busca os rooms do Hubitat via Maker API e retorna lista de rooms descobertos
 * Também retorna o mapeamento deviceId -> roomName do Hubitat
 */
export const fetchHubitatRooms = async (): Promise<{ rooms: string[], deviceRoomMap: Record<string, string> } | null> => {
  const config = getConfig();
  if (!config || (!config.hubIp && !config.useCloud)) return null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort('Timeout'), 15000);
    const ts = new Date().getTime();

    const url = `${buildBaseUrl(config)}/devices?access_token=${config.accessToken}&_t=${ts}`;
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) throw new Error(`HTTP Error ${response.status}`);

    const data = await response.json();
    const roomsSet = new Set<string>();
    const deviceRoomMap: Record<string, string> = {};

    data.forEach((item: any) => {
      if (item.room && item.room.trim()) {
        const roomName = item.room.trim();
        roomsSet.add(roomName);
        deviceRoomMap[item.id] = roomName;
      }
    });

    return {
      rooms: Array.from(roomsSet).sort(),
      deviceRoomMap
    };
  } catch (error: any) {
    console.error("Fetch Rooms Error:", error);
    return null;
  }
};

/**
 * Importa rooms do Hubitat para o Lumina
 * Cria os rooms que não existem e atualiza o mapeamento de dispositivos
 */
export const importRoomsFromHubitat = async (
  selectedRooms: string[],
  deviceRoomMap: Record<string, string>,
  existingRooms: Room[]
): Promise<{ newRooms: Room[], updatedDeviceMapping: Record<string, string> }> => {
  const defaultImages = [
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1484101403633-5e0c5a1c806a?auto=format&fit=crop&w=1920&q=80',
  ];

  const existingRoomNames = existingRooms.map(r => r.name.toLowerCase());
  const newRooms: Room[] = [];
  const roomNameToId: Record<string, string> = {};

  // Mapear rooms existentes
  existingRooms.forEach(r => {
    roomNameToId[r.name.toLowerCase()] = r.id;
  });

  // Criar novos rooms
  selectedRooms.forEach((roomName, index) => {
    const lowerName = roomName.toLowerCase();
    if (!existingRoomNames.includes(lowerName)) {
      const newRoom: Room = {
        id: `room_${Date.now()}_${index}`,
        name: roomName,
        image: defaultImages[index % defaultImages.length],
        deviceIds: []
      };
      newRooms.push(newRoom);
      roomNameToId[lowerName] = newRoom.id;
    }
  });

  // Atualizar mapeamento de dispositivos para rooms
  const currentMapping = getDeviceMapping();
  const updatedMapping = { ...currentMapping };

  Object.entries(deviceRoomMap).forEach(([deviceId, hubitatRoomName]) => {
    const lowerName = hubitatRoomName.toLowerCase();
    if (selectedRooms.map(r => r.toLowerCase()).includes(lowerName)) {
      const luminaRoomId = roomNameToId[lowerName];
      if (luminaRoomId) {
        updatedMapping[deviceId] = luminaRoomId;
      }
    }
  });

  return { newRooms, updatedDeviceMapping: updatedMapping };
};

/**
 * Busca todos os dispositivos do Hubitat via Maker API
 */
export const fetchHubitatDevices = async (): Promise<Record<string, Device> | null> => {
  const config = getConfig();
  if (!config || (!config.hubIp && !config.useCloud)) return null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort('Timeout'), 15000);
    const ts = new Date().getTime();

    let url = '';
    if (config.useLegacyApi) {
      url = `${buildBaseUrl(config)}/data?access_token=${config.accessToken}&_t=${ts}`;
    } else {
      url = `${buildBaseUrl(config)}/devices?access_token=${config.accessToken}&_t=${ts}`;
    }

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) throw new Error(`HTTP Error ${response.status}`);

    const data = await response.json();
    const devices: Record<string, Device> = {};
    
    const roomMapping = getDeviceMapping();
    const actionMapping = getActionMapping();
    const nameMapping = getNameMapping();

    data.forEach((item: any) => {
      const customName = nameMapping[item.id] || item.label || item.name || 'Dispositivo';
      const roomId = roomMapping[item.id] || 'living';
      const targetId = actionMapping[item.id];
      const model = item.model || '';
      const manufacturer = item.manufacturer || '';
      const capabilities = item.capabilities || [];

      const attributes = item.attributes || [];
      const state = mapAttributesToState(attributes);

      // Usar LABEL para detecção (nome amigável do usuário)
      const type = mapHubitatTypeToAppType(capabilities, item.label || item.name, model, manufacturer);

      devices[item.id] = {
        id: item.id,
        hubitatId: item.id,
        name: customName,
        type,
        roomId,
        targetDeviceId: targetId,
        state,
      };
    });

    return devices;

  } catch (error: any) {
    console.error("Fetch Error:", error);
    return null;
  }
};

export const testConnection = async (config: HubitatConfig): Promise<{ success: boolean; message: string }> => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort('Timeout'), 5000);

    let url = '';
    if (config.useLegacyApi) {
      url = `${buildBaseUrl(config)}/data?access_token=${config.accessToken}&_t=${new Date().getTime()}`;
    } else {
      url = `${buildBaseUrl(config)}/devices?access_token=${config.accessToken}&_t=${new Date().getTime()}`;
    }

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (response.ok) {
      return { success: true, message: 'Conexão bem sucedida!' };
    } else {
      return { success: false, message: `Erro HTTP: ${response.status}` };
    }
  } catch (error: any) {
    return { success: false, message: `Erro: ${error.message || 'Falha na conexão'}` };
  }
};

/**
 * Envia comando para o Hubitat
 * PARÂMETROS POSICIONAIS: deviceId, command, args (opcional)
 */
export const sendHubitatCommand = async (deviceId: string | number, command: string, secondaryArgs?: (string | number)[] | null): Promise<boolean> => {
  const config = getConfig();
  if (!config) return false;

  const actionMapping = getActionMapping();
  // Garantir que deviceId é string
  const deviceIdStr = String(deviceId);
  let targetId = deviceIdStr;
  
  if (deviceIdStr.startsWith('virtual_')) {
      const mappedId = actionMapping[deviceIdStr];
      if (mappedId) {
          targetId = mappedId;
      } else {
          return true;
      }
  }

  try {
    let url = `${buildBaseUrl(config)}/devices/${targetId}/${command}`;
    if (secondaryArgs && secondaryArgs.length > 0) {
        url += `/${secondaryArgs.join(',')}`;
    }
    url += `?access_token=${config.accessToken}`;

    console.log(`[Hubitat CMD] ${url}`);
    const response = await fetch(url);
    return response.ok;
  } catch (error) {
    console.error("Command Error:", error);
    return false;
  }
};

// ═══════════════════════════════════════════════════════════════════════════
//  CÂMERAS IP - Sistema Independente v1.6
// ═══════════════════════════════════════════════════════════════════════════

const DEFAULT_CAMERAS_CONFIG: CamerasConfig = {
  cameras: [],
  maxCameras: 4,
  showOnHome: true
};

export const getCamerasConfig = (): CamerasConfig => {
  const data = localStorage.getItem(CAMERAS_CONFIG_KEY);
  return data ? JSON.parse(data) : DEFAULT_CAMERAS_CONFIG;
};

export const saveCamerasConfig = (config: CamerasConfig): void => {
  localStorage.setItem(CAMERAS_CONFIG_KEY, JSON.stringify(config));
};

export const addCamera = (camera: Omit<IPCamera, 'id' | 'order'>): IPCamera | null => {
  const config = getCamerasConfig();
  if (config.cameras.length >= config.maxCameras) {
    return null; // Limite atingido
  }
  
  const newCamera: IPCamera = {
    ...camera,
    id: `cam_${Date.now()}`,
    order: config.cameras.length
  };
  
  config.cameras.push(newCamera);
  saveCamerasConfig(config);
  return newCamera;
};

export const updateCamera = (cameraId: string, updates: Partial<IPCamera>): boolean => {
  const config = getCamerasConfig();
  const index = config.cameras.findIndex(c => c.id === cameraId);
  if (index === -1) return false;
  
  config.cameras[index] = { ...config.cameras[index], ...updates };
  saveCamerasConfig(config);
  return true;
};

export const removeCamera = (cameraId: string): boolean => {
  const config = getCamerasConfig();
  const index = config.cameras.findIndex(c => c.id === cameraId);
  if (index === -1) return false;
  
  config.cameras.splice(index, 1);
  // Reordenar
  config.cameras.forEach((cam, i) => cam.order = i);
  saveCamerasConfig(config);
  return true;
};

export const getCameras = (): IPCamera[] => {
  return getCamerasConfig().cameras;
};

export const getCamerasByRoom = (roomId: string): IPCamera[] => {
  return getCamerasConfig().cameras.filter(c => c.roomId === roomId);
};

// ═══════════════════════════════════════════════════════════════════════════
//  HOME WIDGETS - Storage
// ═══════════════════════════════════════════════════════════════════════════

const DEFAULT_HOME_WIDGETS: HomeWidget[] = [
  { id: 'clock', type: 'clock', enabled: true, x: 0, y: 0, w: 2, h: 2, config: {} },
  { id: 'weather', type: 'weather', enabled: true, x: 2, y: 0, w: 2, h: 2, config: {} },
  { id: 'favorites', type: 'favorites', enabled: true, x: 0, y: 2, w: 4, h: 1, config: {} },
  { id: 'cameras', type: 'cameras', enabled: true, x: 0, y: 3, w: 4, h: 2, config: {} },
];

export const getHomeWidgets = (): HomeWidget[] => {
  try {
    const saved = localStorage.getItem('lumina_home_widgets');
    return saved ? JSON.parse(saved) : DEFAULT_HOME_WIDGETS;
  } catch {
    return DEFAULT_HOME_WIDGETS;
  }
};

export const saveHomeWidgets = (widgets: HomeWidget[]): void => {
  localStorage.setItem('lumina_home_widgets', JSON.stringify(widgets));
};

export const addHomeWidget = (widget: Omit<HomeWidget, 'id'>): HomeWidget => {
  const widgets = getHomeWidgets();
  const newWidget: HomeWidget = {
    ...widget,
    id: `widget_${Date.now()}`
  };
  widgets.push(newWidget);
  saveHomeWidgets(widgets);
  return newWidget;
};

export const removeHomeWidget = (widgetId: string): void => {
  const widgets = getHomeWidgets().filter(w => w.id !== widgetId);
  saveHomeWidgets(widgets);
};

export const updateHomeWidget = (widgetId: string, updates: Partial<HomeWidget>): void => {
  const widgets = getHomeWidgets().map(w => 
    w.id === widgetId ? { ...w, ...updates } : w
  );
  saveHomeWidgets(widgets);
};
