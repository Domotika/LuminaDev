export interface DailyForecast {
  date: string;
  maxTemp: number;
  minTemp: number;
  weatherCode: number;
}

export interface WeatherData {
  temperature: number;
  weatherCode: number;
  isDay: boolean;
  windSpeed: number;
  description?: string;
  forecast: DailyForecast[];
}

export type ImageSource = 'unsplash' | 'custom' | 'animated' | 'youtube';

export interface SceneUrls {
  movie: string;
  sleep: string;
  wake: string;
  leave: string;
}

export interface HubitatConfig {
  hubIp: string;
  appId: string;
  accessToken: string;
  useCloud: boolean;
  hubUuid?: string;
}

export interface Settings {
  imageSource: ImageSource;
  customImageUrls: string;
  youtubeUrl?: string;
  animatedBackground?: string; // ID of selected animated bg, or 'all' for rotation
  flickrTags?: string;
  useFlickr: boolean;
  refreshInterval: number;
  showWeather: boolean;
  showClock: boolean;
  showDate: boolean;
  locationName: string;
  transparentWidgets: boolean;
  sceneUrls: SceneUrls;
  hubitat: HubitatConfig;
  latitude?: number;
  longitude?: number;
}

export interface Photo {
  url: string;
  author: string;
  title?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
//  HOME WIDGETS
// ═══════════════════════════════════════════════════════════════════════════

export type WidgetType = 'slideshow' | 'qrcode' | 'text' | 'video' | 'weather' | 'clock' | 'devices';

export interface WidgetLayout {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Widget {
  id: string;
  type: WidgetType;
  enabled: boolean;
  config: Record<string, any>;
  layout: WidgetLayout;
}

export interface SlideshowConfig {
  images: string[];
  interval: number;
  transition: 'fade' | 'slide' | 'none';
  showCaption: boolean;
  captions?: string[];
}

export interface QRCodeConfig {
  content: string;
  size: number;
  label?: string;
  foreground?: string;
  background?: string;
}

export interface TextWidgetConfig {
  content: string;
  fontSize: 'sm' | 'md' | 'lg' | 'xl';
  textAlign: 'left' | 'center' | 'right';
  scrolling: boolean;
  scrollSpeed?: number;
}

export interface VideoWidgetConfig {
  url: string;
  autoplay: boolean;
  muted: boolean;
  loop: boolean;
  showControls: boolean;
}

// Hubitat Device (simplified for display)
export interface HubitatDevice {
  id: string;
  name: string;
  type: string;
  state: {
    switch?: string;
    level?: number;
    temperature?: number;
    motion?: string;
    contact?: string;
  };
}
