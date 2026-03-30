// ═══════════════════════════════════════════════════════════════════════════
//  AI CHAT - Lumina Pro AI Assistant Interface
// ═══════════════════════════════════════════════════════════════════════════

import React, { useState, useRef, useEffect } from 'react';
import { Device, Room } from '../types';
import {
  AIConfig,
  AIMessage,
  getAIConfig,
  getAIHistory,
  saveAIHistory,
  clearAIHistory,
  buildDeviceContext,
  buildSystemPrompt,
  callLLM,
  parseAIResponse,
  generateMessageId,
} from '../services/aiService';

interface AIChatProps {
  devices: Record<string, Device>;
  rooms: Room[];
  onCommand: (cmd: { action: string; deviceId?: string; command?: string; args?: (string | number)[]; rule?: any; scene?: any }) => void;
  onClose: () => void;
  onOpenSettings: () => void;
}

export const AIChat: React.FC<AIChatProps> = ({
  devices,
  rooms,
  onCommand,
  onClose,
  onOpenSettings,
}) => {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState<AIConfig | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadedConfig = getAIConfig();
    setConfig(loadedConfig);
    
    const history = getAIHistory();
    if (history.length > 0) {
      setMessages(history);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading || !config) return;

    const userMessage: AIMessage = {
      id: generateMessageId(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    if (!config.enabled || !config.apiKey) {
      const errorMessage: AIMessage = {
        id: generateMessageId(),
        role: 'assistant',
        content: 'IA não configurada. Clique no ícone de configurações para inserir sua API Key.',
        timestamp: Date.now(),
        error: 'not_configured',
      };
      setMessages([...newMessages, errorMessage]);
      setIsLoading(false);
      return;
    }

    const deviceContext = buildDeviceContext(devices, rooms);
    const systemPrompt = buildSystemPrompt(deviceContext);

    const response = await callLLM(config, newMessages, systemPrompt);

    if (response.error) {
      const errorMessage: AIMessage = {
        id: generateMessageId(),
        role: 'assistant',
        content: `❌ Erro: ${response.error}`,
        timestamp: Date.now(),
        error: response.error,
      };
      setMessages([...newMessages, errorMessage]);
      saveAIHistory([...newMessages, errorMessage]);
    } else {
      const { text, commands } = parseAIResponse(response.content);

      const assistantMessage: AIMessage = {
        id: generateMessageId(),
        role: 'assistant',
        content: text || response.content,
        timestamp: Date.now(),
      };
      
      const finalMessages = [...newMessages, assistantMessage];
      setMessages(finalMessages);
      saveAIHistory(finalMessages);

      for (const cmd of commands) {
        console.log('[AI] Executing command:', cmd);
        onCommand(cmd);
      }
    }

    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearHistory = () => {
    clearAIHistory();
    setMessages([]);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-2xl h-[80vh] flex flex-col shadow-2xl border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 8V4H8" />
                <rect width="16" height="12" x="4" y="8" rx="2" />
                <path d="M2 14h2" /><path d="M20 14h2" />
                <path d="M15 13v2" /><path d="M9 13v2" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-white">Lumina AI</h2>
              <p className="text-xs text-gray-400">
                {config?.enabled ? `${config.provider} • ${config.model}` : 'Não configurado'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleClearHistory}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Limpar histórico"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
            </button>
            <button
              onClick={onOpenSettings}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Configurações"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Fechar"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18" /><path d="m6 6 12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 py-12">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
              </svg>
              <p className="font-medium">Olá! Como posso ajudar?</p>
              <p className="text-sm mt-2">
                Experimente: "Ligue a luz da sala" ou "Crie uma cena para..."
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-md'
                    : msg.error
                    ? 'bg-red-900/50 text-red-200 rounded-bl-md border border-red-500/30'
                    : 'bg-gray-800 text-gray-100 rounded-bl-md'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    msg.role === 'user' ? 'text-blue-200' : 'text-gray-500'
                  }`}
                >
                  {formatTime(msg.timestamp)}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-800 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.1s]" />
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite uma mensagem..."
              disabled={isLoading}
              className="flex-1 bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="p-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:opacity-50 text-white rounded-xl transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
