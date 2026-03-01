# Lumina Dashboard

Dashboard local glassmorphism para **Hubitat Elevation** - Single File HTML que roda diretamente no File Manager.

![Version](https://img.shields.io/badge/version-1.5.3-blue)
![Platform](https://img.shields.io/badge/platform-Hubitat-green)
![License](https://img.shields.io/badge/license-MIT-yellow)

## ✨ Features

- 🎨 **UI Glassmorphism** - Design moderno com efeitos de vidro
- ⚡ **Zero Latência** - Execução 100% local no hub
- 📱 **Responsivo** - Funciona em tablets, celulares e painéis de parede
- 🔌 **Maker API** - Integração nativa via Hubitat Maker API
- 🏠 **Multi-room** - Organize dispositivos por cômodos
- 🎛️ **Controles Avançados** - TV remotes, AC, persianas, dimmers

## 📦 Instalação

1. Faça upload do arquivo `LuminaHighline_vX.X.html` para o **File Manager** do Hubitat
2. Configure o **Maker API** no Hubitat (Apps → Maker API)
3. Acesse: `http://[IP-HUBITAT]/local/LuminaHighline_vX.X.html`
4. Configure IP, App ID e Access Token na tela de Settings

---

## ✅ Lista de Compatibilidade

### 🔌 Switches & Relays

| Dispositivo | Driver/Fabricante | Tipo Lumina | Status |
|-------------|-------------------|-------------|--------|
| Generic Switch | Hubitat Built-in | SWITCH | ✅ |
| Generic Dimmer | Hubitat Built-in | DIMMER | ✅ |
| Zigbee Switch | Hubitat Built-in | SWITCH | ✅ |
| Z-Wave Switch | Hubitat Built-in | SWITCH | ✅ |
| **Molsmart Relays HTTP** | TRATO | SWITCH | ✅ |
| **Molsmart Relays TCP 2/4/8/16/32CH** | TRATO | SWITCH | ✅ |
| Shelly Relay | Shelly | SWITCH | ✅ |
| Sonoff Basic | Sonoff | SWITCH | ✅ |

### 💡 Iluminação

| Dispositivo | Driver/Fabricante | Tipo Lumina | Status |
|-------------|-------------------|-------------|--------|
| Generic Dimmer | Hubitat Built-in | DIMMER | ✅ |
| Zigbee Dimmer | Hubitat Built-in | DIMMER | ✅ |
| Z-Wave Dimmer | Hubitat Built-in | DIMMER | ✅ |
| Philips Hue Bulb | CoCoHue / Hubitat | LIGHT | ✅ |
| IKEA Tradfri | Hubitat Built-in | DIMMER | ✅ |
| LIFX | Community Driver | LIGHT | ✅ |
| RGB/RGBW Controllers | Various | LIGHT | ✅ |
| Tuya Zigbee Bulbs | Hubitat Built-in | DIMMER | ✅ |

### 🌡️ Climatização (AC / Thermostat)

| Dispositivo | Driver/Fabricante | Tipo Lumina | Status |
|-------------|-------------------|-------------|--------|
| Generic Thermostat | Hubitat Built-in | AC | ✅ |
| **Molsmart GW8 IR AC** | TRATO (irweb) | IR_REMOTE | ✅ |
| Sensibo | Community Driver | AC | ✅ |
| Cielo Breez | Community Driver | AC | ✅ |
| Midea AC | Community Driver | AC | ✅ |
| Tuya IR AC | Tuya Integration | AC | ✅ |
| Ecobee | Hubitat Built-in | AC | ✅ |
| Nest Thermostat | Community Driver | AC | ✅ |

### 📺 TVs & Mídia

| Dispositivo | Driver/Fabricante | Tipo Lumina | Status |
|-------------|-------------------|-------------|--------|
| **Samsung TV** | Dave Gutheinz | TV | ✅ |
| **LG webOS TV** | Community Driver | TV | ✅ |
| **Molsmart GW8 IR TV** | TRATO (irweb) | IR_REMOTE | ✅ |
| Roku TV | Community Driver | TV | ✅ |
| Sony Bravia | Community Driver | TV | ✅ |
| Vizio SmartCast | Community Driver | TV | ✅ |
| Fire TV | Community Driver | TV | ✅ |
| Chromecast | Community Driver | MEDIA | ✅ |

### 🔊 Áudio / AVR / Multiroom

| Dispositivo | Driver/Fabricante | Tipo Lumina | Status |
|-------------|-------------------|-------------|--------|
| **Molsmart SoundSmart** | TRATO | AVR | ✅ |
| Denon AVR | Community Driver | AVR | ✅ |
| Marantz AVR | Community Driver | AVR | ✅ |
| Yamaha MusicCast | Community Driver | AVR | ✅ |
| Sonos | Community Driver | AVR | ✅ |
| Google Home/Nest Audio | Community Driver | AVR | ✅ |
| Echo/Alexa | Community Driver | AVR | ✅ |

### 🪟 Persianas & Cortinas

| Dispositivo | Driver/Fabricante | Tipo Lumina | Status |
|-------------|-------------------|-------------|--------|
| Generic Window Shade | Hubitat Built-in | BLIND | ✅ |
| **Molsmart GW8 RF** | TRATO | BLIND | ✅ |
| **Molsmart Curtains HTTP/TCP** | TRATO | BLIND | ✅ |
| Somfy RTS | Community Driver | BLIND | ✅ |
| IKEA Fyrtur/Kadrilj | Hubitat Built-in | BLIND | ✅ |
| Tuya Zigbee Blinds | Hubitat Built-in | BLIND | ✅ |
| Zemismart Blinds | Community Driver | BLIND | ✅ |
| Aqara Roller Shade | Hubitat Built-in | BLIND | ✅ |

### 🚪 Fechaduras

| Dispositivo | Driver/Fabricante | Tipo Lumina | Status |
|-------------|-------------------|-------------|--------|
| Generic Z-Wave Lock | Hubitat Built-in | LOCK | ✅ |
| Yale Assure | Hubitat Built-in | LOCK | ✅ |
| Schlage | Hubitat Built-in | LOCK | ✅ |
| August Smart Lock | Community Driver | LOCK | ✅ |
| Kwikset | Hubitat Built-in | LOCK | ✅ |
| Zigbee Lock | Hubitat Built-in | LOCK | ✅ |

### 👁️ Sensores de Movimento

| Dispositivo | Driver/Fabricante | Tipo Lumina | Status |
|-------------|-------------------|-------------|--------|
| **Philips Hue Indoor (SML001)** | Hubitat Built-in | MOTION | ✅ |
| **Philips Hue Outdoor (SML002)** | Hubitat Built-in | MOTION | ✅ |
| Zigbee Motion Sensor | Hubitat Built-in | MOTION | ✅ |
| Z-Wave Motion Sensor | Hubitat Built-in | MOTION | ✅ |
| Aqara Motion Sensor | Hubitat Built-in | MOTION | ✅ |
| SmartThings Motion | Hubitat Built-in | MOTION | ✅ |

### 📡 Sensores de Presença (Radar/Mmwave)

| Dispositivo | Driver/Fabricante | Tipo Lumina | Status |
|-------------|-------------------|-------------|--------|
| **Mmwave MEROS MS600** | Community Driver | PRESENCE | ✅ |
| **Tuya Mmwave (TS0601)** | Hubitat Built-in | PRESENCE | ✅ |
| **MOES Mmwave (TS0225)** | Hubitat Built-in | PRESENCE | ✅ |
| Aqara FP1/FP2 | Community Driver | PRESENCE | ✅ |
| Everything Presence One | Community Driver | PRESENCE | ✅ |
| Life Control Occupancy | Community Driver | PRESENCE | ✅ |

### 💧 Sensores de Segurança

| Dispositivo | Driver/Fabricante | Tipo Lumina | Status |
|-------------|-------------------|-------------|--------|
| Water Leak Sensor | Hubitat Built-in | WATER | ✅ |
| Smoke Detector | Hubitat Built-in | SMOKE | ✅ |
| CO Detector | Hubitat Built-in | SMOKE | ✅ |
| Aqara Water Sensor | Hubitat Built-in | WATER | ✅ |
| First Alert Smoke/CO | Hubitat Built-in | SMOKE | ✅ |
| Zigbee Water Sensor | Hubitat Built-in | WATER | ✅ |

### 🎬 Cenas & Botões

| Dispositivo | Driver/Fabricante | Tipo Lumina | Status |
|-------------|-------------------|-------------|--------|
| Hubitat Scenes | Hubitat Built-in | SCENE | ✅ |
| Pushable Button | Various | SCENE | ✅ |
| Pico Remote | Lutron | SCENE | ✅ |
| Hue Dimmer Switch | CoCoHue | SCENE | ✅ |
| IKEA Tradfri Remote | Hubitat Built-in | SCENE | ✅ |
| Aqara Cube/Button | Hubitat Built-in | SCENE | ✅ |

### 📲 Controles IR/RF (Molsmart)

| Dispositivo | Driver/Fabricante | Tipo Lumina | Status |
|-------------|-------------------|-------------|--------|
| **Molsmart GW8 IR TV** | TRATO (irweb) | IR_REMOTE | ✅ |
| **Molsmart GW8 IR AC** | TRATO (irweb) | IR_REMOTE | ✅ |
| **Molsmart GW8 RF Blinds** | TRATO | BLIND | ✅ |
| **Child Buttons (TV - xxx)** | TRATO | BUTTON | ✅ |
| **Child Buttons (Cortina - xxx)** | TRATO | BUTTON | ✅ |

---

## 🔧 Capabilities Suportadas

O Lumina detecta automaticamente dispositivos pelas seguintes capabilities do Hubitat:

```
Switch, SwitchLevel, ColorControl, ColorTemperature
Thermostat, ThermostatCoolingSetpoint, ThermostatHeatingSetpoint
WindowShade, WindowBlind
Lock
AudioVolume, MusicPlayer, TV, SamsungTV
MotionSensor, PresenceSensor
WaterSensor, SmokeDetector, CarbonMonoxideDetector
PushableButton, HoldableButton
```

## 📁 Estrutura do Repositório

```
/
├── LuminaHighline_v1.X.html   # Single File builds (prontos para uso)
├── hubitat-drivers/           # Drivers Groovy auxiliares
└── README.md
```

## 🚀 Changelog

### v1.5.3 (2026-03-01)
- ✅ Suporte completo Molsmart (GW8 IR/RF, SoundSmart, Relays)
- ✅ Detecção de child buttons (TV -, Cortina -, AC -)
- ✅ UI de controle remoto IR para TV e AC
- ✅ Detecção de sensores mmwave (TS0601, TS0225)
- ✅ Correção na ordem de detecção (BLIND antes de SCENE)
- ✅ Fix sendHubitatCommand (parâmetros posicionais)

### v1.4 (2026-03-01)
- ✅ Fix na detecção de dispositivos (TV antes de AC)
- ✅ Suporte a Water/Smoke sensors
- ✅ TV Remote UI completa

---

## 📞 Suporte

- **Desenvolvido por:** Domótika
- **GitHub:** [Domotika/LuminaDev](https://github.com/Domotika/LuminaDev)
- **Compatível com:** Hubitat Elevation C-5, C-7, C-8

---

*Lumina Dashboard - Transformando sua casa em uma experiência visual.*
