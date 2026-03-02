/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  LUMINA DASHBOARD TILE
 *  Incorpore o Lumina Dashboard na Dashboard nativa do Hubitat via iFrame
 * ═══════════════════════════════════════════════════════════════════════════
 *  
 *  Copyright © 2024-2026 Domótika Automação Residencial LTDA
 *  https://luminadashboards.dev.br
 *  
 *  Este driver cria um dispositivo virtual que exibe o Lumina Dashboard
 *  como uma tile iframe nas Dashboards nativas do Hubitat.
 *  
 *  Benefícios:
 *  - Acesse o Lumina pelo app Hubitat no celular
 *  - Funciona com Hubitat Cloud para acesso remoto
 *  - Sem necessidade de navegador/bookmark separado
 *  
 * ═══════════════════════════════════════════════════════════════════════════
 */

metadata {
    definition(
        name: "Lumina Dashboard Tile (PT)",
        namespace: "domotika",
        author: "Domótika",
        description: "Exibe o Lumina Dashboard como uma tile iframe nas Dashboards nativas do Hubitat",
        importUrl: "https://raw.githubusercontent.com/Domotika/LuminaDev/main/hubitat-drivers/LuminaDashboardTile_PT.groovy"
    ) {
        capability "Actuator"
        
        attribute "html", "string"
        attribute "luminaUrl", "string"
        attribute "ultimaAtualizacao", "string"
        
        command "atualizar"
        command "definirUrl", ["string"]
    }
    
    preferences {
        input name: "luminaFile", type: "enum", title: "📁 Arquivo Lumina", 
            options: [
                "LuminaHighline_v1.5.html": "v1.5 Estável",
                "LuminaHighline_v1.6-beta.html": "v1.6 Beta",
                "custom": "URL Personalizada"
            ], 
            defaultValue: "LuminaHighline_v1.5.html", 
            required: true
            
        input name: "customUrl", type: "text", title: "🔗 URL Personalizada (se selecionado acima)", 
            description: "URL completa incluindo http://", 
            required: false
            
        input name: "useCloud", type: "bool", title: "☁️ Usar URL do Hubitat Cloud", 
            description: "Ative para acesso remoto via Hubitat Cloud", 
            defaultValue: false
            
        input name: "tileHeight", type: "enum", title: "📐 Altura da Tile", 
            options: ["300px", "400px", "500px", "600px", "800px", "100%"], 
            defaultValue: "100%", 
            required: true
            
        input name: "showBorder", type: "bool", title: "🖼️ Mostrar Borda", 
            defaultValue: false
            
        input name: "enableDebug", type: "bool", title: "🐛 Ativar Log de Debug", 
            defaultValue: false
    }
}

// ═══════════════════════════════════════════════════════════════════════════
//  CICLO DE VIDA
// ═══════════════════════════════════════════════════════════════════════════

def installed() {
    log.info "Lumina Dashboard Tile instalado"
    initialize()
}

def updated() {
    log.info "Lumina Dashboard Tile atualizado"
    initialize()
}

def initialize() {
    def url = buildLuminaUrl()
    def html = buildIframeHtml(url)
    
    sendEvent(name: "luminaUrl", value: url)
    sendEvent(name: "html", value: html)
    sendEvent(name: "ultimaAtualizacao", value: new Date().format("dd/MM/yyyy HH:mm:ss"))
    
    if (enableDebug) {
        log.debug "Lumina URL: ${url}"
        log.debug "HTML tamanho: ${html.length()} chars"
    }
    
    log.info "Lumina Dashboard Tile configurado: ${url}"
}

// ═══════════════════════════════════════════════════════════════════════════
//  COMANDOS
// ═══════════════════════════════════════════════════════════════════════════

def atualizar() {
    log.info "Atualizando Lumina Dashboard Tile"
    initialize()
}

def refresh() {
    atualizar()
}

def definirUrl(String url) {
    log.info "Definindo URL personalizada: ${url}"
    device.updateSetting("luminaFile", [value: "custom", type: "enum"])
    device.updateSetting("customUrl", [value: url, type: "text"])
    initialize()
}

def setUrl(String url) {
    definirUrl(url)
}

// ═══════════════════════════════════════════════════════════════════════════
//  CONSTRUTOR DE URL
// ═══════════════════════════════════════════════════════════════════════════

def buildLuminaUrl() {
    if (luminaFile == "custom" && customUrl) {
        return customUrl
    }
    
    def fileName = luminaFile ?: "LuminaHighline_v1.5.html"
    
    if (useCloud) {
        // Formato URL Hubitat Cloud
        def hubUuid = location.hubs[0].getDataValue("cloudId") ?: location.hubs[0].getDataValue("hubUID")
        if (hubUuid) {
            return "https://cloud.hubitat.com/api/${hubUuid}/local/${fileName}"
        } else {
            log.warn "Cloud ID não encontrado, usando URL local"
        }
    }
    
    // URL Local
    def hubIP = location.hubs[0].getDataValue("localIP") ?: "192.168.1.1"
    return "http://${hubIP}/local/${fileName}"
}

// ═══════════════════════════════════════════════════════════════════════════
//  CONSTRUTOR DE HTML
// ═══════════════════════════════════════════════════════════════════════════

def buildIframeHtml(String url) {
    def height = tileHeight ?: "100%"
    def border = showBorder ? "1px solid rgba(255,255,255,0.2)" : "none"
    
    // iframe responsivo com design completo
    def html = """
<div style="width:100%;height:${height};overflow:hidden;position:relative;background:#000;">
    <iframe 
        src="${url}" 
        style="
            width:100%;
            height:100%;
            border:${border};
            border-radius:8px;
            background:#1a1a2e;
        "
        frameborder="0"
        allowfullscreen="true"
        allow="fullscreen"
        loading="lazy"
    ></iframe>
</div>
"""
    
    return html.trim()
}

// ═══════════════════════════════════════════════════════════════════════════
//  INSTRUÇÕES DE USO
// ═══════════════════════════════════════════════════════════════════════════

/*
 * COMO USAR ESTE DRIVER:
 * 
 * 1. Instale este driver em "Drivers Code"
 * 2. Crie um novo dispositivo virtual com este driver
 * 3. Configure as preferências do dispositivo (arquivo, altura, etc)
 * 4. Na Dashboard do Hubitat:
 *    a) Adicione este dispositivo
 *    b) Selecione tipo de tile: "Attribute"
 *    c) Selecione atributo: "html"
 *    d) Defina tamanho grande (recomendado 4x4 ou maior)
 * 5. O iframe mostrará automaticamente o Lumina Dashboard!
 *
 * ACESSO REMOTO:
 * - Ative "Usar URL do Hubitat Cloud" nas preferências
 * - A tile funcionará via app Hubitat mesmo fora de casa
 *
 * DICA:
 * - Para tela cheia, use uma Dashboard dedicada só pro Lumina
 * - Configure a tile para ocupar toda a tela
 */
