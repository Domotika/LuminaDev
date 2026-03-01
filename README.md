# Lumina - Hubitat Dashboard

Este é um dashboard elegante e moderno para controlar sua automação residencial Hubitat Elevation, focado em design de vidro (Glassmorphism).

## 🚀 Como rodar localmente (Recomendado)

Rodar localmente resolve problemas de CORS e "Mixed Content", permitindo conexão direta com o IP local do Hubitat via HTTP.

### Pré-requisitos
1. **Node.js**: Baixe e instale a versão LTS em [nodejs.org](https://nodejs.org/).

### Instalação

1. Abra o terminal na pasta do projeto.
2. Instale as dependências:
   ```bash
   npm install
   ```

### Rodando o App

1. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
2. Acesse o link mostrado no terminal (geralmente `http://localhost:5173`).

## ⚙️ Configuração no Hubitat

Para que o dashboard funcione, você precisa configurar o **Maker API** no seu Hubitat:

1. Instale o app **Maker API** no Hubitat.
2. Selecione os dispositivos que deseja controlar.
3. Ative a opção **"Allow Access via Local IP"**.
4. Ative a opção **"Include Location Events"** (opcional, mas recomendado).
5. **IMPORTANTE (CORS):** No campo "Enable these hosts for CORS support", coloque:
   ```
   *
   ```
   Isso permite que o dashboard acesse a API de qualquer local.

## 📱 Configuração no Dashboard

Ao abrir o dashboard pela primeira vez, vá na aba **Ajustes** e preencha:

* **Hubitat IP:** O IP da sua central (ex: `192.168.1.50`) ou a URL Cloud.
* **App ID:** O número do App ID encontrado no topo da página do Maker API.
* **Access Token:** O token longo encontrado no final da página do Maker API.
