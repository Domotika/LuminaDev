/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  LUMINA DASHBOARD INSTALLER
 *  Professional Dashboard for Hubitat Elevation
 * ═══════════════════════════════════════════════════════════════════════════
 *  
 *  Copyright © 2024-2026 Domótika Automação Residencial LTDA
 *  https://luminadashboards.dev.br
 *  
 *  This installer downloads and manages the Lumina Dashboard HTML file.
 *  The dashboard requires a valid license for activation.
 *  
 * ═══════════════════════════════════════════════════════════════════════════
 */

definition(
    name: "Lumina Dashboard Installer",
    namespace: "domotika",
    author: "Domótika",
    description: "Installs and updates Lumina Dashboard - Professional glassmorphism dashboard for Hubitat",
    category: "Convenience",
    iconUrl: "",
    iconX2Url: "",
    iconX3Url: "",
    documentationLink: "https://luminadashboards.dev.br",
    importUrl: "https://raw.githubusercontent.com/Domotika/LuminaDev/main/hubitat-apps/LuminaInstaller.groovy"
)

preferences {
    page(name: "mainPage")
    page(name: "installPage")
    page(name: "updatePage")
    page(name: "setupSyncPage")
    page(name: "aboutPage")
}

// ═══════════════════════════════════════════════════════════════════════════
//  CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

@groovy.transform.Field static final String LUMINA_VERSION = "1.5.6"
@groovy.transform.Field static final String LUMINA_FILENAME = "LuminaHighline_v1.5.html"
@groovy.transform.Field static final String GITHUB_RAW_URL = "https://raw.githubusercontent.com/Domotika/LuminaDev/main/LuminaHighline_v1.5.html"
@groovy.transform.Field static final String GITHUB_VERSION_URL = "https://raw.githubusercontent.com/Domotika/LuminaDev/main/version.txt"

// ═══════════════════════════════════════════════════════════════════════════
//  PAGES
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
                    <p class="lumina-subtitle">PROFESSIONAL DASHBOARD FOR HUBITAT</p>
                </div>
            """
        }
        
        // Status Section
        section("📊 Status") {
            def installed = isLuminaInstalled()
            def statusClass = installed ? "status-installed" : "status-not-installed"
            def statusText = installed ? "INSTALLED" : "NOT INSTALLED"
            
            paragraph """
                <div class="lumina-card">
                    <strong>Dashboard Status:</strong> 
                    <span class="lumina-status ${statusClass}">${statusText}</span>
                    <br><br>
                    <strong>Installer Version:</strong> ${LUMINA_VERSION}<br>
                    <strong>File:</strong> ${LUMINA_FILENAME}
                </div>
            """
            
            if (installed) {
                def hubIP = location.hubs[0].getDataValue("localIP") ?: "YOUR-HUB-IP"
                paragraph """
                    <div class="lumina-card" style="border-left-color: #28a745;">
                        <strong>🔗 Access your dashboard:</strong><br>
                        <a href="http://${hubIP}/local/${LUMINA_FILENAME}" target="_blank" style="font-size: 14px; color: #0f3460;">
                            http://${hubIP}/local/${LUMINA_FILENAME}
                        </a>
                    </div>
                """
            }
        }
        
        // Actions Section
        section("⚡ Actions") {
            if (!isLuminaInstalled()) {
                href "installPage", title: "📥 Install Lumina Dashboard", description: "Download and install the dashboard", style: "external"
            } else {
                href "updatePage", title: "🔄 Check for Updates", description: "Download latest version", style: "external"
            }
            href "setupSyncPage", title: "🔧 Setup Auto-Sync", description: "Create Hub Variables for cloud sync"
            href "aboutPage", title: "ℹ️ About & License", description: "Information and support"
        }
        
        // Maker API Check
        section("🔌 Maker API") {
            def makerApp = findMakerAPI()
            if (makerApp) {
                paragraph """
                    <div class="lumina-card" style="border-left-color: #28a745;">
                        ✅ <strong>Maker API detected!</strong><br>
                        App ID: ${makerApp.id}
                    </div>
                """
            } else {
                paragraph """
                    <div class="lumina-card" style="border-left-color: #ffc107;">
                        ⚠️ <strong>Maker API not found</strong><br>
                        Please install Maker API from Apps → Add Built-in App → Maker API
                    </div>
                """
            }
        }
    }
}

def installPage() {
    dynamicPage(name: "installPage", title: "Install Lumina Dashboard", install: false, uninstall: false) {
        section {
            paragraph """
                <div class="lumina-card">
                    <h3>📥 Installing Lumina Dashboard</h3>
                    <p>This will download the dashboard from GitHub and save it to your hub's File Manager.</p>
                </div>
            """
        }
        
        section {
            def result = downloadAndInstall()
            if (result.success) {
                def hubIP = location.hubs[0].getDataValue("localIP") ?: "YOUR-HUB-IP"
                paragraph """
                    <div class="lumina-card" style="border-left-color: #28a745;">
                        <h3>✅ Installation Complete!</h3>
                        <p>${result.message}</p>
                        <hr>
                        <strong>Next Steps:</strong>
                        <ol>
                            <li>Access your dashboard at:<br>
                                <a href="http://${hubIP}/local/${LUMINA_FILENAME}" target="_blank">
                                    http://${hubIP}/local/${LUMINA_FILENAME}
                                </a>
                            </li>
                            <li>Complete the activation process</li>
                            <li>Configure your Maker API connection</li>
                        </ol>
                    </div>
                """
            } else {
                paragraph """
                    <div class="lumina-card" style="border-left-color: #dc3545;">
                        <h3>❌ Installation Failed</h3>
                        <p>${result.message}</p>
                        <p>Please try again or contact support.</p>
                    </div>
                """
            }
        }
        
        section {
            href "mainPage", title: "← Back to Main", description: ""
        }
    }
}

def updatePage() {
    dynamicPage(name: "updatePage", title: "Update Lumina Dashboard", install: false, uninstall: false) {
        section {
            paragraph """
                <div class="lumina-card">
                    <h3>🔄 Checking for Updates</h3>
                    <p>Downloading latest version from GitHub...</p>
                </div>
            """
        }
        
        section {
            def result = downloadAndInstall()
            if (result.success) {
                paragraph """
                    <div class="lumina-card" style="border-left-color: #28a745;">
                        <h3>✅ Update Complete!</h3>
                        <p>${result.message}</p>
                        <p>Refresh your dashboard to see the changes.</p>
                    </div>
                """
            } else {
                paragraph """
                    <div class="lumina-card" style="border-left-color: #dc3545;">
                        <h3>❌ Update Failed</h3>
                        <p>${result.message}</p>
                    </div>
                """
            }
        }
        
        section {
            href "mainPage", title: "← Back to Main", description: ""
        }
    }
}

def setupSyncPage() {
    dynamicPage(name: "setupSyncPage", title: "Setup Auto-Sync", install: false, uninstall: false) {
        section {
            paragraph """
                <div class="lumina-card">
                    <h3>🔧 Auto-Sync Hub Variables</h3>
                    <p>Lumina uses Hub Variables to automatically save and restore your configuration.</p>
                    <p>This allows your settings to persist even when updating the dashboard.</p>
                </div>
            """
        }
        
        section {
            // Run setup and show results
            def result = checkAndCreateVariables()
            
            if (result.allExist) {
                paragraph """
                    <div class="lumina-card" style="border-left-color: #28a745;">
                        <h3>✅ Auto-Sync Ready!</h3>
                        <p>All Hub Variables are configured correctly.</p>
                        <hr>
                        <strong>Variables:</strong>
                        <ul>
                            ${result.variables.collect { "<li>${it.name}: ${it.status}</li>" }.join("")}
                        </ul>
                    </div>
                """
            } else {
                paragraph """
                    <div class="lumina-card" style="border-left-color: #ffc107;">
                        <h3>⚠️ Creating Variables...</h3>
                        <p>${result.created} variables were created.</p>
                        <hr>
                        <strong>Variables:</strong>
                        <ul>
                            ${result.variables.collect { "<li>${it.name}: ${it.status}</li>" }.join("")}
                        </ul>
                    </div>
                """
            }
        }
        
        section("📋 How it works") {
            paragraph """
                <div class="lumina-card">
                    <ol>
                        <li><strong>Auto-Save:</strong> When you change settings in Lumina, it waits 5 seconds then saves to Hubitat</li>
                        <li><strong>Auto-Load:</strong> When you open Lumina, it automatically loads your saved configuration</li>
                        <li><strong>Chunked Storage:</strong> Large configs are split into multiple variables (max 5 chunks)</li>
                    </ol>
                    <hr>
                    <p><em>Variables are stored in: Settings → Hub Variables</em></p>
                </div>
            """
        }
        
        section {
            href "mainPage", title: "← Back to Main", description: ""
        }
    }
}

def checkAndCreateVariables() {
    def variables = [
        "LuminaConfig",
        "LuminaConfig_0",
        "LuminaConfig_1", 
        "LuminaConfig_2",
        "LuminaConfig_3",
        "LuminaConfig_4"
    ]
    
    def results = []
    def created = 0
    def allExist = true
    
    variables.each { varName ->
        def exists = false
        try {
            def value = getGlobalVar(varName)
            exists = (value != null)
        } catch (e) {
            exists = false
        }
        
        if (!exists) {
            allExist = false
            try {
                setGlobalVar(varName, "")
                results << [name: varName, status: "✅ Created"]
                created++
            } catch (e) {
                results << [name: varName, status: "❌ Error: ${e.message}"]
            }
        } else {
            results << [name: varName, status: "✅ Exists"]
        }
    }
    
    return [allExist: allExist, created: created, variables: results]
}

def aboutPage() {
    dynamicPage(name: "aboutPage", title: "About Lumina", install: false, uninstall: false) {
        section {
            paragraph """
                <div class="lumina-header">
                    <h1 class="lumina-title">LUMINA</h1>
                    <p class="lumina-subtitle">PROFESSIONAL DASHBOARD FOR HUBITAT</p>
                </div>
            """
        }
        
        section("📋 License Information") {
            paragraph """
                <div class="lumina-card">
                    <p><strong>Lumina Dashboard is commercial software.</strong></p>
                    <p>A valid license is required for each Hubitat hub.</p>
                    <hr>
                    <strong>To activate:</strong>
                    <ol>
                        <li>Open the dashboard in your browser</li>
                        <li>Copy your Installation ID</li>
                        <li>Send via WhatsApp with proof of purchase</li>
                        <li>Receive your activation key</li>
                    </ol>
                    <hr>
                    <p>📱 <strong>WhatsApp:</strong> +55 47 99635-7469</p>
                    <p>🌐 <strong>Website:</strong> <a href="https://luminadashboards.dev.br" target="_blank">luminadashboards.dev.br</a></p>
                </div>
            """
        }
        
        section("🏢 Developer") {
            paragraph """
                <div class="lumina-card">
                    <strong>Domótika Automação Residencial LTDA</strong><br>
                    Balneário Camboriú - SC, Brazil<br><br>
                    <a href="https://domotika.com.br" target="_blank">domotika.com.br</a>
                </div>
            """
        }
        
        section {
            href "mainPage", title: "← Back to Main", description: ""
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
//  HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

def isLuminaInstalled() {
    try {
        def files = listFiles()
        return files?.any { it.name == LUMINA_FILENAME }
    } catch (e) {
        log.error "Error checking installation: ${e.message}"
        return false
    }
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
        log.error "Error listing files: ${e.message}"
        return []
    }
}

def downloadAndInstall() {
    try {
        log.info "Downloading Lumina Dashboard from GitHub..."
        
        // Download HTML from GitHub
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
                throw new Exception("GitHub returned status ${resp.status}")
            }
        }
        
        if (!htmlContent || htmlContent.length() < 1000) {
            return [success: false, message: "Downloaded content appears invalid"]
        }
        
        log.info "Downloaded ${htmlContent.length()} bytes, saving to File Manager..."
        
        // Upload to File Manager
        def uploadResult = uploadFile(LUMINA_FILENAME, htmlContent)
        
        if (uploadResult) {
            log.info "Lumina Dashboard installed successfully!"
            return [success: true, message: "Version ${LUMINA_VERSION} installed successfully! (${htmlContent.length()} bytes)"]
        } else {
            return [success: false, message: "Failed to save file to File Manager"]
        }
        
    } catch (e) {
        log.error "Installation failed: ${e.message}"
        return [success: false, message: "Error: ${e.message}"]
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
        
        // Alternative method using byte upload
        uploadHubFile(filename, content.getBytes("UTF-8"))
        return true
        
    } catch (e) {
        log.error "Error uploading file: ${e.message}"
        
        // Fallback: try alternative upload method
        try {
            uploadHubFile(filename, content.getBytes("UTF-8"))
            return true
        } catch (e2) {
            log.error "Fallback upload also failed: ${e2.message}"
            return false
        }
    }
}

def findMakerAPI() {
    try {
        def apps = getChildApps()
        return apps?.find { it.name?.toLowerCase()?.contains("maker") }
    } catch (e) {
        // Try alternative method
        try {
            return getAllChildApps()?.find { it.name?.toLowerCase()?.contains("maker") }
        } catch (e2) {
            return null
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
//  LIFECYCLE
// ═══════════════════════════════════════════════════════════════════════════

def installed() {
    log.info "Lumina Installer installed"
    initialize()
    setupHubVariables()
}

def updated() {
    log.info "Lumina Installer updated"
    initialize()
}

def initialize() {
    log.info "Lumina Installer initialized - Version ${LUMINA_VERSION}"
}

// ═══════════════════════════════════════════════════════════════════════════
//  AUTO-SYNC HUB VARIABLES
// ═══════════════════════════════════════════════════════════════════════════

def setupHubVariables() {
    log.info "Setting up Hub Variables for Lumina Auto-Sync..."
    
    def variables = [
        "LuminaConfig",
        "LuminaConfig_0",
        "LuminaConfig_1", 
        "LuminaConfig_2",
        "LuminaConfig_3",
        "LuminaConfig_4"
    ]
    
    def created = 0
    variables.each { varName ->
        try {
            def existing = getGlobalVar(varName)
            if (existing == null) {
                setGlobalVar(varName, "")
                created++
                log.info "Created Hub Variable: ${varName}"
            }
        } catch (e) {
            // Variable doesn't exist, create it
            try {
                setGlobalVar(varName, "")
                created++
                log.info "Created Hub Variable: ${varName}"
            } catch (e2) {
                log.warn "Could not create variable ${varName}: ${e2.message}"
            }
        }
    }
    
    if (created > 0) {
        log.info "Lumina Auto-Sync: Created ${created} Hub Variables"
    } else {
        log.info "Lumina Auto-Sync: All Hub Variables already exist"
    }
}

def uninstalled() {
    log.info "Lumina Installer uninstalled"
    // Note: We don't delete the HTML file to preserve user's installation
}
