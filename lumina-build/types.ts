export enum DeviceType {
  LIGHT = 'LIGHT',
  DIMMER = 'DIMMER',
  SWITCH = 'SWITCH',
  THERMOSTAT = 'THERMOSTAT',
  AC = 'AC',
  BLIND = 'BLIND',
  LOCK = 'LOCK',
  MEDIA = 'MEDIA',
  AVR = 'AVR',
  TV = 'TV',
  SCENE = 'SCENE',
  MOTION = 'MOTION',
  PRESENCE = 'PRESENCE',
  WATER = 'WATER',
  SMOKE = 'SMOKE',
}

export interface HubitatCommand {
  deviceId: string;
  command: string;
  arguments?: (string | number)[];
}

export interface HubitatConfig {
  hubIp: string;
  appId: string;
  accessToken: string;
  hubUuid?: string; // For Cloud Access
  useCloud?: boolean; // Toggle for Cloud Access
  useLegacyApi?: boolean; // Toggle for Custom Groovy App
  customAppId?: string; // ID of the Custom Groovy App
  enableLock?: boolean; // Toggle for Lumina Lock Screen
}

export interface Device {
  id: string;
  hubitatId: string; // The ID used for the actual Hubitat API
  name: string;
  type: DeviceType;
  roomId: string;
  targetDeviceId?: string; // Optional: ID of another device/switch to control (e.g., for Rule Machine)
  state: {
    isOn?: boolean;
    level?: number; // 0-100 for dimmers/media vol/blinds position
    temperature?: number;
    setpoint?: number;
    mode?: string;
    fanMode?: string; // Auto, Low, Med, High
    isLocked?: boolean;
    activeScene?: boolean;

    // Campos específicos para AVR/Denon
    input?: string;
    audioMode?: string;
    mute?: boolean;

    // Campos específicos para LG TV
    transportStatus?: string; // playing, paused, stopped
    currentApp?: string; // Netflix, YouTube, etc
    channelName?: string;

    // Campos para Persianas
    windowShade?: string; // open, closed, opening, closing, unknown

    // Campos para Sensores
    motion?: string; // active, inactive
    presence?: string; // present, not present
    humanMotionState?: string; // none, moving, small, static, etc.
    acceleration?: string; // active, inactive (Vibration)
    tilt?: string; // clear, detected
    distance?: number; // meters
    illuminance?: number; // lux
    battery?: number; // %

    // Campos para Sensores de Segurança (NOVOS)
    water?: string; // wet, dry
    smoke?: string; // clear, detected
    carbonMonoxide?: string; // clear, detected

    // Campos para Válvulas
    valve?: string; // open, closed
    waterConsumed?: number; // Liters
    timerTimeLeft?: number; // seconds/minutes
  };
}

export interface Room {
  id: string;
  name: string;
  image: string; // URL for background
  deviceIds: string[];
}

export interface AppState {
  currentRoomId: string | null; // null means 'Home/Overview'
  rooms: Room[];
  devices: Record<string, Device>;
}
