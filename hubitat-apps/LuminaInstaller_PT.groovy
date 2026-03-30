/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  LUMINA DASHBOARD - INSTALADOR
 *  Dashboard Profissional para Hubitat Elevation
 * ═══════════════════════════════════════════════════════════════════════════
 *  
 *  Copyright © 2024-2026 Domótika Ambientes Inteligentes LTDA
 *  https://luminadashboards.dev.br
 *  
 *  Este instalador baixa e gerencia o arquivo HTML do Lumina Dashboard.
 *  O dashboard requer uma licença válida para ativação.
 *  
 * ═══════════════════════════════════════════════════════════════════════════
 */

definition(
    name: "Lumina Dashboard - Instalador",
    namespace: "domotika",
    author: "Domótika",
    description: "Instala e atualiza o Lumina Dashboard - Dashboard profissional com glassmorphism para Hubitat",
    category: "Convenience",
    iconUrl: "",
    iconX2Url: "",
    iconX3Url: "",
    documentationLink: "https://luminadashboards.dev.br",
    importUrl: "https://raw.githubusercontent.com/Domotika/LuminaDev/main/hubitat-apps/LuminaInstaller_PT.groovy"
)

preferences {
    page(name: "mainPage")
    page(name: "installPage")
    page(name: "updatePage")
    page(name: "setupSyncPage")
    page(name: "generateLinkPage")
    page(name: "aboutPage")
}

// ═══════════════════════════════════════════════════════════════════════════
//  CONFIGURAÇÃO
// ═══════════════════════════════════════════════════════════════════════════

@groovy.transform.Field static final String LUMINA_VERSION = "1.5.7"
@groovy.transform.Field static final String LUMINA_FILENAME = "LuminaHighline_v1.5.html"
@groovy.transform.Field static final String GITHUB_RAW_URL = "https://raw.githubusercontent.com/Domotika/LuminaDev/main/LuminaHighline_v1.5.html"
@groovy.transform.Field static final String GITHUB_VERSION_URL = "https://raw.githubusercontent.com/Domotika/LuminaDev/main/version.txt"

// ═══════════════════════════════════════════════════════════════════════════
//  PÁGINAS
// ═══════════════════════════════════════════════════════════════════════════

def mainPage() {
    dynamicPage(name: "mainPage", title: "", install: true, uninstall: true) {
        
        section {
            paragraph """
                <style>
                    .lumina-header {
                        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
                        padding: 30px;
                        border-radius: 15px;
                        text-align: center;
                        margin-bottom: 20px;
                    }
                    .lumina-title {
                        font-size: 28px;
                        font-weight: 300;
                        color: white;
                        margin: 0;
                        letter-spacing: 3px;
                    }
                    .lumina-subtitle {
                        font-size: 12px;
                        color: rgba(255,255,255,0.6);
                        margin-top: 8px;
                        letter-spacing: 1px;
                    }
                    .lumina-card {
                        background: #f8f9fa;
                        border-radius: 10px;
                        padding: 20px;
                        margin: 10px 0;
                        border-left: 4px solid #0f3460;
                    }
                    .lumina-status {
                        display: inline-block;
                        padding: 5px 12px;
                        border-radius: 20px;
                        font-size: 11px;
                        font-weight: bold;
                        text-transform: uppercase;
                    }
                    .status-installed { background: #d4edda; color: #155724; }
                    .status-not-installed { background: #f8d7da; color: #721c24; }
                    .status-update { background: #fff3cd; color: #856404; }
                </style>
                <div class="lumina-header">
                    <h1 class="lumina-title">LUMINA</h1>
                    <p class="lumina-subtitle">DASHBOARD PROFISSIONAL PARA HUBITAT</p>
                </div>
            """
        }
        
        // Seção de Status
        section("📊 Status") {
            def installed = isLuminaInstalled()
            def installedFile = findInstalledLumina()
            def installedVersion = getInstalledVersion()
            def statusClass = installed ? "status-installed" : "status-not-installed"
            def statusText = installed ? "INSTALADO" : "NÃO INSTALADO"
            
            paragraph """
                <div class="lumina-card">
                    <strong>Status do Dashboard:</strong> 
                    <span class="lumina-status ${statusClass}">${statusText}</span>
                    <br><br>
                    ${installed ? "<strong>Versão Instalada:</strong> ${installedVersion}<br><strong>Arquivo:</strong> ${installedFile?.name}<br><br>" : ""}
                    <strong>Versão do Instalador:</strong> ${LUMINA_VERSION}<br>
                    <strong>Arquivo Padrão:</strong> ${LUMINA_FILENAME}
                </div>
            """
            
            if (installed && installedFile) {
                def hubIP = location.hubs[0].getDataValue("localIP") ?: "IP-DO-SEU-HUB"
                def fileName = installedFile.name
                paragraph """
                    <div class="lumina-card" style="border-left-color: #28a745;">
                        <strong>🔗 Acesse seu dashboard:</strong><br>
                        <a href="http://${hubIP}/local/${fileName}" target="_blank" style="font-size: 14px; color: #0f3460;">
                            http://${hubIP}/local/${fileName}
                        </a>
                    </div>
                """
            }
        }
        
        // Seção de Ações
        section("⚡ Ações") {
            if (!isLuminaInstalled()) {
                href "installPage", title: "📥 Instalar Lumina Dashboard", description: "Baixar e instalar o dashboard", style: "external"
            } else {
                href "updatePage", title: "🔄 Verificar Atualizações", description: "Baixar versão mais recente", style: "external"
            }
            href "setupSyncPage", title: "🔧 Configurar Auto-Sync", description: "Criar Hub Variables para sincronização"
            href "generateLinkPage", title: "🔗 Gerar Link de Acesso", description: "Link pronto com configuração automática"
            href "aboutPage", title: "ℹ️ Sobre & Licença", description: "Informações e suporte"
        }
        
        // Verificação do Maker API
        section("🔌 Maker API") {
            def makerApp = findMakerAPI()
            if (makerApp) {
                paragraph """
                    <div class="lumina-card" style="border-left-color: #28a745;">
                        ✅ <strong>Maker API detectado!</strong><br>
                        App ID: ${makerApp.id}
                    </div>
                """
            } else {
                paragraph """
                    <div class="lumina-card" style="border-left-color: #ffc107;">
                        ⚠️ <strong>Maker API não detectado</strong><br>
                        Se você já tem o Maker API instalado, ignore esta mensagem.<br>
                        Caso contrário, instale em: Apps → Add Built-in App → Maker API
                    </div>
                """
            }
        }
    }
}

def installPage() {
    dynamicPage(name: "installPage", title: "Instalar Lumina Dashboard", install: false, uninstall: false) {
        section {
            paragraph """
                <div class="lumina-card">
                    <h3>📥 Instalando Lumina Dashboard</h3>
                    <p>Isso irá baixar o dashboard do GitHub e salvar no File Manager do seu hub.</p>
                </div>
            """
        }
        
        section {
            def result = downloadAndInstall()
            if (result.success) {
                def hubIP = location.hubs[0].getDataValue("localIP") ?: "IP-DO-SEU-HUB"
                paragraph """
                    <div class="lumina-card" style="border-left-color: #28a745;">
                        <h3>✅ Instalação Concluída!</h3>
                        <p>${result.message}</p>
                        <hr>
                        <strong>Próximos Passos:</strong>
                        <ol>
                            <li>Acesse seu dashboard em:<br>
                                <a href="http://${hubIP}/local/${LUMINA_FILENAME}" target="_blank">
                                    http://${hubIP}/local/${LUMINA_FILENAME}
                                </a>
                            </li>
                            <li>Complete o processo de ativação</li>
                            <li>Configure a conexão com o Maker API</li>
                        </ol>
                    </div>
                """
            } else {
                paragraph """
                    <div class="lumina-card" style="border-left-color: #dc3545;">
                        <h3>❌ Falha na Instalação</h3>
                        <p>${result.message}</p>
                        <p>Por favor, tente novamente ou entre em contato com o suporte.</p>
                    </div>
                """
            }
        }
        
        section {
            href "mainPage", title: "← Voltar ao Menu", description: ""
        }
    }
}

def updatePage() {
    dynamicPage(name: "updatePage", title: "Atualizar Lumina Dashboard", install: false, uninstall: false) {
        section {
            paragraph """
                <div class="lumina-card">
                    <h3>🔄 Verificando Atualizações</h3>
                    <p>Baixando versão mais recente do GitHub...</p>
                </div>
            """
        }
        
        section {
            def result = downloadAndInstall()
            if (result.success) {
                paragraph """
                    <div class="lumina-card" style="border-left-color: #28a745;">
                        <h3>✅ Atualização Concluída!</h3>
                        <p>${result.message}</p>
                        <p>Atualize seu dashboard no navegador para ver as mudanças.</p>
                    </div>
                """
            } else {
                paragraph """
                    <div class="lumina-card" style="border-left-color: #dc3545;">
                        <h3>❌ Falha na Atualização</h3>
                        <p>${result.message}</p>
                    </div>
                """
            }
        }
        
        section {
            href "mainPage", title: "← Voltar ao Menu", description: ""
        }
    }
}

def setupSyncPage() {
    dynamicPage(name: "setupSyncPage", title: "Configurar Auto-Sync", install: false, uninstall: false) {
        section {
            paragraph """
                <div class="lumina-card">
                    <h3>🔧 Hub Variables para Auto-Sync</h3>
                    <p>O Lumina usa Hub Variables para salvar e restaurar automaticamente sua configuração.</p>
                    <p>Isso permite que suas configurações persistam mesmo ao atualizar o dashboard.</p>
                </div>
            """
        }
        
        section {
            // Executar setup e mostrar resultados
            def result = checkAndCreateVariables()
            
            if (result.allExist) {
                paragraph """
                    <div class="lumina-card" style="border-left-color: #28a745;">
                        <h3>✅ Auto-Sync Pronto!</h3>
                        <p>Todas as Hub Variables estão configuradas corretamente.</p>
                        <hr>
                        <strong>Variáveis:</strong>
                        <ul>
                            ${result.variables.collect { "<li>${it.name}: ${it.status}</li>" }.join("")}
                        </ul>
                    </div>
                """
            } else if (result.created > 0) {
                paragraph """
                    <div class="lumina-card" style="border-left-color: #ffc107;">
                        <h3>⚠️ Algumas variáveis criadas</h3>
                        <p>${result.created} variáveis foram criadas.</p>
                        <hr>
                        <strong>Variáveis:</strong>
                        <ul>
                            ${result.variables.collect { "<li>${it.name}: ${it.status}</li>" }.join("")}
                        </ul>
                    </div>
                """
            } else {
                // Nenhuma criada automaticamente - mostrar instruções manuais
                def missing = result.variables.findAll { it.status.contains("Falha") || it.status.contains("Erro") }
                paragraph """
                    <div class="lumina-card" style="border-left-color: #dc3545;">
                        <h3>📝 Criação Manual Necessária</h3>
                        <p>O Hubitat não permite criar Hub Variables automaticamente via apps.</p>
                        <p><strong>Crie manualmente em:</strong> Settings → Hub Variables → Add Variable</p>
                        <hr>
                        <strong>Variáveis necessárias (Type: String):</strong>
                        <ul>
                            <li><code>LuminaData</code> (metadados)</li>
                            <li><code>LuminaData_0</code> até <code>LuminaData_14</code> (15 chunks)</li>
                        </ul>
                        <p style="font-size:10px; color:#666; margin-top:8px;">
                            Total: 16 variáveis. Suporta configs de até ~15KB.
                        </p>
                        <hr>
                        <p style="font-size:12px;">⏱️ Leva ~30 segundos. Depois volte aqui para verificar.</p>
                    </div>
                """
            }
        }
        
        section("📋 Como funciona") {
            paragraph """
                <div class="lumina-card">
                    <ol>
                        <li><strong>Auto-Save:</strong> Quando você altera configurações no Lumina, ele aguarda 5 segundos e salva no Hubitat</li>
                        <li><strong>Auto-Load:</strong> Quando você abre o Lumina, ele carrega automaticamente sua configuração salva</li>
                        <li><strong>Armazenamento em Chunks:</strong> Configurações grandes são divididas em múltiplas variáveis (máx 5 chunks)</li>
                    </ol>
                    <hr>
                    <p><em>As variáveis ficam em: Settings → Hub Variables</em></p>
                </div>
            """
        }
        
        section {
            href "mainPage", title: "← Voltar ao Menu", description: ""
        }
    }
}

def checkAndCreateVariables() {
    def variables = [
        "LuminaData",
        "LuminaData_0", "LuminaData_1", "LuminaData_2", "LuminaData_3", "LuminaData_4",
        "LuminaData_5", "LuminaData_6", "LuminaData_7", "LuminaData_8", "LuminaData_9",
        "LuminaData_10", "LuminaData_11", "LuminaData_12", "LuminaData_13", "LuminaData_14"
    ]
    
    def results = []
    def created = 0
    def allExist = true
    
    // Obter lista de variáveis existentes
    def existingVars = getAllGlobalVars()?.keySet() ?: []
    
    variables.each { varName ->
        def exists = existingVars.contains(varName)
        
        if (!exists) {
            allExist = false
            def success = createHubVariable(varName)
            if (success) {
                results << [name: varName, status: "✅ Criada"]
                created++
            } else {
                results << [name: varName, status: "❌ Falha ao criar"]
            }
        } else {
            results << [name: varName, status: "✅ Existe"]
        }
    }
    
    return [allExist: allExist, created: created, variables: results]
}

def createHubVariable(String varName) {
    // Hubitat não expõe API para criar Hub Variables de dentro de apps
    // Usuário precisa criar manualmente em Settings → Hub Variables
    return false
}

def generateLinkPage() {
    dynamicPage(name: "generateLinkPage", title: "Gerar Link de Acesso", install: false, uninstall: false) {
        section {
            paragraph """
                <div class="lumina-card">
                    <h3>🔗 Link de Acesso Automático</h3>
                    <p>Gere um link que configura o Lumina automaticamente!</p>
                    <p>Ao abrir este link, o dashboard já estará conectado ao Hubitat.</p>
                </div>
            """
        }
        
        section("📋 Dados do Maker API") {
            paragraph """
                <div class="lumina-card" style="border-left-color: #17a2b8;">
                    <strong>Onde encontrar:</strong><br>
                    Apps → Maker API → Copie o <strong>App ID</strong> (número na URL) e o <strong>Access Token</strong>
                </div>
            """
            input "makerAppId", "text", title: "App ID do Maker API", required: true, submitOnChange: true
            input "makerToken", "text", title: "Access Token do Maker API", required: true, submitOnChange: true
        }
        
        section("🔑 Licença (Opcional)") {
            paragraph "<p class='text-muted'>Se já possui uma licença ativada, inclua aqui para ativar automaticamente.</p>"
            input "luminaLicense", "text", title: "Chave de Licença (XXXX-XXXX-XXXX-XXXX)", required: false, submitOnChange: true
        }
        
        if (makerAppId && makerToken) {
            section("✨ Seu Link de Acesso") {
                def link = generateAccessLink()
                def installedFile = findInstalledLumina()
                def fileName = installedFile?.name ?: LUMINA_FILENAME
                
                paragraph """
                    <div class="lumina-card" style="border-left-color: #28a745;">
                        <h3>✅ Link Gerado!</h3>
                        <p>Copie e abra em qualquer dispositivo:</p>
                        <hr>
                        <textarea readonly style="width:100%; height:80px; font-size:11px; padding:10px; border:1px solid #ccc; border-radius:5px; background:#f5f5f5;" onclick="this.select()">${link}</textarea>
                        <hr>
                        <p style="font-size:11px; color:#666;">
                            📱 <strong>Dica:</strong> Envie este link por WhatsApp ou email para seus clientes!
                        </p>
                    </div>
                """
                
                if (luminaLicense) {
                    paragraph """
                        <div class="lumina-card" style="border-left-color: #ffc107;">
                            🔑 <strong>Licença incluída!</strong> O dashboard será ativado automaticamente.
                        </div>
                    """
                }
            }
        }
        
        section {
            href "mainPage", title: "← Voltar ao Menu", description: ""
        }
    }
}

def generateAccessLink() {
    def hubIP = location.hubs[0].getDataValue("localIP") ?: "192.168.1.1"
    def installedFile = findInstalledLumina()
    def fileName = installedFile?.name ?: LUMINA_FILENAME
    
    def configMap = [
        hubIp: hubIP,
        appId: makerAppId,
        accessToken: makerToken
    ]
    
    if (luminaLicense) {
        configMap.license = luminaLicense
    }
    
    def jsonConfig = groovy.json.JsonOutput.toJson(configMap)
    def base64Config = jsonConfig.bytes.encodeBase64().toString()
    
    return "http://${hubIP}/local/${fileName}?config=${base64Config}"
}

def aboutPage() {
    dynamicPage(name: "aboutPage", title: "Sobre o Lumina", install: false, uninstall: false) {
        section {
            paragraph """
                <div class="lumina-header">
                    <h1 class="lumina-title">LUMINA</h1>
                    <p class="lumina-subtitle">DASHBOARD PROFISSIONAL PARA HUBITAT</p>
                </div>
            """
        }
        
        section("📋 Informações de Licença") {
            paragraph """
                <div class="lumina-card">
                    <p><strong>Lumina Dashboard é um software comercial.</strong></p>
                    <p>Uma licença válida é necessária para cada hub Hubitat.</p>
                    <hr>
                    <strong>Para ativar:</strong>
                    <ol>
                        <li>Abra o dashboard no seu navegador</li>
                        <li>Copie seu ID de Instalação</li>
                        <li>Envie via WhatsApp com comprovante de compra</li>
                        <li>Receba sua chave de ativação</li>
                    </ol>
                    <hr>
                    <p>📱 <strong>WhatsApp:</strong> +55 47 99635-7469</p>
                    <p>🌐 <strong>Website:</strong> <a href="https://luminadashboards.dev.br" target="_blank">luminadashboards.dev.br</a></p>
                </div>
            """
        }
        
        section("🏢 Desenvolvedor") {
            paragraph """
                <div class="lumina-card">
                    <strong>Domótika Ambientes Inteligentes LTDA</strong><br>
                    Balneário Camboriú - SC, Brasil<br><br>
                    <a href="https://domotika.com.br" target="_blank">domotika.com.br</a>
                </div>
            """
        }
        
        section {
            href "mainPage", title: "← Voltar ao Menu", description: ""
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
//  FUNÇÕES AUXILIARES
// ═══════════════════════════════════════════════════════════════════════════

def isLuminaInstalled() {
    try {
        def installed = findInstalledLumina()
        return installed != null
    } catch (e) {
        log.error "Erro ao verificar instalação: ${e.message}"
        return false
    }
}

def findInstalledLumina() {
    try {
        def files = listFiles()
        // Busca qualquer arquivo Lumina (v1.5, v1.6-beta, etc)
        def luminaFile = files?.find { 
            it.name?.startsWith("LuminaHighline") || 
            it.name?.startsWith("Lumina_") ||
            it.name?.toLowerCase()?.contains("lumina") && it.name?.endsWith(".html")
        }
        return luminaFile
    } catch (e) {
        log.error "Erro ao buscar Lumina: ${e.message}"
        return null
    }
}

def getInstalledVersion() {
    def file = findInstalledLumina()
    if (!file) return null
    
    def name = file.name
    // Extrai versão do nome do arquivo (ex: LuminaHighline_v1.6-beta.html -> v1.6-beta)
    def match = name =~ /[vV]?(\d+\.\d+[^.]*)/
    if (match.find()) {
        return "v${match.group(1)}"
    }
    return name.replace(".html", "")
}

def listFiles() {
    try {
        def params = [
            uri: "http://127.0.0.1:8080",
            path: "/hub/fileManager/json",
            contentType: "application/json",
            timeout: 30
        ]
        def files = []
        httpGet(params) { resp ->
            if (resp.status == 200) {
                files = resp.data
            }
        }
        return files
    } catch (e) {
        log.error "Erro ao listar arquivos: ${e.message}"
        return []
    }
}

def downloadAndInstall() {
    try {
        log.info "Baixando Lumina Dashboard do GitHub..."
        
        // Download HTML do GitHub
        def params = [
            uri: GITHUB_RAW_URL,
            contentType: "text/plain",
            timeout: 60
        ]
        
        def htmlContent = ""
        httpGet(params) { resp ->
            if (resp.status == 200) {
                htmlContent = resp.data.text
            } else {
                throw new Exception("GitHub retornou status ${resp.status}")
            }
        }
        
        if (!htmlContent || htmlContent.length() < 1000) {
            return [success: false, message: "Conteúdo baixado parece inválido"]
        }
        
        log.info "Baixou ${htmlContent.length()} bytes, salvando no File Manager..."
        
        // Upload para File Manager
        def uploadResult = uploadFile(LUMINA_FILENAME, htmlContent)
        
        if (uploadResult) {
            log.info "Lumina Dashboard instalado com sucesso!"
            return [success: true, message: "Versão ${LUMINA_VERSION} instalada com sucesso! (${htmlContent.length()} bytes)"]
        } else {
            return [success: false, message: "Falha ao salvar arquivo no File Manager"]
        }
        
    } catch (e) {
        log.error "Falha na instalação: ${e.message}"
        return [success: false, message: "Erro: ${e.message}"]
    }
}

def uploadFile(String filename, String content) {
    try {
        def params = [
            uri: "http://127.0.0.1:8080",
            path: "/hub/fileManager/upload",
            contentType: "multipart/form-data",
            body: [
                file: [
                    name: filename,
                    contentType: "text/html",
                    content: content.bytes
                ]
            ],
            timeout: 60
        ]
        
        // Método alternativo usando byte upload
        uploadHubFile(filename, content.getBytes("UTF-8"))
        return true
        
    } catch (e) {
        log.error "Erro ao fazer upload: ${e.message}"
        
        // Fallback: tentar método alternativo
        try {
            uploadHubFile(filename, content.getBytes("UTF-8"))
            return true
        } catch (e2) {
            log.error "Upload alternativo também falhou: ${e2.message}"
            return false
        }
    }
}

def findMakerAPI() {
    // Método 1: Buscar por child apps
    try {
        def apps = getChildApps()
        def maker = apps?.find { it.name?.toLowerCase()?.contains("maker") }
        if (maker) return maker
    } catch (e) {
        log.debug "getChildApps não disponível: ${e.message}"
    }
    
    // Método 2: Tentar getAllChildApps
    try {
        def allApps = getAllChildApps()
        def maker = allApps?.find { it.name?.toLowerCase()?.contains("maker") }
        if (maker) return maker
    } catch (e) {
        log.debug "getAllChildApps não disponível: ${e.message}"
    }
    
    // Método 3: Verificar via HTTP se Maker API está acessível
    try {
        def params = [
            uri: "http://127.0.0.1:8080",
            path: "/apps/api",
            contentType: "application/json",
            timeout: 5
        ]
        httpGet(params) { resp ->
            if (resp.status == 200) {
                // Maker API existe (retorna lista de apps)
                return [id: "detectado", name: "Maker API"]
            }
        }
    } catch (e) {
        log.debug "Não foi possível verificar Maker API via HTTP"
    }
    
    return null
}

// ═══════════════════════════════════════════════════════════════════════════
//  CICLO DE VIDA
// ═══════════════════════════════════════════════════════════════════════════

def installed() {
    log.info "Lumina Installer instalado"
    initialize()
    setupHubVariables()
}

def updated() {
    log.info "Lumina Installer atualizado"
    initialize()
}

def initialize() {
    log.info "Lumina Installer inicializado - Versão ${LUMINA_VERSION}"
}

def uninstalled() {
    log.info "Lumina Installer desinstalado"
    // Nota: Não deletamos o arquivo HTML para preservar a instalação do usuário
}

// ═══════════════════════════════════════════════════════════════════════════
//  AUTO-SYNC HUB VARIABLES
// ═══════════════════════════════════════════════════════════════════════════

def setupHubVariables() {
    log.info "Configurando Hub Variables para Lumina Auto-Sync..."
    
    def variables = [
        "LuminaData",
        "LuminaData_0", "LuminaData_1", "LuminaData_2", "LuminaData_3", "LuminaData_4",
        "LuminaData_5", "LuminaData_6", "LuminaData_7", "LuminaData_8", "LuminaData_9",
        "LuminaData_10", "LuminaData_11", "LuminaData_12", "LuminaData_13", "LuminaData_14"
    ]
    
    // Obter lista de variáveis existentes
    def existingVars = getAllGlobalVars()?.keySet() ?: []
    
    def created = 0
    variables.each { varName ->
        if (!existingVars.contains(varName)) {
            if (createHubVariable(varName)) {
                created++
                log.info "Hub Variable criada: ${varName}"
            } else {
                log.warn "Não foi possível criar variável ${varName}"
            }
        }
    }
    
    if (created > 0) {
        log.info "Lumina Auto-Sync: ${created} Hub Variables criadas"
    } else {
        log.info "Lumina Auto-Sync: Todas as Hub Variables já existem"
    }
}
