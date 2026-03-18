# 🎯 Lumina Dashboard com Sistema de Backup Integrado

**Versões prontas para uso - não precisa editar HTML!**

## 📦 Downloads

**🔗 GitHub:** https://github.com/Domotika/LuminaDev/tree/Claude-Code

- **`Lumina_Standard_with_Backup.html`** (674 KB)
- **`Lumina_PRO_with_Backup.html`** (690 KB)

## 🚀 Instalação Simples

### 1. Dashboard
1. **Baixe o arquivo** do GitHub
2. **Hubitat → Settings → File Manager**
3. **Upload** do arquivo HTML
4. **Acesse:** `http://[IP-HUB]/local/Lumina_Standard_with_Backup.html`

### 2. Backup (Opcional)
1. **Drivers Code → New Driver**
2. **Cole** o código de `drivers/LuminaBackup.groovy`
3. **Save**
4. **Devices → Add Device → Virtual**
5. **Nome:** "Lumina Backup"
6. **Type:** "Lumina Backup Driver"
7. **Apps → Maker API** → Adicionar device "Lumina Backup"

## ✨ Como Funciona

### Sem Driver de Backup
- Dashboard funciona normalmente
- Sem funcionalidade de backup

### Com Driver de Backup  
- **Botão "💾 Backup"** aparece automaticamente
- **Modal completo** com todas funcionalidades
- **Backup automático** de configuração + dados de conexão

## 🎯 Interface de Backup

**Botão no canto superior direito:**
- **💾 Backup** → Abre modal completo

**Modal de Backup:**
- **💾 Backup Configuração** → Salva apenas config
- **📦 Backup Completo** → Config + dados de conexão
- **🔗 Dados de Conexão** → Gerenciar IP/token
- **ℹ️ Informações** → Status do sistema

## 🔧 Funcionalidades

### Backup de Configuração
- Rooms, devices, settings
- Favorites, layouts
- Salvo no File Manager do Hubitat
- Nome: `lumina-config-YYYY-MM-DD_HH-mm-ss.json`

### Backup Completo
- Configuração + dados de conexão
- Hub IP, Maker API Token, Cloud URL
- Portabilidade total entre hubs
- Nome: `lumina-full-YYYY-MM-DD_HH-mm-ss.json`

### Dados de Conexão
- **Salvar:** Grava IP/token permanentemente  
- **Carregar:** Recupera dados salvos
- **Auto-Preencher:** Usa dados da sessão atual
- Nunca mais digitar dados manualmente!

## 💡 Vantagens

✅ **Zero edição de HTML** - Cliente usa direto  
✅ **Backup ilimitado** - File Manager do Hubitat  
✅ **Dados de conexão salvos** - Nunca mais digitar  
✅ **Portabilidade total** - Move entre hubs facilmente  
✅ **Interface visual** - Modal completo e intuitivo  
✅ **Funciona offline** - Não depende de internet  
✅ **Limpeza automática** - Remove backups antigos  

## 🔍 Troubleshooting

### Botão backup não aparece
- Driver não instalado ou não está na Maker API
- Aguarde 2-3 segundos após carregar a página

### Erro ao salvar backup
- Verificar se device está na Maker API
- Confirmar token correto nas configurações

### "Driver não disponível"
- Device não foi criado ou nome incorreto
- Deve conter "lumina backup" no nome

## 🎯 Resultado Final

**Solução definitiva para clientes não-técnicos:**
- ✅ Download → Upload → Funciona
- ✅ Backup completo com um clique  
- ✅ Dados de conexão salvos permanentemente
- ✅ Zero configuração adicional necessária

**O sistema de backup mais avançado para Lumina Dashboard!** 🚀