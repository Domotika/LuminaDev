// ═══════════════════════════════════════════════════════════════════════════
//  AI CONFIG PANEL - Configurações do Assistente IA (Lumina Style)
// ═══════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Check, AlertCircle, Loader2 } from 'lucide-react';
import {
  AIConfig,
  AIProvider,
  getAIConfig,
  saveAIConfig,
  DEFAULT_AI_CONFIG,
  AI_MODELS,
} from '../services/aiService';
import {
  SceneConfig,
  getSceneConfig,
  saveSceneConfig,
  DEFAULT_SCENE_CONFIG,
  testConnection as testSceneConnection,
} from '../services/sceneService';

interface AIConfigPanelProps {
  onClose: () => void;
  onSave: (config: AIConfig) => void;
}

export const AIConfigPanel: React.FC<AIConfigPanelProps> = ({ onClose, onSave }) => {
  const [config, setConfig] = useState<AIConfig>(DEFAULT_AI_CONFIG);
  const [sceneConfig, setSceneConfig] = useState<SceneConfig>(DEFAULT_SCENE_CONFIG);
  const [showApiKey, setShowApiKey] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testError, setTestError] = useState<string>('');
  const [sceneTestStatus, setSceneTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  useEffect(() => {
    const loaded = getAIConfig();
    setConfig(loaded);
    const loadedScene = getSceneConfig();
    setSceneConfig(loadedScene);
  }, []);

  const handleProviderChange = (provider: AIProvider) => {
    const defaultModel = AI_MODELS[provider][0].id;
    setConfig({ ...config, provider, model: defaultModel });
    setTestStatus('idle');
  };

  const handleSave = () => {
    saveAIConfig(config);
    saveSceneConfig(sceneConfig);
    onSave(config);
    onClose();
  };

  const handleTestScene = async () => {
    setSceneTestStatus('testing');
    const tempConfig = { ...sceneConfig, enabled: true };
    saveSceneConfig(tempConfig);
    const success = await testSceneConnection();
    setSceneTestStatus(success ? 'success' : 'error');
    if (!success) {
      setSceneConfig({ ...sceneConfig, enabled: false });
    } else {
      setSceneConfig(tempConfig);
    }
  };

  const handleTest = async () => {
    if (!config.apiKey) {
      setTestStatus('error');
      setTestError('Insira uma API Key');
      return;
    }

    setTestStatus('testing');
    setTestError('');

    try {
      switch (config.provider) {
        case 'openai':
          const openaiRes = await fetch('https://api.openai.com/v1/models', {
            headers: { 'Authorization': `Bearer ${config.apiKey}` },
          });
          if (!openaiRes.ok) {
            const err = await openaiRes.json().catch(() => ({}));
            throw new Error(err.error?.message || 'API Key inválida');
          }
          break;

        case 'anthropic':
          const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': config.apiKey,
              'anthropic-version': '2023-06-01',
              'anthropic-dangerous-direct-browser-access': 'true',
            },
            body: JSON.stringify({
              model: config.model, // Use selected model
              max_tokens: 10,
              messages: [{ role: 'user', content: 'test' }],
            }),
          });
          if (!anthropicRes.ok) {
            const err = await anthropicRes.json().catch(() => ({}));
            throw new Error(err.error?.message || 'API Key inválida');
          }
          break;

        case 'google':
          const googleRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${config.apiKey}`
          );
          if (!googleRes.ok) {
            const err = await googleRes.json().catch(() => ({}));
            throw new Error(err.error?.message || 'API Key inválida');
          }
          break;
      }

      setTestStatus('success');
    } catch (e: any) {
      setTestStatus('error');
      setTestError(e.message || 'Erro ao validar API Key');
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-zinc-900/95 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="text-lg font-medium text-white flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 8V4H8" />
                <rect width="16" height="12" x="4" y="8" rx="2" />
                <path d="M2 14h2" /><path d="M20 14h2" />
                <path d="M15 13v2" /><path d="M9 13v2" />
              </svg>
            </div>
            Configurar IA
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X size={18} className="text-white/60" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {/* Enable Toggle */}
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
            <div>
              <p className="font-medium text-white text-sm">Ativar Assistente IA</p>
              <p className="text-[10px] text-white/50 mt-0.5">Requer API Key própria</p>
            </div>
            <button
              onClick={() => setConfig({ ...config, enabled: !config.enabled })}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                config.enabled ? 'bg-blue-500' : 'bg-white/20'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${
                  config.enabled ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Provider Selection */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-white/40">Provedor</label>
            <div className="grid grid-cols-3 gap-2">
              {(['openai', 'anthropic', 'google'] as AIProvider[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handleProviderChange(p)}
                  className={`p-3 rounded-xl border transition-all text-center ${
                    config.provider === p
                      ? 'bg-blue-500/20 border-blue-500/50 text-white'
                      : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  <span 
                    className={`block w-3 h-3 rounded-full mx-auto mb-2 ${
                      p === 'openai' ? 'bg-green-500' : p === 'anthropic' ? 'bg-orange-500' : 'bg-blue-500'
                    }`}
                  />
                  <span className="text-[10px] font-medium capitalize">{p}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Model Selection */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-white/40">Modelo</label>
            <select
              value={config.model}
              onChange={(e) => setConfig({ ...config, model: e.target.value })}
              className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:border-blue-500/50 transition-colors text-sm"
            >
              {AI_MODELS[config.provider].map((m) => (
                <option key={m.id} value={m.id} className="bg-zinc-900">
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* API Key */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-white/40">API Key</label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={config.apiKey}
                onChange={(e) => {
                  setConfig({ ...config, apiKey: e.target.value });
                  setTestStatus('idle');
                }}
                placeholder={`Sua ${config.provider} API Key`}
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 pr-12 outline-none focus:border-blue-500/50 transition-colors font-mono text-xs"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white/80 transition-colors"
              >
                {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-[9px] text-white/40 flex items-center gap-1.5">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Armazenada apenas no seu navegador
            </p>
          </div>

          {/* Test Button */}
          <button
            type="button"
            onClick={handleTest}
            disabled={!config.apiKey || testStatus === 'testing'}
            className={`w-full p-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 text-sm ${
              testStatus === 'success'
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : testStatus === 'error'
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 disabled:opacity-50'
            }`}
          >
            {testStatus === 'testing' && <><Loader2 size={16} className="animate-spin" /> Testando...</>}
            {testStatus === 'success' && <><Check size={16} /> Conexão OK!</>}
            {testStatus === 'error' && <><AlertCircle size={16} /> {testError}</>}
            {testStatus === 'idle' && 'Testar Conexão'}
          </button>

          {/* Lumina Bridge Config */}
          <details className="group">
            <summary className="text-[10px] text-white/40 cursor-pointer hover:text-white/60 flex items-center gap-1">
              <span className="text-[8px]">▶</span> Lumina Bridge (Regras & Cenas)
            </summary>
            <div className="mt-3 space-y-3 pt-3 border-t border-white/10">
              <div>
                <label className="text-[9px] text-white/40 uppercase tracking-wide">Bridge URL</label>
                <input
                  type="text"
                  value={config.bridgeUrl || ''}
                  onChange={(e) => setConfig({ ...config, bridgeUrl: e.target.value })}
                  placeholder="http://192.168.1.100/apps/api/109"
                  className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 mt-1 text-xs outline-none focus:border-blue-500/50 font-mono"
                />
              </div>
              <div>
                <label className="text-[9px] text-white/40 uppercase tracking-wide">Access Token</label>
                <input
                  type="text"
                  value={config.bridgeToken || ''}
                  onChange={(e) => setConfig({ ...config, bridgeToken: e.target.value })}
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 mt-1 text-xs outline-none focus:border-blue-500/50 font-mono"
                />
              </div>
              <p className="text-[8px] text-white/30 leading-relaxed">
                Instale o Lumina Bridge app no Hubitat para criar regras e cenas via IA.
              </p>
            </div>
          </details>

          {/* Scene Manager Config */}
          <details className="group" open={sceneConfig.enabled}>
            <summary className="text-[10px] text-white/40 cursor-pointer hover:text-white/60 flex items-center gap-1">
              <span className="text-[8px]">▶</span> Lumina Scene Manager (Hubitat)
            </summary>
            <div className="mt-3 space-y-3 pt-3 border-t border-white/10">
              <div>
                <label className="text-[9px] text-white/40 uppercase tracking-wide">API URL</label>
                <input
                  type="text"
                  value={sceneConfig.apiUrl}
                  onChange={(e) => setSceneConfig({ ...sceneConfig, apiUrl: e.target.value })}
                  placeholder="https://cloud.hubitat.com/api/.../apps/XXX"
                  className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 mt-1 text-xs outline-none focus:border-blue-500/50 font-mono"
                />
              </div>
              <div>
                <label className="text-[9px] text-white/40 uppercase tracking-wide">Access Token</label>
                <input
                  type="text"
                  value={sceneConfig.accessToken}
                  onChange={(e) => setSceneConfig({ ...sceneConfig, accessToken: e.target.value })}
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 mt-1 text-xs outline-none focus:border-blue-500/50 font-mono"
                />
              </div>
              <button
                type="button"
                onClick={handleTestScene}
                disabled={!sceneConfig.apiUrl || !sceneConfig.accessToken}
                className={`w-full p-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-2 ${
                  sceneTestStatus === 'success'
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : sceneTestStatus === 'error'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 disabled:opacity-50'
                }`}
              >
                {sceneTestStatus === 'testing' && 'Testando...'}
                {sceneTestStatus === 'success' && 'Scene Manager OK!'}
                {sceneTestStatus === 'error' && 'Erro na conexão'}
                {sceneTestStatus === 'idle' && 'Testar Scene Manager'}
              </button>
            </div>
          </details>

          {/* Advanced Settings */}
          <details className="group">
            <summary className="text-[10px] text-white/40 cursor-pointer hover:text-white/60 flex items-center gap-1">
              <span className="text-[8px]">▶</span> Configurações Avançadas
            </summary>
            <div className="mt-3 space-y-3 pt-3 border-t border-white/10">
              <div>
                <label className="text-[9px] text-white/40 uppercase tracking-wide">Max Tokens</label>
                <input
                  type="number"
                  value={config.maxTokens}
                  onChange={(e) => setConfig({ ...config, maxTokens: parseInt(e.target.value) || 1024 })}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 mt-1 text-sm outline-none focus:border-blue-500/50"
                />
              </div>
              <div>
                <label className="text-[9px] text-white/40 uppercase tracking-wide">Temperatura ({config.temperature})</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={config.temperature}
                  onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                  className="w-full mt-2 accent-blue-500"
                />
              </div>
            </div>
          </details>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-white/10 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 p-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 rounded-xl transition-colors text-sm font-medium"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors text-sm font-medium"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};
