/**
 * Integração Lumina Dashboard - Backup Driver
 * 
 * Adicione este código ao dashboard para habilitar backup via driver
 */

// Adicionar ao hubitatService.ts ou arquivo similar

class LuminaBackupService {
    constructor(hubitatService) {
        this.hubitat = hubitatService;
        this.backupDriverId = null;
        this.init();
    }

    async init() {
        // Procura driver de backup
        await this.findBackupDriver();
    }

    async findBackupDriver() {
        try {
            const devices = await this.hubitat.getDevices();
            const backupDriver = devices.find(d => 
                d.name?.toLowerCase().includes('lumina backup') ||
                d.label?.toLowerCase().includes('lumina backup')
            );
            
            if (backupDriver) {
                this.backupDriverId = backupDriver.id;
                console.log('✅ Lumina Backup Driver encontrado:', backupDriver.id);
            } else {
                console.warn('⚠️ Lumina Backup Driver não encontrado');
            }
        } catch (error) {
            console.error('Erro ao procurar backup driver:', error);
        }
    }

    async saveConfigBackup(config, filename = null) {
        if (!this.backupDriverId) {
            throw new Error('Driver de backup não encontrado');
        }

        try {
            const configJson = JSON.stringify(config, null, 2);
            
            if (filename) {
                await this.hubitat.sendCommand(this.backupDriverId, 'saveBackup', [filename, configJson]);
            } else {
                await this.hubitat.sendCommand(this.backupDriverId, 'saveConfig', [configJson]);
            }
            
            console.log('✅ Backup salvo com sucesso');
            return true;
        } catch (error) {
            console.error('Erro ao salvar backup:', error);
            throw error;
        }
    }

    async saveConnectionData(hubIp, makerToken, cloudUrl = '') {
        if (!this.backupDriverId) {
            throw new Error('Driver de backup não encontrado');
        }

        try {
            await this.hubitat.sendCommand(this.backupDriverId, 'saveConnectionData', [hubIp, makerToken, cloudUrl]);
            console.log('✅ Dados de conexão salvos');
            return true;
        } catch (error) {
            console.error('Erro ao salvar dados de conexão:', error);
            throw error;
        }
    }

    async getConnectionData() {
        if (!this.backupDriverId) {
            throw new Error('Driver de backup não encontrado');
        }

        try {
            await this.hubitat.sendCommand(this.backupDriverId, 'getConnectionData');
            
            // Aguarda processamento
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const device = await this.hubitat.getDevice(this.backupDriverId);
            const status = device.attributes?.status?.value;
            
            if (status === 'connection_ready') {
                // Na implementação real, você recuperaria os dados do device
                return this.getConnectionFromDevice();
            }
            
            return null;
        } catch (error) {
            console.error('Erro ao recuperar dados de conexão:', error);
            return null;
        }
    }

    async saveFullBackup(config) {
        if (!this.backupDriverId) {
            throw new Error('Driver de backup não encontrado');
        }

        try {
            const configJson = JSON.stringify(config, null, 2);
            await this.hubitat.sendCommand(this.backupDriverId, 'saveFullConfig', [configJson]);
            
            console.log('✅ Backup completo salvo (config + conexão)');
            return true;
        } catch (error) {
            console.error('Erro ao salvar backup completo:', error);
            throw error;
        }
    }

    async getFullBackup() {
        if (!this.backupDriverId) {
            throw new Error('Driver de backup não encontrado');
        }

        try {
            await this.hubitat.sendCommand(this.backupDriverId, 'getFullConfig');
            
            // Aguarda processamento
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const device = await this.hubitat.getDevice(this.backupDriverId);
            const status = device.attributes?.status?.value;
            
            if (status === 'full_config_ready') {
                return this.getFullConfigFromDevice();
            }
            
            return null;
        } catch (error) {
            console.error('Erro ao recuperar backup completo:', error);
            return null;
        }
    }

    // Métodos auxiliares para dados de conexão
    async getConnectionFromDevice() {
        // Implementar conforme API do Hubitat
        return {
            hubIp: '192.168.1.100',
            makerToken: 'abc123...',
            cloudUrl: 'https://cloud.hubitat.com',
            savedAt: Date.now()
        };
    }

    async getFullConfigFromDevice() {
        // Implementar conforme API do Hubitat
        return {
            filename: 'lumina-full-2026-03-18_11-30-00.json',
            available: true,
            created: new Date()
        };
    }

    async listBackups() {
        if (!this.backupDriverId) {
            throw new Error('Driver de backup não encontrado');
        }

        try {
            await this.hubitat.sendCommand(this.backupDriverId, 'listBackups');
            
            // Aguarda um pouco para o comando processar
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Pega status do device
            const device = await this.hubitat.getDevice(this.backupDriverId);
            const status = device.attributes?.status?.value;
            
            if (status === 'list_ready') {
                // Na implementação real, você pegaria a lista do atributo do device
                return this.getBackupListFromDevice();
            }
            
            return [];
        } catch (error) {
            console.error('Erro ao listar backups:', error);
            return [];
        }
    }

    async deleteBackup(filename) {
        if (!this.backupDriverId) {
            throw new Error('Driver de backup não encontrado');
        }

        try {
            await this.hubitat.sendCommand(this.backupDriverId, 'deleteBackup', [filename]);
            console.log('✅ Backup deletado:', filename);
            return true;
        } catch (error) {
            console.error('Erro ao deletar backup:', error);
            throw error;
        }
    }

    async getBackupInfo() {
        if (!this.backupDriverId) {
            throw new Error('Driver de backup não encontrado');
        }

        try {
            await this.hubitat.sendCommand(this.backupDriverId, 'getBackupInfo');
            
            // Aguarda processamento
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const device = await this.hubitat.getDevice(this.backupDriverId);
            
            return {
                count: device.attributes?.backupCount?.value || 0,
                lastBackup: device.attributes?.lastBackup?.value || 'Nenhum',
                lastError: device.attributes?.lastError?.value || '',
                status: device.attributes?.status?.value || 'unknown'
            };
        } catch (error) {
            console.error('Erro ao obter info backup:', error);
            return null;
        }
    }

    // Método auxiliar para pegar lista do device (implementar conforme API)
    async getBackupListFromDevice() {
        // Implementação dependente da API específica do Hubitat
        // Por enquanto retorna mock
        return [
            {
                name: 'lumina-config-2026-03-18_11-30-00.json',
                modified: new Date(),
                size: '~5KB'
            }
        ];
    }
}

// Interface para adicionar ao dashboard
class LuminaBackupUI {
    constructor(backupService) {
        this.backupService = backupService;
        this.createBackupButton();
    }

    createBackupButton() {
        // Adiciona botão de backup à interface
        const backupBtn = document.createElement('button');
        backupBtn.innerHTML = '💾 Backup Config';
        backupBtn.className = 'backup-btn';
        backupBtn.onclick = () => this.showBackupModal();
        
        // Adiciona ao toolbar ou área de settings
        const toolbar = document.querySelector('.toolbar') || document.querySelector('.settings');
        if (toolbar) {
            toolbar.appendChild(backupBtn);
        }
    }

    showBackupModal() {
        const modal = document.createElement('div');
        modal.className = 'backup-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>🗄️ Backup Lumina</h3>
                <div class="backup-actions">
                    <button onclick="this.saveBackup()">💾 Backup Config</button>
                    <button onclick="this.saveFullBackup()">📦 Backup Completo</button>
                    <button onclick="this.listBackups()">📋 Listar Backups</button>
                    <button onclick="this.showConnectionModal()">🔗 Dados de Conexão</button>
                    <button onclick="this.showInfo()">ℹ️ Informações</button>
                </div>
                <div id="backup-content"></div>
                <button onclick="this.close()" class="close-btn">❌ Fechar</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Adiciona métodos ao modal
        modal.saveBackup = () => this.saveBackup();
        modal.saveFullBackup = () => this.saveFullBackup();
        modal.listBackups = () => this.listBackups();
        modal.showConnectionModal = () => this.showConnectionModal();
        modal.showInfo = () => this.showInfo();
        modal.close = () => document.body.removeChild(modal);
    }

    async saveBackup() {
        try {
            // Pega configuração atual do dashboard
            const config = this.getCurrentConfig();
            
            const filename = prompt('Nome do backup (opcional):');
            
            await this.backupService.saveConfigBackup(config, filename);
            
            alert('✅ Backup salvo com sucesso!');
        } catch (error) {
            alert(`❌ Erro ao salvar backup: ${error.message}`);
        }
    }

    async listBackups() {
        try {
            const backups = await this.backupService.listBackups();
            
            const content = document.getElementById('backup-content');
            content.innerHTML = `
                <h4>📋 Backups Disponíveis</h4>
                <div class="backup-list">
                    ${backups.map(backup => `
                        <div class="backup-item">
                            <span>${backup.name}</span>
                            <span>${backup.size}</span>
                            <button onclick="this.deleteBackup('${backup.name}')">🗑️</button>
                        </div>
                    `).join('')}
                </div>
            `;
        } catch (error) {
            alert(`❌ Erro ao listar backups: ${error.message}`);
        }
    }

    async showInfo() {
        try {
            const info = await this.backupService.getBackupInfo();
            
            const content = document.getElementById('backup-content');
            content.innerHTML = `
                <h4>ℹ️ Informações de Backup</h4>
                <div class="backup-info">
                    <p><strong>Total de backups:</strong> ${info.count}</p>
                    <p><strong>Último backup:</strong> ${info.lastBackup}</p>
                    <p><strong>Status:</strong> ${info.status}</p>
                    ${info.lastError ? `<p><strong>Último erro:</strong> ${info.lastError}</p>` : ''}
                </div>
            `;
        } catch (error) {
            alert(`❌ Erro ao obter informações: ${error.message}`);
        }
    }

    async saveFullBackup() {
        try {
            // Pega configuração atual do dashboard
            const config = this.getCurrentConfig();
            
            // Salva backup completo (config + dados de conexão)
            await this.backupService.saveFullBackup(config);
            
            alert('✅ Backup completo salvo (configuração + dados de conexão)!');
        } catch (error) {
            alert(`❌ Erro ao salvar backup completo: ${error.message}`);
        }
    }

    showConnectionModal() {
        const content = document.getElementById('backup-content');
        content.innerHTML = `
            <h4>🔗 Dados de Conexão</h4>
            <div class="connection-form">
                <div class="form-group">
                    <label>Hub IP:</label>
                    <input type="text" id="hubIp" placeholder="192.168.1.100" value="${this.getCurrentHubIp()}">
                </div>
                <div class="form-group">
                    <label>Maker API Token:</label>
                    <input type="text" id="makerToken" placeholder="abc123..." value="${this.getCurrentToken()}">
                </div>
                <div class="form-group">
                    <label>Cloud URL (opcional):</label>
                    <input type="text" id="cloudUrl" placeholder="https://cloud.hubitat.com/api/..." value="${this.getCurrentCloudUrl()}">
                </div>
                <div class="connection-actions">
                    <button onclick="this.saveConnectionData()" class="primary-btn">💾 Salvar Conexão</button>
                    <button onclick="this.loadConnectionData()" class="secondary-btn">📥 Carregar Salva</button>
                    <button onclick="this.autoFillConnection()" class="secondary-btn">🔄 Auto-Preencher</button>
                </div>
            </div>
        `;

        // Adiciona métodos ao conteúdo
        const modal = document.querySelector('.backup-modal');
        modal.saveConnectionData = () => this.saveConnectionData();
        modal.loadConnectionData = () => this.loadConnectionData();
        modal.autoFillConnection = () => this.autoFillConnection();
    }

    async saveConnectionData() {
        try {
            const hubIp = document.getElementById('hubIp').value;
            const makerToken = document.getElementById('makerToken').value;
            const cloudUrl = document.getElementById('cloudUrl').value;

            if (!hubIp || !makerToken) {
                alert('❌ Hub IP e Maker Token são obrigatórios!');
                return;
            }

            await this.backupService.saveConnectionData(hubIp, makerToken, cloudUrl);
            alert('✅ Dados de conexão salvos!');
        } catch (error) {
            alert(`❌ Erro ao salvar dados de conexão: ${error.message}`);
        }
    }

    async loadConnectionData() {
        try {
            const connectionData = await this.backupService.getConnectionData();
            
            if (connectionData) {
                document.getElementById('hubIp').value = connectionData.hubIp || '';
                document.getElementById('makerToken').value = connectionData.makerToken || '';
                document.getElementById('cloudUrl').value = connectionData.cloudUrl || '';
                
                alert('✅ Dados de conexão carregados!');
            } else {
                alert('❌ Nenhum dado de conexão encontrado');
            }
        } catch (error) {
            alert(`❌ Erro ao carregar dados de conexão: ${error.message}`);
        }
    }

    autoFillConnection() {
        // Preenche automaticamente com dados atuais da sessão
        const currentHubIp = this.getCurrentHubIp();
        const currentToken = this.getCurrentToken();
        const currentCloudUrl = this.getCurrentCloudUrl();

        document.getElementById('hubIp').value = currentHubIp;
        document.getElementById('makerToken').value = currentToken;
        document.getElementById('cloudUrl').value = currentCloudUrl;

        alert('✅ Dados preenchidos automaticamente!');
    }

    getCurrentConfig() {
        // Implementar conforme estrutura do dashboard
        return {
            rooms: window.rooms || [],
            settings: window.settings || {},
            devices: window.devices || [],
            timestamp: new Date().toISOString(),
            version: '1.6.0'
        };
    }

    // Métodos auxiliares para obter dados atuais
    getCurrentHubIp() {
        // Implementar conforme armazenamento atual
        return localStorage.getItem('lumina_hub_ip') || '';
    }

    getCurrentToken() {
        // Implementar conforme armazenamento atual
        return localStorage.getItem('lumina_maker_token') || '';
    }

    getCurrentCloudUrl() {
        // Implementar conforme armazenamento atual
        return localStorage.getItem('lumina_cloud_url') || '';
    }
}

// CSS para o modal
const backupCSS = `
.backup-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
}

.modal-content {
    background: white;
    padding: 20px;
    border-radius: 10px;
    min-width: 500px;
    max-width: 700px;
    max-height: 80vh;
    overflow-y: auto;
}

.backup-actions {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 10px;
    margin: 15px 0;
}

.backup-actions button {
    padding: 12px 8px;
    border: none;
    border-radius: 6px;
    background: #007bff;
    color: white;
    cursor: pointer;
    font-size: 13px;
    transition: all 0.2s;
}

.backup-actions button:hover {
    background: #0056b3;
    transform: translateY(-1px);
}

.backup-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    border-bottom: 1px solid #eee;
    background: #f8f9fa;
    margin: 5px 0;
    border-radius: 5px;
}

.backup-btn {
    padding: 10px 15px;
    background: #28a745;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    transition: all 0.2s;
}

.backup-btn:hover {
    background: #1e7e34;
    transform: translateY(-1px);
}

.connection-form {
    background: #f8f9fa;
    padding: 15px;
    border-radius: 8px;
    margin: 15px 0;
}

.form-group {
    margin-bottom: 15px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: 500;
    color: #333;
}

.form-group input {
    width: 100%;
    padding: 10px;
    border: 2px solid #ddd;
    border-radius: 5px;
    font-size: 14px;
    transition: border-color 0.2s;
}

.form-group input:focus {
    outline: none;
    border-color: #007bff;
}

.connection-actions {
    display: flex;
    gap: 10px;
    margin-top: 20px;
}

.primary-btn {
    background: #28a745 !important;
    flex: 1;
}

.secondary-btn {
    background: #6c757d !important;
    flex: 1;
}

.close-btn {
    width: 100%;
    margin-top: 20px;
    padding: 12px;
    background: #dc3545;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
}

.close-btn:hover {
    background: #c82333;
}

.backup-info p {
    margin: 8px 0;
    padding: 8px;
    background: #f8f9fa;
    border-left: 4px solid #007bff;
    border-radius: 0 4px 4px 0;
}
`;

// Adiciona CSS
const style = document.createElement('style');
style.textContent = backupCSS;
document.head.appendChild(style);

// Exporta para uso
window.LuminaBackupService = LuminaBackupService;
window.LuminaBackupUI = LuminaBackupUI;