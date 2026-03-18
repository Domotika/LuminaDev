# 🗄️ Lumina Backup System - Instalação

Sistema de backup robusto para configurações do Lumina Dashboard, salvando diretamente no File Manager do Hubitat.

## 📦 Instalação

### 1. Instalar Driver

1. **Hubitat → Drivers Code**
2. **New Driver**
3. Cole o código do arquivo `LuminaBackup.groovy`
4. **Save**

### 2. Criar Device

1. **Devices → Add Device**
2. **Virtual**
3. **Device Information:**
   - Device Name: `Lumina Backup`
   - Device Label: `Lumina Backup`
   - Type: `Lumina Backup Driver`
4. **Done**

### 3. Adicionar à Maker API

1. **Apps → Maker API**
2. **Select devices to authorize in MakerAPI:**
3. Marque `Lumina Backup`
4. **Update**

### 4. Configurar Dashboard

Adicione ao arquivo principal do Lumina (App.tsx ou similar):

```javascript
// Importar e inicializar
import { LuminaBackupService, LuminaBackupUI } from './backup-integration.js';

// Após inicialização do Hubitat
const backupService = new LuminaBackupService(hubitatService);
const backupUI = new LuminaBackupUI(backupService);
```

## ⚙️ Configuração

### Driver Settings

- **Máximo de backups:** 10 (padrão)
- **Limpeza automática:** Ativada
- **Debug logging:** Desativado

### Dashboard Integration

O sistema adiciona automaticamente:
- **Botão "💾 Backup Config"** na toolbar
- **Modal de backup** com todas as funcionalidades

## 🔧 Funcionalidades

### 1. Backup Automático
```javascript
// Salva com timestamp automático
await backupService.saveConfigBackup(config);
```

### 2. Backup Nomeado
```javascript
// Salva com nome específico
await backupService.saveConfigBackup(config, 'pre-update-backup.json');
```

### 3. **🔗 Dados de Conexão**
```javascript
// Salva dados de conexão (IP, token, cloud URL)
await backupService.saveConnectionData('192.168.1.100', 'abc123...', 'https://cloud...');

// Recupera dados salvos
const connection = await backupService.getConnectionData();
// { hubIp: '...', makerToken: '...', cloudUrl: '...' }
```

### 4. **📦 Backup Completo**
```javascript
// Salva configuração + dados de conexão juntos
await backupService.saveFullBackup(config);

// Recupera backup completo
const fullBackup = await backupService.getFullBackup();
```

### 5. Listar Backups
```javascript
const backups = await backupService.listBackups();
```

### 6. Deletar Backup
```javascript
await backupService.deleteBackup('backup-antigo.json');
```

### 7. Informações
```javascript
const info = await backupService.getBackupInfo();
// { count: 5, lastBackup: 'config-2026-03-18.json', ... }
```

## 📁 Arquivos Salvos

**Localização:** Hubitat File Manager
**Formato:** `lumina-config-YYYY-MM-DD_HH-mm-ss.json`

**Estrutura do backup:**

**Backup simples (config):**
```json
{
  "rooms": [...],
  "settings": {...},
  "devices": [...],
  "timestamp": "2026-03-18T14:30:00.000Z",
  "version": "1.6.0"
}
```

**Backup completo (config + conexão):**
```json
{
  "config": {
    "rooms": [...],
    "settings": {...},
    "devices": [...]
  },
  "connection": {
    "hubIp": "192.168.1.100",
    "makerToken": "abc123...",
    "cloudUrl": "https://cloud.hubitat.com/api/..."
  },
  "timestamp": 1773840000000,
  "type": "full_backup",
  "version": "1.0"
}
```

## 🚀 Uso no Dashboard

### Interface Visual

1. **Clique em "💾 Backup Config"**
2. **Escolha uma ação:**
   - **💾 Backup Config** - Cria backup só da configuração
   - **📦 Backup Completo** - Backup com dados de conexão
   - **📋 Listar Backups** - Mostra backups existentes
   - **🔗 Dados de Conexão** - Gerencia IP/token/cloud URL
   - **ℹ️ Informações** - Estatísticas e status

### 🔗 Gerenciar Conexão

Na tela "Dados de Conexão":
- **💾 Salvar Conexão** - Grava IP/token atuais
- **📥 Carregar Salva** - Recupera dados gravados
- **🔄 Auto-Preencher** - Usa dados da sessão atual

### Backup Manual
```javascript
// Para usar programaticamente
window.luminaBackup.saveConfig();
```

## 🔐 Vantagens

✅ **Backup completo** - Toda configuração salva  
✅ **Dados de conexão** - IP/token salvos junto  
✅ **File Manager nativo** - Integração direta  
✅ **Limpeza automática** - Remove backups antigos  
✅ **Zero limitação** - Arquivos de qualquer tamanho  
✅ **Versionamento** - Múltiplos backups  
✅ **Interface simples** - Um clique para backup  
✅ **Portabilidade total** - Move entre hubs facilmente  
✅ **Restore automático** - Carrega conexão + config  

## 🛠️ Troubleshooting

### Driver não encontrado
```javascript
// Verificar se driver está na Maker API
const devices = await hubitat.getDevices();
const backup = devices.find(d => d.name.includes('Lumina Backup'));
console.log('Backup driver:', backup);
```

### Erro de permissão
- Verificar se device está na Maker API
- Confirmar token correto

### Backup não aparece
- Aguardar 1-2 segundos após comando
- Verificar File Manager manualmente

## 📈 Próximos Passos

1. **Restore automático** - Carregar backup via interface
2. **Backup incremental** - Só mudanças
3. **Compressão** - Arquivos menores
4. **Upload externo** - Google Drive, Dropbox

---

**🎯 Resultado:** Backup robusto e ilimitado para o Lumina Dashboard! 🚀