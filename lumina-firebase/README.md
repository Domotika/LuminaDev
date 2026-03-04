# Lumina Dashboard - Firebase Hosting

## Arquivos

- `public/index.html` - Lumina v2.0 PRO (página principal)
- `public/v1.5.html` - Lumina v1.5 Estável
- `public/v2.0-pro.html` - Lumina v2.0 PRO

## Deploy

### 1. Instalar Firebase CLI (se necessário)
```bash
npm install -g firebase-tools
```

### 2. Login no Firebase
```bash
firebase login
```

### 3. Configurar projeto
Edite o arquivo `.firebaserc` e substitua `SEU-PROJETO-FIREBASE` pelo ID do seu projeto Firebase.

Ou execute:
```bash
firebase use --add
```

### 4. Deploy
```bash
firebase deploy
```

## URLs após deploy

- `https://SEU-PROJETO.web.app/` → v2.0 PRO
- `https://SEU-PROJETO.web.app/v1.5.html` → v1.5
- `https://SEU-PROJETO.web.app/v2.0-pro.html` → v2.0 PRO

## Domínio Customizado (opcional)

No Firebase Console:
1. Hosting → Add custom domain
2. Siga as instruções para configurar DNS

Exemplo: `https://lumina.domotika.com.br/`

## Configuração no Cliente

1. Abra a URL do Lumina
2. Vá em Configurações → Hubitat
3. Selecione "Nuvem (Remoto)"
4. Preencha:
   - Hub UUID (do Maker API Cloud URL)
   - App ID
   - Access Token
5. Salvar

Pronto! O cliente pode acessar de qualquer lugar.
