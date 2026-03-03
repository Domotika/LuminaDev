# ☁️ Acesso Remoto via Cloud - Guia Completo

Este guia explica como configurar o Lumina Dashboard para acesso remoto via Hubitat Cloud.

---

## 📋 Pré-requisitos

- ✅ Hubitat Elevation conectado à **internet**
- ✅ Conta no [Hubitat Portal](https://portal.hubitat.com/) (gratuita)
- ✅ Lumina Dashboard instalado no File Manager do hub
- ✅ **Lumina Dashboard API** ou **Maker API** instalado

---

## 🔧 Passo 1: Verificar Conexão Cloud do Hub

1. Acesse seu Hubitat: `http://[IP-DO-HUB]`
2. Vá em **Settings** → **Hub Details**
3. Verifique se aparece **"Cloud: Connected"** ✅

> ⚠️ Se mostrar "Disconnected", verifique a conexão de internet do hub.

---

## 🔧 Passo 2: Habilitar Cloud na API

### Opção A: Usando Lumina Dashboard API (Recomendado)

1. **Apps** → **Lumina Dashboard API**
2. Copie as informações:
   - **App ID**: número mostrado na página
   - **Access Token**: token gerado
   - **Hub UUID**: ID do hub
3. A **URL Cloud** já aparece pronta na página do app

### Opção B: Usando Maker API Nativo

1. **Apps** → **Maker API**
2. Habilite: **☑️ Allow Access via Cloud**
3. Clique em **Done**
4. Abra novamente e copie:
   - **App ID**: número na URL
   - **Access Token**: mostrado na página
   - **Cloud API URL**: link completo

---

## 🔧 Passo 3: Configurar o Lumina Dashboard

1. Abra o Lumina Dashboard
2. Vá em **Ajustes** (ícone ⚙️)
3. Configure:

### Para Lumina Dashboard API:
```
☑️ Usar App Customizado (Groovy): ATIVADO
☑️ Usar Cloud (Acesso Remoto): ATIVADO
Hub UUID: [seu-uuid-aqui]
Custom App ID: [id-do-app]
Access Token: [seu-token]
```

### Para Maker API:
```
☑️ Usar Cloud (Acesso Remoto): ATIVADO
Hub UUID: [seu-uuid-aqui]
App ID: [id-do-maker-api]
Access Token: [seu-token]
```

4. Clique em **Testar** → Deve mostrar "Conexão bem sucedida!"
5. Clique em **Salvar**

---

## 📱 Acesso via App Hubitat (Dashboard Tile)

### Passo 1: Instalar o Driver

1. **Devices** → **Drivers Code** → **+ New Driver**
2. Importe:
```
https://raw.githubusercontent.com/Domotika/LuminaDev/main/hubitat-drivers/LuminaDashboardTile_PT.groovy
```
3. **Save**

### Passo 2: Criar Dispositivo Virtual

1. **Devices** → **Add Device** → **Virtual**
2. **Device Name**: `Lumina Dashboard`
3. **Type**: Selecione **"Lumina Dashboard Tile (PT)"**
4. **Save Device**

### Passo 3: Configurar o Tile

1. Abra o dispositivo criado
2. Em **Preferences**:
   - **Lumina URL**: `http://[IP-DO-HUB]/local/LuminaHighline_v1.5.html`
   - OU URL Cloud se preferir
3. Clique em **Save Preferences**
4. Clique em **Refresh**

### Passo 4: Adicionar ao Dashboard Hubitat

1. **Apps** → **Hubitat Dashboard** → Selecione um dashboard
2. Clique no **+** para adicionar tile
3. **Pick a Device**: Selecione "Lumina Dashboard"
4. **Pick a Template**: **Attribute**
5. **Pick an Attribute**: **html**
6. **Save**

### Passo 5: Acessar pelo App

1. Abra o **app Hubitat** no celular
2. Vá no **Dashboard** que você configurou
3. O Lumina aparece como um tile clicável
4. Funciona local e remoto! ☁️

---

## 🔗 Acesso via Link Direto (Navegador)

### Acesso Local (dentro de casa)

```
http://[IP-DO-HUB]/local/LuminaHighline_v1.5.html
```

Exemplo:
```
http://192.168.1.50/local/LuminaHighline_v1.5.html
```

### Acesso Remoto (fora de casa)

Use o link do Hubitat Cloud Portal:

1. Acesse [portal.hubitat.com](https://portal.hubitat.com/)
2. Faça login
3. Clique no seu hub
4. **Local Files** ou acesse via:

```
https://cloud.hubitat.com/local/[HUB-UUID]/LuminaHighline_v1.5.html
```

> 💡 **Dica**: Salve o link nos favoritos do celular para acesso rápido!

---

## 🔧 Configuração com Link de Auto-Setup

O Lumina suporta links que configuram tudo automaticamente:

### Formato do Link:

```
http://[IP]/local/LuminaHighline_v1.5.html#config=[BASE64]
```

Onde `[BASE64]` contém:
```json
{
  "hubIp": "192.168.1.50",
  "appId": "123",
  "accessToken": "xxx-xxx",
  "hubUuid": "xxx-xxx-xxx",
  "useCloud": true
}
```

### Gerar via Lumina Installer:

1. **Apps** → **Lumina Installer**
2. Clique em **"🔗 Gerar Link de Acesso"**
3. Preencha App ID e Token
4. Copie o link gerado
5. Envie para o cliente!

---

## ❓ Troubleshooting

### "No response from hub"

- ✅ Verifique se o hub está conectado à internet
- ✅ Verifique se Cloud está habilitado na API
- ✅ Verifique se o Hub UUID está correto
- ✅ Teste a URL da API direto no navegador

### "Invalid Token"

- ✅ Regenere o token na API
- ✅ Copie o token novamente (sem espaços)
- ✅ Verifique se OAuth está habilitado no app

### Dashboard não carrega

- ✅ Verifique se o arquivo HTML está no File Manager
- ✅ Teste o acesso local primeiro
- ✅ Verifique o console do navegador (F12) para erros

### Cloud lento

- É normal ser 2-5s mais lento que local
- Para melhor performance, use acesso local quando em casa
- O Lumina pode detectar automaticamente (local vs cloud)

---

## 📞 Suporte

- **WhatsApp**: [+55 47 99635-7469](https://wa.me/5547996357469)
- **Website**: [luminadashboards.dev.br](https://luminadashboards.dev.br)
- **GitHub**: [Domotika/LuminaDev](https://github.com/Domotika/LuminaDev)

---

*Lumina Dashboard - Domótika Ambientes Inteligentes*
