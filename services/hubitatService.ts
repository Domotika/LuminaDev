import { HubitatCommand, HubitatConfig, Device, DeviceType, Room } from '../types';
import { MOCK_DEVICES } from '../constants';

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
    const data: any = {
        r: getSavedRooms() || [],
        dm: getDeviceMapping(),
        nm: getNameMapping(),
        am: getActionMapping(),
        bg: getBackgroundMapping(),
        ri: getRoomImageMapping(),
        bm: getButtonMapping(),
        ly: getLayouts(),
        cd: getCustomDevices()
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
    if (chunks.length > 5) return { success: false, message: 'Configuração muito grande.' };
    try {
        const metaUrl = `${getBaseUrl(config)}/globals/${variableName}/CHUNKS:${chunks.length}?access_token=${config.accessToken}`;
        await fetch(metaUrl);
        for (let i = 0; i < chunks.length; i++) {
            const chunkUrl = `${getBaseUrl(config)}/globals/${variableName}_${i}/${encodeURIComponent(chunks[i])}?access_token=${config.accessToken}`;
            await fetch(chunkUrl);
        }
        return { success: true, message: 'Salvo com sucesso!' };
    } catch (e: any) { return { success: false, message: `Erro: ${e.message}` }; }
};

export const syncFromHubitat = async (variableName: string = 'LuminaData'): Promise<{success: boolean, message: string}> => {
    const config = getConfig();
    if (!config) return { success: false, message: 'Não configurado' };
    try {
        const mainUrl = `${getBaseUrl(config)}/globals/${variableName}?access_token=${config.accessToken}`;
        const mainRes = await fetch(mainUrl);
        if (!mainRes.ok) return { success: false, message: 'Erro ao ler dados' };
        const mainData = await mainRes.json();
        const mainValue = mainData.value;
        let fullBase64 = '';
        if (mainValue && mainValue.startsWith('CHUNKS:')) {
            const count = parseInt(mainValue.split(':')[1]);
            for (let i = 0; i < count; i++) {
                const chunkRes = await fetch(`${getBaseUrl(config)}/globals/${variableName}_${i}?access_token=${config.accessToken}`);
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
    
    if (name === 'volume') state.level = typeof value === 'number' ? value : parseInt(value);
    if (name === 'mute') state.mute = valStr === 'muted';
    
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

    // Water & Smoke (NOVOS)
    if (name === 'water') {
        state.water = valStr; // "wet" ou "dry"
        state.isOn = valStr === 'wet'; // Wet = Alarme Ativo
    }
    if (name === 'smoke') {
        state.smoke = valStr; // "detected" ou "clear"
        state.isOn = valStr === 'detected'; // Detected = Alarme Ativo
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
  });
  return state;
};

/**
 * Função unificada e robusta para detectar tipos
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

  // 2. Capabilities de Segurança e Sensores Críticos
  if (caps.includes('watersensor') || caps.includes('water sensor')) return DeviceType.WATER;
  if (caps.includes('smokesensor') || caps.includes('smoke sensor') || caps.includes('carbondioxidesensor')) return DeviceType.SMOKE;
  if (caps.includes('lock')) return DeviceType.LOCK;

  // 3. Climatização e Cortinas
  if (caps.includes('thermostat') || caps.includes('thermostatcooling') || caps.includes('thermostatheating')) return DeviceType.AC;
  if (caps.includes('windowshade') || caps.includes('windowblind')) return DeviceType.BLIND;

  // 4. Multimídia
  if (caps.includes('tv') || caps.includes('samsungtv') || (caps.includes('audiovolume') && lowerName.includes('tv'))) return DeviceType.TV;
  if (caps.includes('audiovolume') || caps.includes('musicplayer') || lowerName.includes('receiver') || lowerName.includes('avr')) return DeviceType.AVR;

  // 5. Sensores de Movimento/Presença
  if (caps.includes('presencesensor') || caps.includes('presence sensor')) return DeviceType.PRESENCE;
  if (caps.includes('motionsensor') || caps.includes('motion sensor')) return DeviceType.MOTION;

  // 6. Iluminação e Switches
  // Dimmers
  if (caps.includes('switchlevel') || caps.includes('changelevel')) return DeviceType.DIMMER;
  
  // Luzes (RGB/CCT ou nome específico)
  if (caps.includes('colorcontrol') || caps.includes('colortemperature')) return DeviceType.LIGHT;
  if (caps.includes('switch') && (lowerName.includes('luz') || lowerName.includes('led') || lowerName.includes('abajur') || lowerName.includes('light'))) return DeviceType.LIGHT;

  // Botões
  if (caps.includes('pushablebutton') || caps.includes('holdablebutton') || lowerName.includes('cena')) return DeviceType.SCENE;

  // Padrão
  if (caps.includes('switch')) return DeviceType.SWITCH;
  
  return DeviceType.SWITCH;
};

/**
 * Busca todos os dispositivos do Hubitat via Maker API
 */
export const fetchHubitatDevices = async (): Promise<Record<string, Device> | null> => {
  const config = getConfig();
  if (!config || !config.hubIp) return null;

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

      // 1. Processar Atributos (usando a função auxiliar exportada)
      // Se for Legacy API (Groovy), precisa adaptar o formato, mas assumindo Maker API padrão:
      const attributes = item.attributes || [];
      const state = mapAttributesToState(attributes);

      // 2. Detectar Tipo (AGORA USANDO A LÓGICA CENTRALIZADA)
      const type = mapHubitatTypeToAppType(capabilities, item.name || item.label, model, manufacturer);

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
// ... (seu código atual)

// --- ADICIONE ISSO NO FINAL DO ARQUIVO SE ESTIVER FALTANDO ---

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

export const sendHubitatCommand = async (deviceId: string, command: string, secondaryArgs?: (string | number)[] | null): Promise<boolean> => {
  const config = getConfig();
  if (!config) return false;

  const actionMapping = getActionMapping();
  let targetId = deviceId;
  
  if (deviceId.startsWith('virtual_')) {
      const mappedId = actionMapping[deviceId];
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

    const response = await fetch(url);
    return response.ok;
  } catch (error) {
    console.error("Command Error:", error);
    return false;
  }
};