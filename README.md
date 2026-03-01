# Lumina Dashboard

<div align="center">

![Lumina Banner](https://luminadashboards.dev.br/assets/banner.png)

**Professional Glassmorphism Dashboard for Hubitat Elevation**

*Single-file HTML that runs directly on your hub — zero external servers required.*

[![Version](https://img.shields.io/badge/version-1.5.3-blue?style=for-the-badge)](https://github.com/Domotika/LuminaDev/releases)
[![Platform](https://img.shields.io/badge/platform-Hubitat-00A4EF?style=for-the-badge)](https://hubitat.com)
[![License](https://img.shields.io/badge/license-Commercial-yellow?style=for-the-badge)](#)

🌐 **Website:** [luminadashboards.dev.br](https://luminadashboards.dev.br)

</div>

---

## ✨ Features

<div align="center">

| | | |
|:---:|:---:|:---:|
| 🎨 **Glassmorphism UI** | ⚡ **Zero Latency** | 📱 **Responsive** |
| Modern glass effects | 100% local execution | Tablets, phones, wall panels |
| 🔌 **Maker API** | 🏠 **Multi-room** | 🎛️ **Advanced Controls** |
| Native Hubitat integration | Organize by rooms | TV remotes, AC, blinds |

</div>

![Lumina Screenshot](https://luminadashboards.dev.br/assets/screenshot-main.png)

---

## 🚀 Quick Start

### Installation

1. **Upload** `LuminaHighline_vX.X.html` to Hubitat **File Manager**
2. **Configure** the **Maker API** app in Hubitat (Apps → Maker API)
3. **Access**: `http://[YOUR-HUB-IP]/local/LuminaHighline_vX.X.html`
4. **Setup**: Enter Hub IP, App ID and Access Token in Settings

### Requirements

- Hubitat Elevation (C-5, C-7, or C-8)
- Maker API app installed and configured
- Modern web browser (Chrome, Safari, Firefox, Edge)

---

## 📱 Screenshots

<div align="center">

| Room View | Device Control | Settings |
|:---:|:---:|:---:|
| ![Room](https://luminadashboards.dev.br/assets/screenshot-room.png) | ![Control](https://luminadashboards.dev.br/assets/screenshot-control.png) | ![Settings](https://luminadashboards.dev.br/assets/screenshot-settings.png) |

</div>

---

## ✅ Device Compatibility

### 🔌 Switches & Relays

| Device | Driver/Manufacturer | Lumina Type | Status |
|--------|---------------------|-------------|--------|
| Generic Switch | Hubitat Built-in | SWITCH | ✅ |
| Generic Dimmer | Hubitat Built-in | DIMMER | ✅ |
| Zigbee Switch | Hubitat Built-in | SWITCH | ✅ |
| Z-Wave Switch | Hubitat Built-in | SWITCH | ✅ |
| **Molsmart Relays HTTP** | TRATO | SWITCH | ✅ |
| **Molsmart Relays TCP 2/4/8/16/32CH** | TRATO | SWITCH | ✅ |
| Shelly Relay | Shelly | SWITCH | ✅ |
| Sonoff Basic | Sonoff | SWITCH | ✅ |

### 💡 Lighting

| Device | Driver/Manufacturer | Lumina Type | Status |
|--------|---------------------|-------------|--------|
| Generic Dimmer | Hubitat Built-in | DIMMER | ✅ |
| Zigbee Dimmer | Hubitat Built-in | DIMMER | ✅ |
| Z-Wave Dimmer | Hubitat Built-in | DIMMER | ✅ |
| Philips Hue Bulb | CoCoHue / Hubitat | LIGHT | ✅ |
| IKEA Tradfri | Hubitat Built-in | DIMMER | ✅ |
| LIFX | Community Driver | LIGHT | ✅ |
| RGB/RGBW Controllers | Various | LIGHT | ✅ |
| Tuya Zigbee Bulbs | Hubitat Built-in | DIMMER | ✅ |

### 🌡️ Climate Control (AC / Thermostat)

| Device | Driver/Manufacturer | Lumina Type | Status |
|--------|---------------------|-------------|--------|
| Generic Thermostat | Hubitat Built-in | AC | ✅ |
| **Molsmart GW8 IR AC** | TRATO (irweb) | IR_REMOTE | ✅ |
| Sensibo | Community Driver | AC | ✅ |
| Cielo Breez | Community Driver | AC | ✅ |
| Midea AC | Community Driver | AC | ✅ |
| Tuya IR AC | Tuya Integration | AC | ✅ |
| Ecobee | Hubitat Built-in | AC | ✅ |
| Nest Thermostat | Community Driver | AC | ✅ |

### 📺 TVs & Media

| Device | Driver/Manufacturer | Lumina Type | Status |
|--------|---------------------|-------------|--------|
| **Samsung TV** | Dave Gutheinz | TV | ✅ |
| **LG webOS TV** | Community Driver | TV | ✅ |
| **Molsmart GW8 IR TV** | TRATO (irweb) | IR_REMOTE | ✅ |
| Roku TV | Community Driver | TV | ✅ |
| Sony Bravia | Community Driver | TV | ✅ |
| Vizio SmartCast | Community Driver | TV | ✅ |
| Fire TV | Community Driver | TV | ✅ |
| Chromecast | Community Driver | MEDIA | ✅ |

### 🔊 Audio / AVR / Multiroom

| Device | Driver/Manufacturer | Lumina Type | Status |
|--------|---------------------|-------------|--------|
| **Molsmart SoundSmart** | TRATO | AVR | ✅ |
| Denon AVR | Community Driver | AVR | ✅ |
| Marantz AVR | Community Driver | AVR | ✅ |
| Yamaha MusicCast | Community Driver | AVR | ✅ |
| Sonos | Community Driver | AVR | ✅ |
| Google Home/Nest Audio | Community Driver | AVR | ✅ |
| Echo/Alexa | Community Driver | AVR | ✅ |

### 🪟 Blinds & Shades

| Device | Driver/Manufacturer | Lumina Type | Status |
|--------|---------------------|-------------|--------|
| Generic Window Shade | Hubitat Built-in | BLIND | ✅ |
| **Molsmart GW8 RF** | TRATO | BLIND | ✅ |
| **Molsmart Curtains HTTP/TCP** | TRATO | BLIND | ✅ |
| Somfy RTS | Community Driver | BLIND | ✅ |
| IKEA Fyrtur/Kadrilj | Hubitat Built-in | BLIND | ✅ |
| Tuya Zigbee Blinds | Hubitat Built-in | BLIND | ✅ |
| Zemismart Blinds | Community Driver | BLIND | ✅ |
| Aqara Roller Shade | Hubitat Built-in | BLIND | ✅ |

### 🚪 Locks

| Device | Driver/Manufacturer | Lumina Type | Status |
|--------|---------------------|-------------|--------|
| Generic Z-Wave Lock | Hubitat Built-in | LOCK | ✅ |
| Yale Assure | Hubitat Built-in | LOCK | ✅ |
| Schlage | Hubitat Built-in | LOCK | ✅ |
| August Smart Lock | Community Driver | LOCK | ✅ |
| Kwikset | Hubitat Built-in | LOCK | ✅ |
| Zigbee Lock | Hubitat Built-in | LOCK | ✅ |

### 👁️ Motion Sensors

| Device | Driver/Manufacturer | Lumina Type | Status |
|--------|---------------------|-------------|--------|
| **Philips Hue Indoor (SML001)** | Hubitat Built-in | MOTION | ✅ |
| **Philips Hue Outdoor (SML002)** | Hubitat Built-in | MOTION | ✅ |
| Zigbee Motion Sensor | Hubitat Built-in | MOTION | ✅ |
| Z-Wave Motion Sensor | Hubitat Built-in | MOTION | ✅ |
| Aqara Motion Sensor | Hubitat Built-in | MOTION | ✅ |
| SmartThings Motion | Hubitat Built-in | MOTION | ✅ |

### 📡 Presence Sensors (Radar/Mmwave)

| Device | Driver/Manufacturer | Lumina Type | Status |
|--------|---------------------|-------------|--------|
| **Mmwave MEROS MS600** | Community Driver | PRESENCE | ✅ |
| **Tuya Mmwave (TS0601)** | Hubitat Built-in | PRESENCE | ✅ |
| **MOES Mmwave (TS0225)** | Hubitat Built-in | PRESENCE | ✅ |
| Aqara FP1/FP2 | Community Driver | PRESENCE | ✅ |
| Everything Presence One | Community Driver | PRESENCE | ✅ |
| Life Control Occupancy | Community Driver | PRESENCE | ✅ |

### 💧 Safety Sensors

| Device | Driver/Manufacturer | Lumina Type | Status |
|--------|---------------------|-------------|--------|
| Water Leak Sensor | Hubitat Built-in | WATER | ✅ |
| Smoke Detector | Hubitat Built-in | SMOKE | ✅ |
| CO Detector | Hubitat Built-in | SMOKE | ✅ |
| Aqara Water Sensor | Hubitat Built-in | WATER | ✅ |
| First Alert Smoke/CO | Hubitat Built-in | SMOKE | ✅ |
| Zigbee Water Sensor | Hubitat Built-in | WATER | ✅ |

### 🎬 Scenes & Buttons

| Device | Driver/Manufacturer | Lumina Type | Status |
|--------|---------------------|-------------|--------|
| Hubitat Scenes | Hubitat Built-in | SCENE | ✅ |
| Pushable Button | Various | SCENE | ✅ |
| Pico Remote | Lutron | SCENE | ✅ |
| Hue Dimmer Switch | CoCoHue | SCENE | ✅ |
| IKEA Tradfri Remote | Hubitat Built-in | SCENE | ✅ |
| Aqara Cube/Button | Hubitat Built-in | SCENE | ✅ |

### 📲 IR/RF Controls (Molsmart Ecosystem)

| Device | Driver/Manufacturer | Lumina Type | Status |
|--------|---------------------|-------------|--------|
| **Molsmart GW8 IR TV** | TRATO (irweb) | IR_REMOTE | ✅ |
| **Molsmart GW8 IR AC** | TRATO (irweb) | IR_REMOTE | ✅ |
| **Molsmart GW8 RF Blinds** | TRATO | BLIND | ✅ |
| **Child Buttons (TV - xxx)** | TRATO | BUTTON | ✅ |
| **Child Buttons (Cortina - xxx)** | TRATO | BUTTON | ✅ |

---

## 🔧 Supported Hubitat Capabilities

Lumina automatically detects devices by these Hubitat capabilities:

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

---

## 📁 Repository Structure

```
/
├── LuminaHighline_v1.X.html   # Single-file builds (ready to use)
├── hubitat-drivers/           # Auxiliary Groovy drivers
└── README.md
```

---

## 🚀 Changelog

### v1.5.3 (2026-03-01)
- ✅ Full Molsmart ecosystem support (GW8 IR/RF, SoundSmart, Relays)
- ✅ Child button detection (TV -, Cortina -, AC -)
- ✅ IR Remote UI for TV and AC control
- ✅ Mmwave sensor detection (TS0601, TS0225)
- ✅ Fixed detection order (BLIND before SCENE)
- ✅ Fixed sendHubitatCommand (positional parameters)

### v1.4 (2026-03-01)
- ✅ Fixed device detection (TV before AC)
- ✅ Water/Smoke sensor support
- ✅ Complete TV Remote UI

---

## 🌐 Links

<div align="center">

| | |
|:---:|:---:|
| 🌐 **Website** | [luminadashboards.dev.br](https://luminadashboards.dev.br) |
| 📦 **GitHub** | [Domotika/LuminaDev](https://github.com/Domotika/LuminaDev) |
| 🏢 **Company** | [Domótika](https://domotika.com.br) |

</div>

---

## 📞 Support

- **Developed by:** Domótika
- **Compatible with:** Hubitat Elevation C-5, C-7, C-8
- **Contact:** [luminadashboards.dev.br](https://luminadashboards.dev.br)

---

<div align="center">

**Lumina Dashboard** — *Transform your home into a visual experience.*

![Lumina Footer](https://luminadashboards.dev.br/assets/footer-devices.png)

</div>
