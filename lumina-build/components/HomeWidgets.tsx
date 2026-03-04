import React, { useState, useEffect, useRef } from 'react';
import { 
  Image as ImageIcon, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  Settings,
  QrCode,
  Type,
  Video,
  X,
  Plus,
  Trash2,
  Save,
  ExternalLink
} from 'lucide-react';
import { GlassCard } from './GlassCard';
import { 
  HomeWidget, 
  SlideshowConfig, 
  QRCodeConfig, 
  TextWidgetConfig, 
  VideoWidgetConfig 
} from '../types';

// ═══════════════════════════════════════════════════════════════════════════
//  SLIDESHOW WIDGET - Fotos rotativas com transição
// ═══════════════════════════════════════════════════════════════════════════

interface SlideshowWidgetProps {
  config: SlideshowConfig;
  onEdit?: () => void;
  compact?: boolean;
}

export const SlideshowWidget: React.FC<SlideshowWidgetProps> = ({ config, onEdit, compact }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const images = config.images || [];
  const interval = (config.interval || 10) * 1000;

  useEffect(() => {
    if (!isPlaying || images.length <= 1) return;
    
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % images.length);
        setIsTransitioning(false);
      }, 500);
    }, interval);

    return () => clearInterval(timer);
  }, [isPlaying, images.length, interval]);

  const goTo = (index: number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsTransitioning(false);
    }, 300);
  };

  const goNext = () => goTo((currentIndex + 1) % images.length);
  const goPrev = () => goTo((currentIndex - 1 + images.length) % images.length);

  if (images.length === 0) {
    return (
      <GlassCard className="h-full flex flex-col items-center justify-center gap-3 text-white/40">
        <ImageIcon size={32} />
        <span className="text-xs">Nenhuma imagem</span>
        {onEdit && (
          <button 
            onClick={onEdit}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs transition-colors"
          >
            Configurar
          </button>
        )}
      </GlassCard>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl group">
      {/* Image */}
      <div 
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-500 ${
          isTransitioning ? 'opacity-0' : 'opacity-100'
        }`}
        style={{ backgroundImage: `url(${images[currentIndex]})` }}
      />
      
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

      {/* Controls - shown on hover */}
      <div className="absolute inset-0 flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={goPrev}
          className="p-2 bg-black/40 hover:bg-black/60 rounded-full backdrop-blur-sm transition-all"
        >
          <ChevronLeft size={20} className="text-white" />
        </button>
        <button 
          onClick={goNext}
          className="p-2 bg-black/40 hover:bg-black/60 rounded-full backdrop-blur-sm transition-all"
        >
          <ChevronRight size={20} className="text-white" />
        </button>
      </div>

      {/* Bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-between">
        {/* Dots */}
        {images.length > 1 && images.length <= 10 && (
          <div className="flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  i === currentIndex ? 'bg-white w-4' : 'bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        )}
        
        {images.length > 10 && (
          <span className="text-xs text-white/60">
            {currentIndex + 1} / {images.length}
          </span>
        )}

        {/* Play/Pause */}
        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-1.5 bg-black/40 hover:bg-black/60 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
        >
          {isPlaying ? <Pause size={14} className="text-white" /> : <Play size={14} className="text-white" />}
        </button>
      </div>

      {/* Caption */}
      {config.showCaption && config.captions?.[currentIndex] && (
        <div className="absolute bottom-12 left-0 right-0 px-4 text-center">
          <span className="text-sm text-white/90 drop-shadow-lg">
            {config.captions[currentIndex]}
          </span>
        </div>
      )}

      {/* Edit button */}
      {onEdit && (
        <button 
          onClick={onEdit}
          className="absolute top-2 right-2 p-1.5 bg-black/40 hover:bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-all"
        >
          <Settings size={14} className="text-white" />
        </button>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
//  QR CODE WIDGET - Gerador de QR Code
// ═══════════════════════════════════════════════════════════════════════════

interface QRCodeWidgetProps {
  config: QRCodeConfig;
  onEdit?: () => void;
}

export const QRCodeWidget: React.FC<QRCodeWidgetProps> = ({ config, onEdit }) => {
  const content = config.content || '';
  const size = config.size || 150;
  const fg = (config.foreground || '#ffffff').replace('#', '');
  const bg = (config.background || '000000').replace('#', '');
  
  // Using QR Server API (free, no dependencies)
  const qrUrl = content 
    ? `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(content)}&color=${fg}&bgcolor=${bg}`
    : '';

  if (!content) {
    return (
      <GlassCard className="h-full flex flex-col items-center justify-center gap-3 text-white/40">
        <QrCode size={32} />
        <span className="text-xs">QR Code vazio</span>
        {onEdit && (
          <button 
            onClick={onEdit}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs transition-colors"
          >
            Configurar
          </button>
        )}
      </GlassCard>
    );
  }

  return (
    <GlassCard className="h-full flex flex-col items-center justify-center gap-3 p-4 group relative">
      <img 
        src={qrUrl} 
        alt="QR Code"
        className="max-w-full max-h-[calc(100%-2rem)] object-contain rounded-lg"
        style={{ imageRendering: 'pixelated' }}
      />
      
      {config.label && (
        <span className="text-xs text-white/70 text-center truncate w-full">
          {config.label}
        </span>
      )}

      {onEdit && (
        <button 
          onClick={onEdit}
          className="absolute top-2 right-2 p-1.5 bg-black/40 hover:bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-all"
        >
          <Settings size={14} className="text-white" />
        </button>
      )}
    </GlassCard>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
//  TEXT WIDGET - Texto/Notas com suporte a markdown básico
// ═══════════════════════════════════════════════════════════════════════════

interface TextWidgetProps {
  config: TextWidgetConfig;
  onEdit?: () => void;
}

export const TextWidget: React.FC<TextWidgetProps> = ({ config, onEdit }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [needsScroll, setNeedsScroll] = useState(false);

  const content = config.content || '';
  const fontSize = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  }[config.fontSize || 'md'];

  const textAlign = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }[config.textAlign || 'left'];

  // Basic markdown parsing
  const parseMarkdown = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-white/10 px-1 rounded">$1</code>')
      .replace(/\n/g, '<br/>');
  };

  useEffect(() => {
    if (containerRef.current && contentRef.current) {
      setNeedsScroll(contentRef.current.scrollHeight > containerRef.current.clientHeight);
    }
  }, [content]);

  if (!content) {
    return (
      <GlassCard className="h-full flex flex-col items-center justify-center gap-3 text-white/40">
        <Type size={32} />
        <span className="text-xs">Texto vazio</span>
        {onEdit && (
          <button 
            onClick={onEdit}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs transition-colors"
          >
            Configurar
          </button>
        )}
      </GlassCard>
    );
  }

  return (
    <GlassCard className="h-full flex flex-col p-4 group relative overflow-hidden">
      <div 
        ref={containerRef}
        className={`flex-1 overflow-hidden ${config.scrolling && needsScroll ? 'relative' : 'overflow-y-auto'}`}
      >
        {config.scrolling && needsScroll ? (
          <div className="animate-marquee-vertical">
            <div 
              ref={contentRef}
              className={`${fontSize} ${textAlign} text-white/90 leading-relaxed`}
              dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
            />
          </div>
        ) : (
          <div 
            ref={contentRef}
            className={`${fontSize} ${textAlign} text-white/90 leading-relaxed`}
            dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
          />
        )}
      </div>

      {onEdit && (
        <button 
          onClick={onEdit}
          className="absolute top-2 right-2 p-1.5 bg-black/40 hover:bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-all"
        >
          <Settings size={14} className="text-white" />
        </button>
      )}
    </GlassCard>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
//  VIDEO WIDGET - YouTube/Video embed
// ═══════════════════════════════════════════════════════════════════════════

interface VideoWidgetProps {
  config: VideoWidgetConfig;
  onEdit?: () => void;
}

export const VideoWidget: React.FC<VideoWidgetProps> = ({ config, onEdit }) => {
  const url = config.url || '';
  
  // Extract YouTube video ID
  const getYouTubeId = (url: string): string | null => {
    const regexes = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
    ];
    for (const regex of regexes) {
      const match = url.match(regex);
      if (match) return match[1];
    }
    return null;
  };

  const videoId = getYouTubeId(url);
  
  // Build embed URL with options
  const embedUrl = videoId ? (() => {
    const params = new URLSearchParams();
    if (config.autoplay) params.set('autoplay', '1');
    if (config.muted) params.set('mute', '1');
    if (config.loop) {
      params.set('loop', '1');
      params.set('playlist', videoId);
    }
    if (!config.showControls) params.set('controls', '0');
    params.set('rel', '0'); // No related videos
    params.set('modestbranding', '1');
    
    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  })() : '';

  if (!url) {
    return (
      <GlassCard className="h-full flex flex-col items-center justify-center gap-3 text-white/40">
        <Video size={32} />
        <span className="text-xs">Nenhum vídeo</span>
        {onEdit && (
          <button 
            onClick={onEdit}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs transition-colors"
          >
            Configurar
          </button>
        )}
      </GlassCard>
    );
  }

  if (!videoId) {
    return (
      <GlassCard className="h-full flex flex-col items-center justify-center gap-3 text-red-400/80">
        <Video size={32} />
        <span className="text-xs text-center px-4">URL inválida. Use links do YouTube.</span>
        {onEdit && (
          <button 
            onClick={onEdit}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs transition-colors text-white"
          >
            Corrigir
          </button>
        )}
      </GlassCard>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl group bg-black">
      <iframe
        src={embedUrl}
        className="absolute inset-0 w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        frameBorder="0"
      />
      
      {onEdit && (
        <button 
          onClick={onEdit}
          className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 rounded-full opacity-0 group-hover:opacity-100 transition-all z-10"
        >
          <Settings size={14} className="text-white" />
        </button>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
//  WIDGET EDITOR MODALS
// ═══════════════════════════════════════════════════════════════════════════

interface WidgetEditorProps<T> {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: T) => void;
  config: T;
  title: string;
}

// Slideshow Editor
export const SlideshowEditor: React.FC<WidgetEditorProps<SlideshowConfig>> = ({
  isOpen, onClose, onSave, config, title
}) => {
  const [images, setImages] = useState<string[]>(config.images || []);
  const [captions, setCaptions] = useState<string[]>(config.captions || []);
  const [interval, setInterval] = useState(config.interval || 10);
  const [transition, setTransition] = useState(config.transition || 'fade');
  const [showCaption, setShowCaption] = useState(config.showCaption || false);
  const [newUrl, setNewUrl] = useState('');

  const addImage = () => {
    if (newUrl.trim()) {
      setImages([...images, newUrl.trim()]);
      setCaptions([...captions, '']);
      setNewUrl('');
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setCaptions(captions.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave({
      images,
      captions,
      interval,
      transition: transition as 'fade' | 'slide' | 'none',
      showCaption
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-lg font-medium text-white">{title}</h3>
          <button onClick={onClose} className="text-white/50 hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Add Image */}
          <div>
            <label className="text-xs text-white/50 uppercase tracking-wider">Adicionar Imagem</label>
            <div className="flex gap-2 mt-1">
              <input
                type="url"
                value={newUrl}
                onChange={e => setNewUrl(e.target.value)}
                placeholder="https://exemplo.com/imagem.jpg"
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30"
                onKeyDown={e => e.key === 'Enter' && addImage()}
              />
              <button
                onClick={addImage}
                className="px-3 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
              >
                <Plus size={18} className="text-white" />
              </button>
            </div>
          </div>

          {/* Image List */}
          {images.length > 0 && (
            <div>
              <label className="text-xs text-white/50 uppercase tracking-wider">Imagens ({images.length})</label>
              <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                {images.map((img, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white/5 rounded-lg p-2">
                    <img src={img} className="w-12 h-12 object-cover rounded" alt="" />
                    <input
                      type="text"
                      value={captions[i] || ''}
                      onChange={e => {
                        const newCaptions = [...captions];
                        newCaptions[i] = e.target.value;
                        setCaptions(newCaptions);
                      }}
                      placeholder="Legenda (opcional)"
                      className="flex-1 bg-transparent text-sm text-white/80 placeholder-white/30"
                    />
                    <button
                      onClick={() => removeImage(i)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/50 uppercase tracking-wider">Intervalo (seg)</label>
              <input
                type="number"
                min={3}
                max={120}
                value={interval}
                onChange={e => setInterval(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white mt-1"
              />
            </div>
            <div>
              <label className="text-xs text-white/50 uppercase tracking-wider">Transição</label>
              <select
                value={transition}
                onChange={e => setTransition(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white mt-1"
              >
                <option value="fade">Fade</option>
                <option value="slide">Slide</option>
                <option value="none">Nenhuma</option>
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-white/80 cursor-pointer">
            <input
              type="checkbox"
              checked={showCaption}
              onChange={e => setShowCaption(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            Mostrar legendas
          </label>
        </div>

        <div className="flex justify-end gap-2 p-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 text-white/60 hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Save size={16} /> Salvar
          </button>
        </div>
      </div>
    </div>
  );
};

// QR Code Editor
export const QRCodeEditor: React.FC<WidgetEditorProps<QRCodeConfig>> = ({
  isOpen, onClose, onSave, config, title
}) => {
  const [content, setContent] = useState(config.content || '');
  const [label, setLabel] = useState(config.label || '');
  const [size, setSize] = useState(config.size || 150);

  const handleSave = () => {
    onSave({ content, label, size, foreground: '#ffffff', background: '#000000' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-lg font-medium text-white">{title}</h3>
          <button onClick={onClose} className="text-white/50 hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          <div>
            <label className="text-xs text-white/50 uppercase tracking-wider">URL ou Texto</label>
            <input
              type="text"
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="https://..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white mt-1"
            />
          </div>

          <div>
            <label className="text-xs text-white/50 uppercase tracking-wider">Legenda (opcional)</label>
            <input
              type="text"
              value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder="Wi-Fi da Casa"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white mt-1"
            />
          </div>

          {/* Preview */}
          {content && (
            <div className="flex justify-center py-4">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(content)}&color=ffffff&bgcolor=000000`}
                alt="Preview"
                className="rounded-lg"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 p-4 border-t border-white/10">
          <button onClick={onClose} className="px-4 py-2 text-white/60 hover:text-white">Cancelar</button>
          <button onClick={handleSave} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg flex items-center gap-2">
            <Save size={16} /> Salvar
          </button>
        </div>
      </div>
    </div>
  );
};

// Text Editor
export const TextEditor: React.FC<WidgetEditorProps<TextWidgetConfig>> = ({
  isOpen, onClose, onSave, config, title
}) => {
  const [content, setContent] = useState(config.content || '');
  const [fontSize, setFontSize] = useState(config.fontSize || 'md');
  const [textAlign, setTextAlign] = useState(config.textAlign || 'left');
  const [scrolling, setScrolling] = useState(config.scrolling || false);

  const handleSave = () => {
    onSave({
      content,
      fontSize: fontSize as 'sm' | 'md' | 'lg' | 'xl',
      textAlign: textAlign as 'left' | 'center' | 'right',
      scrolling
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-lg font-medium text-white">{title}</h3>
          <button onClick={onClose} className="text-white/50 hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          <div>
            <label className="text-xs text-white/50 uppercase tracking-wider">Texto</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Digite seu texto aqui... Suporta **negrito** e *itálico*"
              rows={6}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white mt-1 resize-none"
            />
            <p className="text-[10px] text-white/30 mt-1">Suporta: **negrito**, *itálico*, `código`</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/50 uppercase tracking-wider">Tamanho</label>
              <select
                value={fontSize}
                onChange={e => setFontSize(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white mt-1"
              >
                <option value="sm">Pequeno</option>
                <option value="md">Médio</option>
                <option value="lg">Grande</option>
                <option value="xl">Extra Grande</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-white/50 uppercase tracking-wider">Alinhamento</label>
              <select
                value={textAlign}
                onChange={e => setTextAlign(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white mt-1"
              >
                <option value="left">Esquerda</option>
                <option value="center">Centro</option>
                <option value="right">Direita</option>
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-white/80 cursor-pointer">
            <input
              type="checkbox"
              checked={scrolling}
              onChange={e => setScrolling(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            Rolagem automática (ticker)
          </label>
        </div>

        <div className="flex justify-end gap-2 p-4 border-t border-white/10">
          <button onClick={onClose} className="px-4 py-2 text-white/60 hover:text-white">Cancelar</button>
          <button onClick={handleSave} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg flex items-center gap-2">
            <Save size={16} /> Salvar
          </button>
        </div>
      </div>
    </div>
  );
};

// Video Editor
export const VideoEditor: React.FC<WidgetEditorProps<VideoWidgetConfig>> = ({
  isOpen, onClose, onSave, config, title
}) => {
  const [url, setUrl] = useState(config.url || '');
  const [autoplay, setAutoplay] = useState(config.autoplay || false);
  const [muted, setMuted] = useState(config.muted || true);
  const [loop, setLoop] = useState(config.loop || false);
  const [showControls, setShowControls] = useState(config.showControls !== false);

  const handleSave = () => {
    onSave({ url, autoplay, muted, loop, showControls });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-lg font-medium text-white">{title}</h3>
          <button onClick={onClose} className="text-white/50 hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          <div>
            <label className="text-xs text-white/50 uppercase tracking-wider">URL do YouTube</label>
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white mt-1"
            />
            <p className="text-[10px] text-white/30 mt-1">Aceita links do YouTube ou ID do vídeo</p>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-white/80 cursor-pointer">
              <input type="checkbox" checked={autoplay} onChange={e => setAutoplay(e.target.checked)} className="w-4 h-4 rounded" />
              Reproduzir automaticamente
            </label>
            <label className="flex items-center gap-2 text-sm text-white/80 cursor-pointer">
              <input type="checkbox" checked={muted} onChange={e => setMuted(e.target.checked)} className="w-4 h-4 rounded" />
              Iniciar mudo
            </label>
            <label className="flex items-center gap-2 text-sm text-white/80 cursor-pointer">
              <input type="checkbox" checked={loop} onChange={e => setLoop(e.target.checked)} className="w-4 h-4 rounded" />
              Repetir vídeo
            </label>
            <label className="flex items-center gap-2 text-sm text-white/80 cursor-pointer">
              <input type="checkbox" checked={showControls} onChange={e => setShowControls(e.target.checked)} className="w-4 h-4 rounded" />
              Mostrar controles
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2 p-4 border-t border-white/10">
          <button onClick={onClose} className="px-4 py-2 text-white/60 hover:text-white">Cancelar</button>
          <button onClick={handleSave} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg flex items-center gap-2">
            <Save size={16} /> Salvar
          </button>
        </div>
      </div>
    </div>
  );
};

export default {
  SlideshowWidget,
  QRCodeWidget,
  TextWidget,
  VideoWidget,
  SlideshowEditor,
  QRCodeEditor,
  TextEditor,
  VideoEditor
};
