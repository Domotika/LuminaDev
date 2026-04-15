/**
 * Lumina 3D Model Manager
 * Driver para gerenciar modelos 3D GLB no Hubitat File Manager
 * 
 * @version 1.0.0
 * @author Raphael Vasconcelos - Domotika
 */

metadata {
    definition(
        name: "Lumina 3D Model Manager", 
        namespace: "domotika", 
        author: "Raphael Vasconcelos",
        description: "Gerencia modelos 3D GLB para visualização no Lumina Dashboard"
    ) {
        capability "Configuration"
        capability "Refresh"
        
        command "uploadModel", ["string"]
        command "setActiveModel", ["string"] 
        command "listModels"
        command "deleteModel", ["string"]
        command "getModelUrl", ["string"]
        
        attribute "activeModel", "string"
        attribute "totalModels", "number"
        attribute "lastUpdated", "string"
        attribute "modelList", "json"
        attribute "status", "string"
    }
    
    preferences {
        input name: "defaultModel", type: "text", title: "Modelo Padrão", 
              description: "Nome do arquivo GLB padrão (ex: casa_principal.glb)", 
              defaultValue: "lumina_apartamento.glb"
        input name: "debugEnable", type: "bool", title: "Habilitar Debug", defaultValue: false
        input name: "autoRefresh", type: "bool", title: "Auto-refresh", 
              description: "Atualizar lista automaticamente", defaultValue: true
    }
}

def installed() {
    log.info "Lumina 3D Model Manager: Instalado"
    initialize()
}

def updated() {
    log.info "Lumina 3D Model Manager: Configurações atualizadas"
    initialize()
}

def initialize() {
    sendEvent(name: "status", value: "Inicializando...")
    
    // Set default model if specified
    if (defaultModel) {
        sendEvent(name: "activeModel", value: defaultModel)
    }
    
    // Refresh model list
    if (autoRefresh) {
        listModels()
    }
    
    sendEvent(name: "status", value: "Pronto")
    sendEvent(name: "lastUpdated", value: new Date().format("dd/MM/yyyy HH:mm"))
}

def refresh() {
    if (debugEnable) log.debug "Refreshing 3D Model list..."
    listModels()
}

def configure() {
    initialize()
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMMANDS - Model Management
// ═══════════════════════════════════════════════════════════════════════════════

def uploadModel(String fileName) {
    if (debugEnable) log.debug "uploadModel called with: ${fileName}"
    
    try {
        // Validate file extension
        if (!fileName.toLowerCase().endsWith('.glb')) {
            sendEvent(name: "status", value: "Erro: Apenas arquivos .glb são suportados")
            return [success: false, message: "Formato inválido"]
        }
        
        sendEvent(name: "status", value: "Upload: ${fileName}")
        
        // Note: Actual file upload is handled by File Manager UI
        // This command just registers the model in our system
        def currentList = parseModelList()
        if (!currentList.contains(fileName)) {
            currentList.add(fileName)
            updateModelList(currentList)
        }
        
        sendEvent(name: "status", value: "Modelo registrado: ${fileName}")
        sendEvent(name: "lastUpdated", value: new Date().format("dd/MM/yyyy HH:mm"))
        
        // Set as active if it's the first model
        if (device.currentValue("activeModel") == null) {
            setActiveModel(fileName)
        }
        
        return [success: true, message: "Modelo ${fileName} registrado com sucesso"]
        
    } catch (Exception e) {
        log.error "Erro no upload: ${e.message}"
        sendEvent(name: "status", value: "Erro: ${e.message}")
        return [success: false, message: e.message]
    }
}

def setActiveModel(String fileName) {
    if (debugEnable) log.debug "setActiveModel called with: ${fileName}"
    
    try {
        sendEvent(name: "activeModel", value: fileName)
        sendEvent(name: "status", value: "Modelo ativo: ${fileName}")
        sendEvent(name: "lastUpdated", value: new Date().format("dd/MM/yyyy HH:mm"))
        
        if (debugEnable) log.debug "Active model set to: ${fileName}"
        return [success: true, activeModel: fileName]
        
    } catch (Exception e) {
        log.error "Erro ao definir modelo ativo: ${e.message}"
        return [success: false, message: e.message]
    }
}

def listModels() {
    if (debugEnable) log.debug "Listando modelos 3D..."
    
    try {
        def modelList = parseModelList()
        
        sendEvent(name: "totalModels", value: modelList.size())
        sendEvent(name: "modelList", value: groovy.json.JsonOutput.toJson(modelList))
        sendEvent(name: "status", value: "Modelos: ${modelList.size()}")
        sendEvent(name: "lastUpdated", value: new Date().format("dd/MM/yyyy HH:mm"))
        
        if (debugEnable) log.debug "Found ${modelList.size()} models: ${modelList}"
        
        return [
            success: true, 
            models: modelList, 
            total: modelList.size(),
            activeModel: device.currentValue("activeModel")
        ]
        
    } catch (Exception e) {
        log.error "Erro ao listar modelos: ${e.message}"
        sendEvent(name: "status", value: "Erro: ${e.message}")
        return [success: false, message: e.message]
    }
}

def deleteModel(String fileName) {
    if (debugEnable) log.debug "deleteModel called with: ${fileName}"
    
    try {
        def currentList = parseModelList()
        currentList.removeAll { it == fileName }
        updateModelList(currentList)
        
        // If deleted model was active, reset to default or first available
        if (device.currentValue("activeModel") == fileName) {
            def newActive = defaultModel ?: (currentList.size() > 0 ? currentList[0] : null)
            if (newActive) {
                setActiveModel(newActive)
            } else {
                sendEvent(name: "activeModel", value: null)
            }
        }
        
        sendEvent(name: "status", value: "Modelo removido: ${fileName}")
        sendEvent(name: "totalModels", value: currentList.size())
        sendEvent(name: "lastUpdated", value: new Date().format("dd/MM/yyyy HH:mm"))
        
        return [success: true, message: "Modelo ${fileName} removido"]
        
    } catch (Exception e) {
        log.error "Erro ao deletar modelo: ${e.message}"
        return [success: false, message: e.message]
    }
}

def getModelUrl(String fileName = null) {
    def modelName = fileName ?: device.currentValue("activeModel") ?: defaultModel
    
    if (!modelName) {
        return [success: false, message: "Nenhum modelo especificado"]
    }
    
    // Build Hubitat File Manager URL
    def hubIP = location.hubs[0].localIP
    def modelUrl = "http://${hubIP}/local/${modelName}"
    
    if (debugEnable) log.debug "Model URL: ${modelUrl}"
    
    return [
        success: true,
        url: modelUrl,
        fileName: modelName,
        fullPath: "/local/${modelName}"
    ]
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

private List parseModelList() {
    def listJson = device.currentValue("modelList")
    if (!listJson) return []
    
    try {
        return new groovy.json.JsonSlurper().parseText(listJson)
    } catch (Exception e) {
        if (debugEnable) log.debug "Error parsing model list, returning empty: ${e.message}"
        return []
    }
}

private void updateModelList(List models) {
    def json = groovy.json.JsonOutput.toJson(models)
    sendEvent(name: "modelList", value: json)
    sendEvent(name: "totalModels", value: models.size())
}

// ═══════════════════════════════════════════════════════════════════════════════
// API ENDPOINTS (for Lumina Dashboard)
// ═══════════════════════════════════════════════════════════════════════════════

def getActiveModelInfo() {
    def activeModel = device.currentValue("activeModel")
    if (!activeModel) {
        return [success: false, message: "Nenhum modelo ativo"]
    }
    
    return [
        success: true,
        model: activeModel,
        url: getModelUrl(activeModel),
        lastUpdated: device.currentValue("lastUpdated"),
        totalModels: device.currentValue("totalModels")
    ]
}