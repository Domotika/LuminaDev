import React, { useState, useEffect } from 'react';
import GridLayout from 'react-grid-layout';
import { Widget, WidgetLayout, SlideshowConfig, QRCodeConfig, TextWidgetConfig, VideoWidgetConfig } from '../types';
import 'react-grid-layout/css/styles.css';

interface WidgetGridProps {
  widgets: Widget[];
  onUpdate: (widgetId: string, config: any) => void;
  onRemove: (widgetId: string) => void;
  onLayoutChange: (widgetId: string, layout: WidgetLayout) => void;
}

export const WidgetGrid: React.FC<WidgetGridProps> = ({ 
  widgets, 
  onUpdate, 
  onRemove,
  onLayoutChange
}) => {
  const [editingWidget, setEditingWidget] = useState<string | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 1200, height: 800 });

  useEffect(() => {
    const updateSize = () => {
      setContainerSize({
        width: window.innerWidth - 40,
        height: window.innerHeight - 120
      });
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const layout = widgets.map(w => ({
    i: w.id,
    x: w.layout.x,
    y: w.layout.y,
    w: w.layout.w,
    h: w.layout.h,
    minW: 1,
    minH: 1,
  }));

  const handleLayoutChange = (newLayout: any[]) => {
    newLayout.forEach(item => {
      const widget = widgets.find(w => w.id === item.i);
      if (widget) {
        const changed = 
          widget.layout.x !== item.x ||
          widget.layout.y !== item.y ||
          widget.layout.w !== item.w ||
          widget.layout.h !== item.h;
        
        if (changed) {
          onLayoutChange(item.i, { x: item.x, y: item.y, w: item.w, h: item.h });
        }
      }
    });
  };

  const cols = 12;
  // Grid starts from row 3 (after clock/weather area) - uses bottom 4 rows
  const availableHeight = Math.floor(containerSize.height * 0.65); // ~65% of screen for widgets
  const rowHeight = Math.floor(availableHeight / 4);

  return (
    <>
      {/* Widget area: positioned in center/bottom, leaving top 35% for clock/weather */}
      <div 
        className="absolute left-0 right-0 bottom-0 z-20 pointer-events-auto" 
        style={{ 
          top: '35%', // Start below clock/weather area
          padding: '10px 20px 80px 20px' // Extra bottom padding for control bar
        }}
      >
        <GridLayout
          className="layout"
          layout={layout}
          cols={cols}
          rowHeight={rowHeight}
          width={containerSize.width}
          onLayoutChange={handleLayoutChange}
          draggableHandle=".drag-handle"
          isResizable={true}
          isDraggable={true}
          compactType={null}
          preventCollision={false}
          margin={[10, 10]}
        >
          {widgets.map(widget => (
            <div key={widget.id} className="relative group">
              {/* Drag Handle */}
              <div className="drag-handle absolute top-0 left-0 right-0 h-6 cursor-move bg-gradient-to-b from-black/40 to-transparent rounded-t-2xl opacity-0 group-hover:opacity-100 transition-all z-30 flex items-center justify-center">
                <div className="flex gap-1">
                  <div className="w-1 h-1 rounded-full bg-white/50" />
                  <div className="w-1 h-1 rounded-full bg-white/50" />
                  <div className="w-1 h-1 rounded-full bg-white/50" />
                </div>
              </div>

              {/* Widget Content */}
              <div className="h-full w-full">
                {widget.type === 'slideshow' && (
                  <SlideshowWidget config={widget.config as SlideshowConfig} onEdit={() => setEditingWidget(widget.id)} />
                )}
                {widget.type === 'qrcode' && (
                  <QRCodeWidget config={widget.config as QRCodeConfig} onEdit={() => setEditingWidget(widget.id)} />
                )}
                {widget.type === 'text' && (
                  <TextWidget config={widget.config as TextWidgetConfig} onEdit={() => setEditingWidget(widget.id)} />
                )}
                {widget.type === 'video' && (
                  <VideoWidget config={widget.config as VideoWidgetConfig} onEdit={() => setEditingWidget(widget.id)} />
                )}
              </div>

              {/* Control buttons */}
              <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-all z-30">
                <button
                  onClick={() => setEditingWidget(widget.id)}
                  className="p-1.5 bg-blue-500/80 hover:bg-blue-500 rounded-full shadow-lg"
                  title="Configurar"
                >
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                <button
                  onClick={() => onRemove(widget.id)}
                  className="p-1.5 bg-red-500/80 hover:bg-red-500 rounded-full shadow-lg"
                  title="Remover"
                >
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </GridLayout>
      </div>

      {/* Edit Modal */}
      {editingWidget && (
        <WidgetEditor
          widget={widgets.find(w => w.id === editingWidget)!}
          onSave={(config) => {
            onUpdate(editingWidget, config);
            setEditingWidget(null);
          }}
          onClose={() => setEditingWidget(null)}
        />
      )}
    </>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
//  WIDGET COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

const SlideshowWidget: React.FC<{ config: SlideshowConfig; onEdit: () => void }> = ({ config, onEdit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const images = config.images || [];
  const interval = (config.interval || 10) * 1000;

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % images.length);
        setIsTransitioning(false);
      }, 500);
    }, interval);
    return () => clearInterval(timer);
  }, [images.length, interval]);

  if (images.length === 0) {
    return (
      <div className="h-full w-full bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 border-dashed flex flex-col items-center justify-center gap-2 text-white/40 cursor-pointer" onClick={onEdit}>
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="text-xs">Slideshow</span>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl">
      <div className={`absolute inset-0 bg-cover bg-center transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`} style={{ backgroundImage: `url(${images[currentIndex]})` }} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {images.slice(0, 10).map((_, i) => (
            <div key={i} className={`w-1 h-1 rounded-full transition-all ${i === currentIndex % 10 ? 'bg-white w-3' : 'bg-white/40'}`} />
          ))}
        </div>
      )}
    </div>
  );
};

const QRCodeWidget: React.FC<{ config: QRCodeConfig; onEdit: () => void }> = ({ config, onEdit }) => {
  const content = config.content || '';
  const size = config.size || 150;
  const qrUrl = content ? `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(content)}&color=ffffff&bgcolor=000000` : '';

  if (!content) {
    return (
      <div className="h-full w-full bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 border-dashed flex flex-col items-center justify-center gap-2 text-white/40 cursor-pointer" onClick={onEdit}>
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
        </svg>
        <span className="text-xs">QR Code</span>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 flex flex-col items-center justify-center gap-2 p-3">
      <img src={qrUrl} alt="QR" className="max-w-full max-h-[calc(100%-1.5rem)] object-contain rounded" style={{ imageRendering: 'pixelated' }} />
      {config.label && <span className="text-[10px] text-white/70 truncate w-full text-center">{config.label}</span>}
    </div>
  );
};

const TextWidget: React.FC<{ config: TextWidgetConfig; onEdit: () => void }> = ({ config, onEdit }) => {
  const content = config.content || '';
  const fontSize = { sm: 'text-xs', md: 'text-sm', lg: 'text-base', xl: 'text-lg' }[config.fontSize || 'md'];
  const textAlign = { left: 'text-left', center: 'text-center', right: 'text-right' }[config.textAlign || 'center'];

  const parseMarkdown = (text: string) => text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code class="bg-white/10 px-1 rounded">$1</code>')
    .replace(/\n/g, '<br/>');

  if (!content) {
    return (
      <div className="h-full w-full bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 border-dashed flex flex-col items-center justify-center gap-2 text-white/40 cursor-pointer" onClick={onEdit}>
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
        <span className="text-xs">Texto</span>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 p-3 flex items-center justify-center overflow-hidden">
      <div className={`${fontSize} ${textAlign} text-white/90 leading-relaxed`} dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }} />
    </div>
  );
};

const VideoWidget: React.FC<{ config: VideoWidgetConfig; onEdit: () => void }> = ({ config, onEdit }) => {
  const url = config.url || '';
  
  const getYouTubeId = (url: string): string | null => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/) || url.match(/^([a-zA-Z0-9_-]{11})$/);
    return match ? match[1] : null;
  };

  const videoId = getYouTubeId(url);
  
  const embedUrl = videoId ? (() => {
    const params = new URLSearchParams();
    if (config.autoplay) params.set('autoplay', '1');
    if (config.muted) params.set('mute', '1');
    if (config.loop) { params.set('loop', '1'); params.set('playlist', videoId); }
    if (!config.showControls) params.set('controls', '0');
    params.set('rel', '0');
    params.set('modestbranding', '1');
    params.set('enablejsapi', '1');
    if (typeof window !== 'undefined') params.set('origin', window.location.origin);
    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  })() : '';

  if (!url || !videoId) {
    return (
      <div className="h-full w-full bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 border-dashed flex flex-col items-center justify-center gap-2 text-white/40 cursor-pointer" onClick={onEdit}>
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-xs">Vídeo</span>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl bg-black">
      <iframe src={embedUrl} className="absolute inset-0 w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen frameBorder="0" />
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
//  WIDGET EDITOR
// ═══════════════════════════════════════════════════════════════════════════

const WidgetEditor: React.FC<{ widget: Widget; onSave: (config: any) => void; onClose: () => void }> = ({ widget, onSave, onClose }) => {
  const [config, setConfig] = useState(widget.config);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 pointer-events-auto" onClick={onClose}>
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-lg font-medium text-white capitalize">Configurar {widget.type}</h3>
          <button onClick={onClose} className="text-white/50 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          <p className="text-xs text-white/40 bg-white/5 p-2 rounded">
            💡 Arraste o widget pela barra superior para reposicionar. Redimensione pelos cantos.
          </p>

          {widget.type === 'slideshow' && (
            <>
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wider">URLs das imagens</label>
                <textarea
                  value={(config.images || []).join('\n')}
                  onChange={e => setConfig({ ...config, images: e.target.value.split('\n').filter(u => u.trim()) })}
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white mt-1 font-mono"
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wider">Intervalo (seg)</label>
                <input type="number" min={3} value={config.interval || 10} onChange={e => setConfig({ ...config, interval: Number(e.target.value) })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white mt-1" />
              </div>
            </>
          )}
          
          {widget.type === 'qrcode' && (
            <>
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wider">URL ou Texto</label>
                <input type="text" value={config.content || ''} onChange={e => setConfig({ ...config, content: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white mt-1" placeholder="https://..." />
              </div>
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wider">Legenda</label>
                <input type="text" value={config.label || ''} onChange={e => setConfig({ ...config, label: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white mt-1" placeholder="Wi-Fi" />
              </div>
            </>
          )}
          
          {widget.type === 'text' && (
            <>
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wider">Texto</label>
                <textarea value={config.content || ''} onChange={e => setConfig({ ...config, content: e.target.value })} rows={3} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white mt-1" placeholder="**Negrito** *itálico*" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-wider">Tamanho</label>
                  <select value={config.fontSize || 'md'} onChange={e => setConfig({ ...config, fontSize: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white mt-1">
                    <option value="sm">Pequeno</option>
                    <option value="md">Médio</option>
                    <option value="lg">Grande</option>
                    <option value="xl">Extra</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-wider">Alinhamento</label>
                  <select value={config.textAlign || 'center'} onChange={e => setConfig({ ...config, textAlign: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white mt-1">
                    <option value="left">Esquerda</option>
                    <option value="center">Centro</option>
                    <option value="right">Direita</option>
                  </select>
                </div>
              </div>
            </>
          )}
          
          {widget.type === 'video' && (
            <>
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wider">URL do YouTube</label>
                <input type="url" value={config.url || ''} onChange={e => setConfig({ ...config, url: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white mt-1" placeholder="https://youtube.com/watch?v=..." />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-white/80 cursor-pointer">
                  <input type="checkbox" checked={config.autoplay || false} onChange={e => setConfig({ ...config, autoplay: e.target.checked })} className="w-4 h-4 rounded" /> Autoplay
                </label>
                <label className="flex items-center gap-2 text-sm text-white/80 cursor-pointer">
                  <input type="checkbox" checked={config.muted !== false} onChange={e => setConfig({ ...config, muted: e.target.checked })} className="w-4 h-4 rounded" /> Mudo
                </label>
                <label className="flex items-center gap-2 text-sm text-white/80 cursor-pointer">
                  <input type="checkbox" checked={config.loop || false} onChange={e => setConfig({ ...config, loop: e.target.checked })} className="w-4 h-4 rounded" /> Repetir
                </label>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 p-4 border-t border-white/10">
          <button onClick={onClose} className="px-4 py-2 text-white/60 hover:text-white">Cancelar</button>
          <button onClick={() => onSave(config)} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};
