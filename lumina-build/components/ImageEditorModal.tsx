import React, { useState, useEffect } from 'react';
import { X, Save, Upload, Link, RefreshCcw, Image as ImageIcon } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface ImageEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (imageData: string | null) => void;
  currentImage?: string;
  defaultImage: string;
  title: string;
}

export const ImageEditorModal: React.FC<ImageEditorModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  currentImage, 
  defaultImage,
  title
}) => {
  const [mode, setMode] = useState<'url' | 'upload'>('url');
  const [urlInput, setUrlInput] = useState('');
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPreview(currentImage || defaultImage);
      setUrlInput(currentImage && currentImage.startsWith('http') ? currentImage : '');
    }
  }, [isOpen, currentImage, defaultImage]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrlInput(e.target.value);
    if (e.target.value.match(/^https?:\/\//)) {
        setPreview(e.target.value);
    }
  };

  const handleSave = () => {
    // If preview matches default, we save null (reset to default)
    if (preview === defaultImage) {
        onSave(null);
    } else {
        onSave(preview);
    }
    onClose();
  };

  const handleRestoreDefault = () => {
      setPreview(defaultImage);
      setUrlInput('');
      onSave(null);
      onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <GlassCard className="w-full max-w-md bg-zinc-900/90 border-white/10 flex flex-col p-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
            <h3 className="text-sm font-medium uppercase tracking-widest text-white flex items-center gap-2">
                <ImageIcon size={16} /> {title}
            </h3>
            <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
                <X size={20} />
            </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-6">
            {/* Preview Area */}
            <div className="aspect-video w-full rounded-lg overflow-hidden border border-white/10 bg-black relative group">
                <img 
                    src={preview || defaultImage} 
                    alt="Preview" 
                    className="w-full h-full object-cover transition-opacity duration-300" 
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                <div className="absolute bottom-2 right-2 bg-black/60 px-2 py-1 rounded text-[10px] text-white/80">
                    Pré-visualização
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col gap-4">
                <div className="flex gap-2 p-1 bg-white/5 rounded-lg border border-white/10">
                    <button 
                        onClick={() => setMode('url')}
                        className={`flex-1 py-2 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-2 ${mode === 'url' ? 'bg-white/20 text-white shadow-md' : 'text-white/40 hover:text-white'}`}
                    >
                        <Link size={14} /> Link (URL)
                    </button>
                    <button 
                        onClick={() => setMode('upload')}
                        className={`flex-1 py-2 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-2 ${mode === 'upload' ? 'bg-white/20 text-white shadow-md' : 'text-white/40 hover:text-white'}`}
                    >
                        <Upload size={14} /> Upload
                    </button>
                </div>

                {mode === 'url' ? (
                    <input 
                        type="text" 
                        value={urlInput}
                        onChange={handleUrlChange}
                        placeholder="https://exemplo.com/imagem.jpg"
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white text-xs focus:outline-none focus:border-white/30 transition-colors"
                    />
                ) : (
                    <label className="w-full border border-dashed border-white/20 hover:border-white/40 bg-black/20 hover:bg-black/30 rounded-lg h-20 flex flex-col items-center justify-center cursor-pointer transition-all">
                         <span className="text-[10px] uppercase tracking-widest text-white/50 mb-1">Selecionar Arquivo</span>
                         <span className="text-[9px] text-white/30">(Máx 2MB recomendado)</span>
                         <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                )}
            </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-black/20 border-t border-white/10 flex justify-between items-center">
            <button 
                onClick={handleRestoreDefault}
                className="text-[10px] text-red-300 hover:text-red-200 flex items-center gap-1.5 px-3 py-2 rounded hover:bg-red-500/10 transition-colors"
            >
                <RefreshCcw size={12} /> Restaurar Padrão
            </button>
            <button 
                onClick={handleSave}
                className="bg-white text-black text-xs font-bold uppercase tracking-wider px-6 py-2.5 rounded-lg hover:bg-white/90 transition-colors flex items-center gap-2"
            >
                <Save size={14} /> Salvar
            </button>
        </div>
      </GlassCard>
    </div>
  );
};