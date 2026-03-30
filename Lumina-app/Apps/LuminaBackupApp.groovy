/**
 * Lumina Dashboard - Backup App
 * 
 * App com endpoint HTTP para salvar configurações no File Manager.
 * Aceita POST com JSON grande no body.
 * 
 * @author Domótika - Raphael Vasconcelos
 * @version 1.0.0
 * @date 2026-03-26
 */

definition(
    name: "Lumina Backup",
    namespace: "domotika",
    author: "Raphael Vasconcelos",
    description: "Backup de configurações do Lumina Dashboard via File Manager",
    category: "Utility",
    iconUrl: "",
    iconX2Url: "",
    singleInstance: true
)

preferences {
    page(name: "mainPage")
}

def mainPage() {
    dynamicPage(name: "mainPage", title: "Lumina Backup", install: true, uninstall: true) {
        section("Status") {
            paragraph "Endpoint: ${getFullApiServerUrl()}/backup"
            paragraph "Token: ${state.accessToken ?: 'Não gerado'}"
            input "debugEnable", "bool", title: "Debug logging", defaultValue: false
        }
        section("Backups") {
            paragraph "Total: ${state.backupCount ?: 0}"
            paragraph "Último: ${state.lastBackup ?: 'Nenhum'}"
            if (state.lastError) {
                paragraph "Erro: ${state.lastError}"
            }
        }
        section("Ações") {
            href "listBackupsPage", title: "Listar Backups", description: "Ver backups salvos"
        }
    }
}

def listBackupsPage() {
    dynamicPage(name: "listBackupsPage", title: "Backups Salvos") {
        section {
            def files = state.backupFiles ?: []
            if (files.size() == 0) {
                paragraph "Nenhum backup encontrado"
            } else {
                files.each { file ->
                    paragraph "${file.name} - ${file.date}"
                }
            }
        }
    }
}

// ========== MAPPINGS HTTP ==========
mappings {
    path("/backup") {
        action: [
            GET: "getBackupInfo",
            POST: "saveBackup"
        ]
    }
    path("/backup/list") {
        action: [
            GET: "listBackups"
        ]
    }
    path("/backup/load/:filename") {
        action: [
            GET: "loadBackup"
        ]
    }
    path("/backup/delete/:filename") {
        action: [
            DELETE: "deleteBackup",
            GET: "deleteBackup"
        ]
    }
    path("/connection") {
        action: [
            GET: "getConnectionData",
            POST: "saveConnectionData"
        ]
    }
}

// ========== LIFECYCLE ==========
def installed() {
    log.info "Lumina Backup App instalado"
    initialize()
}

def updated() {
    log.info "Lumina Backup App atualizado"
    initialize()
}

def initialize() {
    if (!state.accessToken) {
        createAccessToken()
    }
    state.backupFiles = state.backupFiles ?: []
    state.backupCount = state.backupFiles.size()
}

// ========== ENDPOINTS ==========

/**
 * GET /backup - Retorna informações do sistema de backup
 */
def getBackupInfo() {
    logDebug "getBackupInfo chamado"
    
    def info = [
        status: "ready",
        endpoint: getFullApiServerUrl() + "/backup",
        backupCount: state.backupFiles?.size() ?: 0,
        lastBackup: state.lastBackup,
        lastError: state.lastError
    ]
    
    return renderJSON(info)
}

/**
 * POST /backup - Salva backup no File Manager
 * Body: { "config": {...}, "filename": "optional-name" }
 */
def saveBackup() {
    logDebug "saveBackup chamado"
    
    try {
        def body = request.JSON
        
        if (!body || !body.config) {
            state.lastError = "Body vazio ou sem campo 'config'"
            return renderJSON([success: false, error: state.lastError])
        }
        
        def configData = body.config
        def filename = body.filename
        
        // Se config é objeto, converte pra JSON string
        if (configData instanceof Map || configData instanceof List) {
            configData = new groovy.json.JsonBuilder(configData).toString()
        }
        
        // Gera nome do arquivo se não fornecido
        if (!filename) {
            def timestamp = new Date().format("yyyy-MM-dd_HH-mm-ss")
            filename = "lumina-backup-${timestamp}.json"
        }
        
        // Sanitiza nome
        filename = sanitizeFilename(filename)
        if (!filename.endsWith('.json')) {
            filename += '.json'
        }
        
        // Salva no File Manager
        def success = writeToFileManager(filename, configData)
        
        if (success) {
            // Atualiza estado
            state.lastBackup = filename
            state.lastError = null
            
            // Adiciona à lista de backups
            def files = state.backupFiles ?: []
            files.removeAll { it.name == filename }
            files << [name: filename, date: new Date().format("yyyy-MM-dd HH:mm:ss"), size: configData.length()]
            
            // Mantém apenas os últimos 20
            if (files.size() > 20) {
                files = files.takeRight(20)
            }
            state.backupFiles = files
            state.backupCount = files.size()
            
            log.info "Backup salvo: ${filename} (${configData.length()} bytes)"
            
            return renderJSON([
                success: true, 
                filename: filename,
                size: configData.length(),
                message: "Backup salvo com sucesso!"
            ])
        } else {
            return renderJSON([success: false, error: state.lastError ?: "Erro ao salvar arquivo"])
        }
        
    } catch (Exception e) {
        log.error "Erro ao salvar backup: ${e.message}"
        state.lastError = e.message
        return renderJSON([success: false, error: e.message])
    }
}

/**
 * GET /backup/list - Lista backups disponíveis
 */
def listBackups() {
    logDebug "listBackups chamado"
    
    return renderJSON([
        success: true,
        backups: state.backupFiles ?: [],
        count: state.backupFiles?.size() ?: 0
    ])
}

/**
 * GET /backup/load/:filename - Carrega um backup
 */
def loadBackup() {
    def filename = params.filename
    logDebug "loadBackup chamado: ${filename}"
    
    if (!filename) {
        return renderJSON([success: false, error: "Filename obrigatório"])
    }
    
    filename = sanitizeFilename(filename)
    
    try {
        def content = readFromFileManager(filename)
        
        if (content) {
            return renderJSON([
                success: true,
                filename: filename,
                config: new groovy.json.JsonSlurper().parseText(content)
            ])
        } else {
            return renderJSON([success: false, error: "Arquivo não encontrado"])
        }
    } catch (Exception e) {
        log.error "Erro ao carregar backup: ${e.message}"
        return renderJSON([success: false, error: e.message])
    }
}

/**
 * DELETE /backup/delete/:filename - Deleta um backup
 */
def deleteBackup() {
    def filename = params.filename
    logDebug "deleteBackup chamado: ${filename}"
    
    if (!filename) {
        return renderJSON([success: false, error: "Filename obrigatório"])
    }
    
    filename = sanitizeFilename(filename)
    
    try {
        // Remove da lista
        def files = state.backupFiles ?: []
        files.removeAll { it.name == filename }
        state.backupFiles = files
        state.backupCount = files.size()
        
        // Não podemos deletar arquivo do File Manager via API,
        // mas removemos da lista de backups gerenciados
        
        log.info "Backup removido da lista: ${filename}"
        
        return renderJSON([success: true, message: "Backup removido"])
    } catch (Exception e) {
        log.error "Erro ao deletar backup: ${e.message}"
        return renderJSON([success: false, error: e.message])
    }
}

/**
 * POST /connection - Salva dados de conexão
 */
def saveConnectionData() {
    logDebug "saveConnectionData chamado"
    
    try {
        def body = request.JSON
        
        if (!body) {
            return renderJSON([success: false, error: "Body vazio"])
        }
        
        state.connectionData = [
            hubIp: body.hubIp,
            appId: body.appId,
            accessToken: body.accessToken,
            cloudUrl: body.cloudUrl,
            savedAt: new Date().time
        ]
        
        log.info "Dados de conexão salvos"
        
        return renderJSON([success: true, message: "Dados salvos"])
    } catch (Exception e) {
        log.error "Erro ao salvar conexão: ${e.message}"
        return renderJSON([success: false, error: e.message])
    }
}

/**
 * GET /connection - Retorna dados de conexão salvos
 */
def getConnectionData() {
    logDebug "getConnectionData chamado"
    
    if (state.connectionData) {
        return renderJSON([success: true, connection: state.connectionData])
    } else {
        return renderJSON([success: false, error: "Nenhum dado de conexão salvo"])
    }
}

// ========== FILE MANAGER ==========

/**
 * Escreve arquivo no File Manager usando uploadHubFile
 */
private writeToFileManager(String filename, String content) {
    try {
        // Método 1: uploadHubFile (preferido)
        uploadHubFile(filename, content.getBytes("UTF-8"))
        logDebug "Arquivo salvo via uploadHubFile: ${filename}"
        return true
    } catch (Exception e1) {
        logDebug "uploadHubFile falhou: ${e1.message}, tentando alternativa..."
        
        try {
            // Método 2: Alternativa via interface interna
            def params = [
                uri: "http://127.0.0.1:8080",
                path: "/hub/fileManager/upload",
                requestContentType: "application/octet-stream",
                body: content.getBytes("UTF-8"),
                headers: [
                    "Content-Disposition": "attachment; filename=\"${filename}\""
                ]
            ]
            httpPost(params) { resp ->
                logDebug "Upload response: ${resp.status}"
            }
            return true
        } catch (Exception e2) {
            log.error "Erro ao salvar arquivo: ${e2.message}"
            state.lastError = "Não foi possível salvar no File Manager: ${e2.message}"
            return false
        }
    }
}

/**
 * Lê arquivo do File Manager
 */
private readFromFileManager(String filename) {
    try {
        def content = downloadHubFile(filename)
        return new String(content, "UTF-8")
    } catch (Exception e) {
        log.error "Erro ao ler arquivo: ${e.message}"
        return null
    }
}

// ========== HELPERS ==========

private sanitizeFilename(filename) {
    return filename.replaceAll(/[^a-zA-Z0-9._-]/, "_")
}

private renderJSON(data) {
    render contentType: "application/json", data: new groovy.json.JsonBuilder(data).toString()
}

private logDebug(msg) {
    if (debugEnable) {
        log.debug msg
    }
}
