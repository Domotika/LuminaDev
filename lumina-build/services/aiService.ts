// ═══════════════════════════════════════════════════════════════════════════
//  AI SERVICE - Lumina Pro AI Assistant
//  Integração com LLMs (OpenAI, Anthropic, Google) para comandos naturais
// ═══════════════════════════════════════════════════════════════════════════

import { Device, Room } from '../types';

// ═══════════════════════════════════════════════════════════════════════════
//  TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type AIProvider = 'openai' | 'anthropic' | 'google';

export interface AIConfig {
  enabled: boolean;
  provider: AIProvider;
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
  bridgeUrl?: string;
  bridgeToken?: string;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  pending?: boolean;
  error?: string;
}

export interface AIDeviceContext {
  id: string;
  name: string;
  type: string;
  room: string;
  state: Record<string, any>;
  commands: string[];
}

// ═══════════════════════════════════════════════════════════════════════════
//  STORAGE KEYS
// ═══════════════════════════════════════════════════════════════════════════

const STORAGE_KEY_CONFIG = 'lumina_ai_config';
const STORAGE_KEY_HISTORY = 'lumina_ai_history';

// ═══════════════════════════════════════════════════════════════════════════
//  DEFAULT CONFIG
// ═══════════════════════════════════════════════════════════════════════════

export const DEFAULT_AI_CONFIG: AIConfig = {
  enabled: false,
  provider: 'openai',
  apiKey: '',
  model: 'gpt-4o-mini',
  maxTokens: 1024,
  temperature: 0.7,
  bridgeUrl: '',
  bridgeToken: '',
};

// ═══════════════════════════════════════════════════════════════════════════
//  MODEL OPTIONS BY PROVIDER
// ═══════════════════════════════════════════════════════════════════════════

export const AI_MODELS: Record<AIProvider, { id: string; name: string }[]> = {
  openai: [
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini (Rápido)' },
    { id: 'gpt-4o', name: 'GPT-4o (Avançado)' },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
  ],
  anthropic: [
    { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4 (Recomendado)' },
    { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku (Rápido)' },
    { id: 'claude-opus-4-20250514', name: 'Claude Opus 4 (Avançado)' },
  ],
  google: [
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash (Rápido)' },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro (Avançado)' },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
//  CONFIG MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

export function getAIConfig(): AIConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (stored) {
      return { ...DEFAULT_AI_CONFIG, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error('[AI] Failed to load config:', e);
  }
  return DEFAULT_AI_CONFIG;
}

export function saveAIConfig(config: AIConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
  } catch (e) {
    console.error('[AI] Failed to save config:', e);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//  HISTORY MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

export function getAIHistory(): AIMessage[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('[AI] Failed to load history:', e);
  }
  return [];
}

export function saveAIHistory(messages: AIMessage[]): void {
  try {
    const trimmed = messages.slice(-50);
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(trimmed));
  } catch (e) {
    console.error('[AI] Failed to save history:', e);
  }
}

export function clearAIHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_HISTORY);
  } catch (e) {
    console.error('[AI] Failed to clear history:', e);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//  DEVICE CONTEXT BUILDER
// ═══════════════════════════════════════════════════════════════════════════

export function buildDeviceContext(
  devices: Record<string, Device>,
  rooms: Room[]
): AIDeviceContext[] {
  const roomMap = new Map(rooms.map(r => [r.id, r.name]));
  
  return Object.values(devices).map(device => ({
    id: device.id,
    name: device.name,
    type: device.type,
    room: roomMap.get(device.roomId) || 'Sem Cômodo',
    state: device.state,
    commands: getDeviceCommands(device.type),
  }));
}

function getDeviceCommands(type: string): string[] {
  const commandMap: Record<string, string[]> = {
    LIGHT: ['on', 'off', 'toggle'],
    DIMMER: ['on', 'off', 'setLevel(0-100)'],
    SWITCH: ['on', 'off', 'toggle'],
    BLIND: ['open', 'close', 'stop', 'setPosition(0-100)'],
    LOCK: ['lock', 'unlock'],
    THERMOSTAT: ['setHeatingSetpoint', 'setCoolingSetpoint', 'setMode(heat/cool/auto/off)'],
    AC: ['on', 'off', 'setTemperature', 'setMode', 'setFanSpeed'],
    MEDIA: ['play', 'pause', 'stop', 'setVolume(0-100)', 'mute', 'unmute'],
    SCENE: ['on (ativar cena)'],
    CAMERA: ['refresh'],
    SOUNDSMART: ['play', 'pause', 'stop', 'setVolume(0-100)', 'mute', 'unmute'],
  };
  return commandMap[type] || ['on', 'off'];
}

// ═══════════════════════════════════════════════════════════════════════════
//  SYSTEM PROMPT
// ═══════════════════════════════════════════════════════════════════════════

export function buildSystemPrompt(deviceContext: AIDeviceContext[]): string {
  const deviceList = deviceContext
    .map(d => `- ${d.name} (ID: ${d.id}) [${d.type}] em "${d.room}" | Comandos: ${d.commands.join(', ')}`)
    .join('\n');

  return `Você é o assistente IA do Lumina Dashboard, conectado ao Hubitat via Lumina Bridge.

DISPOSITIVOS DISPONÍVEIS:
${deviceList}

CAPACIDADES REAIS:
1. CONTROLE DIRETO: Ligar/desligar/ajustar dispositivos via Maker API
2. CRIAR REGRAS: Criar regras time-based que executam no scheduler do Hubitat
3. CRIAR CENAS: Criar cenas que acionam múltiplos dispositivos

FORMATO DE COMANDOS (JSON no final da resposta):

Para controlar dispositivo IMEDIATAMENTE:
{"action": "command", "deviceId": "ID", "command": "on/off/setLevel", "args": []}

Para criar regra time-based (horário específico):
{"action": "createRule", "rule": {
  "name": "Nome da Regra",
  "trigger": {"type": "time", "config": {"time": "HH:MM", "days": "daily"}},
  "actions": [{"deviceId": "ID", "command": "on"}]
}}

Para criar cena:
{"action": "createScene", "scene": {
  "name": "Nome da Cena", 
  "actions": [{"deviceId": "ID", "command": "on", "args": []}]
}}

REGRAS IMPORTANTES:
- Apenas triggers "time" são suportados (ex: "às 17h", "às 8:30")
- Use formato 24h: "17:00", "08:30", "23:45"
- Para "todos os dias" use "days": "daily"
- Comandos são executados REALMENTE no Hubitat
- Regras ficam agendadas no scheduler do Hubitat

EXEMPLOS REAIS:

Usuário: "Ligar Monitor Bot às 17h todo dia"
Resposta: "Vou criar uma regra para ligar o Monitor Bot às 17:00 todos os dias!"
{"action": "createRule", "rule": {"name": "Ligar Monitor Bot às 17h", "trigger": {"type": "time", "config": {"time": "17:00", "days": "daily"}}, "actions": [{"deviceId": "6", "command": "on"}]}}

Usuário: "Liga a luz da sala agora"
Resposta: "Ligando a luz da sala!"
{"action": "command", "deviceId": "15", "command": "on"}`;
}

// ═══════════════════════════════════════════════════════════════════════════
//  API CALLS
// ═══════════════════════════════════════════════════════════════════════════

interface LLMResponse {
  content: string;
  error?: string;
}

export async function callLLM(
  config: AIConfig,
  messages: AIMessage[],
  systemPrompt: string
): Promise<LLMResponse> {
  if (!config.apiKey) {
    return { content: '', error: 'API Key não configurada' };
  }

  try {
    switch (config.provider) {
      case 'openai':
        return await callOpenAI(config, messages, systemPrompt);
      case 'anthropic':
        return await callAnthropic(config, messages, systemPrompt);
      case 'google':
        return await callGoogle(config, messages, systemPrompt);
      default:
        return { content: '', error: 'Provider não suportado' };
    }
  } catch (error: any) {
    console.error('[AI] LLM call failed:', error);
    return { content: '', error: error.message || 'Erro ao chamar a IA' };
  }
}

async function callOpenAI(
  config: AIConfig,
  messages: AIMessage[],
  systemPrompt: string
): Promise<LLMResponse> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({ role: m.role, content: m.content })),
      ],
      max_tokens: config.maxTokens,
      temperature: config.temperature,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `OpenAI error: ${response.status}`);
  }

  const data = await response.json();
  return { content: data.choices[0]?.message?.content || '' };
}

async function callAnthropic(
  config: AIConfig,
  messages: AIMessage[],
  systemPrompt: string
): Promise<LLMResponse> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: config.model,
      system: systemPrompt,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      max_tokens: config.maxTokens,
      temperature: config.temperature,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `Anthropic error: ${response.status}`);
  }

  const data = await response.json();
  return { content: data.content[0]?.text || '' };
}

async function callGoogle(
  config: AIConfig,
  messages: AIMessage[],
  systemPrompt: string
): Promise<LLMResponse> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`;
  
  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents,
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: {
        maxOutputTokens: config.maxTokens,
        temperature: config.temperature,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `Google AI error: ${response.status}`);
  }

  const data = await response.json();
  return { content: data.candidates?.[0]?.content?.parts?.[0]?.text || '' };
}

// ═══════════════════════════════════════════════════════════════════════════
//  COMMAND PARSER
// ═══════════════════════════════════════════════════════════════════════════

export interface ParsedCommand {
  action: 'command' | 'createRule' | 'createScene';
  deviceId?: string;
  command?: string;
  args?: (string | number)[];
  rule?: any;
  scene?: any;
}

export function parseAIResponse(content: string): { text: string; commands: ParsedCommand[] } {
  const commands: ParsedCommand[] = [];
  
  // Match JSON objects with action field (handles nested objects)
  const jsonRegex = /\{[^{}]*"action"\s*:\s*"[^"]+"\s*[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g;
  const matches = content.match(jsonRegex) || [];
  
  for (const match of matches) {
    try {
      const parsed = JSON.parse(match);
      if (parsed.action === 'command' && parsed.deviceId && parsed.command) {
        commands.push({
          action: 'command',
          deviceId: parsed.deviceId,
          command: parsed.command,
          args: parsed.args,
        });
      } else if (parsed.action === 'createRule' && parsed.rule) {
        commands.push({
          action: 'createRule',
          rule: parsed.rule,
        });
      } else if (parsed.action === 'createScene' && parsed.scene) {
        commands.push({
          action: 'createScene',
          scene: parsed.scene,
        });
      }
    } catch (e) {
      // Try to find and parse nested JSON
      try {
        const nestedMatch = match.match(/\{[\s\S]*\}/);
        if (nestedMatch) {
          const parsed = JSON.parse(nestedMatch[0]);
          if (parsed.action) {
            commands.push(parsed as ParsedCommand);
          }
        }
      } catch {
        // Ignore invalid JSON
      }
    }
  }
  
  // Remove JSON from visible text
  let text = content;
  for (const match of matches) {
    text = text.replace(match, '');
  }
  text = text.trim();
  
  return { text, commands };
}

// ═══════════════════════════════════════════════════════════════════════════
//  UTILS
// ═══════════════════════════════════════════════════════════════════════════

export function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ═══════════════════════════════════════════════════════════════════════════
//  LUMINA BRIDGE INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════

export interface BridgeResponse {
  success: boolean;
  message?: string;
  ruleId?: string;
  sceneId?: string;
  error?: string;
}

export async function executeBridgeAction(
  config: AIConfig,
  command: ParsedCommand,
  hubitatService: any
): Promise<BridgeResponse> {
  console.log('=== BRIDGE ACTION DEBUG START ===');
  console.log('[Bridge] Config received:', { 
    enabled: config?.enabled, 
    provider: config?.provider,
    bridgeUrl: config?.bridgeUrl,
    hasBridgeToken: !!config?.bridgeToken
  });
  console.log('[Bridge] Command received:', command);
  console.log('[Bridge] HubitatService available:', !!hubitatService);

  try {
    console.log(`[Bridge] Processing action: ${command.action}`);
    
    switch (command.action) {
      case 'command':
        console.log('[Bridge] >>> DEVICE COMMAND PATH <<<');
        const deviceResult = await executeDeviceCommand(command, hubitatService);
        console.log('[Bridge] Device command result:', deviceResult);
        return deviceResult;
      
      case 'createRule':
        console.log('[Bridge] >>> CREATE RULE PATH <<<');
        console.log('[Bridge] Rule data:', command.rule);
        const ruleResult = await createRule(config, command.rule);
        console.log('[Bridge] Rule creation result:', ruleResult);
        return ruleResult;
      
      case 'createScene':
        console.log('[Bridge] >>> CREATE SCENE PATH <<<');
        console.log('[Bridge] Scene data:', command.scene);
        const sceneResult = await createScene(config, command.scene);
        console.log('[Bridge] Scene creation result:', sceneResult);
        return sceneResult;
      
      default:
        console.warn('[Bridge] >>> UNKNOWN ACTION <<<');
        console.warn('[Bridge] Unknown action:', command.action);
        return { success: false, error: 'Ação não suportada' };
    }
  } catch (error: any) {
    console.error('[Bridge] >>> EXCEPTION CAUGHT <<<');
    console.error('[Bridge] Error:', error);
    console.error('[Bridge] Stack:', error.stack);
    return { success: false, error: error.message || 'Erro na execução' };
  } finally {
    console.log('=== BRIDGE ACTION DEBUG END ===');
  }
}

async function executeDeviceCommand(
  command: ParsedCommand,
  hubitatService: any
): Promise<BridgeResponse> {
  console.log('[executeDeviceCommand] Starting...');
  
  if (!command.deviceId || !command.command) {
    return { success: false, error: 'DeviceId ou command inválidos' };
  }

  // Try Bridge /command endpoint first (preferred)
  try {
    console.log('[executeDeviceCommand] Trying Bridge /command endpoint...');
    
    // Get bridge config from aiService context
    const aiConfig = getAIConfig();
    if (aiConfig.bridgeUrl && aiConfig.bridgeToken) {
      console.log('[executeDeviceCommand] Using Bridge for command:', {
        url: aiConfig.bridgeUrl,
        deviceId: command.deviceId,
        command: command.command
      });
      
      const url = `${aiConfig.bridgeUrl}/command?access_token=${aiConfig.bridgeToken}`;
      const payload = {
        deviceId: command.deviceId,
        command: command.command,
        args: command.args || []
      };
      
      console.log('[executeDeviceCommand] Bridge URL:', url);
      console.log('[executeDeviceCommand] Bridge payload:', payload);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      console.log('[executeDeviceCommand] Bridge response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Bridge command error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('[executeDeviceCommand] Bridge response data:', data);
      
      if (data.success) {
        return {
          success: true,
          message: data.message || `Comando ${command.command} executado via Bridge`
        };
      } else {
        throw new Error(data.error || 'Bridge command failed');
      }
    } else {
      console.log('[executeDeviceCommand] Bridge not configured, falling back to Hubitat service...');
    }
  } catch (bridgeError: any) {
    console.warn('[executeDeviceCommand] Bridge failed:', bridgeError.message);
    console.log('[executeDeviceCommand] Falling back to Hubitat service...');
  }

  // Fallback to original Hubitat service
  try {
    await hubitatService.executeDeviceCommand(
      command.deviceId,
      command.command,
      command.args || []
    );
    
    return { 
      success: true, 
      message: `Comando ${command.command} executado no device ${command.deviceId}` 
    };
  } catch (error: any) {
    return { 
      success: false, 
      error: `Falha ao executar comando: ${error.message}` 
    };
  }
}

async function createRule(config: AIConfig, rule: any): Promise<BridgeResponse> {
  console.log('=== CREATE RULE DEBUG START ===');
  console.log('[CreateRule] Config:', { url: config.bridgeUrl, hasToken: !!config.bridgeToken });
  console.log('[CreateRule] Rule data:', rule);

  if (!config.bridgeUrl || !config.bridgeToken) {
    console.error('[CreateRule] Missing bridge config!');
    return { 
      success: false, 
      error: 'Lumina Bridge não configurado. Configure URL e token nas configurações.' 
    };
  }

  const url = `${config.bridgeUrl}/rule?access_token=${config.bridgeToken}`;
  console.log('[CreateRule] Target URL:', url);
  
  const payload = {
    name: rule.name,
    trigger: rule.trigger,
    actions: rule.actions
  };
  console.log('[CreateRule] Payload:', JSON.stringify(payload, null, 2));

  try {
    console.log('[CreateRule] Making HTTP POST request...');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    console.log('[CreateRule] Response status:', response.status);
    console.log('[CreateRule] Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      console.error('[CreateRule] Bad response status:', response.status, response.statusText);
      throw new Error(`Bridge error: ${response.status}`);
    }

    const data = await response.json();
    console.log('[CreateRule] Response data:', data);
    
    if (data.success) {
      console.log('[CreateRule] SUCCESS! Rule created with ID:', data.ruleId);
      return {
        success: true,
        message: data.message || 'Regra criada com sucesso',
        ruleId: data.ruleId
      };
    } else {
      console.error('[CreateRule] Bridge returned error:', data.error);
      return {
        success: false,
        error: data.error || 'Falha ao criar regra'
      };
    }
  } catch (error: any) {
    console.error('[CreateRule] HTTP request failed:', error);
    return {
      success: false,
      error: `Erro na comunicação com Bridge: ${error.message}`
    };
  } finally {
    console.log('=== CREATE RULE DEBUG END ===');
  }
}

async function createScene(config: AIConfig, scene: any): Promise<BridgeResponse> {
  if (!config.bridgeUrl || !config.bridgeToken) {
    return { 
      success: false, 
      error: 'Lumina Bridge não configurado. Configure URL e token nas configurações.' 
    };
  }

  const url = `${config.bridgeUrl}/scene?access_token=${config.bridgeToken}`;
  
  const payload = {
    name: scene.name,
    actions: scene.actions
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Bridge error: ${response.status}`);
  }

  const data = await response.json();
  
  if (data.success) {
    return {
      success: true,
      message: data.message || 'Cena criada com sucesso',
      sceneId: data.sceneId
    };
  } else {
    return {
      success: false,
      error: data.error || 'Falha ao criar cena'
    };
  }
}
