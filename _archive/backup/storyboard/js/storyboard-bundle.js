/* Storyboard Bundle - All modules combined for non-module environment */

// ===== Common Utilities =====
const StoryboardUtils = {
    showMessage: function(message, type = 'info') {
        try {
            const messageContainer = document.getElementById('message-container');
            if (!messageContainer) {
                console.warn('Message container not found');
                return;
            }
            
            const messageElement = document.createElement('div');
            messageElement.className = `message ${type}-message`;
            messageElement.innerHTML = `
                ${message}
                <button class="close-button" onclick="this.parentElement.remove()">×</button>
            `;
            
            messageContainer.appendChild(messageElement);
            
            if (type !== 'error') {
                setTimeout(() => {
                    if (messageContainer.contains(messageElement)) {
                        messageContainer.removeChild(messageElement);
                    }
                }, 5000);
            }
        } catch (error) {
            console.error('Error showing message:', error);
            alert(message);
        }
    },

    copyToClipboard: async function(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            try {
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                return true;
            } catch (fallbackError) {
                console.error('Clipboard copy failed:', fallbackError);
                return false;
            }
        }
    },

    formatDate: function(date) {
        try {
            const dateObj = typeof date === 'string' ? new Date(date) : date;
            return dateObj.toLocaleString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return '날짜 형식 오류';
        }
    },

    escapeHtml: function(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    deepClone: function(obj) {
        try {
            return JSON.parse(JSON.stringify(obj));
        } catch (error) {
            console.error('Error cloning object:', error);
            return null;
        }
    },

    generateId: function(prefix = '') {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`;
    },

    isEmpty: function(value) {
        if (value == null) return true;
        if (typeof value === 'string') return value.trim() === '';
        if (Array.isArray(value)) return value.length === 0;
        if (typeof value === 'object') return Object.keys(value).length === 0;
        return false;
    },

    getNestedValue: function(obj, path, defaultValue = null) {
        try {
            const keys = path.split('.');
            let result = obj;
            
            for (const key of keys) {
                if (result == null) return defaultValue;
                result = result[key];
            }
            
            return result !== undefined ? result : defaultValue;
        } catch (error) {
            return defaultValue;
        }
    },

    downloadJSON: function(data, filename) {
        try {
            const blob = new Blob([JSON.stringify(data, null, 2)], {
                type: 'application/json'
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download error:', error);
            StoryboardUtils.showMessage('파일 다운로드에 실패했습니다.', 'error');
        }
    },

    loadJSONFile: async function(input) {
        return new Promise((resolve, reject) => {
            const file = input.files[0];
            if (!file) {
                reject(new Error('파일이 선택되지 않았습니다.'));
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    resolve(data);
                } catch (error) {
                    reject(new Error('JSON 파싱 오류: ' + error.message));
                }
            };
            reader.onerror = () => {
                reject(new Error('파일 읽기 오류'));
            };
            reader.readAsText(file);
        });
    }
};

// ===== Data Manager =====
const StoryboardDataManager = {
    currentData: null,
    hasStage2Structure: false,
    selectedType: null,
    selectedId: null,
    selectedSceneId: null,

    getProjectFileName: function() {
        try {
            const htmlFileName = window.location.pathname.split('/').pop();
            const baseName = htmlFileName.replace('.html', '');
            return baseName + '.json';
        } catch (error) {
            return 'Film_Production_Manager.json';
        }
    },

    getProjectName: function() {
        try {
            return this.getProjectFileName()
                .replace('_Manager.json', '')
                .replace('Film_Production_Manager.json', 'Film Production Manager');
        } catch (error) {
            return 'Film Production Manager';
        }
    },

    getEmptyData: function() {
        try {
            return {
                film_id: 'FILM_NEW',
                current_stage_name: 'scenario_breakdown',
                timestamp: new Date().toISOString(),
                schema_version: '1.1.0',
                film_metadata: {
                    title_working: this.getProjectName(),
                    confirmed_genre: '',
                    current_scene: null,
                    total_scenes: 0,
                    completed_scenes: []
                },
                breakdown_data: {
                    sequences: [],
                    scenes: [],
                    shots: []
                },
                visual_consistency_info: {},
                concept_art_prompt_data: {}
            };
        } catch (error) {
            console.error('Error creating empty data:', error);
            return null;
        }
    },

    loadFromStorage: function() {
        try {
            const savedData = localStorage.getItem('storyboardData');
            if (savedData) {
                this.currentData = JSON.parse(savedData);
                this.detectDataStructure();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error loading from storage:', error);
            return false;
        }
    },

    saveToStorage: function() {
        try {
            if (this.currentData) {
                localStorage.setItem('storyboardData', JSON.stringify(this.currentData));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error saving to storage:', error);
            StoryboardUtils.showMessage('데이터 저장 중 오류가 발생했습니다.', 'error');
            return false;
        }
    },

    detectDataStructure: function() {
        if (!this.currentData) {
            this.hasStage2Structure = false;
            return;
        }

        const hasStage2Indicators = 
            this.currentData.stage2_shot_breakdown ||
            this.currentData.stage2_shot_and_image_breakdown ||
            (this.currentData.sequences && 
             this.currentData.sequences.some(seq => seq.scenes && seq.scenes.length > 0));

        this.hasStage2Structure = hasStage2Indicators;
    },

    findSequenceById: function(sequenceId) {
        if (!this.currentData?.breakdown_data?.sequences) return null;
        return this.currentData.breakdown_data.sequences.find(seq => seq.id === sequenceId);
    },

    findSceneById: function(sceneId) {
        if (!this.currentData?.breakdown_data?.scenes) return null;
        return this.currentData.breakdown_data.scenes.find(scene => scene.id === sceneId);
    },

    findShotById: function(shotId) {
        if (!this.currentData?.breakdown_data?.shots) return null;
        return this.currentData.breakdown_data.shots.find(shot => shot.id === shotId);
    },

    getScenesForSequence: function(sequenceId) {
        if (!this.currentData?.breakdown_data?.scenes) return [];
        return this.currentData.breakdown_data.scenes.filter(
            scene => scene.sequence_id === sequenceId
        );
    },

    getShotsForScene: function(sceneId) {
        if (!this.currentData?.breakdown_data?.shots) return [];
        return this.currentData.breakdown_data.shots.filter(
            shot => shot.scene_id === sceneId
        );
    },

    updateShot: function(shotId, updates) {
        const shot = this.findShotById(shotId);
        if (!shot) return false;

        Object.assign(shot, updates);
        this.currentData.timestamp = new Date().toISOString();
        this.saveToStorage();
        return true;
    },

    resetData: function() {
        this.currentData = this.getEmptyData();
        this.hasStage2Structure = false;
        this.selectedType = null;
        this.selectedId = null;
        this.selectedSceneId = null;
        this.saveToStorage();
    },

    importData: function(jsonData) {
        try {
            this.currentData = StoryboardUtils.deepClone(jsonData);
            this.detectDataStructure();
            this.saveToStorage();
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    },

    exportData: function() {
        return StoryboardUtils.deepClone(this.currentData);
    },

    getStatistics: function() {
        if (!this.currentData?.breakdown_data) {
            return {
                sequences: 0,
                scenes: 0,
                shots: 0,
                totalDuration: 0
            };
        }

        const stats = {
            sequences: this.currentData.breakdown_data.sequences?.length || 0,
            scenes: this.currentData.breakdown_data.scenes?.length || 0,
            shots: this.currentData.breakdown_data.shots?.length || 0,
            totalDuration: 0
        };

        if (this.currentData.breakdown_data.shots) {
            stats.totalDuration = this.currentData.breakdown_data.shots.reduce((total, shot) => {
                const duration = shot.other_info?.estimated_duration || 0;
                return total + duration;
            }, 0);
        }

        return stats;
    }
};

// Make data manager globally accessible
window.dataManager = StoryboardDataManager;
window.currentData = null; // Legacy support

// ===== Initialize Bundle =====
document.addEventListener('DOMContentLoaded', function() {
    // Load initial data
    const hasData = StoryboardDataManager.loadFromStorage();
    if (hasData) {
        window.currentData = StoryboardDataManager.currentData; // Legacy support
        if (window.updateNavigation) {
            window.updateNavigation();
        }
        StoryboardUtils.showMessage('저장된 데이터를 불러왔습니다.', 'success');
    } else {
        StoryboardDataManager.resetData();
        window.currentData = StoryboardDataManager.currentData; // Legacy support
        if (window.updateNavigation) {
            window.updateNavigation();
        }
    }

    // Setup global functions
    window.showMessage = StoryboardUtils.showMessage;
    window.copyToClipboard = async function(text) {
        const success = await StoryboardUtils.copyToClipboard(text);
        if (success) {
            StoryboardUtils.showMessage('클립보드에 복사되었습니다.', 'success');
        } else {
            StoryboardUtils.showMessage('클립보드 복사에 실패했습니다.', 'error');
        }
        return success;
    };

    // Export helper for legacy code
    window.getEmptyData = function() {
        return StoryboardDataManager.getEmptyData();
    };

    window.getProjectFileName = function() {
        return StoryboardDataManager.getProjectFileName();
    };

    window.getProjectName = function() {
        return StoryboardDataManager.getProjectName();
    };
});