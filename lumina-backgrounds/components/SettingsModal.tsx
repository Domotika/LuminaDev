import React, { useState } from 'react';
import { Settings, ImageSource } from '../types';
import { ANIMATED_BACKGROUNDS } from '../services/imageService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSave: (newSettings: Settings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSave }) => {
  const [localSettings, setLocalSettings] = useState<Settings>(settings);
  const [activeTab, setActiveTab] = useState<'general' | 'hubitat' | 'scenes'>('general');

  if (!isOpen) return null;

  const handleChange = (field: keyof Settings, value: any) => {
    setLocalSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleHubitatChange = (field: string, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      hubitat: { ...prev.hubitat, [field]: value }
    }));
  };

  const handleSceneUrlChange = (key: keyof Settings['sceneUrls'], value: string) => {
    setLocalSettings(prev => ({
      ...prev,
      sceneUrls: { ...prev.sceneUrls, [key]: value }
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-gray-900/95 border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl animate-fade-in flex flex-col max-h-[90vh]">
        {/* Header with Tabs */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 pb-0">
          <div className="flex gap-4">
            {['general', 'hubitat', 'scenes'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`pb-4 text-sm font-medium border-b-2 transition-colors capitalize ${
                  activeTab === tab 
                    ? 'text-blue-400 border-blue-400' 
                    : 'text-white/50 border-transparent hover:text-white/80'
                }`}
              >
                {tab === 'general' ? 'Geral' : tab === 'hubitat' ? 'Hubitat' : 'Cenas'}
              </button>
            ))}
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {/* GENERAL TAB */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              {/* Image Source */}
              <div className="space-y-3">
                <h3 className="font-medium text-white">Fonte das Imagens</h3>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { value: 'unsplash', label: '📷 Fotos' },
                    { value: 'animated', label: '✨ Animados' },
                    { value: 'youtube', label: '▶️ YouTube' },
                    { value: 'custom', label: '🔗 URLs' }
                  ].map(option => (
                    <label
                      key={option.value}
                      className={`flex-1 cursor-pointer border rounded-xl p-3 text-center text-sm transition-all ${
                        localSettings.imageSource === option.value
                          ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                          : 'border-white/10 text-white/60 hover:border-white/30'
                      }`}
                    >
                      <input
                        type="radio"
                        name="imageSource"
                        className="hidden"
                        checked={localSettings.imageSource === option.value}
                        onChange={() => handleChange('imageSource', option.value as ImageSource)}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>

                {localSettings.imageSource === 'unsplash' && (
                  <div className="bg-white/5 p-4 rounded-lg space-y-2">
                    <label className="text-xs text-white/50 uppercase tracking-wider">Tags (categorias)</label>
                    <input
                      type="text"
                      placeholder="natureza, arquitetura, musica"
                      value={localSettings.flickrTags || ''}
                      onChange={(e) => handleChange('flickrTags', e.target.value)}
                      className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                    />
                  </div>
                )}
                
                {localSettings.imageSource === 'animated' && (
                  <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 p-4 rounded-lg border border-purple-500/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">✨</span>
                        <span className="text-sm font-medium text-purple-300">Backgrounds Animados</span>
                      </div>
                    </div>
                    
                    {/* Selection Grid */}
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {/* All option */}
                      <button
                        onClick={() => handleChange('animatedBackground', 'all')}
                        className={`relative aspect-square rounded-lg border-2 transition-all flex flex-col items-center justify-center gap-1 ${
                          !localSettings.animatedBackground || localSettings.animatedBackground === 'all'
                            ? 'border-purple-500 bg-purple-500/30'
                            : 'border-white/10 hover:border-white/30 bg-black/20'
                        }`}
                      >
                        <span className="text-lg">🔄</span>
                        <span className="text-[10px] text-white/70">Todos</span>
                      </button>
                      
                      {/* Individual backgrounds */}
                      {ANIMATED_BACKGROUNDS.map(bg => (
                        <button
                          key={bg.id}
                          onClick={() => handleChange('animatedBackground', bg.id)}
                          className={`relative aspect-square rounded-lg border-2 transition-all flex flex-col items-center justify-center gap-1 ${
                            localSettings.animatedBackground === bg.id
                              ? 'border-purple-500 bg-purple-500/30'
                              : 'border-white/10 hover:border-white/30 bg-black/20'
                          }`}
                          title={bg.title}
                        >
                          <span className="text-lg">{bg.icon}</span>
                          <span className="text-[10px] text-white/70 truncate w-full px-1 text-center">{bg.title}</span>
                        </button>
                      ))}
                    </div>
                    
                    <p className="text-xs text-white/40">
                      {!localSettings.animatedBackground || localSettings.animatedBackground === 'all' 
                        ? 'Alternando entre todas as animações'
                        : `Selecionado: ${ANIMATED_BACKGROUNDS.find(b => b.id === localSettings.animatedBackground)?.title}`
                      }
                    </p>
                  </div>
                )}

                {localSettings.imageSource === 'youtube' && (
                  <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 p-4 rounded-lg border border-red-500/20 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">▶️</span>
                      <span className="text-sm font-medium text-red-300">Vídeo do YouTube</span>
                    </div>
                    <p className="text-xs text-white/60">
                      Cole a URL de um vídeo do YouTube. Recomendado: loops de natureza, aquário, lareira ou "ambient backgrounds".
                    </p>
                    <input
                      type="text"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={localSettings.youtubeUrl || ''}
                      onChange={(e) => handleChange('youtubeUrl', e.target.value)}
                      className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-red-500 outline-none"
                    />
                    <div className="flex items-center gap-2 text-xs text-yellow-400/80">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Requer servidor HTTP. Não funciona via file://</span>
                    </div>
                  </div>
                )}
                
                {localSettings.imageSource === 'custom' && (
                  <div className="bg-white/5 p-4 rounded-lg space-y-2">
                    <label className="text-xs text-white/50 uppercase tracking-wider">URLs das imagens (uma por linha)</label>
                    <textarea
                      rows={4}
                      placeholder="https://exemplo.com/imagem1.jpg"
                      value={localSettings.customImageUrls || ''}
                      onChange={(e) => handleChange('customImageUrls', e.target.value)}
                      className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-blue-500 outline-none resize-none"
                    />
                  </div>
                )}
              </div>

              {/* Display Options */}
              <div className="space-y-4">
                <h3 className="font-medium text-white">Exibição</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-white/50 uppercase tracking-wider">Transição (seg)</label>
                    <input
                      type="number"
                      min="5"
                      value={localSettings.refreshInterval}
                      onChange={(e) => handleChange('refreshInterval', parseInt(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white mt-1 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/50 uppercase tracking-wider">Local</label>
                    <input
                      type="text"
                      value={localSettings.locationName}
                      onChange={(e) => handleChange('locationName', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white mt-1 focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  {[
                    { field: 'showClock', label: 'Mostrar Relógio' },
                    { field: 'showDate', label: 'Mostrar Data' },
                    { field: 'showWeather', label: 'Mostrar Clima' },
                    { field: 'transparentWidgets', label: 'Widgets Transparentes' }
                  ].map(item => (
                    <label key={item.field} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(localSettings as any)[item.field]}
                        onChange={(e) => handleChange(item.field as keyof Settings, e.target.checked)}
                        className="w-4 h-4 rounded text-blue-500"
                      />
                      <span className="text-sm text-white/80">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* HUBITAT TAB */}
          {activeTab === 'hubitat' && (
            <div className="space-y-6">
              <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-lg">
                <p className="text-sm text-blue-300">
                  Configure o Maker API do Hubitat para controlar dispositivos e executar cenas.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-wider">IP do Hub</label>
                  <input
                    type="text"
                    placeholder="192.168.1.100"
                    value={localSettings.hubitat.hubIp}
                    onChange={(e) => handleHubitatChange('hubIp', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white mt-1 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-white/50 uppercase tracking-wider">App ID (Maker API)</label>
                  <input
                    type="text"
                    placeholder="123"
                    value={localSettings.hubitat.appId}
                    onChange={(e) => handleHubitatChange('appId', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white mt-1 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-white/50 uppercase tracking-wider">Access Token</label>
                  <input
                    type="password"
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    value={localSettings.hubitat.accessToken}
                    onChange={(e) => handleHubitatChange('accessToken', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white mt-1 font-mono focus:border-blue-500 outline-none"
                  />
                </div>

                <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.hubitat.useCloud}
                    onChange={(e) => handleHubitatChange('useCloud', e.target.checked)}
                    className="w-4 h-4 rounded text-blue-500"
                  />
                  <span className="text-sm text-white/80">Usar Hubitat Cloud</span>
                </label>

                {localSettings.hubitat.useCloud && (
                  <div>
                    <label className="text-xs text-white/50 uppercase tracking-wider">Hub UUID (Cloud)</label>
                    <input
                      type="text"
                      placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                      value={localSettings.hubitat.hubUuid || ''}
                      onChange={(e) => handleHubitatChange('hubUuid', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white mt-1 font-mono focus:border-blue-500 outline-none"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SCENES TAB */}
          {activeTab === 'scenes' && (
            <div className="space-y-6">
              <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-lg">
                <p className="text-sm text-yellow-300">
                  Insira as URLs do Maker API para cada cena. O dashboard fará a requisição diretamente.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { key: 'movie' as const, label: 'Modo Filme', icon: '🎬' },
                  { key: 'sleep' as const, label: 'Hora de Dormir', icon: '🌙' },
                  { key: 'wake' as const, label: 'Acordar', icon: '☀️' },
                  { key: 'leave' as const, label: 'Saindo de Casa', icon: '🚪' }
                ].map(scene => (
                  <div key={scene.key}>
                    <label className="text-xs text-white/50 uppercase tracking-wider flex items-center gap-2">
                      <span>{scene.icon}</span>
                      {scene.label}
                    </label>
                    <input
                      type="text"
                      placeholder="https://cloud.hubitat.com/api/..."
                      value={localSettings.sceneUrls?.[scene.key] || ''}
                      onChange={(e) => handleSceneUrlChange(scene.key, e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white mt-1 font-mono focus:border-blue-500 outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onSave(localSettings);
              onClose();
            }}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow transition-colors flex items-center gap-2"
          >
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
