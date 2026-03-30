# Lumina com Sistema de Backup

Versões especiais com sistema integrado de backup e restauração de configurações.

## 💾 Sistema de Backup

### Funcionalidades
- ✅ **Backup automático** das configurações
- ✅ **Export/Import** de configurações
- ✅ **Sync com Hubitat File Manager** 
- ✅ **Restauração rápida** após reinstalação
- ✅ **Versionamento** de configurações

### Como funciona
1. Configurações salvas automaticamente no `localStorage`
2. Backup sincronizado com Hubitat via File Manager
3. Arquivos `.json` gerados para cada backup
4. Restauração via interface ou import manual

## 📁 Arquivos Disponíveis

### `Lumina_Standard_Backup.html` (~675KB)
- Versão Standard + Sistema de Backup
- Todas as funcionalidades da versão padrão
- **+11KB** pelo sistema de backup

### `Lumina_PRO_Backup.html` (~690KB)  
- Versão PRO + Sistema de Backup
- Todos os recursos PRO + backup/restore
- **+10KB** pelo sistema de backup

## ⚙️ Configurações de Backup

- **Frequência:** A cada mudança + manual
- **Local:** Hubitat File Manager (`/local/lumina-backups/`)
- **Formato:** JSON compacto
- **Retenção:** Últimos 5 backups por padrão