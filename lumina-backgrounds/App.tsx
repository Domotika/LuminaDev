import React, { useEffect, useState, useCallback } from 'react';
import { Background } from './components/Background';
import { Clock } from './components/Widgets/Clock';
import { DateDisplay } from './components/Widgets/DateDisplay';
import { Weather } from './components/Widgets/Weather';
import { SceneButtons } from './components/Widgets/SceneButtons';
import { SettingsModal } from './components/SettingsModal';
import { WidgetGrid } from './components/WidgetGrid';
import { fetchWeather } from './services/weatherService';
import { fetchPhotos } from './services/imageService';
import { loadSettings, saveSettings, loadWidgets, saveWidgets } from './services/hubitatService';
import { WeatherData, Settings, Photo, Widget, WidgetLayout } from './types';

const DEFAULT_SETTINGS: Settings = {
  imageSource: 'unsplash',
  customImageUrls: '',
  youtubeUrl: '',
  useFlickr: false,
  flickrTags: 'nature, architecture',
  refreshInterval: 30,
  showWeather: true,
  showClock: true,
  showDate: true,
  locationName: 'Minha Casa',
  transparentWidgets: true,
  sceneUrls: { movie: '', sleep: '', wake: '', leave: '' },
  hubitat: {
    hubIp: '',
    appId: '',
    accessToken: '',
    useCloud: false,
    hubUuid: ''
  },
  latitude: -23.5505,
  longitude: -46.6333
};

const App: React.FC = () => {
  const [settings, setSettings] = useState<Settings>(() => {
    // Merge saved settings with defaults to handle missing/new fields
    const saved = loadSettings();
    if (saved) {
      return { ...DEFAULT_SETTINGS, ...saved, hubitat: { ...DEFAULT_SETTINGS.hubitat, ...saved.hubitat } };
    }
    return DEFAULT_SETTINGS;
  });
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [widgets, setWidgets] = useState<Widget[]>(() => loadWidgets());
  const [showAddMenu, setShowAddMenu] = useState(false);

  // Save settings when changed
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Save widgets when changed
  useEffect(() => {
    saveWidgets(widgets);
  }, [widgets]);

  // Load photos based on settings
  useEffect(() => {
    const tags = settings.flickrTags || 'nature';
    const source = settings.imageSource || 'unsplash'; // Fallback for corrupted settings
    const animatedBgId = settings.animatedBackground;
    
    fetchPhotos(source, settings.customImageUrls || '', tags, animatedBgId)
      .then(photos => {
        if (photos && photos.length > 0) {
          setPhotos(photos);
        } else {
          console.warn("No photos returned, using fallback");
          // Force unsplash collection if source returned empty
          fetchPhotos('unsplash', '', 'nature').then(setPhotos);
        }
      })
      .catch(err => {
        console.error("Error loading photos:", err);
        // Fallback to default collection on error
        fetchPhotos('unsplash', '', 'nature').then(setPhotos).catch(() => {});
      });
  }, [settings.imageSource, settings.customImageUrls, settings.flickrTags, settings.animatedBackground]);

  // Load weather
  const loadWeather = useCallback(async () => {
    if (!settings.showWeather) return;
    
    setLoadingWeather(true);
    
    // Try geolocation first
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const data = await fetchWeather(position.coords.latitude, position.coords.longitude);
            setWeather(data);
          } catch (e) {
            console.error(e);
          } finally {
            setLoadingWeather(false);
          }
        },
        async () => {
          // Fallback to saved or default coordinates
          const lat = settings.latitude || -23.5505;
          const lon = settings.longitude || -46.6333;
          try {
            const data = await fetchWeather(lat, lon);
            setWeather(data);
          } catch (err) {
            console.error("Weather error", err);
          } finally {
            setLoadingWeather(false);
          }
        }
      );
    } else {
      setLoadingWeather(false);
    }
  }, [settings.showWeather, settings.latitude, settings.longitude]);

  useEffect(() => {
    loadWeather();
    // Refresh weather every 30 minutes
    const interval = setInterval(loadWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadWeather]);

  // Widget class helper
  const getWidgetClass = (isRow = false) => {
    const base = "animate-fade-in p-5 transition-all duration-300 h-full";
    const layout = isRow ? "flex flex-row items-center justify-between gap-6" : "flex flex-col";
    
    if (settings.transparentWidgets) {
      return `${base} ${layout}`;
    }
    return `${base} ${layout} bg-black/40 backdrop-blur-md rounded-2xl shadow-2xl border border-white/5`;
  };

  // Add widget handler
  const handleAddWidget = (type: Widget['type']) => {
    const defaultConfigs: Record<string, any> = {
      slideshow: { images: [], interval: 10, transition: 'fade', showCaption: false },
      qrcode: { content: '', size: 150, label: '' },
      text: { content: '', fontSize: 'md', textAlign: 'center', scrolling: false },
      video: { url: '', autoplay: false, muted: true, loop: true, showControls: false }
    };

    // Find a free spot in the center/bottom area (rows 0-3 in widget grid = rows 3-6 on screen)
    const existingPositions = widgets.map(w => ({ x: w.layout.x, y: w.layout.y }));
    let x = 0, y = 0;
    for (let row = 0; row < 4; row++) { // 4 rows available in widget area
      for (let col = 0; col < 12; col += 3) {
        if (!existingPositions.some(p => p.x === col && p.y === row)) {
          x = col;
          y = row;
          break;
        }
      }
    }

    const newWidget: Widget = {
      id: `widget_${Date.now()}`,
      type,
      enabled: true,
      config: defaultConfigs[type] || {},
      layout: { x, y, w: 3, h: 2 }
    };

    setWidgets(prev => [...prev, newWidget]);
    setShowAddMenu(false);
  };

  const handleLayoutChange = (widgetId: string, layout: WidgetLayout) => {
    setWidgets(prev => prev.map(w => 
      w.id === widgetId ? { ...w, layout } : w
    ));
  };

  const handleUpdateWidget = (widgetId: string, config: any) => {
    setWidgets(prev => prev.map(w => 
      w.id === widgetId ? { ...w, config } : w
    ));
  };

  const handleRemoveWidget = (widgetId: string) => {
    setWidgets(prev => prev.filter(w => w.id !== widgetId));
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden font-sans select-none text-white">
      {/* Dynamic Background */}
      <Background 
        photos={photos} 
        interval={settings.refreshInterval}
        imageSource={settings.imageSource}
        youtubeUrl={settings.youtubeUrl}
      />

      {/* Main Layout Grid */}
      <div className="absolute inset-0 z-10 grid grid-cols-12 grid-rows-6 gap-4 p-6 md:p-8 pointer-events-none">
        
        {/* Top Left: Clock & Date */}
        {(settings.showClock || settings.showDate) && (
          <div className="col-span-12 md:col-span-5 lg:col-span-4 row-span-1 flex flex-col pointer-events-auto">
            <div className={getWidgetClass(true)}>
              {settings.showClock && <Clock />}
              {settings.showClock && settings.showDate && (
                <div className={`h-12 w-px ${settings.transparentWidgets ? 'bg-white/40' : 'bg-white/20'}`} />
              )}
              {settings.showDate && <DateDisplay />}
            </div>
          </div>
        )}

        {/* Scene Buttons - Row 2 Left */}
        <div className="col-span-12 md:col-span-5 lg:col-span-4 row-start-2 flex flex-col justify-start pointer-events-auto z-20">
          <SceneButtons settings={settings} />
        </div>

        {/* Right Side: Weather Panel */}
        {settings.showWeather && (
          <div className="col-span-12 md:col-span-4 lg:col-span-3 row-span-3 md:row-start-1 md:col-start-9 lg:col-start-10 flex flex-col pointer-events-auto">
            <div className={getWidgetClass(false)}>
              <Weather data={weather} loading={loadingWeather} locationName={settings.locationName} />
            </div>
          </div>
        )}

        {/* Custom Widgets - Drag & Drop */}
        {widgets.length > 0 && (
          <WidgetGrid 
            widgets={widgets}
            onUpdate={handleUpdateWidget}
            onRemove={handleRemoveWidget}
            onLayoutChange={handleLayoutChange}
          />
        )}

        {/* Bottom Bar: Controls */}
        <div className="row-start-6 col-span-12 flex justify-between items-end pointer-events-auto">
          {/* Brand/Info */}
          <div className="flex items-center gap-2 bg-black/20 backdrop-blur-sm rounded-full px-4 py-2">
            <span className="text-sm font-medium text-white/80">Lumina Backgrounds</span>
            <span className="text-xs text-white/40">v2.0</span>
          </div>

          {/* Controls */}
          <div className="flex gap-3">
            {/* Add Widget Button */}
            <div className="relative">
              <button 
                onClick={() => setShowAddMenu(!showAddMenu)}
                className={`backdrop-blur-md text-white/80 hover:text-white transition-all p-3 rounded-full border shadow-lg ${
                  showAddMenu 
                    ? 'bg-blue-600/60 border-blue-500/50' 
                    : 'bg-gray-800/40 border-white/10 hover:bg-gray-700/60'
                }`}
                title="Adicionar Widget"
              >
                <svg className={`w-6 h-6 transition-transform ${showAddMenu ? 'rotate-45' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
              {/* Dropdown */}
              {showAddMenu && (
                <>
                  {/* Backdrop to close on click outside */}
                  <div className="fixed inset-0 z-40" onClick={() => setShowAddMenu(false)} />
                  <div className="absolute bottom-full right-0 mb-2 z-50 animate-fade-in">
                    <div className="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden min-w-48">
                      <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-white/40 border-b border-white/5">
                        Adicionar Widget
                      </div>
                      {[
                        { type: 'slideshow' as const, label: 'Slideshow', icon: '🖼️' },
                        { type: 'video' as const, label: 'Vídeo', icon: '📺' },
                        { type: 'qrcode' as const, label: 'QR Code', icon: '📱' },
                        { type: 'text' as const, label: 'Texto', icon: '📝' }
                      ].map(item => (
                        <button
                          key={item.type}
                          onClick={() => handleAddWidget(item.type)}
                          className="w-full text-left px-4 py-3 text-sm text-white hover:bg-white/10 flex items-center gap-3"
                        >
                          <span>{item.icon}</span>
                          <span>{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Settings Button */}
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="bg-gray-800/40 backdrop-blur-md text-white/80 hover:text-white hover:bg-gray-700/60 transition-all p-3 rounded-full border border-white/10 shadow-lg group"
              title="Configurações"
            >
              <svg className="w-6 h-6 group-hover:rotate-45 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={setSettings}
      />
    </div>
  );
};

export default App;
