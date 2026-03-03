# Lumina Dashboard

<div align="center">

![Lumina Banner](https://i.ibb.co/ks0bNVHs/1.png)

**Professional Glassmorphism Dashboard for Hubitat Elevation**

*Single-file HTML that runs directly on your hub — zero external servers required.*

[![Version](https://img.shields.io/badge/version-1.5.6-blue?style=for-the-badge)](https://github.com/Domotika/LuminaDev/releases)
[![Beta](https://img.shields.io/badge/beta-1.6-purple?style=for-the-badge)](https://github.com/Domotika/LuminaDev)
[![Platform](https://img.shields.io/badge/platform-Hubitat-00A4EF?style=for-the-badge)](https://hubitat.com)
[![License](https://img.shields.io/badge/license-Commercial-yellow?style=for-the-badge)](LICENSE)

🌐 **Website:** [luminadashboards.dev.br](https://luminadashboards.dev.br)

[🇧🇷 Português](README.pt-BR.md)

</div>

---

## ✨ What's New in v1.6

- 🔗 **Auto-Setup Link** — Generate a link that configures everything automatically!
- 📱 **Dashboard Tile** — Access Lumina inside the Hubitat app
- ☁️ **Cloud Support** — Remote access via Hubitat Cloud
- 🔄 **Auto-Sync** — Settings sync automatically across devices
- 📷 **IP Cameras** — MJPEG, Snapshot, and RTSP support
- ⭐ **Favorites Bar** — Quick access to your most-used devices

---

## 💳 Licensing

**Lumina Dashboard is commercial software.** A license is required for each Hubitat hub.

### How to Purchase

1. Visit [luminadashboards.dev.br](https://luminadashboards.dev.br)
2. Choose your license plan
3. Complete payment
4. Follow the activation steps below

---

## 🚀 Quick Start

📖 **[Complete Installation Guide](INSTALLATION.md)** ← Full step-by-step instructions!

☁️ **[Cloud Remote Access Guide](CLOUD_ACCESS.md)** ← Setup access via Hubitat app!

### Method 1: HPM - Hubitat Package Manager (Recommended) ⭐

Installs everything automatically with one click!

1. **Open HPM** in Hubitat
2. **Install** → **Search by Keywords**
3. Search for **"Lumina"**
4. Select **Lumina Dashboard** → **Install**
5. ✅ API, Installer, Tiles - all installed!

> Don't have HPM? [Install it here](https://hubitatpackagemanager.hubitatcommunity.com/)

### Method 2: Automatic Installation

1. **Install Maker API** in Hubitat (Apps → Add Built-in App)
2. **Install Lumina Installer:**
   - Apps → Add User App → + New App → Import:
   ```
   https://raw.githubusercontent.com/Domotika/LuminaDev/develop/hubitat-apps/LuminaInstaller_EN.groovy
   ```
3. **Click "📥 Install Lumina Dashboard"** — Downloads automatically!
4. **Click "🔧 Setup Auto-Sync"** — Creates Hub Variables
5. **Click "🔗 Generate Access Link"** — Enter App ID + Token
6. **Open the generated link** — Everything is configured! ✅

### Method 2: Access via Hubitat App 📱

Use Lumina inside the official Hubitat app with remote access!

1. **Install the Tile Driver:**
   ```
   https://raw.githubusercontent.com/Domotika/LuminaDev/develop/hubitat-drivers/LuminaDashboardTile_EN.groovy
   ```
2. **Create virtual device** with type "Lumina Dashboard Tile"
3. **Add to Dashboard** as Attribute tile (select "html")
4. **Enable Cloud** for remote access! ☁️

### Method 3: Remote Access Server (iframe) 📱☁️

Embed Lumina in any dashboard or app with full remote access support!

1. **Install LuminaServer App:**
   - Apps → Add User App → + New App → Import:
   ```
   https://raw.githubusercontent.com/Domotika/LuminaDev/main/hubitat-apps/LuminaServer.groovy
   ```
2. **Add the App:**
   - Apps → Add User App → **Lumina Dashboard Server**
3. **Configure:**
   - Set the HTML filename (default: `LuminaHighline_v1.5.html`)
   - Click **Done**
4. **Copy URLs:**
   - Open the app settings to see generated URLs
   - **Local URL** — For same-network access
   - **Cloud URL** — For remote/mobile access ☁️

5. **Use in Dashboards:**
   - Add the Cloud URL to any iframe-compatible dashboard
   - Works in **Hubitat Mobile App**, **ActionTiles**, **SharpTools**, etc.

> 💡 **Why use this?** The standard Hubitat Cloud blocks iframe embedding. LuminaServer adds permissive headers (`X-Frame-Options: ALLOWALL`) to enable embedding anywhere.

### Method 4: Manual Installation

1. **Upload** `LuminaHighline_v1.5.html` to Hubitat **File Manager**
2. **Access**: `http://[HUB-IP]/local/LuminaHighline_v1.5.html`
3. **Configure** IP, App ID, Token in Settings

---

## 🔐 Activation

1. Open Lumina → Copy your **Installation ID**
2. Send via WhatsApp: [+55 47 99635-7469](https://wa.me/5547996357469?text=Hello!%20I%20purchased%20Lumina%20Dashboard.%20My%20Installation%20ID%20is:%20)
3. Receive and enter your **Activation Key**
4. ✅ Activated!

---

## ✨ Features

<div align="center">

| | | |
|:---:|:---:|:---:|
| 🎨 **Glassmorphism UI** | ⚡ **Zero Latency** | 📱 **Responsive** |
| Modern glass effects | 100% local execution | Tablets, phones, wall panels |
| 🔌 **Maker API** | 🏠 **Multi-room** | 🎛️ **Advanced Controls** |
| Native Hubitat integration | Organize by rooms | TV remotes, AC, blinds |
| 🔗 **Auto-Setup** | 📱 **App Integration** | ☁️ **Cloud Access** |
| One link configures all! | Works in Hubitat app | Remote via Hubitat Cloud |

</div>

---

## 📱 Screenshots

<div align="center">

| Home | Rooms | Scenes |
|:---:|:---:|:---:|
| ![Home](https://i.ibb.co/ks0bNVHs/1.png) | ![Rooms](https://i.ibb.co/TBGjTWvG/2.png) | ![Scenes](https://i.ibb.co/tpgcF3Z8/3.png) |

| API Config | Settings |
|:---:|:---:|
| ![Config](https://i.ibb.co/RTqMtCM7/4.png) | ![Settings](https://i.ibb.co/v4q1KRCL/5.png) |

</div>

---

## ✅ Device Compatibility

### 🔌 Switches & Relays

| Device | Driver/Manufacturer | Lumina Type | Status |
|--------|---------------------|-------------|--------|
| Generic Switch | Hubitat Built-in | SWITCH | ✅ |
| Generic Dimmer | Hubitat Built-in | DIMMER | ✅ |
| Zigbee/Z-Wave Switch | Hubitat Built-in | SWITCH | ✅ |
| **Molsmart Relays HTTP/TCP** | TRATO | SWITCH | ✅ |
| Shelly Relay | Shelly | SWITCH | ✅ |

### 💡 Lighting

| Device | Driver/Manufacturer | Lumina Type | Status |
|--------|---------------------|-------------|--------|
| Generic Dimmer | Hubitat Built-in | DIMMER | ✅ |
| Philips Hue | CoCoHue / Hubitat | LIGHT | ✅ |
| IKEA Tradfri | Hubitat Built-in | DIMMER | ✅ |
| RGB/RGBW Controllers | Various | LIGHT | ✅ |

### 🌡️ Climate Control

| Device | Driver/Manufacturer | Lumina Type | Status |
|--------|---------------------|-------------|--------|
| Generic Thermostat | Hubitat Built-in | AC | ✅ |
| **Molsmart GW8 IR AC** | TRATO (irweb) | IR_REMOTE | ✅ |
| Sensibo / Cielo | Community Driver | AC | ✅ |
| Ecobee / Nest | Built-in/Community | AC | ✅ |

### 📺 TVs & Media

| Device | Driver/Manufacturer | Lumina Type | Status |
|--------|---------------------|-------------|--------|
| **Samsung TV** | Dave Gutheinz | TV | ✅ |
| **LG webOS TV** | Community Driver | TV | ✅ |
| **Molsmart GW8 IR TV** | TRATO (irweb) | IR_REMOTE | ✅ |
| Roku / Fire TV | Community Driver | TV | ✅ |

### 🔊 Audio / AVR

| Device | Driver/Manufacturer | Lumina Type | Status |
|--------|---------------------|-------------|--------|
| **Molsmart SoundSmart** | TRATO | AVR | ✅ |
| Denon / Marantz AVR | Community Driver | AVR | ✅ |
| Sonos | Community Driver | AVR | ✅ |

### 🪟 Blinds & Shades

| Device | Driver/Manufacturer | Lumina Type | Status |
|--------|---------------------|-------------|--------|
| Generic Window Shade | Hubitat Built-in | BLIND | ✅ |
| **Molsmart Curtains** | TRATO | BLIND | ✅ |
| Somfy / IKEA Fyrtur | Community/Built-in | BLIND | ✅ |

### 🚪 Locks & Sensors

| Device | Driver/Manufacturer | Lumina Type | Status |
|--------|---------------------|-------------|--------|
| Z-Wave/Zigbee Lock | Hubitat Built-in | LOCK | ✅ |
| Motion Sensor | Hubitat Built-in | MOTION | ✅ |
| Presence/Mmwave | Various | PRESENCE | ✅ |
| Water/Smoke Sensor | Hubitat Built-in | WATER/SMOKE | ✅ |

---

## 📁 Repository Structure

```
/
├── LuminaHighline_v1.5.html      # Stable release
├── LuminaHighline_v1.6-beta.html # Beta with new features
├── hubitat-apps/
│   ├── LuminaDashboardAPI.groovy # Main API (devices + hub variables)
│   ├── LuminaInstaller_PT.groovy # Installer (Portuguese)
│   ├── LuminaInstaller_EN.groovy # Installer (English)
│   └── LuminaServer.groovy       # Remote Access Server (iframe)
├── hubitat-drivers/
│   ├── LuminaDashboardTile_PT.groovy # Dashboard Tile (Portuguese)
│   └── LuminaDashboardTile_EN.groovy # Dashboard Tile (English)
├── INSTALLATION.md               # Complete installation guide
├── LICENSE                       # Commercial license terms
├── README.md                     # Documentation (English)
└── README.pt-BR.md               # Documentation (Portuguese)
```

---

## 🚀 Changelog

### v1.6-beta (2026-03-02)
- 🔗 **Auto-Setup Link** — Generate link with embedded config
- 📱 **Dashboard Tile Driver** — Lumina inside Hubitat app
- ☁️ **Hubitat Cloud Support** — Remote access via Cloud
- 🔄 **Auto-Sync** — Settings saved to Hub Variables
- 📷 **IP Cameras** — MJPEG, Snapshot, RTSP support
- ⭐ **Favorites Bar** — Quick access to favorite devices
- 🖼️ **Offline Mode** — Works without internet (CSS gradients fallback)

### v1.5.6 (2026-03-01)
- ✅ Lumina Installer app for automatic installation
- ✅ Auto-Sync with Hub Variables
- ✅ Full Molsmart ecosystem support
- ✅ Scene button fix (push/1)

### v1.5.3 (2026-03-01)
- ✅ Molsmart GW8 IR/RF support
- ✅ SoundSmart multiroom detection
- ✅ Child button detection
- ✅ IR Remote UI for TV and AC

---

## 🌐 Links

<div align="center">

| | |
|:---:|:---:|
| 🌐 **Website** | [luminadashboards.dev.br](https://luminadashboards.dev.br) |
| 📦 **GitHub** | [Domotika/LuminaDev](https://github.com/Domotika/LuminaDev) |
| 🏢 **Company** | [Domótika](https://domotika.com.br) |
| 📱 **WhatsApp** | [+55 47 99635-7469](https://wa.me/5547996357469) |

</div>

---

## 📞 Support

- **Developed by:** Domótika Ambientes Inteligentes LTDA
- **Compatible with:** Hubitat Elevation C-5, C-7, C-8
- **Contact:** [luminadashboards.dev.br](https://luminadashboards.dev.br)

---

<div align="center">

**Lumina Dashboard** — *Transform your home into a visual experience.*

*Made with ❤️ by Domótika*

</div>
