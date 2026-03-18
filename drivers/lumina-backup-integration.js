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
                    <button onclick="this.saveBackup()">💾 Salvar Backup</button>
                    <button onclick="this.listBackups()">📋 Listar Backups</button>
                    <button onclick="this.showInfo()">ℹ️ Informações</button>
                </div>
                <div id="backup-content"></div>
                <button onclick="this.close()" class="close-btn">❌ Fechar</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Adiciona métodos ao modal
        modal.saveBackup = () => this.saveBackup();
        modal.listBackups = () => this.listBackups();
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
    min-width: 400px;
    max-width: 600px;
}

.backup-actions {
    display: flex;
    gap: 10px;
    margin: 15px 0;
}

.backup-actions button {
    flex: 1;
    padding: 10px;
    border: none;
    border-radius: 5px;
    background: #007bff;
    color: white;
    cursor: pointer;
}

.backup-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px;
    border-bottom: 1px solid #eee;
}

.backup-btn {
    padding: 8px 15px;
    background: #28a745;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
}
`;

// Adiciona CSS
const style = document.createElement('style');
style.textContent = backupCSS;
document.head.appendChild(style);

// Exporta para uso
window.LuminaBackupService = LuminaBackupService;
window.LuminaBackupUI = LuminaBackupUI;