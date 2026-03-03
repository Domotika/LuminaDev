/**
 *  Lumina Dashboard Server
 *  
 *  Serves Lumina Dashboard HTML with permissive headers for iframe embedding.
 *  Works with Hubitat Mobile App and external dashboards.
 *
 *  Copyright 2026 Domótika
 *  Licensed under the Apache License, Version 2.0
 */

definition(
    name: "Lumina Dashboard Server",
    namespace: "domotika",
    author: "Domótika",
    description: "Serves Lumina Dashboard for iframe embedding in Hubitat app",
    category: "Convenience",
    iconUrl: "",
    iconX2Url: "",
    oauth: true,
    singleInstance: true
)

preferences {
    page(name: "mainPage")
}

def mainPage() {
    // Gera token automaticamente ao abrir a página
    if (!state.accessToken) {
        try {
            createAccessToken()
        } catch (e) {
            log.error "Erro ao criar token: ${e.message}"
        }
    }
    
    dynamicPage(name: "mainPage", title: "Lumina Dashboard Server", install: true, uninstall: true) {
        section("Configuração") {
            input "fileName", "text", title: "Nome do arquivo HTML", required: true, defaultValue: "LuminaHighline_v1.5.html"
            input "enableDebug", "bool", title: "Ativar logs de debug", defaultValue: false
        }
        
        section("URLs de Acesso") {
            if (state.accessToken) {
                def localUrl = getFullLocalApiServerUrl() + "/lumina?access_token=${state.accessToken}"
                def cloudUrl = getFullApiServerUrl() + "/lumina?access_token=${state.accessToken}"
                
                paragraph "<b>URL Local (rede interna):</b><br><code style='word-break:break-all;'>${localUrl}</code>"
                paragraph "<b>URL Cloud (acesso externo):</b><br><code style='word-break:break-all;'>${cloudUrl}</code>"
                paragraph "<b>Para iframe no Dashboard:</b><br>Use a URL Cloud acima em um tile 'Attribute' ou dashboard externo."
            } else {
                paragraph "Clique em 'Done' para gerar as URLs de acesso."
            }
        }
        
        section("Ações") {
            href(name: "refreshToken", title: "🔄 Regenerar Token", description: "Gera novo token de acesso", page: "refreshTokenPage")
        }
    }
}

def refreshTokenPage() {
    createAccessToken()
    dynamicPage(name: "refreshTokenPage", title: "Token Regenerado", install: false) {
        section() {
            paragraph "✅ Novo token gerado com sucesso!"
            paragraph "Volte à página principal para ver as novas URLs."
        }
    }
}

mappings {
    path("/lumina") { action: [GET: "serveLumina"] }
    path("/lumina/") { action: [GET: "serveLumina"] }
}

def installed() {
    logDebug "Lumina Server instalado"
    initialize()
}

def updated() {
    logDebug "Lumina Server atualizado"
    initialize()
}

def initialize() {
    if (!state.accessToken) {
        createAccessToken()
    }
}

def serveLumina() {
    logDebug "Servindo Lumina Dashboard: ${fileName}"
    
    try {
        // Read file from Hubitat File Manager
        def fileContent = readFile(fileName)
        
        if (fileContent) {
            // Return HTML with permissive headers
            render(
                contentType: "text/html",
                data: fileContent,
                headers: [
                    "X-Frame-Options": "ALLOWALL",
                    "Content-Security-Policy": "frame-ancestors *",
                    "Access-Control-Allow-Origin": "*",
                    "Cache-Control": "no-cache, no-store, must-revalidate"
                ]
            )
        } else {
            render(
                contentType: "text/html",
                data: errorPage("Arquivo não encontrado: ${fileName}<br><br>Certifique-se de que o arquivo está no File Manager do Hubitat."),
                status: 404
            )
        }
    } catch (Exception e) {
        log.error "Erro ao servir Lumina: ${e.message}"
        render(
            contentType: "text/html", 
            data: errorPage("Erro ao carregar: ${e.message}"),
            status: 500
        )
    }
}

def readFile(String filename) {
    try {
        def uri = "http://127.0.0.1:8080/local/${filename}"
        
        def params = [
            uri: uri,
            textParser: true,
            timeout: 30
        ]
        
        def result = null
        httpGet(params) { resp ->
            if (resp.status == 200) {
                result = resp.data.text
            }
        }
        return result
    } catch (Exception e) {
        log.error "Erro ao ler arquivo ${filename}: ${e.message}"
        return null
    }
}

def errorPage(String message) {
    return """
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lumina - Erro</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
            box-sizing: border-box;
        }
        .error-box {
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 16px;
            padding: 40px;
            text-align: center;
            max-width: 400px;
        }
        .icon { font-size: 48px; margin-bottom: 20px; }
        h1 { font-size: 20px; font-weight: 500; margin: 0 0 16px 0; }
        p { font-size: 14px; color: rgba(255,255,255,0.6); margin: 0; line-height: 1.6; }
        code { background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px; font-size: 12px; }
    </style>
</head>
<body>
    <div class="error-box">
        <div class="icon">⚠️</div>
        <h1>Lumina Dashboard</h1>
        <p>${message}</p>
    </div>
</body>
</html>
"""
}

def logDebug(msg) {
    if (enableDebug) {
        log.debug msg
    }
}
