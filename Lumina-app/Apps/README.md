# 📱 Lumina Apps

Aplicativos Groovy para integração e funcionalidades adicionais do Lumina Dashboard.

## 🔧 Apps Disponíveis

### `LuminaBackupApp.groovy`
**App de Backup de Configurações do Lumina Dashboard**

#### 📋 Funcionalidades
- ✅ **Endpoint HTTP** para backup de configurações via POST
- ✅ **Salvamento no File Manager** do Hubitat
- ✅ **Suporte a JSON grandes** no body da requisição
- ✅ **Versionamento automático** dos backups
- ✅ **Interface de gerenciamento** via app Hubitat
- ✅ **Debug logging** configurável

#### 🚀 Como Instalar

1. **Via Hubitat Package Manager:**
   - Procure por "Lumina Backup" na lista de apps

2. **Instalação Manual:**
   - Vá em `Apps Code` no Hubitat
   - Clique em `New App`
   - Cole o conteúdo de `LuminaBackupApp.groovy`
   - Salve e instale o app

#### ⚙️ Como Usar

1. **Instale o App** no Hubitat
2. **Configure** as preferências do app
3. **Anote o Endpoint e Token** exibidos
4. **Configure no Lumina** as credenciais de backup

#### 🔗 Integração com Lumina

O app funciona com as versões **Backup** do Lumina:
- `Lumina_Standard_Backup.html`
- `Lumina_PRO_Backup.html`

Essas versões incluem o sistema de backup automático que se comunica com este app.

#### 📊 Recursos

- **Endpoint:** `http://HUB-IP/apps/api/[APP-ID]/backup`
- **Método:** POST
- **Content-Type:** application/json
- **Autenticação:** Bearer Token
- **Limite:** ~1MB por backup

#### 🔐 Segurança

- Token de acesso único por instalação
- Validação de origem das requisições
- Logs detalhados para auditoria
- Armazenamento local no File Manager

---

## 📁 Estrutura de Backup

```
File Manager/
└── lumina-backups/
    ├── backup-2026-03-30-123456.json
    ├── backup-2026-03-29-654321.json
    └── ...
```

## 🆘 Suporte

Para suporte técnico:
- **GitHub:** https://github.com/Domotika/LuminaDev
- **Discord:** Comunidade Domótika
- **Email:** suporte@domotika.com.br