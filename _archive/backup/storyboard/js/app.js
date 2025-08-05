/* Main Application Module */

import { dataManager } from './utils/dataManager.js';
import { showMessage, downloadJSON, loadJSONFile } from './utils/common.js';
import { navigation } from './components/navigation.js';
import { promptManager } from './components/promptManager.js';
import { imageGallery } from './components/imageGallery.js';
import { videoPlayer } from './components/videoPlayer.js';
import { audioPlayer } from './components/audioPlayer.js';

class StoryboardApp {
    constructor() {
        this.initialize();
    }

    /**
     * Initialize application
     */
    async initialize() {
        try {
            // Initialize event listeners
            this.setupEventListeners();
            
            // Load data from storage
            const hasData = dataManager.loadFromStorage();
            
            if (hasData) {
                this.updateUI();
                showMessage('저장된 데이터를 불러왔습니다.', 'success');
            } else {
                // Initialize with empty data
                dataManager.resetData();
                this.updateUI();
            }
            
            // Setup global functions
            this.setupGlobalFunctions();
            
        } catch (error) {
            console.error('Initialization error:', error);
            showMessage('애플리케이션 초기화 중 오류가 발생했습니다.', 'error');
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Import button
        const importBtn = document.getElementById('import-btn');
        if (importBtn) {
            importBtn.addEventListener('click', () => this.importData());
        }

        // Export dropdown
        const exportBtn = document.getElementById('export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', (e) => this.toggleExportDropdown(e));
        }

        // Reset button
        const resetBtn = document.getElementById('reset-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetData());
        }

        // Concept art button
        const conceptArtBtn = document.getElementById('concept-art-btn');
        if (conceptArtBtn) {
            conceptArtBtn.addEventListener('click', () => this.openConceptArt());
        }

        // File input
        const fileInput = document.getElementById('file-input');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            const dropdown = document.getElementById('export-dropdown');
            if (dropdown && !e.target.closest('.dropdown')) {
                dropdown.style.display = 'none';
            }
        });
    }

    /**
     * Setup global functions for legacy support
     */
    setupGlobalFunctions() {
        // Navigation functions
        window.toggleSequence = (sequenceId, event) => {
            navigation.toggleSequence(sequenceId, event);
        };
        
        window.toggleScene = (sceneId, event) => {
            navigation.toggleScene(sceneId, event);
        };
        
        window.selectShot = (shotId) => {
            navigation.selectShot(shotId);
        };
        
        window.selectSequence = (sequenceId) => {
            dataManager.selectedType = 'sequence';
            dataManager.selectedId = sequenceId;
            navigation.setActiveItem('sequence', sequenceId);
            this.showSequenceContent(sequenceId);
        };
        
        window.selectScene = (sceneId) => {
            dataManager.selectedType = 'scene';
            dataManager.selectedId = sceneId;
            dataManager.selectedSceneId = sceneId;
            navigation.setActiveItem('scene', sceneId);
            this.showSceneContent(sceneId);
        };
        
        // Shot content display
        window.showShotContent = (shotId) => {
            this.showShotContent(shotId);
        };
        
        // Export functions
        window.exportData = () => this.exportData();
        window.exportFullData = () => this.exportFullData();
        window.toggleExportDropdown = (event) => this.toggleExportDropdown(event);
        window.hideExportDropdown = () => this.hideExportDropdown();
        
        // Copy to clipboard
        window.copyToClipboard = async (text) => {
            const { copyToClipboard } = await import('./utils/common.js');
            const success = await copyToClipboard(text);
            if (success) {
                showMessage('클립보드에 복사되었습니다.', 'success');
            }
        };
    }

    /**
     * Update UI components
     */
    updateUI() {
        // Update navigation
        navigation.update();
        
        // Update content area based on selection
        if (dataManager.selectedType && dataManager.selectedId) {
            switch (dataManager.selectedType) {
                case 'sequence':
                    this.showSequenceContent(dataManager.selectedId);
                    break;
                case 'scene':
                    this.showSceneContent(dataManager.selectedId);
                    break;
                case 'shot':
                    this.showShotContent(dataManager.selectedId);
                    break;
            }
        }
    }

    /**
     * Import data from JSON file
     */
    async importData() {
        const fileInput = document.getElementById('file-input');
        if (fileInput) {
            fileInput.click();
        }
    }

    /**
     * Handle file selection
     */
    async handleFileSelect(event) {
        try {
            const data = await loadJSONFile(event.target);
            
            if (dataManager.importData(data)) {
                this.updateUI();
                showMessage('데이터를 성공적으로 가져왔습니다.', 'success');
            } else {
                showMessage('데이터 가져오기에 실패했습니다.', 'error');
            }
            
            // Clear file input
            event.target.value = '';
        } catch (error) {
            console.error('File import error:', error);
            showMessage('파일 가져오기 오류: ' + error.message, 'error');
        }
    }

    /**
     * Export data (URL only)
     */
    exportData() {
        const data = dataManager.exportData();
        if (!data) {
            showMessage('내보낼 데이터가 없습니다.', 'warning');
            return;
        }
        
        // Create URL-only version
        const urlOnlyData = this.extractUrlOnlyData(data);
        const filename = dataManager.getProjectFileName();
        
        downloadJSON(urlOnlyData, filename);
        showMessage('URL 데이터를 내보냈습니다.', 'success');
    }

    /**
     * Export full data
     */
    exportFullData() {
        const data = dataManager.exportData();
        if (!data) {
            showMessage('내보낼 데이터가 없습니다.', 'warning');
            return;
        }
        
        const filename = dataManager.getProjectFileName().replace('.json', '_full_backup.json');
        downloadJSON(data, filename);
        showMessage('전체 백업 데이터를 내보냈습니다.', 'success');
    }

    /**
     * Extract URL-only data
     */
    extractUrlOnlyData(fullData) {
        // Deep clone to avoid modifying original
        const urlData = JSON.parse(JSON.stringify(fullData));
        
        // Remove prompt data but keep URLs
        if (urlData.breakdown_data?.shots) {
            urlData.breakdown_data.shots.forEach(shot => {
                // Keep only URLs in audio
                if (shot.audio_prompts) {
                    delete shot.audio_prompts;
                }
                
                // Keep only URLs in content
                if (shot.content) {
                    delete shot.content.dialogue_by_character;
                    delete shot.content.dialogue_sequence;
                    delete shot.content.narration;
                    delete shot.content.sound_effects;
                }
                
                // Remove video prompts
                if (shot.video_prompts) {
                    delete shot.video_prompts;
                }
            });
        }
        
        return urlData;
    }

    /**
     * Reset all data
     */
    resetData() {
        if (confirm('모든 데이터를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
            dataManager.resetData();
            this.updateUI();
            showMessage('데이터가 초기화되었습니다.', 'success');
        }
    }

    /**
     * Open concept art page
     */
    openConceptArt() {
        window.open('your_title_storyboard_v9.4_c.html', '_blank');
    }

    /**
     * Toggle export dropdown
     */
    toggleExportDropdown(event) {
        event.stopPropagation();
        const dropdown = document.getElementById('export-dropdown');
        if (dropdown) {
            dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
        }
    }

    /**
     * Hide export dropdown
     */
    hideExportDropdown() {
        const dropdown = document.getElementById('export-dropdown');
        if (dropdown) {
            dropdown.style.display = 'none';
        }
    }

    /**
     * Show sequence content
     */
    showSequenceContent(sequenceId) {
        const sequence = dataManager.findSequenceById(sequenceId);
        if (!sequence) return;
        
        const contentArea = document.getElementById('content-area');
        if (!contentArea) return;
        
        // Update header
        document.getElementById('content-title').textContent = sequence.title || '제목 없음';
        document.getElementById('content-subtitle').textContent = 'Sequence';
        
        // Create content
        contentArea.innerHTML = `
            <div class="info-section">
                <h3>시퀀스 정보</h3>
                <table class="info-table">
                    <tr>
                        <th>ID</th>
                        <td>${sequence.id}</td>
                    </tr>
                    <tr>
                        <th>제목</th>
                        <td>${sequence.title || '-'}</td>
                    </tr>
                    <tr>
                        <th>기능</th>
                        <td>${sequence.function || '-'}</td>
                    </tr>
                    <tr>
                        <th>설명</th>
                        <td>${sequence.description || '-'}</td>
                    </tr>
                    <tr>
                        <th>예상 시간</th>
                        <td>${sequence.duration_estimate || '-'}</td>
                    </tr>
                </table>
            </div>
            
            <div class="info-section">
                <h3>씬 목록</h3>
                ${this.createSceneList(sequenceId)}
            </div>
        `;
    }

    /**
     * Show scene content
     */
    showSceneContent(sceneId) {
        const scene = dataManager.findSceneById(sceneId);
        if (!scene) return;
        
        const contentArea = document.getElementById('content-area');
        if (!contentArea) return;
        
        // Update header
        document.getElementById('content-title').textContent = scene.title || '제목 없음';
        document.getElementById('content-subtitle').textContent = 'Scene';
        
        // Create content
        contentArea.innerHTML = `
            <div class="info-section">
                <h3>씬 정보</h3>
                <table class="info-table">
                    <tr>
                        <th>ID</th>
                        <td>${scene.id}</td>
                    </tr>
                    <tr>
                        <th>제목</th>
                        <td>${scene.title || '-'}</td>
                    </tr>
                    <tr>
                        <th>설명</th>
                        <td>${scene.description || '-'}</td>
                    </tr>
                </table>
            </div>
            
            <div class="info-section">
                <h3>샷 목록</h3>
                ${this.createShotList(sceneId)}
            </div>
        `;
    }

    /**
     * Show shot content
     */
    showShotContent(shotId) {
        // Use modular version if available
        if (window.showShotContentModular) {
            window.showShotContentModular(shotId);
            return;
        }
        
        // Fallback to basic display
        const shot = dataManager.findShotById(shotId);
        if (!shot) return;
        
        const contentArea = document.getElementById('content-area');
        if (!contentArea) return;
        
        // Update header
        document.getElementById('content-title').textContent = shot.title || '제목 없음';
        document.getElementById('content-subtitle').textContent = `Shot ${shot.id}`;
        
        // Basic content display
        contentArea.innerHTML = `
            <div class="info-section">
                <h3>샷 정보</h3>
                <p>상세 정보를 보려면 탭을 선택하세요.</p>
            </div>
        `;
    }

    /**
     * Create scene list HTML
     */
    createSceneList(sequenceId) {
        const scenes = dataManager.getScenesForSequence(sequenceId);
        
        if (scenes.length === 0) {
            return '<p style="color: #999;">이 시퀀스에 씬이 없습니다.</p>';
        }
        
        let html = '<div class="scene-list">';
        scenes.forEach(scene => {
            const shotCount = dataManager.getShotsForScene(scene.id).length;
            html += `
                <div class="scene-list-item" onclick="selectScene('${scene.id}')">
                    <span class="scene-name">${scene.title || '제목 없음'}</span>
                    <span class="shot-count">${shotCount}개 샷</span>
                </div>
            `;
        });
        html += '</div>';
        
        return html;
    }

    /**
     * Create shot list HTML
     */
    createShotList(sceneId) {
        const shots = dataManager.getShotsForScene(sceneId);
        
        if (shots.length === 0) {
            return '<p style="color: #999;">이 씬에 샷이 없습니다.</p>';
        }
        
        let html = '<div class="shot-list">';
        shots.forEach(shot => {
            const duration = shot.other_info?.estimated_duration || 0;
            html += `
                <div class="shot-list-item" onclick="selectShot('${shot.id}')">
                    <span class="shot-name">${shot.title || '제목 없음'}</span>
                    ${duration > 0 ? `<span class="shot-duration">${duration}초</span>` : ''}
                </div>
            `;
        });
        html += '</div>';
        
        return html;
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.storyboardApp = new StoryboardApp();
});