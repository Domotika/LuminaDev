/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  LUMINA DASHBOARD TILE
 *  Embed Lumina Dashboard in native Hubitat Dashboard via iFrame
 * ═══════════════════════════════════════════════════════════════════════════
 *  
 *  Copyright © 2024-2026 Domótika Ambientes Inteligentes LTDA
 *  https://luminadashboards.dev.br
 *  
 *  This driver creates a virtual device that displays Lumina Dashboard
 *  as an iframe tile in native Hubitat Dashboards.
 *  
 *  Benefits:
 *  - Access Lumina from Hubitat mobile app
 *  - Works with Hubitat Cloud for remote access
 *  - No need for separate browser/bookmark
 *  
 * ═══════════════════════════════════════════════════════════════════════════
 */

metadata {
    definition(
        name: "Lumina Dashboard Tile",
        namespace: "domotika",
        author: "Domótika",
        description: "Displays Lumina Dashboard as an iframe tile in native Hubitat Dashboards",
        importUrl: "https://raw.githubusercontent.com/Domotika/LuminaDev/main/hubitat-drivers/LuminaDashboardTile_EN.groovy"
    ) {
        capability "Actuator"
        
        attribute "html", "string"
        attribute "luminaUrl", "string"
        attribute "lastUpdated", "string"
        
        command "refresh"
        command "setUrl", ["string"]
    }
    
    preferences {
        input name: "luminaFile", type: "enum", title: "📁 Lumina File", 
            options: [
                "LuminaHighline_v1.5.html": "v1.5 Stable (Free)",
                "LuminaHighline_v2.0-PRO.html": "v2.0 PRO (Premium)",
                "github-v15": "v1.5 via GitHub (Remote)",
                "github-v20": "v2.0 PRO via GitHub (Remote)",
                "custom": "Custom URL"
            ], 
            defaultValue: "LuminaHighline_v1.5.html", 
            required: true
            
        input name: "customUrl", type: "text", title: "🔗 Custom URL (if selected above)", 
            description: "Full URL including http://", 
            required: false
            
        input name: "useCloud", type: "bool", title: "☁️ Use Hubitat Cloud URL (local files only)", 
            description: "Enable for remote access via Hubitat Cloud (not needed for GitHub)", 
            defaultValue: false
            
        input name: "tileHeight", type: "enum", title: "📐 Tile Height / Altura da Tile", 
            options: ["300px", "400px", "500px", "600px", "800px", "100%"], 
            defaultValue: "100%", 
            required: true
            
        input name: "showBorder", type: "bool", title: "🖼️ Show Border / Mostrar Borda", 
            defaultValue: false
            
        input name: "enableDebug", type: "bool", title: "🐛 Enable Debug Logging", 
            defaultValue: false
    }
}

// ═══════════════════════════════════════════════════════════════════════════
//  LIFECYCLE
// ═══════════════════════════════════════════════════════════════════════════

def installed() {
    log.info "Lumina Dashboard Tile installed"
    initialize()
}

def updated() {
    log.info "Lumina Dashboard Tile updated"
    initialize()
}

def initialize() {
    def url = buildLuminaUrl()
    def html = buildIframeHtml(url)
    
    sendEvent(name: "luminaUrl", value: url)
    sendEvent(name: "html", value: html)
    sendEvent(name: "lastUpdated", value: new Date().format("yyyy-MM-dd HH:mm:ss"))
    
    if (enableDebug) {
        log.debug "Lumina URL: ${url}"
        log.debug "HTML length: ${html.length()} chars"
    }
    
    log.info "Lumina Dashboard Tile configured: ${url}"
}

// ═══════════════════════════════════════════════════════════════════════════
//  COMMANDS
// ═══════════════════════════════════════════════════════════════════════════

def refresh() {
    log.info "Refreshing Lumina Dashboard Tile"
    initialize()
}

def setUrl(String url) {
    log.info "Setting custom URL: ${url}"
    device.updateSetting("luminaFile", [value: "custom", type: "enum"])
    device.updateSetting("customUrl", [value: url, type: "text"])
    initialize()
}

// ═══════════════════════════════════════════════════════════════════════════
//  URL BUILDER
// ═══════════════════════════════════════════════════════════════════════════

def buildLuminaUrl() {
    if (luminaFile == "custom" && customUrl) {
        return customUrl
    }
    
    // GitHub Pages - Guaranteed Remote Access
    if (luminaFile == "github-v15") {
        return "https://domotika.github.io/LuminaDev/LuminaHighline_v1.5.html"
    }
    if (luminaFile == "github-v20") {
        return "https://domotika.github.io/LuminaDev/LuminaHighline_v2.0-PRO.html"
    }
    
    def fileName = luminaFile ?: "LuminaHighline_v1.5.html"
    
    if (useCloud) {
        // Hubitat Cloud URL format
        def hubUuid = location.hubs[0].getDataValue("cloudId") ?: location.hubs[0].getDataValue("hubUID")
        if (hubUuid) {
            return "https://cloud.hubitat.com/api/${hubUuid}/local/${fileName}"
        } else {
            log.warn "Cloud ID not found, falling back to local URL"
        }
    }
    
    // Local URL
    def hubIP = location.hubs[0].getDataValue("localIP") ?: "192.168.1.1"
    return "http://${hubIP}/local/${fileName}"
}

// ═══════════════════════════════════════════════════════════════════════════
//  HTML BUILDER
// ═══════════════════════════════════════════════════════════════════════════

def buildIframeHtml(String url) {
    def height = tileHeight ?: "100%"
    def border = showBorder ? "1px solid rgba(255,255,255,0.2)" : "none"
    
    // Full-featured iframe with responsive design
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
//  TILE TEMPLATE (for Dashboard)
// ═══════════════════════════════════════════════════════════════════════════

// Note: To use this tile in Hubitat Dashboard:
// 1. Add this device to your dashboard
// 2. Select tile type: "Attribute"
// 3. Select attribute: "html"
// 4. Set tile size to fill desired area (recommend 4x4 or larger)
// 5. The iframe will automatically display Lumina Dashboard
