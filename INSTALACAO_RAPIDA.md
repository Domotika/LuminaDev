# ⚡ Instalação Rápida - Lumina Dashboard

> **Versão:** 1.5.7 | **Data:** 2026-03-05

---

## 📋 CHECKLIST DE INSTALAÇÃO

### PASSO 1: Maker API (OBRIGATÓRIO)
- [ ] Apps → Add Built-in App → **Maker API**
- [ ] Selecione **TODOS** os dispositivos que quer no Lumina
- [ ] Ative: "Allow Access via Local IP Address"
- [ ] Ative: "Allow Access via Remote/Cloud Access"
- [ ] Clique **Done**
- [ ] Anote: **App ID** (número na URL) e **Access Token**

### PASSO 2: Upload do HTML
- [ ] Baixe: `LuminaHighline_v1.5.html` do GitHub
- [ ] Settings → **File Manager** → Choose File → Upload
- [ ] Confirme que aparece na lista

### PASSO 3: Acesse o Lumina
- [ ] Navegador: `http://[IP-DO-HUB]/local/LuminaHighline_v1.5.html`
- [ ] Clique em **⚙️ Ajustes**
- [ ] Preencha:
  - **IP do Hub:** `192.168.x.x` (IP local do Hubitat)
  - **App ID:** (do Maker API)
  - **Access Token:** (do Maker API)
- [ ] Clique **Salvar**
- [ ] Volte e veja os dispositivos carregarem! ✅

---

## 🎯 CONFIGURAÇÃO MÍNIMA FUNCIONAL

```
┌─────────────────────────────────────────────────────────┐
│  1. MAKER API                                           │
│     └── Selecionar dispositivos                         │
│     └── Copiar App ID + Token                           │
│                                                         │
│  2. FILE MANAGER                                        │
│     └── Upload: LuminaHighline_v1.5.html                │
│                                                         │
│  3. ACESSAR                                             │
│     └── http://[IP]/local/LuminaHighline_v1.5.html      │
│     └── Configurar IP + App ID + Token                  │
│                                                         │
│  ✅ PRONTO!                                             │
└─────────────────────────────────────────────────────────┘
```

---

## 📱 EXTRAS OPCIONAIS

### Auto-Sync entre dispositivos
1. Settings → **Hub Variables** → Add Variable
2. Crie: `LuminaData` (tipo: String)
3. No Lumina: Ajustes → Ative "Auto-Sync"

### Acesso pelo App Hubitat (Cloud)
1. Instale driver: `LuminaDashboardTile_PT.groovy`
2. Devices → Add Virtual Device → Tipo: "Lumina Dashboard Tile (PT)"
3. Configure o dispositivo com App ID + Token
4. Adicione na Dashboard do Hubitat como Attribute Tile

### Acesso Remoto via iframe
1. Instale app: `LuminaServer.groovy`
2. Configure nome do arquivo HTML
3. Use a URL Cloud gerada em qualquer dashboard

---

## ❌ O QUE NÃO PRECISA

| Arquivo | Necessário? | Quando usar |
|---------|-------------|-------------|
| `LuminaDashboardAPI.groovy` | ❌ Não | Só se NÃO quiser usar Maker API |
| `LuminaInstaller_*.groovy` | ❌ Não | Só pra download automático |
| `LuminaServer.groovy` | ❌ Não | Só pra iframe/embed |
| `LuminaDashboardTile_*.groovy` | ❌ Não | Só pra tile no app Hubitat |

---

## 🔧 TROUBLESHOOTING

### "Nenhum dispositivo aparece"
- Verifique se os dispositivos estão selecionados no Maker API
- Confirme que o IP do Hub está correto (sem http://)
- Teste: `http://[IP]/apps/api/[APP_ID]/devices?access_token=[TOKEN]`

### "Erro de conexão"
- Você está na mesma rede do Hubitat?
- O Maker API está ativo?
- Tente recarregar a página (Ctrl+F5)

### "Comandos não funcionam"
- O dispositivo está no Maker API?
- O driver do dispositivo tem o comando esperado?

---

## 📁 ESTRUTURA DO REPOSITÓRIO

```
lumina-dev/
├── LuminaHighline_v1.5.html     ← ARQUIVO PRINCIPAL (upload este!)
├── LuminaHighline_v2.0-PRO.html ← Versão Premium
├── hubitat-apps/
│   ├── LuminaInstaller_PT.groovy  (opcional - download automático)
│   ├── LuminaDashboardAPI.groovy  (opcional - API customizada)
│   └── LuminaServer.groovy        (opcional - iframe embedding)
├── hubitat-drivers/
│   ├── LuminaDashboardTile_PT.groovy (opcional - tile no app)
│   └── LuminaDashboardTile_EN.groovy
└── archive/                      ← Versões antigas (ignorar)
```

---

**Dúvidas?** WhatsApp: +55 47 99635-7469
