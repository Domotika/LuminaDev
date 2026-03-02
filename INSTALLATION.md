# Lumina Dashboard - Guia de Instalação
# Installation Guide

---

## 🇧🇷 Português

### Pré-requisitos

- Hubitat Elevation (C-5, C-7 ou C-8)
- Acesso à interface web do Hubitat
- Licença Lumina ativa

---

## Método 1: Instalação Automática (Recomendado) ⭐

### Passo 1: Instalar o Maker API

1. Acesse seu Hubitat: `http://[IP-DO-HUB]`
2. Vá em **Apps** → **Add Built-in App** → **Maker API**
3. Configure:
   - ✅ **Allow Access via Local IP Address**
   - ✅ **All Devices** (ou selecione os desejados)
5. Clique em **Done**
6. Abra o Maker API e anote o **App ID** e **Access Token**

---

### Passo 2: Instalar o Lumina Installer

1. No Hubitat, vá em **Apps** → **Add User App**
2. Clique em **+ New App**
3. Cole o código do Installer:
   ```
   https://raw.githubusercontent.com/Domotika/LuminaDev/develop/hubitat-apps/LuminaInstaller_PT.groovy
   ```
4. Clique em **Import** → **Save**
5. Volte em **Apps** → **Add User App** → selecione **Lumina Dashboard - Instalador**
6. O app será criado automaticamente

---

### Passo 3: Baixar e Instalar o Dashboard

1. No Lumina Installer, clique em **📥 Instalar Lumina Dashboard**
2. Aguarde o download do GitHub
3. ✅ Dashboard instalado automaticamente!

---

### Passo 4: Configurar Auto-Sync

1. No Lumina Installer, clique em **🔧 Configurar Auto-Sync**
2. As Hub Variables serão criadas automaticamente
3. ✅ Suas configurações serão salvas e sincronizadas!

---

### Passo 5: Gerar Link de Acesso Automático 🔗

Este é o método mais fácil para configurar o Lumina!

1. No Lumina Installer, clique em **🔗 Gerar Link de Acesso**
2. Preencha:
   - **App ID** do Maker API
   - **Access Token** do Maker API
   - **Chave de Licença** (opcional - se já tiver)
3. Copie o **link gerado**
4. Abra o link em qualquer dispositivo
5. ✅ **Pronto!** O Lumina já está conectado e configurado!

**💡 Dica:** Envie este link para seus clientes via WhatsApp. Ao abrir, tudo estará configurado automaticamente!

---

### Passo 6: Ativar a Licença

Se não incluiu a licença no link:

1. Na tela de ativação, copie o **ID de Instalação**
2. Envie via WhatsApp: [+55 47 99635-7469](https://wa.me/5547996357469?text=Olá!%20Comprei%20o%20Lumina%20Dashboard.%20Meu%20ID%20de%20Instalação%20é:%20)
3. Receba e digite sua **Chave de Ativação**
4. ✅ Sistema ativado!

---

## Método 2: Acesso via App Hubitat 📱

Use o Lumina dentro do app oficial do Hubitat!

### Passo 1: Instalar o Driver da Tile

1. No Hubitat, vá em **Drivers Code** → **+ New Driver**
2. Clique em **Import** e cole:
   ```
   https://raw.githubusercontent.com/Domotika/LuminaDev/develop/hubitat-drivers/LuminaDashboardTile_PT.groovy
   ```
3. Clique em **Import** → **Save**

---

### Passo 2: Criar o Dispositivo Virtual

1. Vá em **Devices** → **Add Device** → **Virtual**
2. Preencha:
   - **Device Name:** Lumina Dashboard
   - **Type:** Lumina Dashboard Tile (PT)
3. Clique em **Save Device**

---

### Passo 3: Configurar o Dispositivo

1. Abra o dispositivo criado
2. Em **Preferences**, configure:
   - **Arquivo Lumina:** v1.5 Estável ou v1.6 Beta
   - **Usar Hubitat Cloud:** ✅ Ative para acesso remoto!
   - **Altura da Tile:** 100% (recomendado)
3. Clique em **Save Preferences**

---

### Passo 4: Adicionar na Dashboard

1. Vá em **Dashboards** → Escolha ou crie uma Dashboard
2. Clique em **+** para adicionar tile
3. Selecione o dispositivo **Lumina Dashboard**
4. Configure a tile:
   - **Template:** Attribute
   - **Attribute:** html
   - **Tamanho:** 4x4 ou maior (quanto maior, melhor!)
5. ✅ O Lumina aparece dentro da Dashboard Hubitat!

**🎉 Benefícios:**
- Acesse pelo app Hubitat no celular
- Acesso remoto automático via Hubitat Cloud
- Sem precisar de navegador separado

---

## Método 3: Instalação Manual

### Passo 1: Download do Arquivo

Baixe o arquivo do GitHub:
- **v1.5 Estável:** [LuminaHighline_v1.5.html](https://raw.githubusercontent.com/Domotika/LuminaDev/develop/LuminaHighline_v1.5.html)
- **v1.6 Beta:** [LuminaHighline_v1.6-beta.html](https://raw.githubusercontent.com/Domotika/LuminaDev/develop/LuminaHighline_v1.6-beta.html)

### Passo 2: Upload para o Hubitat

1. No Hubitat, vá em **Settings** → **File Manager**
2. Clique em **Choose File** → selecione o HTML baixado
3. Clique em **Upload**

### Passo 3: Acessar

```
http://[IP-DO-HUB]/local/LuminaHighline_v1.5.html
```

### Passo 4: Configurar Manualmente

1. Vá em **Ajustes** (⚙️)
2. Digite: **IP**, **App ID**, **Token**
3. Teste e Salve

---

## 📱 Criar Atalho na Tela Inicial

**iOS/iPad:**
1. Abra o Lumina no Safari
2. Toque em Compartilhar (□↑) → **Adicionar à Tela de Início**

**Android:**
1. Abra o Lumina no Chrome
2. Menu (⋮) → **Adicionar à tela inicial**

---

## ⚠️ Solução de Problemas

| Problema | Solução |
|----------|---------|
| Erro de conexão | Verifique IP e se está na mesma rede |
| Token inválido | Copie novamente do Maker API |
| Dispositivos não aparecem | Verifique seleção no Maker API |
| Página em branco | Limpe cache e recarregue |
| HTTPS não funciona | Use `http://` (Hubitat local não usa HTTPS) |
| Auto-Sync não funciona | Execute "🔧 Configurar Auto-Sync" no Installer |

---

---

## 🇺🇸 English

### Prerequisites

- Hubitat Elevation (C-5, C-7, or C-8)
- Access to Hubitat web interface
- Active Lumina license

---

## Method 1: Automatic Installation (Recommended) ⭐

### Step 1: Install Maker API

1. Access your Hubitat: `http://[HUB-IP]`
2. Go to **Apps** → **Add Built-in App** → **Maker API**
3. Configure:
   - ✅ **Allow Access via Local IP Address**
   - ✅ **All Devices** (or select desired ones)
5. Click **Done**
6. Open Maker API and note the **App ID** and **Access Token**

---

### Step 2: Install Lumina Installer

1. In Hubitat, go to **Apps** → **Add User App**
2. Click **+ New App**
3. Paste the Installer code:
   ```
   https://raw.githubusercontent.com/Domotika/LuminaDev/develop/hubitat-apps/LuminaInstaller_EN.groovy
   ```
4. Click **Import** → **Save**
5. Go back to **Apps** → **Add User App** → select **Lumina Dashboard Installer**
6. The app will be created automatically

---

### Step 3: Download and Install Dashboard

1. In Lumina Installer, click **📥 Install Lumina Dashboard**
2. Wait for GitHub download
3. ✅ Dashboard installed automatically!

---

### Step 4: Configure Auto-Sync

1. In Lumina Installer, click **🔧 Setup Auto-Sync**
2. Hub Variables will be created automatically
3. ✅ Your settings will be saved and synced!

---

### Step 5: Generate Automatic Access Link 🔗

This is the easiest way to configure Lumina!

1. In Lumina Installer, click **🔗 Generate Access Link**
2. Fill in:
   - **App ID** from Maker API
   - **Access Token** from Maker API
   - **License Key** (optional - if you have one)
3. Copy the **generated link**
4. Open the link on any device
5. ✅ **Done!** Lumina is connected and configured!

**💡 Tip:** Send this link to your clients via WhatsApp. When opened, everything will be configured automatically!

---

### Step 6: Activate License

If you didn't include the license in the link:

1. On the activation screen, copy the **Installation ID**
2. Send via WhatsApp: [+55 47 99635-7469](https://wa.me/5547996357469?text=Hello!%20I%20purchased%20Lumina%20Dashboard.%20My%20Installation%20ID%20is:%20)
3. Receive and enter your **Activation Key**
4. ✅ System activated!

---

## Method 2: Access via Hubitat App 📱

Use Lumina inside the official Hubitat app!

### Step 1: Install the Tile Driver

1. In Hubitat, go to **Drivers Code** → **+ New Driver**
2. Click **Import** and paste:
   ```
   https://raw.githubusercontent.com/Domotika/LuminaDev/develop/hubitat-drivers/LuminaDashboardTile_EN.groovy
   ```
3. Click **Import** → **Save**

---

### Step 2: Create Virtual Device

1. Go to **Devices** → **Add Device** → **Virtual**
2. Fill in:
   - **Device Name:** Lumina Dashboard
   - **Type:** Lumina Dashboard Tile
3. Click **Save Device**

---

### Step 3: Configure the Device

1. Open the created device
2. In **Preferences**, configure:
   - **Lumina File:** v1.5 Stable or v1.6 Beta
   - **Use Hubitat Cloud:** ✅ Enable for remote access!
   - **Tile Height:** 100% (recommended)
3. Click **Save Preferences**

---

### Step 4: Add to Dashboard

1. Go to **Dashboards** → Choose or create a Dashboard
2. Click **+** to add tile
3. Select the **Lumina Dashboard** device
4. Configure the tile:
   - **Template:** Attribute
   - **Attribute:** html
   - **Size:** 4x4 or larger (bigger is better!)
5. ✅ Lumina appears inside the Hubitat Dashboard!

**🎉 Benefits:**
- Access via Hubitat app on your phone
- Automatic remote access via Hubitat Cloud
- No separate browser needed

---

## Method 3: Manual Installation

### Step 1: Download the File

Download from GitHub:
- **v1.5 Stable:** [LuminaHighline_v1.5.html](https://raw.githubusercontent.com/Domotika/LuminaDev/develop/LuminaHighline_v1.5.html)
- **v1.6 Beta:** [LuminaHighline_v1.6-beta.html](https://raw.githubusercontent.com/Domotika/LuminaDev/develop/LuminaHighline_v1.6-beta.html)

### Step 2: Upload to Hubitat

1. In Hubitat, go to **Settings** → **File Manager**
2. Click **Choose File** → select downloaded HTML
3. Click **Upload**

### Step 3: Access

```
http://[HUB-IP]/local/LuminaHighline_v1.5.html
```

### Step 4: Configure Manually

1. Go to **Settings** (⚙️)
2. Enter: **IP**, **App ID**, **Token**
3. Test and Save

---

## 📱 Create Home Screen Shortcut

**iOS/iPad:**
1. Open Lumina in Safari
2. Tap Share (□↑) → **Add to Home Screen**

**Android:**
1. Open Lumina in Chrome
2. Menu (⋮) → **Add to Home screen**

---

## ⚠️ Troubleshooting

| Problem | Solution |
|---------|----------|
| Connection error | Check IP and same network |
| Invalid token | Copy again from Maker API |
| Devices not showing | Check selection in Maker API |
| Blank page | Clear cache and reload |
| HTTPS not working | Use `http://` (local Hubitat doesn't use HTTPS) |
| Auto-Sync not working | Run "🔧 Setup Auto-Sync" in Installer |

---

## 📞 Support

- **WhatsApp:** +55 47 99635-7469
- **Website:** [luminadashboards.dev.br](https://luminadashboards.dev.br)
- **Company:** [Domótika](https://domotika.com.br)

---

**Lumina Dashboard** — *Transform your home into a visual experience.*
