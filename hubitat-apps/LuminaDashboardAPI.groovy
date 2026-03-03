/**
 *  Lumina Dashboard API
 *  
 *  Custom API for Lumina Dashboard - fetches devices, manages hub variables,
 *  and provides OAuth endpoints for cloud access.
 *
 *  Copyright 2026 Domótika
 *  Licensed under the Apache License, Version 2.0
 */

definition(
    name: "Lumina Dashboard API",
    namespace: "domotika",
    author: "Domótika",
    description: "API para o Lumina Dashboard - busca dispositivos e gerencia configurações",
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
    // Gera token automaticamente
    if (!state.accessToken) {
        try {
            createAccessToken()
        } catch (e) {
            log.error "Erro ao criar token OAuth: ${e.message}"
        }
    }
    
    dynamicPage(name: "mainPage", title: "Lumina Dashboard API", install: true, uninstall: true) {
        section("📱 Dispositivos") {
            input "selectedDevices", "capability.*", title: "Selecione os dispositivos para o Lumina", multiple: true, required: false
            paragraph "<small>Deixe vazio para incluir todos os dispositivos.</small>"
        }
        
        section("🔗 URLs de Acesso") {
            if (state.accessToken) {
                def localUrl = getFullLocalApiServerUrl()
                def cloudUrl = getFullApiServerUrl()
                def appId = app.id
                
                paragraph "<b>🏠 URL Local:</b>"
                paragraph "<code style='word-break:break-all; font-size:11px;'>${localUrl}/devices?access_token=${state.accessToken}</code>"
                
                paragraph "<b>☁️ URL Cloud:</b>"
                paragraph "<code style='word-break:break-all; font-size:11px;'>${cloudUrl}/devices?access_token=${state.accessToken}</code>"
                
                paragraph "<hr>"
                paragraph "<b>📋 Para configurar o Lumina:</b>"
                paragraph "• <b>App ID:</b> ${appId}"
                paragraph "• <b>Access Token:</b> ${state.accessToken}"
                paragraph "• <b>Hub UUID:</b> ${location.hub.hardwareID}"
            } else {
                paragraph "⚠️ Clique em <b>Done</b> e abra novamente para gerar as URLs."
            }
        }
        
        section("💾 Hub Variables (Auto-Sync)") {
            input "enableAutoSync", "bool", title: "Criar variáveis para Auto-Sync", defaultValue: true
            if (enableAutoSync != false) {
                paragraph "<small>Serão criadas as variáveis: LuminaData, LuminaData_0 a LuminaData_4, LuminaConfig</small>"
            }
        }
        
        section("⚙️ Opções") {
            input "includeRooms", "bool", title: "Incluir informação de Room nos dispositivos", defaultValue: true
            input "enableDebug", "bool", title: "Ativar logs de debug", defaultValue: false
        }
        
        section("🔄 Ações") {
            href(name: "createVars", title: "📦 Criar Hub Variables", description: "Cria as variáveis necessárias para auto-sync", page: "createVariablesPage")
            href(name: "refreshToken", title: "🔑 Regenerar Token", description: "Gera novo token de acesso OAuth", page: "refreshTokenPage")
        }
    }
}

def createVariablesPage() {
    createHubVariables()
    dynamicPage(name: "createVariablesPage", title: "Hub Variables", install: false) {
        section() {
            paragraph "✅ Hub Variables criadas com sucesso!"
            paragraph "Variáveis criadas:"
            paragraph "• LuminaData"
            paragraph "• LuminaData_0"
            paragraph "• LuminaData_1"
            paragraph "• LuminaData_2"
            paragraph "• LuminaData_3"
            paragraph "• LuminaData_4"
            paragraph "• LuminaConfig"
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

// ═══════════════════════════════════════════════════════════════════════════
//  API MAPPINGS
// ═══════════════════════════════════════════════════════════════════════════

mappings {
    // Dispositivos
    path("/devices") { action: [GET: "getAllDevices"] }
    path("/devices/:id") { action: [GET: "getDevice"] }
    path("/devices/:id/:command") { action: [GET: "sendCommand"] }
    path("/devices/:id/:command/:arg1") { action: [GET: "sendCommandWithArg"] }
    path("/devices/:id/:command/:arg1/:arg2") { action: [GET: "sendCommandWith2Args"] }
    
    // Hub Variables (para auto-sync)
    path("/globals/:name") { action: [GET: "getGlobal"] }
    path("/globals/:name/:value") { action: [GET: "setGlobal"] }
    
    // Info
    path("/info") { action: [GET: "getHubInfo"] }
}

// ═══════════════════════════════════════════════════════════════════════════
//  LIFECYCLE
// ═══════════════════════════════════════════════════════════════════════════

def installed() {
    logDebug "Lumina Dashboard API instalado"
    initialize()
}

def updated() {
    logDebug "Lumina Dashboard API atualizado"
    initialize()
}

def initialize() {
    if (!state.accessToken) {
        createAccessToken()
    }
    if (enableAutoSync != false) {
        createHubVariables()
    }
}

// ═══════════════════════════════════════════════════════════════════════════
//  HUB VARIABLES
// ═══════════════════════════════════════════════════════════════════════════

def createHubVariables() {
    def varNames = ["LuminaData", "LuminaData_0", "LuminaData_1", "LuminaData_2", "LuminaData_3", "LuminaData_4", "LuminaConfig"]
    
    varNames.each { varName ->
        def existing = getGlobalVar(varName)
        if (!existing) {
            setGlobalVar(varName, "")
            logDebug "Criada variável: ${varName}"
        }
    }
    log.info "Hub Variables para Lumina criadas/verificadas"
}

// ═══════════════════════════════════════════════════════════════════════════
//  API HANDLERS - DEVICES
// ═══════════════════════════════════════════════════════════════════════════

def getAllDevices() {
    logDebug "GET /devices"
    
    def deviceList = selectedDevices ?: getAllSelectedDevices()
    def result = []
    
    deviceList.each { device ->
        result << formatDevice(device)
    }
    
    return renderJson(result)
}

def getDevice() {
    def deviceId = params.id
    logDebug "GET /devices/${deviceId}"
    
    def device = findDevice(deviceId)
    if (!device) {
        return renderJson([error: "Device not found"], 404)
    }
    
    return renderJson(formatDevice(device))
}

def sendCommand() {
    def deviceId = params.id
    def command = params.command
    logDebug "GET /devices/${deviceId}/${command}"
    
    def device = findDevice(deviceId)
    if (!device) {
        return renderJson([error: "Device not found"], 404)
    }
    
    try {
        device."${command}"()
        return renderJson([success: true, device: deviceId, command: command])
    } catch (e) {
        log.error "Erro ao executar comando: ${e.message}"
        return renderJson([error: e.message], 500)
    }
}

def sendCommandWithArg() {
    def deviceId = params.id
    def command = params.command
    def arg1 = params.arg1
    logDebug "GET /devices/${deviceId}/${command}/${arg1}"
    
    def device = findDevice(deviceId)
    if (!device) {
        return renderJson([error: "Device not found"], 404)
    }
    
    try {
        // Tentar converter para número se possível
        def parsedArg = arg1.isNumber() ? arg1.toInteger() : arg1
        device."${command}"(parsedArg)
        return renderJson([success: true, device: deviceId, command: command, arg: arg1])
    } catch (e) {
        log.error "Erro ao executar comando: ${e.message}"
        return renderJson([error: e.message], 500)
    }
}

def sendCommandWith2Args() {
    def deviceId = params.id
    def command = params.command
    def arg1 = params.arg1
    def arg2 = params.arg2
    logDebug "GET /devices/${deviceId}/${command}/${arg1}/${arg2}"
    
    def device = findDevice(deviceId)
    if (!device) {
        return renderJson([error: "Device not found"], 404)
    }
    
    try {
        def parsedArg1 = arg1.isNumber() ? arg1.toInteger() : arg1
        def parsedArg2 = arg2.isNumber() ? arg2.toInteger() : arg2
        device."${command}"(parsedArg1, parsedArg2)
        return renderJson([success: true, device: deviceId, command: command, args: [arg1, arg2]])
    } catch (e) {
        log.error "Erro ao executar comando: ${e.message}"
        return renderJson([error: e.message], 500)
    }
}

// ═══════════════════════════════════════════════════════════════════════════
//  API HANDLERS - GLOBALS (Hub Variables)
// ═══════════════════════════════════════════════════════════════════════════

def getGlobal() {
    def varName = params.name
    logDebug "GET /globals/${varName}"
    
    def value = getGlobalVar(varName)
    return renderJson([name: varName, value: value])
}

def setGlobal() {
    def varName = params.name
    def value = params.value
    logDebug "GET /globals/${varName}/${value?.take(50)}..."
    
    // Decodificar URL-encoded value
    def decodedValue = URLDecoder.decode(value ?: "", "UTF-8")
    setGlobalVar(varName, decodedValue)
    
    return renderJson([name: varName, value: decodedValue, success: true])
}

def getHubInfo() {
    logDebug "GET /info"
    return renderJson([
        hubId: location.hub.hardwareID,
        hubName: location.hub.name,
        localIP: location.hub.localIP,
        firmwareVersion: location.hub.firmwareVersionString,
        appId: app.id,
        apiVersion: "1.0"
    ])
}

// ═══════════════════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════════════════

def getAllSelectedDevices() {
    // Retorna todos os dispositivos do hub
    return getAllDevices()
}

def findDevice(deviceId) {
    def deviceList = selectedDevices ?: getAllSelectedDevices()
    return deviceList.find { it.id.toString() == deviceId.toString() }
}

def formatDevice(device) {
    def formatted = [
        id: device.id.toString(),
        name: device.displayName,
        label: device.label ?: device.name,
        capabilities: device.capabilities.collect { it.name },
        attributes: device.supportedAttributes.collect { attr ->
            [name: attr.name, currentValue: device.currentValue(attr.name)]
        },
        commands: device.supportedCommands.collect { it.name },
        model: device.getDataValue("model") ?: "",
        manufacturer: device.getDataValue("manufacturer") ?: ""
    ]
    
    // Incluir room se configurado
    if (includeRooms != false) {
        def roomName = device.device?.roomName
        if (roomName) {
            formatted.room = roomName
        }
    }
    
    return formatted
}

def renderJson(data, statusCode = 200) {
    def json = groovy.json.JsonOutput.toJson(data)
    render(
        contentType: "application/json",
        data: json,
        status: statusCode
    )
}

def getGlobalVar(String name) {
    return getGlobalVariable(name)?.value
}

def setGlobalVar(String name, String value) {
    try {
        // Tenta atualizar
        setGlobalVariable(name, value)
    } catch (e) {
        // Se não existe, cria
        try {
            addGlobalVariable(name, value, "string")
        } catch (e2) {
            log.error "Erro ao criar/atualizar variável ${name}: ${e2.message}"
        }
    }
}

def logDebug(msg) {
    if (enableDebug) {
        log.debug msg
    }
}
