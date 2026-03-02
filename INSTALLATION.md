# Lumina Dashboard - Guia de Instalação
# Installation Guide

---

## 🇧🇷 Português

### Pré-requisitos

- Hubitat Elevation (C-5, C-7 ou C-8)
- Acesso à interface web do Hubitat
- Navegador moderno (Chrome, Safari, Firefox, Edge)
- Licença Lumina ativa

---

### Passo 1: Instalar o Maker API

O Maker API é o app oficial do Hubitat que permite comunicação externa.

1. Acesse seu Hubitat: `http://[IP-DO-HUB]`
2. Vá em **Apps** → **Add Built-in App**
3. Selecione **Maker API**
4. Configure:
   - ✅ Marque **Allow Access via Local IP Address**
   - ✅ Selecione **All Devices** ou escolha os dispositivos desejados
   - ❌ Deixe desmarcado **Include Location Events**
5. Clique em **Done**
6. Abra o Maker API criado e anote:
   - **App ID** (número na URL, ex: `123`)
   - **Access Token** (código longo)

![Maker API Config](https://i.ibb.co/RTqMtCM7/4.png)

---

### Passo 2: Upload do Lumina

1. No Hubitat, vá em **Settings** → **File Manager**
2. Clique em **Choose File**
3. Selecione o arquivo `LuminaHighline_v1.5.html`
4. Clique em **Upload**
5. Aguarde o upload completar

---

### Passo 3: Acessar o Lumina

Abra o navegador e acesse:

```
http://[IP-DO-HUB]/local/LuminaHighline_v1.5.html
```

Exemplo: `http://192.168.1.100/local/LuminaHighline_v1.5.html`

---

### Passo 4: Ativar a Licença

Na primeira vez que abrir, você verá a tela de ativação:

![Tela de Ativação](https://i.ibb.co/QFGspHqY/ativa-o-lumina.png)

1. **Copie o ID de Instalação** (ex: `LUM-5855-9E9C`)
2. **Envie via WhatsApp** para nossa equipe junto com o comprovante de pagamento:
   - 📱 [Clique aqui para abrir o WhatsApp](https://wa.me/5547996357469?text=Olá!%20Comprei%20o%20Lumina%20Dashboard.%20Meu%20ID%20de%20Instalação%20é:%20)
3. **Receba sua Chave de Ativação** (formato: `XXXX-XXXX-XXXX-XXXX`)
4. **Digite a chave** e clique em **ATIVAR SISTEMA**

---

### Passo 5: Configurar Conexão

Após a ativação, configure a conexão com o Hubitat:

1. Vá em **Ajustes** (ícone de engrenagem)
2. Em **Conexão Maker API**:
   - **HUBITAT IP**: Digite o IP do seu hub (ex: `192.168.1.100`)
   - **App ID**: Cole o App ID do Maker API
   - **Access Token**: Cole o Token de Acesso
3. Clique em **Testar** para verificar a conexão
4. Se aparecer ✅ "Conexão bem sucedida!", clique em **Salvar**

![Configuração](https://i.ibb.co/k69pJjR8/ativa-o-lumina-inicio.png)

---

### Passo 6: Personalizar

Agora você pode:

- **Criar Ambientes**: Organize seus dispositivos por cômodos
- **Renomear Dispositivos**: Dê nomes amigáveis
- **Personalizar Backgrounds**: Escolha imagens para cada tela
- **Organizar Layout**: Arraste e solte os cards

---

### 🔄 Sincronização Automática (Auto-Sync)

O Lumina sincroniza automaticamente suas configurações com o Hubitat usando **Hub Variables**!

#### Configuração do Auto-Sync

**Método 1: Via Lumina Installer (Recomendado)**
1. No Hubitat, abra o app **Lumina Dashboard Installer**
2. Clique em **🔧 Setup Auto-Sync**
3. As variáveis serão criadas automaticamente

**Método 2: Manual**
1. No Hubitat, vá em **Settings** → **Hub Variables**
2. Clique em **Add Variable** e crie estas variáveis (todas como **String**):
   - `LuminaConfig`
   - `LuminaConfig_0`
   - `LuminaConfig_1`
   - `LuminaConfig_2`
   - `LuminaConfig_3`
   - `LuminaConfig_4`
3. Deixe o valor vazio - o Lumina preenche automaticamente

#### Como funciona

- **Auto-Save**: Após qualquer alteração, aguarda 5 segundos e salva no Hubitat
- **Auto-Load**: Ao abrir o Lumina, carrega a configuração salva automaticamente
- **Multi-dispositivo**: Configure em um tablet, abra no celular e já está tudo pronto

Isso significa que você pode:
- Configurar tudo em um tablet
- Abrir no celular e já ter tudo pronto
- Atualizar o HTML sem perder suas configurações

---

### ⚠️ Solução de Problemas

| Problema | Solução |
|----------|---------|
| "Erro de conexão" | Verifique se o IP está correto e se está na mesma rede |
| "Access Token inválido" | Copie novamente o token do Maker API |
| "Dispositivos não aparecem" | Verifique se os dispositivos estão selecionados no Maker API |
| "Página em branco" | Limpe o cache do navegador e recarregue |
| HTTPS não funciona | O Hubitat local usa HTTP. Acesse via `http://` |

---

### 📱 Dica: Criar Atalho na Tela Inicial

**iOS/iPad:**
1. Abra o Lumina no Safari
2. Toque no ícone de compartilhar (quadrado com seta)
3. Selecione "Adicionar à Tela de Início"

**Android:**
1. Abra o Lumina no Chrome
2. Toque no menu (3 pontos)
3. Selecione "Adicionar à tela inicial"

---

## 🇺🇸 English

### Prerequisites

- Hubitat Elevation (C-5, C-7, or C-8)
- Access to Hubitat web interface
- Modern browser (Chrome, Safari, Firefox, Edge)
- Active Lumina license

---

### Step 1: Install Maker API

Maker API is Hubitat's official app for external communication.

1. Access your Hubitat: `http://[HUB-IP]`
2. Go to **Apps** → **Add Built-in App**
3. Select **Maker API**
4. Configure:
   - ✅ Check **Allow Access via Local IP Address**
   - ✅ Select **All Devices** or choose specific devices
   - ❌ Leave unchecked **Include Location Events**
5. Click **Done**
6. Open the created Maker API and note:
   - **App ID** (number in URL, e.g., `123`)
   - **Access Token** (long code)

---

### Step 2: Upload Lumina

1. In Hubitat, go to **Settings** → **File Manager**
2. Click **Choose File**
3. Select `LuminaHighline_v1.5.html`
4. Click **Upload**
5. Wait for upload to complete

---

### Step 3: Access Lumina

Open browser and go to:

```
http://[HUB-IP]/local/LuminaHighline_v1.5.html
```

Example: `http://192.168.1.100/local/LuminaHighline_v1.5.html`

---

### Step 4: Activate License

On first launch, you'll see the activation screen:

1. **Copy your Installation ID** (e.g., `LUM-5855-9E9C`)
2. **Send via WhatsApp** to our team with proof of purchase:
   - 📱 [Click here to open WhatsApp](https://wa.me/5547996357469?text=Hello!%20I%20purchased%20Lumina%20Dashboard.%20My%20Installation%20ID%20is:%20)
3. **Receive your Activation Key** (format: `XXXX-XXXX-XXXX-XXXX`)
4. **Enter the key** and click **ATIVAR SISTEMA** (Activate System)

---

### Step 5: Configure Connection

After activation, configure the Hubitat connection:

1. Go to **Ajustes** (gear icon)
2. In **Conexão Maker API**:
   - **HUBITAT IP**: Enter your hub's IP (e.g., `192.168.1.100`)
   - **App ID**: Paste the Maker API App ID
   - **Access Token**: Paste the Access Token
3. Click **Testar** (Test) to verify connection
4. If you see ✅ "Conexão bem sucedida!", click **Salvar** (Save)

---

### Step 6: Customize

Now you can:

- **Create Rooms**: Organize devices by room
- **Rename Devices**: Give friendly names
- **Customize Backgrounds**: Choose images for each screen
- **Organize Layout**: Drag and drop cards

---

### 🔄 Automatic Sync (Auto-Sync)

Lumina automatically syncs your settings with Hubitat using **Hub Variables**!

#### Auto-Sync Setup

**Method 1: Via Lumina Installer (Recommended)**
1. In Hubitat, open the **Lumina Dashboard Installer** app
2. Click **🔧 Setup Auto-Sync**
3. Variables will be created automatically

**Method 2: Manual**
1. In Hubitat, go to **Settings** → **Hub Variables**
2. Click **Add Variable** and create these variables (all as **String**):
   - `LuminaConfig`
   - `LuminaConfig_0`
   - `LuminaConfig_1`
   - `LuminaConfig_2`
   - `LuminaConfig_3`
   - `LuminaConfig_4`
3. Leave the value empty - Lumina fills it automatically

#### How it works

- **Auto-Save**: After any change, waits 5 seconds and saves to Hubitat
- **Auto-Load**: When opening Lumina, loads saved configuration automatically
- **Multi-device**: Configure on a tablet, open on your phone and it's all ready

This means you can:
- Configure everything on a tablet
- Open on your phone and have everything ready
- Update the HTML without losing your settings

---

## 📞 Support

- **WhatsApp:** +55 47 99635-7469
- **Website:** [luminadashboards.dev.br](https://luminadashboards.dev.br)
- **Company:** [Domótika](https://domotika.com.br)

---

**Lumina Dashboard** — *Transform your home into a visual experience.*
