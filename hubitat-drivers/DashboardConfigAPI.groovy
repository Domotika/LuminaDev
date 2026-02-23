/**
 * Dashboard Config API - APP
 * Versão: 11.0 - SOLUÇÃO DEFINITIVA BASEADA EM FÓRUNS HUBITAT
 */
import groovy.json.JsonOutput
import groovy.json.JsonSlurper

definition(
    name: "Dashboard Config API",
    namespace: "custom",
    author: "Andre Gaspar",
    description: "API REST para gerenciar configurações do dashboard",
    category: "Utility",
    iconUrl: "https://www.hubitat.com/img/favicon.ico",
    iconX2Url: "https://www.hubitat.com/img/favicon.ico",
    oauth: true
)

preferences {
    page(name: "mainPage", title: "Configurações da API", install: true, uninstall: true)
    page(name: "infoPage", title: "Informações da API", install: false, uninstall: false)
}

def mainPage() {
    dynamicPage(name: "mainPage", title: "Dashboard Config API", install: true, uninstall: true) {
        section("Configurações") {
            input "logEnable", "bool", title: "Habilitar logs?", defaultValue: true
        }
        section("Informações") {
            href(name: "toInfo", page: "infoPage", title: "Ver Token OAuth e App ID")
        }
    }
}

def infoPage() {
    dynamicPage(name: "infoPage", title: "OAuth / App Info", install: false, uninstall: false) {
        section("Identificação") {
            paragraph "App ID: <b>${app.id}</b>"
            paragraph "Token: <b>${state.accessToken ?: 'Não gerado'}</b>"
        }
    }
}

def installed() {
    logMsg("INFO", "App instalado")
    initialize()
}

def updated() {
    logMsg("INFO", "App atualizado")
    initialize()
}

def initialize() {
    if (!state.accessToken) {
        createAccessToken()
        logMsg("INFO", "Token OAuth criado")
    }
    state.configs = state.configs ?: [:]
}

mappings {
    path("/health") {
        action: [GET: "health"]
    }
    path("/config/:userId") {
        action: [GET: "getConfig", POST: "saveConfig", DELETE: "deleteConfig"]
    }
    path("/config") {
        action: [GET: "listConfigs"]
    }
}

def health() {
    if (!validateOAuth()) {
        def errorResponse = [success: false, message: "Não autorizado", error: "Token inválido", timestamp: now()]
        def errorJson = JsonOutput.toJson(errorResponse)
        render contentType: "application/json", data: "$errorJson", status: 401
        return
    }
    logMsg("INFO", "Health check executado")
    def response = [
        success: true, 
        message: "API está operacional", 
        data: [status: "OK", app: app.label],
        error: null,
        timestamp: now()
    ]
    def jsonText = JsonOutput.toJson(response)
    render contentType: "application/json", data: "$jsonText", status: 200
}

def getConfig() {
    if (!validateOAuth()) {
        def errorResponse = [success: false, message: "Não autorizado", error: "Token inválido", timestamp: now()]
        def errorJson = JsonOutput.toJson(errorResponse)
        render contentType: "application/json", data: "$errorJson", status: 401
        return
    }
    try {
        def userId = params.userId ?: "default"
        def data = state.configs[userId]
        
        if (data) {
            logMsg("INFO", "Config carregada: ${userId}")
            def response = [
                success: true,
                message: "Configuração carregada com sucesso",
                data: data,
                error: null,
                timestamp: now()
            ]
            def jsonText = JsonOutput.toJson(response)
            render contentType: "application/json", data: "$jsonText", status: 200
        } else {
            logMsg("WARN", "Config não encontrada: ${userId}")
            def response = [
                success: false,
                message: "Configuração não encontrada",
                data: null,
                error: "Nenhuma config para ${userId}",
                timestamp: now()
            ]
            def jsonText = JsonOutput.toJson(response)
            render contentType: "application/json", data: "$jsonText", status: 404
        }
    } catch (Exception e) {
        logMsg("ERROR", "Erro em getConfig: ${e.message}")
        def response = [
            success: false,
            message: "Erro interno",
            data: null,
            error: e.message,
            timestamp: now()
        ]
        def jsonText = JsonOutput.toJson(response)
        render contentType: "application/json", data: "$jsonText", status: 500
    }
}

def saveConfig() {
    if (!validateOAuth()) {
        def errorResponse = [success: false, message: "Não autorizado", error: "Token inválido", timestamp: now()]
        def errorJson = JsonOutput.toJson(errorResponse)
        render contentType: "application/json", data: "$errorJson", status: 401
        return
    }
    try {
        def userId = params.userId ?: "default"
        def payload = parseJson(request.body)
        
        if (!payload) {
             def response = [
                success: false,
                message: "JSON inválido",
                data: null,
                error: "Corpo vazio ou JSON inválido",
                timestamp: now()
            ]
            def jsonText = JsonOutput.toJson(response)
            render contentType: "application/json", data: "$jsonText", status: 400
            return
        }

        state.configs[userId] = payload
        logMsg("INFO", "Config salva: ${userId}")
        
        def response = [
            success: true,
            message: "Configuração salva com sucesso",
            data: null,
            error: null,
            timestamp: now()
        ]
        def jsonText = JsonOutput.toJson(response)
        render contentType: "application/json", data: "$jsonText", status: 200
    } catch (Exception e) {
        logMsg("ERROR", "Erro em saveConfig: ${e.message}")
        def response = [
            success: false,
            message: "Erro interno",
            data: null,
            error: e.message,
            timestamp: now()
        ]
        def jsonText = JsonOutput.toJson(response)
        render contentType: "application/json", data: "$jsonText", status: 500
    }
}

def deleteConfig() {
    if (!validateOAuth()) {
        def errorResponse = [success: false, message: "Não autorizado", error: "Token inválido", timestamp: now()]
        def errorJson = JsonOutput.toJson(errorResponse)
        render contentType: "application/json", data: "$errorJson", status: 401
        return
    }
    try {
        def userId = params.userId ?: "default"
        if (state.configs.containsKey(userId)) {
            state.configs.remove(userId)
            logMsg("INFO", "Config deletada: ${userId}")
             def response = [
                success: true,
                message: "Configuração deletada com sucesso",
                data: null,
                error: null,
                timestamp: now()
            ]
            def jsonText = JsonOutput.toJson(response)
            render contentType: "application/json", data: "$jsonText", status: 200
        } else {
            logMsg("WARN", "Config não encontrada para deletar: ${userId}")
            def response = [
                success: false,
                message: "Configuração não encontrada",
                data: null,
                error: "Nenhuma config para ${userId}",
                timestamp: now()
            ]
            def jsonText = JsonOutput.toJson(response)
            render contentType: "application/json", data: "$jsonText", status: 404
        }
    } catch (Exception e) {
        logMsg("ERROR", "Erro em deleteConfig: ${e.message}")
        def response = [
            success: false,
            message: "Erro interno",
            data: null,
            error: e.message,
            timestamp: now()
        ]
        def jsonText = JsonOutput.toJson(response)
        render contentType: "application/json", data: "$jsonText", status: 500
    }
}

def listConfigs() {
    if (!validateOAuth()) {
        def errorResponse = [success: false, message: "Não autorizado", error: "Token inválido", timestamp: now()]
        def errorJson = JsonOutput.toJson(errorResponse)
        render contentType: "application/json", data: "$errorJson", status: 401
        return
    }
    try {
        def configs = state.configs?.keySet()?.toList() ?: []
        logMsg("INFO", "Listando configs: ${configs.size()} encontradas")
         def response = [
            success: true,
            message: "Lista de configurações obtida",
            data: [configs: configs, count: configs.size()],
            error: null,
            timestamp: now()
        ]
        def jsonText = JsonOutput.toJson(response)
        render contentType: "application/json", data: "$jsonText", status: 200
    } catch (Exception e) {
        logMsg("ERROR", "Erro em listConfigs: ${e.message}")
        def response = [
            success: false,
            message: "Erro interno",
            data: null,
            error: e.message,
            timestamp: now()
        ]
        def jsonText = JsonOutput.toJson(response)
        render contentType: "application/json", data: "$jsonText", status: 500
    }
}

private boolean validateOAuth() {
    def token = params.access_token
    if (!token) {
        def authHeader = request.headers.Authorization
        if (authHeader instanceof ArrayList) {
            authHeader = authHeader[0]
        }
        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7)
        }
    }
    
    if (!token || token != state.accessToken) {
        logMsg("WARN", "Acesso não autorizado")
        return false
    }
    return true
}

private Object parseJson(String json) {
    try {
        return new JsonSlurper().parseText(json)
    } catch (Exception e) {
        logMsg("ERROR", "Erro ao parsear JSON: ${e.message}")
        return null
    }
}

private void logMsg(String level, String msg) {
    if (!logEnable) return
    switch (level) {
        case "ERROR": log.error "[${app.label}] ${msg}"; break
        case "WARN":  log.warn "[${app.label}] ${msg}"; break
        case "INFO":  log.info "[${app.label}] ${msg}"; break
        default:      log.debug "[${app.label}] ${msg}"
    }
}
