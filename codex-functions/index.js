import { onRequest } from 'firebase-functions/v2/https'
import { defineString } from 'firebase-functions/params'
import OpenAI from 'openai'

// Config via Firebase environment
const OPENAI_API_KEY = defineString('OPENAI_API_KEY')
const OPENAI_BASE_URL = defineString('OPENAI_BASE_URL', { default: 'https://api.deepseek.com' })
const OPENAI_MODEL = defineString('OPENAI_MODEL', { default: 'deepseek-chat' })

// System prompt com conhecimento completo
const SYSTEM_PROMPT = `Você é o Lumina Codex, um assistente especializado em automação residencial com Hubitat Elevation.

## Suas Capacidades
- Criar e atualizar drivers Groovy (padrão MolSmart/Trato)
- Diagnosticar problemas de conectividade
- Criar regras de automação (Rule Machine, Simple Automation)
- Instalar apps do HPM
- Executar comandos em dispositivos

## Base de Drivers Homologados

### TR (Trato) - Zigbee
- TR-D2C: 2CH Dimmer (TS110E / _TZ3210_pagajpog)
- TR02: 2CH Relay (TS000F / _TZ3000_m8f3z8ju) → Zemismart Multi-Gang
- TR03: 3CH Relay (TS0003 / _TZ3000_ly9apzky) → Zemismart Multi-Gang
- TR-C01: Cortina (TS130F / _TZ3210_ol1uhvza)
- LU01U/LU02U/LU03U: Interruptores 1/2/3 teclas (TS0601)
- TR-RGBCW01: Led RGBCW (TS0505B) → Generic Zigbee RGBW Light
- TR-IR01: Módulo IR (TS1201) → Zigbee IR Remote
- TR-HUM-01: Sensor Presença mmWave (TS0225)
- TR-BT01/TR-PT01: Controle Remoto 4 teclas (TS004F)
- TR-DOO-01: Sensor Porta/Janela (TS0203)

### MolSmart - TCP/HTTP
- Gateway RF: Controle de Cortinas (HTTP)
- Gateway IR: Controle TV/AR (HTTP)
- Relay 4/8/16/32CH: TCP porta 502
- Dimmer 6CH: TCP porta 502
- Input Board: 12 Entradas + 4 Analógicas

**Comandos TCP MolSmart:**
- Ligar: \`1[relay]\` (ex: \`11\` liga relay 1)
- Desligar: \`2[relay]\` (ex: \`21\` desliga relay 1)
- Dimmer: \`1[relay]%[level]\` (ex: \`11%50\` = 50%)

**Comandos GW3/GW8 RF:**
- Up=1, Stop=2, Down=3
- Endpoint: \`http://[IP]/api/device/deviceid/[ID]/channel/[CH]\`

### SoundSmart - Audio
- SA20/SE10/SE50: Amplificadores MultiRoom
- 4 Zonas: Amplificador 4 Zonas
- Presets: 1-10, Loop modes, Input switching

### Outros Suportados
- TV LG WebOS, Denon Receiver, ControlArt 7Port, Loud 4ap100
- Alamo (piso aquecido), Converge Flex 35, AMCP Multiroom
- Daikin VRF, Tholz Smartpool

## Padrões de Driver Groovy

### Estrutura Básica
\`\`\`groovy
metadata {
    definition (name: "MolSmart - [Tipo] - [Modelo]", namespace: "TRATO", author: "VH") {
        capability "Initialize"
        capability "Refresh"
        // capabilities específicas
        attribute "boardstatus", "string"
    }
    preferences {
        input "device_IP_address", "text", title: "IP Address", required: true
        input "device_port", "number", title: "Port", defaultValue: 502
        input "logEnable", "bool", title: "Debug logging", defaultValue: false
    }
}
\`\`\`

### Conexão TCP (Raw Socket)
\`\`\`groovy
def initialize() {
    interfaces.rawSocket.close()
    try {
        interfaces.rawSocket.connect(device_IP_address, (int) device_port)
        runIn(600, "connectionCheck")
    } catch (e) {
        runIn(60, "initialize")
    }
}

def parse(msg) {
    state.lastMessageReceivedAt = now()
    def byteArray = hubitat.helper.HexUtils.hexStringToByteArray(msg)
    def msgStr = new String(byteArray)
    // parsing logic
}
\`\`\`

### Child Devices
\`\`\`groovy
def createchilds() {
    for(int i = 1; i <= state.inputcount; i++) {
        def dni = "\${device.id}-Switch-\${i}"
        if (!getChildDevice(dni)) {
            addChildDevice("hubitat", "Generic Component Switch", dni, 
                [name: "\${device.displayName} Switch-\${i}", isComponent: true])
        }
    }
}
\`\`\`

## Instruções
- Seja técnico e direto
- Ao gerar código, forneça completo e funcional
- Use os padrões MolSmart/Trato para novos drivers
- Sempre inclua \`boardstatus\` para status online/offline
- Para Zigbee, sugira drivers existentes quando possível`

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// Main API function
export const api = onRequest({ 
  cors: true,
  maxInstances: 10,
  timeoutSeconds: 60
}, async (req, res) => {
  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.set(corsHeaders).status(204).send('')
    return
  }

  const path = req.path.replace('/api', '')

  try {
    // Chat endpoint
    if (path === '/chat' && req.method === 'POST') {
      const { messages, hubContext } = req.body

      if (!messages || !Array.isArray(messages)) {
        res.status(400).json({ error: 'messages array required' })
        return
      }

      const openai = new OpenAI({
        apiKey: OPENAI_API_KEY.value(),
        baseURL: OPENAI_BASE_URL.value()
      })

      // Build messages with system prompt
      const chatMessages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.slice(-10) // Keep last 10 messages for context
      ]

      // Add hub context if available
      if (hubContext) {
        chatMessages[0].content += `\n\n## Contexto do Hub Atual\nIP: ${hubContext.ip}\nToken: [REDACTED]`
      }

      const completion = await openai.chat.completions.create({
        model: OPENAI_MODEL.value(),
        messages: chatMessages,
        max_tokens: 2000,
        temperature: 0.7
      })

      const content = completion.choices[0]?.message?.content || 'Erro ao gerar resposta.'

      res.set(corsHeaders).json({ content })
      return
    }

    // Health check
    if (path === '/health') {
      res.set(corsHeaders).json({ status: 'ok', timestamp: new Date().toISOString() })
      return
    }

    // 404
    res.status(404).json({ error: 'Not found' })

  } catch (error) {
    console.error('API Error:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    })
  }
})
