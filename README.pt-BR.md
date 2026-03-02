# Lumina Dashboard

<div align="center">

![Lumina Banner](https://i.ibb.co/ks0bNVHs/1.png)

**Dashboard Profissional com Glassmorphism para Hubitat Elevation**

*Arquivo HTML único que roda diretamente no seu hub — sem servidores externos.*

[![Versão](https://img.shields.io/badge/versão-1.5.3-blue?style=for-the-badge)](https://github.com/Domotika/LuminaDev/releases)
[![Plataforma](https://img.shields.io/badge/plataforma-Hubitat-00A4EF?style=for-the-badge)](https://hubitat.com)
[![Licença](https://img.shields.io/badge/licença-Comercial-yellow?style=for-the-badge)](#)

🌐 **Website:** [luminadashboards.dev.br](https://luminadashboards.dev.br)

[🇺🇸 English](README.md)

</div>

---

## 💳 Licenciamento

**Lumina Dashboard é um software comercial.** É necessária uma licença para cada hub Hubitat.

### Como Adquirir

1. Acesse [luminadashboards.dev.br](https://luminadashboards.dev.br)
2. Escolha seu plano de licença
3. Realize o pagamento
4. Siga os passos de ativação abaixo

---

## 🔐 Guia de Ativação

Após instalar o Lumina no seu Hubitat, você precisará ativá-lo:

### Passo 1: Obtenha seu ID de Instalação

Ao abrir o Lumina pela primeira vez, uma tela de ativação será exibida:

![Tela de Ativação](https://i.ibb.co/QFGspHqY/ativa-o-lumina.png)

Seu **ID de Instalação** único (ex: `LUM-5855-9E9C`) será exibido.

### Passo 2: Envie para o Suporte

Após concluir sua compra, envie seu **ID de Instalação** via WhatsApp para nossa equipe:

📱 **WhatsApp:** [Clique aqui para contatar o suporte](https://wa.me/5547999999999?text=Olá!%20Comprei%20o%20Lumina%20Dashboard.%20Meu%20ID%20de%20Instalação%20é:%20)

> Inclua seu ID de Instalação e comprovante de pagamento.

### Passo 3: Receba sua Chave de Ativação

Nossa equipe enviará uma **Chave de Ativação** no formato `XXXX-XXXX-XXXX-XXXX`.

### Passo 4: Ative

1. Digite sua Chave de Ativação no campo indicado
2. Clique em **"ATIVAR SISTEMA"**
3. Pronto! O Lumina está totalmente ativado ✅

![Ajustes Após Ativação](https://i.ibb.co/k69pJjR8/ativa-o-lumina-inicio.png)

---

## ✨ Recursos

<div align="center">

| | | |
|:---:|:---:|:---:|
| 🎨 **Interface Glassmorphism** | ⚡ **Latência Zero** | 📱 **Responsivo** |
| Efeitos modernos de vidro | 100% execução local | Tablets, celulares, painéis |
| 🔌 **Maker API** | 🏠 **Multi-ambientes** | 🎛️ **Controles Avançados** |
| Integração nativa Hubitat | Organize por cômodos | Controles de TV, AC, persianas |

</div>

![Lumina Screenshot](https://i.ibb.co/ks0bNVHs/1.png)

---

## 🚀 Início Rápido

### Instalação

1. **Faça upload** do `LuminaHighline_vX.X.html` no **File Manager** do Hubitat
2. **Configure** o app **Maker API** no Hubitat (Apps → Maker API)
3. **Acesse**: `http://[IP-DO-SEU-HUB]/local/LuminaHighline_vX.X.html`
4. **Configure**: Insira o IP do Hub, App ID e Token de Acesso nos Ajustes

### Requisitos

- Hubitat Elevation (C-5, C-7 ou C-8)
- App Maker API instalado e configurado
- Navegador moderno (Chrome, Safari, Firefox, Edge)

---

## 📱 Screenshots

<div align="center">

| Home | Ambientes | Cenas |
|:---:|:---:|:---:|
| ![Home](https://i.ibb.co/ks0bNVHs/1.png) | ![Ambientes](https://i.ibb.co/TBGjTWvG/2.png) | ![Cenas](https://i.ibb.co/tpgcF3Z8/3.png) |

| Configuração API | Ajustes |
|:---:|:---:|
| ![Config](https://i.ibb.co/RTqMtCM7/4.png) | ![Ajustes](https://i.ibb.co/v4q1KRCL/5.png) |

</div>

### 🎨 Backgrounds Inclusos

Lumina inclui diversos wallpapers animados e estáticos:

| Animados | | |
|:---:|:---:|:---:|
| ![Ocean](https://i.ibb.co/DP3PWBL0/ocean-3.gif) | ![Aurora](https://i.ibb.co/FbqRJsqC/aurora.gif) | ![Matrix](https://i.ibb.co/NnnPRhzH/matrix-3.gif) |

---

## ✅ Compatibilidade de Dispositivos

### 🔌 Interruptores & Relés

| Dispositivo | Driver/Fabricante | Tipo Lumina | Status |
|-------------|-------------------|-------------|--------|
| Interruptor Genérico | Hubitat Built-in | SWITCH | ✅ |
| Dimmer Genérico | Hubitat Built-in | DIMMER | ✅ |
| Interruptor Zigbee | Hubitat Built-in | SWITCH | ✅ |
| Interruptor Z-Wave | Hubitat Built-in | SWITCH | ✅ |
| **Molsmart Relays HTTP** | TRATO | SWITCH | ✅ |
| **Molsmart Relays TCP 2/4/8/16/32CH** | TRATO | SWITCH | ✅ |
| Shelly Relay | Shelly | SWITCH | ✅ |
| Sonoff Basic | Sonoff | SWITCH | ✅ |

### 💡 Iluminação

| Dispositivo | Driver/Fabricante | Tipo Lumina | Status |
|-------------|-------------------|-------------|--------|
| Dimmer Genérico | Hubitat Built-in | DIMMER | ✅ |
| Dimmer Zigbee | Hubitat Built-in | DIMMER | ✅ |
| Dimmer Z-Wave | Hubitat Built-in | DIMMER | ✅ |
| Lâmpada Philips Hue | CoCoHue / Hubitat | LIGHT | ✅ |
| IKEA Tradfri | Hubitat Built-in | DIMMER | ✅ |
| LIFX | Community Driver | LIGHT | ✅ |
| Controladores RGB/RGBW | Diversos | LIGHT | ✅ |
| Lâmpadas Tuya Zigbee | Hubitat Built-in | DIMMER | ✅ |

### 🌡️ Climatização (AC / Termostato)

| Dispositivo | Driver/Fabricante | Tipo Lumina | Status |
|-------------|-------------------|-------------|--------|
| Termostato Genérico | Hubitat Built-in | AC | ✅ |
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
| Window Shade Genérico | Hubitat Built-in | BLIND | ✅ |
| **Molsmart GW8 RF** | TRATO | BLIND | ✅ |
| **Molsmart Curtains HTTP/TCP** | TRATO | BLIND | ✅ |
| Somfy RTS | Community Driver | BLIND | ✅ |
| IKEA Fyrtur/Kadrilj | Hubitat Built-in | BLIND | ✅ |
| Persianas Tuya Zigbee | Hubitat Built-in | BLIND | ✅ |
| Zemismart Blinds | Community Driver | BLIND | ✅ |
| Aqara Roller Shade | Hubitat Built-in | BLIND | ✅ |

### 🚪 Fechaduras

| Dispositivo | Driver/Fabricante | Tipo Lumina | Status |
|-------------|-------------------|-------------|--------|
| Fechadura Z-Wave Genérica | Hubitat Built-in | LOCK | ✅ |
| Yale Assure | Hubitat Built-in | LOCK | ✅ |
| Schlage | Hubitat Built-in | LOCK | ✅ |
| August Smart Lock | Community Driver | LOCK | ✅ |
| Kwikset | Hubitat Built-in | LOCK | ✅ |
| Fechadura Zigbee | Hubitat Built-in | LOCK | ✅ |

### 👁️ Sensores de Movimento

| Dispositivo | Driver/Fabricante | Tipo Lumina | Status |
|-------------|-------------------|-------------|--------|
| **Philips Hue Indoor (SML001)** | Hubitat Built-in | MOTION | ✅ |
| **Philips Hue Outdoor (SML002)** | Hubitat Built-in | MOTION | ✅ |
| Sensor Movimento Zigbee | Hubitat Built-in | MOTION | ✅ |
| Sensor Movimento Z-Wave | Hubitat Built-in | MOTION | ✅ |
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
| Sensor de Vazamento | Hubitat Built-in | WATER | ✅ |
| Detector de Fumaça | Hubitat Built-in | SMOKE | ✅ |
| Detector de CO | Hubitat Built-in | SMOKE | ✅ |
| Aqara Water Sensor | Hubitat Built-in | WATER | ✅ |
| First Alert Smoke/CO | Hubitat Built-in | SMOKE | ✅ |
| Sensor Água Zigbee | Hubitat Built-in | WATER | ✅ |

### 🎬 Cenas & Botões

| Dispositivo | Driver/Fabricante | Tipo Lumina | Status |
|-------------|-------------------|-------------|--------|
| Hubitat Scenes | Hubitat Built-in | SCENE | ✅ |
| Pushable Button | Diversos | SCENE | ✅ |
| Pico Remote | Lutron | SCENE | ✅ |
| Hue Dimmer Switch | CoCoHue | SCENE | ✅ |
| IKEA Tradfri Remote | Hubitat Built-in | SCENE | ✅ |
| Aqara Cube/Button | Hubitat Built-in | SCENE | ✅ |

### 📲 Controles IR/RF (Ecossistema Molsmart)

| Dispositivo | Driver/Fabricante | Tipo Lumina | Status |
|-------------|-------------------|-------------|--------|
| **Molsmart GW8 IR TV** | TRATO (irweb) | IR_REMOTE | ✅ |
| **Molsmart GW8 IR AC** | TRATO (irweb) | IR_REMOTE | ✅ |
| **Molsmart GW8 RF Blinds** | TRATO | BLIND | ✅ |
| **Botões Filhos (TV - xxx)** | TRATO | BUTTON | ✅ |
| **Botões Filhos (Cortina - xxx)** | TRATO | BUTTON | ✅ |

---

## 🔧 Capabilities Hubitat Suportadas

Lumina detecta automaticamente dispositivos por estas capabilities do Hubitat:

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

## 📁 Estrutura do Repositório

```
/
├── LuminaHighline_v1.X.html   # Builds single-file (prontos para uso)
├── hubitat-drivers/           # Drivers Groovy auxiliares
├── README.md                  # Documentação em inglês
└── README.pt-BR.md            # Documentação em português
```

---

## 🚀 Changelog

### v1.5.3 (2026-03-01)
- ✅ Suporte completo ao ecossistema Molsmart (GW8 IR/RF, SoundSmart, Relays)
- ✅ Detecção de botões filhos (TV -, Cortina -, AC -)
- ✅ Interface IR Remote para controle de TV e AC
- ✅ Detecção de sensores Mmwave (TS0601, TS0225)
- ✅ Correção na ordem de detecção (BLIND antes de SCENE)
- ✅ Correção no sendHubitatCommand (parâmetros posicionais)

### v1.4 (2026-03-01)
- ✅ Correção na detecção de dispositivos (TV antes de AC)
- ✅ Suporte a sensores de água/fumaça
- ✅ Interface completa de controle remoto de TV

---

## 🌐 Links

<div align="center">

| | |
|:---:|:---:|
| 🌐 **Website** | [luminadashboards.dev.br](https://luminadashboards.dev.br) |
| 📦 **GitHub** | [Domotika/LuminaDev](https://github.com/Domotika/LuminaDev) |
| 🏢 **Empresa** | [Domótika](https://domotika.com.br) |

</div>

---

## 📞 Suporte

- **Desenvolvido por:** Domótika
- **Compatível com:** Hubitat Elevation C-5, C-7, C-8
- **Contato:** [luminadashboards.dev.br](https://luminadashboards.dev.br)

---

<div align="center">

**Lumina Dashboard** — *Transforme sua casa em uma experiência visual.*

*Feito com ❤️ pela Domótika*

</div>
