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
  TV = 'TV',               // LG TV (webOS)
  SAMSUNG_TV = 'SAMSUNG_TV', // Samsung TV (WOL + WebSocket)
  SCENE = 'SCENE',
  MOTION = 'MOTION',
  PRESENCE = 'PRESENCE',
  WATER = 'WATER',
  SMOKE = 'SMOKE',
  IR_REMOTE = 'IR_REMOTE',    // Molsmart GW8 IR/RF Remote (parent device)
  BUTTON = 'BUTTON',          // Generic button / Child button from IR remote
  CAMERA = 'CAMERA',          // IP Camera with snapshot/stream
  ENERGY = 'ENERGY',          // Energy meter (power, consumption)
  SOUNDSMART = 'SOUNDSMART',  // Molsmart/SoundSmart Multiroom Audio Player
  // ═══ NOVOS TIPOS v1.6.1 ═══════════════════════════════════════════════════
  SIREN = 'SIREN',            // Tuya Smart Siren Zigbee (alarm, chime, tone)
  MATTER_SENSOR = 'MATTER_SENSOR', // Matter Advanced Bridge sensors (contact, temp, humidity)
  CONTACT = 'CONTACT',        // Contact sensors (door/window)
  HUMIDITY = 'HUMIDITY',      // Humidity sensors
  TEMPERATURE = 'TEMPERATURE', // Temperature sensors (standalone)
  ILLUMINANCE = 'ILLUMINANCE', // Light sensors / Luximeters (Matter, Aqara, etc)
  RGB_CCT = 'RGB_CCT',         // RGB + CCT lights (Gledopto, RGBCCT strips, etc)
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
    gwOnline?: string; // online, offline, unknown (MolSmart GW3/GW8)

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

    // Campos para IR Remote (Molsmart GW8)
    numberOfButtons?: number; // Total de botões do controle
    lastAction?: string; // Última ação executada
    parentDeviceId?: string; // ID do dispositivo pai (para child buttons)

    // Campos para Câmeras (NOVO v1.6)
    snapshotUrl?: string; // URL para imagem estática
    streamUrl?: string; // URL para stream RTSP/MJPEG
    lastSnapshot?: number; // Timestamp do último snapshot

    // Campos para SoundSmart/Multiroom Audio (NOVO v1.6)
    volume?: number; // 0-100
    mute?: string; // muted, unmuted
    status?: string; // stopped, playing, paused, loading
    trackname?: string; // Nome da faixa atual
    trackDescription?: string; // Descrição HTML com capa
    URLLargeCoverFile?: string; // URL da capa do álbum
    ImageLargeCover?: string; // HTML da capa grande

    // Campos para Medidores de Energia (NOVO v1.6)
    power?: number; // Watts (consumo instantâneo)
    energy?: number; // kWh (consumo acumulado)
    voltage?: number; // Volts
    current?: number; // Amperes
    energyToday?: number; // kWh hoje
    energyCost?: number; // Custo estimado

    // ═══ NOVOS CAMPOS v1.6.1 - Siren/Alarm ═════════════════════════════════
    alarm?: string; // off, siren, strobe, both
    alarmState?: string; // Alarm Sound, Alarm Light, Alarm Sound and Light, No Alarm
    chimeStatus?: string; // playing, stopped
    soundName?: string; // Melody name
    duration?: number; // seconds
    tamperAlarm?: string; // clear, detected
    solarCharging?: string; // not charging, charging

    // ═══ NOVOS CAMPOS v1.6.1 - Matter/Contact Sensors ══════════════════════
    contact?: string; // open, closed
    humidity?: number; // % (para sensores de umidade)

    // ═══ NOVOS CAMPOS v1.6.1 - RGB/CCT Lights ════════════════════════════════
    hue?: number; // 0-360 (or 0-100 depending on driver)
    saturation?: number; // 0-100%
    colorTemperature?: number; // Kelvin (2700-6500K typical)
    colorMode?: string; // RGB, CT, CCT
    colorName?: string; // Red, Blue, Warm White, etc
    RGB?: string; // hex color #RRGGBB
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

// ═══════════════════════════════════════════════════════════════════════════
//  NOVAS INTERFACES v1.6 - Beta Features
// ═══════════════════════════════════════════════════════════════════════════

// Favoritos / Quick Actions
export interface Favorite {
  deviceId: string;
  order: number;
}

// Notificações / Alertas
export interface Notification {
  id: string;
  deviceId: string;
  type: 'alert' | 'warning' | 'info';
  message: string;
  timestamp: number;
  read: boolean;
}

// Histórico de Eventos
export interface EventLog {
  id: string;
  deviceId: string;
  deviceName: string;
  action: string;
  value?: string | number;
  timestamp: number;
}

// Configurações do Modo Kiosk
export interface KioskConfig {
  enabled: boolean;
  hideSettingsAfter: number; // segundos, 0 = nunca
  requirePinForSettings: boolean;
  pin?: string;
  autoRefresh: boolean;
  refreshInterval: number; // segundos
}

// Configurações de Energia
export interface EnergyConfig {
  currency: string; // BRL, USD, EUR
  kwhPrice: number; // Preço por kWh
  showCost: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
//  CÂMERAS IP - Sistema Independente (não são devices Hubitat)
// ═══════════════════════════════════════════════════════════════════════════

export type CameraStreamType = 'mjpeg' | 'snapshot' | 'rtsp';

export interface IPCamera {
  id: string;
  name: string;
  url: string; // URL principal (MJPEG, HTTP snapshot, ou RTSP)
  streamType: CameraStreamType;
  refreshInterval: number; // segundos (para snapshot)
  snapshotUrl?: string; // URL opcional de snapshot para preview (útil para RTSP)
  roomId?: string; // opcional: associar a um cômodo
  order: number; // ordem de exibição
}

export interface CamerasConfig {
  cameras: IPCamera[];
  maxCameras: number; // máximo permitido (4)
  showOnHome: boolean; // exibir na tela inicial
}


// ═══════════════════════════════════════════════════════════════════════════
//  HOME WIDGETS - Widgets personalizáveis para tela inicial
// ═══════════════════════════════════════════════════════════════════════════

export type HomeWidgetType = 
  | 'clock'      // Relógio e data
  | 'weather'    // Clima
  | 'favorites'  // Favoritos
  | 'energy'     // Consumo de energia
  | 'cameras'    // Câmeras IP
  | 'rss'        // Feed RSS
  | 'youtube'    // Player YouTube
  | 'spotify'    // Spotify Connect
  | 'calendar'   // Google Calendar
  | 'shortcuts'  // Atalhos rápidos
  | 'iframe'     // iFrame customizado
  | 'slideshow'  // Slideshow de fotos (URLs)
  | 'qrcode'     // Gerador de QR Code
  | 'text'       // Texto/Notas
  | 'video';     // Embed de vídeo (YouTube, etc)

export interface HomeWidget {
  id: string;
  type: HomeWidgetType;
  title?: string;
  enabled: boolean;
  config: Record<string, any>; // Configurações específicas por tipo
  // Grid position (react-grid-layout)
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
}

export interface HomeWidgetsConfig {
  widgets: HomeWidget[];
  gridCols: number;
  rowHeight: number;
}

// ═══════════════════════════════════════════════════════════════════════════
//  WIDGET CONFIGS - Configurações específicas por tipo de widget
// ═══════════════════════════════════════════════════════════════════════════

export interface SlideshowConfig {
  images: string[]; // URLs das imagens
  interval: number; // segundos entre transições
  transition: 'fade' | 'slide' | 'none';
  showCaption: boolean;
  captions?: string[]; // legendas opcionais
}

export interface QRCodeConfig {
  content: string; // URL ou texto para gerar QR
  size: number; // tamanho em pixels
  label?: string; // texto abaixo do QR
  foreground?: string; // cor do QR
  background?: string; // cor de fundo
}

export interface TextWidgetConfig {
  content: string; // conteúdo (suporta markdown básico)
  fontSize: 'sm' | 'md' | 'lg' | 'xl';
  textAlign: 'left' | 'center' | 'right';
  scrolling: boolean; // ticker/marquee style
  scrollSpeed?: number; // pixels por segundo
}

export interface VideoWidgetConfig {
  url: string; // URL do YouTube ou embed
  autoplay: boolean;
  muted: boolean;
  loop: boolean;
  showControls: boolean;
}
