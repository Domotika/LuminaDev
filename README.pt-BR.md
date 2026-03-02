# Lumina Dashboard

<div align="center">

![Lumina Banner](https://i.ibb.co/ks0bNVHs/1.png)

**Dashboard Profissional com Glassmorphism para Hubitat Elevation**

*Arquivo HTML único que roda diretamente no seu hub — zero servidores externos.*

[![Versão](https://img.shields.io/badge/versão-1.5.6-blue?style=for-the-badge)](https://github.com/Domotika/LuminaDev/releases)
[![Beta](https://img.shields.io/badge/beta-1.6-purple?style=for-the-badge)](https://github.com/Domotika/LuminaDev)
[![Plataforma](https://img.shields.io/badge/plataforma-Hubitat-00A4EF?style=for-the-badge)](https://hubitat.com)
[![Licença](https://img.shields.io/badge/licença-Comercial-yellow?style=for-the-badge)](LICENSE)

🌐 **Website:** [luminadashboards.dev.br](https://luminadashboards.dev.br)

[🇺🇸 English](README.md)

</div>

---

## ✨ Novidades da v1.6

- 🔗 **Link de Configuração Automática** — Gere um link que configura tudo automaticamente!
- 📱 **Tile para Dashboard** — Acesse o Lumina dentro do app Hubitat
- ☁️ **Suporte Cloud** — Acesso remoto via Hubitat Cloud
- 🔄 **Auto-Sync** — Configurações sincronizam automaticamente entre dispositivos
- 📷 **Câmeras IP** — Suporte a MJPEG, Snapshot e RTSP
- ⭐ **Barra de Favoritos** — Acesso rápido aos dispositivos mais usados

---

## 💳 Licenciamento

**Lumina Dashboard é um software comercial.** Uma licença é necessária para cada hub Hubitat.

### Como Comprar

1. Visite [luminadashboards.dev.br](https://luminadashboards.dev.br)
2. Escolha seu plano de licença
3. Complete o pagamento
4. Siga os passos de ativação abaixo

---

## 🚀 Início Rápido

📖 **[Guia Completo de Instalação](INSTALLATION.md)** ← Instruções passo a passo!

### Método 1: Instalação Automática (Recomendado) ⭐

1. **Instale o Maker API** no Hubitat (Apps → Add Built-in App)
2. **Instale o Lumina Installer:**
   - Apps → Add User App → + New App → Import:
   ```
   https://raw.githubusercontent.com/Domotika/LuminaDev/develop/hubitat-apps/LuminaInstaller_PT.groovy
   ```
3. **Clique em "📥 Instalar Lumina Dashboard"** — Baixa automaticamente!
4. **Clique em "🔧 Configurar Auto-Sync"** — Cria as Hub Variables
5. **Clique em "🔗 Gerar Link de Acesso"** — Digite App ID + Token
6. **Abra o link gerado** — Tudo configurado! ✅

### Método 2: Acesso via App Hubitat 📱

Use o Lumina dentro do app oficial do Hubitat com acesso remoto!

1. **Instale o Driver da Tile:**
   ```
   https://raw.githubusercontent.com/Domotika/LuminaDev/develop/hubitat-drivers/LuminaDashboardTile_PT.groovy
   ```
2. **Crie um dispositivo virtual** com tipo "Lumina Dashboard Tile (PT)"
3. **Adicione na Dashboard** como tile Attribute (selecione "html")
4. **Ative o Cloud** para acesso remoto! ☁️

### Método 3: Instalação Manual

1. **Faça upload** do `LuminaHighline_v1.5.html` no **File Manager** do Hubitat
2. **Acesse**: `http://[IP-DO-HUB]/local/LuminaHighline_v1.5.html`
3. **Configure** IP, App ID, Token nos Ajustes

---

## 🔐 Ativação

1. Abra o Lumina → Copie seu **ID de Instalação**
2. Envie via WhatsApp: [+55 47 99635-7469](https://wa.me/5547996357469?text=Olá!%20Comprei%20o%20Lumina%20Dashboard.%20Meu%20ID%20de%20Instalação%20é:%20)
3. Receba e digite sua **Chave de Ativação**
4. ✅ Ativado!

---

## ✨ Recursos

<div align="center">

| | | |
|:---:|:---:|:---:|
| 🎨 **Interface Glassmorphism** | ⚡ **Zero Latência** | 📱 **Responsivo** |
| Efeitos de vidro modernos | 100% execução local | Tablets, celulares, painéis |
| 🔌 **Maker API** | 🏠 **Multi-ambientes** | 🎛️ **Controles Avançados** |
| Integração nativa Hubitat | Organize por cômodos | TV, AC, persianas |
| 🔗 **Auto-Setup** | 📱 **Integração App** | ☁️ **Acesso Cloud** |
| Um link configura tudo! | Funciona no app Hubitat | Remoto via Cloud |

</div>

---

## 📱 Screenshots

<div align="center">

| Home | Ambientes | Cenas |
|:---:|:---:|:---:|
| ![Home](https://i.ibb.co/ks0bNVHs/1.png) | ![Rooms](https://i.ibb.co/TBGjTWvG/2.png) | ![Scenes](https://i.ibb.co/tpgcF3Z8/3.png) |

| Config API | Ajustes |
|:---:|:---:|
| ![Config](https://i.ibb.co/RTqMtCM7/4.png) | ![Settings](https://i.ibb.co/v4q1KRCL/5.png) |

</div>

---

## ✅ Compatibilidade de Dispositivos

### 🔌 Switches & Relés

| Dispositivo | Driver/Fabricante | Tipo Lumina | Status |
|-------------|-------------------|-------------|--------|
| Switch Genérico | Hubitat Built-in | SWITCH | ✅ |
| Dimmer Genérico | Hubitat Built-in | DIMMER | ✅ |
| Switch Zigbee/Z-Wave | Hubitat Built-in | SWITCH | ✅ |
| **Molsmart Relays HTTP/TCP** | TRATO | SWITCH | ✅ |
| Shelly Relay | Shelly | SWITCH | ✅ |

### 💡 Iluminação

| Dispositivo | Driver/Fabricante | Tipo Lumina | Status |
|-------------|-------------------|-------------|--------|
| Dimmer Genérico | Hubitat Built-in | DIMMER | ✅ |
| Philips Hue | CoCoHue / Hubitat | LIGHT | ✅ |
| IKEA Tradfri | Hubitat Built-in | DIMMER | ✅ |
| Controladores RGB/RGBW | Diversos | LIGHT | ✅ |

### 🌡️ Climatização

| Dispositivo | Driver/Fabricante | Tipo Lumina | Status |
|-------------|-------------------|-------------|--------|
| Termostato Genérico | Hubitat Built-in | AC | ✅ |
| **Molsmart GW8 IR AC** | TRATO (irweb) | IR_REMOTE | ✅ |
| Sensibo / Cielo | Community Driver | AC | ✅ |
| Ecobee / Nest | Built-in/Community | AC | ✅ |

### 📺 TVs & Mídia

| Dispositivo | Driver/Fabricante | Tipo Lumina | Status |
|-------------|-------------------|-------------|--------|
| **Samsung TV** | Dave Gutheinz | TV | ✅ |
| **LG webOS TV** | Community Driver | TV | ✅ |
| **Molsmart GW8 IR TV** | TRATO (irweb) | IR_REMOTE | ✅ |
| Roku / Fire TV | Community Driver | TV | ✅ |

### 🔊 Áudio / AVR

| Dispositivo | Driver/Fabricante | Tipo Lumina | Status |
|-------------|-------------------|-------------|--------|
| **Molsmart SoundSmart** | TRATO | AVR | ✅ |
| Denon / Marantz AVR | Community Driver | AVR | ✅ |
| Sonos | Community Driver | AVR | ✅ |

### 🪟 Persianas & Cortinas

| Dispositivo | Driver/Fabricante | Tipo Lumina | Status |
|-------------|-------------------|-------------|--------|
| Window Shade Genérico | Hubitat Built-in | BLIND | ✅ |
| **Molsmart Curtains** | TRATO | BLIND | ✅ |
| Somfy / IKEA Fyrtur | Community/Built-in | BLIND | ✅ |

### 🚪 Fechaduras & Sensores

| Dispositivo | Driver/Fabricante | Tipo Lumina | Status |
|-------------|-------------------|-------------|--------|
| Fechadura Z-Wave/Zigbee | Hubitat Built-in | LOCK | ✅ |
| Sensor de Movimento | Hubitat Built-in | MOTION | ✅ |
| Presença/Mmwave | Diversos | PRESENCE | ✅ |
| Sensor Água/Fumaça | Hubitat Built-in | WATER/SMOKE | ✅ |

---

## 📁 Estrutura do Repositório

```
/
├── LuminaHighline_v1.5.html      # Release estável
├── LuminaHighline_v1.6-beta.html # Beta com novos recursos
├── hubitat-apps/
│   ├── LuminaInstaller_PT.groovy # Instalador (Português)
│   └── LuminaInstaller_EN.groovy # Instalador (Inglês)
├── hubitat-drivers/
│   ├── LuminaDashboardTile_PT.groovy # Tile Dashboard (Português)
│   └── LuminaDashboardTile_EN.groovy # Tile Dashboard (Inglês)
├── INSTALLATION.md               # Guia completo de instalação
├── LICENSE                       # Termos da licença comercial
├── README.md                     # Documentação (Inglês)
└── README.pt-BR.md               # Documentação (Português)
```

---

## 🚀 Changelog

### v1.6-beta (2026-03-02)
- 🔗 **Link de Auto-Setup** — Gera link com config embutida
- 📱 **Driver Dashboard Tile** — Lumina dentro do app Hubitat
- ☁️ **Suporte Hubitat Cloud** — Acesso remoto via Cloud
- 🔄 **Auto-Sync** — Configurações salvas em Hub Variables
- 📷 **Câmeras IP** — Suporte MJPEG, Snapshot, RTSP
- ⭐ **Barra de Favoritos** — Acesso rápido aos favoritos
- 🖼️ **Modo Offline** — Funciona sem internet (gradientes CSS)

### v1.5.6 (2026-03-01)
- ✅ App Lumina Installer para instalação automática
- ✅ Auto-Sync com Hub Variables
- ✅ Suporte completo ao ecossistema Molsmart
- ✅ Correção do botão de cena (push/1)

### v1.5.3 (2026-03-01)
- ✅ Suporte Molsmart GW8 IR/RF
- ✅ Detecção SoundSmart multiroom
- ✅ Detecção de child buttons
- ✅ UI de Controle Remoto IR para TV e AC

---

## 🌐 Links

<div align="center">

| | |
|:---:|:---:|
| 🌐 **Website** | [luminadashboards.dev.br](https://luminadashboards.dev.br) |
| 📦 **GitHub** | [Domotika/LuminaDev](https://github.com/Domotika/LuminaDev) |
| 🏢 **Empresa** | [Domótika](https://domotika.com.br) |
| 📱 **WhatsApp** | [+55 47 99635-7469](https://wa.me/5547996357469) |

</div>

---

## 📞 Suporte

- **Desenvolvido por:** Domótika Ambientes Inteligentes LTDA
- **Compatível com:** Hubitat Elevation C-5, C-7, C-8
- **Contato:** [luminadashboards.dev.br](https://luminadashboards.dev.br)

---

<div align="center">

**Lumina Dashboard** — *Transforme sua casa em uma experiência visual.*

*Feito com ❤️ pela Domótika*

</div>
