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

## 🔧 Como usar

1. Fazer upload do arquivo `.html` no **Hubitat File Manager**
2. Acessar via: `http://HUB-IP/local/nome-do-arquivo.html`
3. Configurar Maker API no primeiro acesso

## ⚠️ Importante

- **Nunca editar** estes arquivos diretamente
- Builds gerados via `npm run build` ou `npm run build:pro`
- Para modificações, editar código fonte em `/lumina-build/`