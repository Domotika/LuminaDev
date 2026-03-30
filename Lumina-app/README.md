# 🚀 Lumina App - Build Distribution

Aplicações finais do Lumina Dashboard prontas para uso no Hubitat.

## 📁 Estrutura

### `/Standard/` 
- **Lumina Standard** - Versão básica com funcionalidades essenciais
- Temas limitados, sem recursos PRO
- **Tamanho:** ~664KB

### `/PRO/`
- **Lumina PRO** - Versão completa com todos os recursos
- Sistema de temas avançado, câmeras IP, favoritos, sidebar layout
- **Tamanho:** ~680KB  

### `/Backup/`
- **Versões com Backup** - Apps com sistema de backup/restore integrado
- `Lumina_Standard_Backup.html` (~675KB)
- `Lumina_PRO_Backup.html` (~690KB)

### `/Apps/`
- **Lumina Backup App** - App Groovy para gerenciar backups
- `LuminaBackupApp.groovy` - Endpoint HTTP para backup de configurações
- Integração completa com versões Backup do Lumina

## 🔧 Como usar

1. Fazer upload do arquivo `.html` no **Hubitat File Manager**
2. Acessar via: `http://HUB-IP/local/nome-do-arquivo.html`
3. Configurar Maker API no primeiro acesso

## 🔗 Fluxo Completo de Backup

1. **Instale o App:** `LuminaBackupApp.groovy` no Hubitat
2. **Use versão Backup:** `Lumina_*_Backup.html` 
3. **Configure:** Endpoint e token no Lumina
4. **Backup automático:** Configurações salvas no File Manager

## ⚠️ Importante

- **Nunca editar** estes arquivos diretamente
- Builds gerados via `npm run build` ou `npm run build:pro`  
- Para modificações, editar código fonte em `/lumina-build/`
- **Versões Backup** requerem o `LuminaBackupApp.groovy` instalado