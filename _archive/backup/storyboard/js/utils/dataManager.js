/* Data Manager - Core data management functionality */

import { showMessage, isEmpty, deepClone } from './common.js';

class DataManager {
    constructor() {
        this.currentData = null;
        this.hasStage2Structure = false;
        this.selectedType = null;
        this.selectedId = null;
        this.selectedSceneId = null;
    }

    /**
     * Get project file name based on current HTML file
     */
    getProjectFileName() {
        try {
            const htmlFileName = window.location.pathname.split('/').pop();
            const baseName = htmlFileName.replace('.html', '');
            return baseName + '.json';
        } catch (error) {
            return 'Film_Production_Manager.json';
        }
    }

    /**
     * Get project name from file name
     */
    getProjectName() {
        try {
            return this.getProjectFileName()
                .replace('_Manager.json', '')
                .replace('Film_Production_Manager.json', 'Film Production Manager');
        } catch (error) {
            return 'Film Production Manager';
        }
    }

    /**
     * Create empty data structure
     */
    getEmptyData() {
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
    }

    /**
     * Load data from storage
     */
    loadFromStorage() {
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
    }

    /**
     * Save data to storage
     */
    saveToStorage() {
        try {
            if (this.currentData) {
                localStorage.setItem('storyboardData', JSON.stringify(this.currentData));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error saving to storage:', error);
            showMessage('데이터 저장 중 오류가 발생했습니다.', 'error');
            return false;
        }
    }

    /**
     * Detect data structure type (Stage2 or normal)
     */
    detectDataStructure() {
        if (!this.currentData) {
            this.hasStage2Structure = false;
            return;
        }

        // Check for Stage 2 structure indicators
        const hasStage2Indicators = 
            this.currentData.stage2_shot_breakdown ||
            this.currentData.stage2_shot_and_image_breakdown ||
            (this.currentData.sequences && 
             this.currentData.sequences.some(seq => seq.scenes && seq.scenes.length > 0));

        this.hasStage2Structure = hasStage2Indicators;
    }

    /**
     * Find sequence by ID
     */
    findSequenceById(sequenceId) {
        if (!this.currentData?.breakdown_data?.sequences) return null;
        return this.currentData.breakdown_data.sequences.find(seq => seq.id === sequenceId);
    }

    /**
     * Find scene by ID
     */
    findSceneById(sceneId) {
        if (!this.currentData?.breakdown_data?.scenes) return null;
        return this.currentData.breakdown_data.scenes.find(scene => scene.id === sceneId);
    }

    /**
     * Find shot by ID
     */
    findShotById(shotId) {
        if (!this.currentData?.breakdown_data?.shots) return null;
        return this.currentData.breakdown_data.shots.find(shot => shot.id === shotId);
    }

    /**
     * Get scenes for a sequence
     */
    getScenesForSequence(sequenceId) {
        if (!this.currentData?.breakdown_data?.scenes) return [];
        return this.currentData.breakdown_data.scenes.filter(
            scene => scene.sequence_id === sequenceId
        );
    }

    /**
     * Get shots for a scene
     */
    getShotsForScene(sceneId) {
        if (!this.currentData?.breakdown_data?.shots) return [];
        return this.currentData.breakdown_data.shots.filter(
            shot => shot.scene_id === sceneId
        );
    }

    /**
     * Update shot data
     */
    updateShot(shotId, updates) {
        const shot = this.findShotById(shotId);
        if (!shot) return false;

        Object.assign(shot, updates);
        this.currentData.timestamp = new Date().toISOString();
        this.saveToStorage();
        return true;
    }

    /**
     * Add new sequence
     */
    addSequence(sequenceData) {
        if (!this.currentData?.breakdown_data) return false;

        if (!this.currentData.breakdown_data.sequences) {
            this.currentData.breakdown_data.sequences = [];
        }

        this.currentData.breakdown_data.sequences.push(sequenceData);
        this.currentData.timestamp = new Date().toISOString();
        this.saveToStorage();
        return true;
    }

    /**
     * Add new scene
     */
    addScene(sceneData) {
        if (!this.currentData?.breakdown_data) return false;

        if (!this.currentData.breakdown_data.scenes) {
            this.currentData.breakdown_data.scenes = [];
        }

        this.currentData.breakdown_data.scenes.push(sceneData);
        this.currentData.timestamp = new Date().toISOString();
        this.saveToStorage();
        return true;
    }

    /**
     * Add new shot
     */
    addShot(shotData) {
        if (!this.currentData?.breakdown_data) return false;

        if (!this.currentData.breakdown_data.shots) {
            this.currentData.breakdown_data.shots = [];
        }

        this.currentData.breakdown_data.shots.push(shotData);
        this.currentData.timestamp = new Date().toISOString();
        this.saveToStorage();
        return true;
    }

    /**
     * Delete sequence and its children
     */
    deleteSequence(sequenceId) {
        if (!this.currentData?.breakdown_data) return false;

        // Delete all shots in scenes of this sequence
        const scenes = this.getScenesForSequence(sequenceId);
        scenes.forEach(scene => {
            this.currentData.breakdown_data.shots = 
                this.currentData.breakdown_data.shots.filter(
                    shot => shot.scene_id !== scene.id
                );
        });

        // Delete all scenes in this sequence
        this.currentData.breakdown_data.scenes = 
            this.currentData.breakdown_data.scenes.filter(
                scene => scene.sequence_id !== sequenceId
            );

        // Delete the sequence
        this.currentData.breakdown_data.sequences = 
            this.currentData.breakdown_data.sequences.filter(
                seq => seq.id !== sequenceId
            );

        this.currentData.timestamp = new Date().toISOString();
        this.saveToStorage();
        return true;
    }

    /**
     * Delete scene and its shots
     */
    deleteScene(sceneId) {
        if (!this.currentData?.breakdown_data) return false;

        // Delete all shots in this scene
        this.currentData.breakdown_data.shots = 
            this.currentData.breakdown_data.shots.filter(
                shot => shot.scene_id !== sceneId
            );

        // Delete the scene
        this.currentData.breakdown_data.scenes = 
            this.currentData.breakdown_data.scenes.filter(
                scene => scene.id !== sceneId
            );

        this.currentData.timestamp = new Date().toISOString();
        this.saveToStorage();
        return true;
    }

    /**
     * Delete shot
     */
    deleteShot(shotId) {
        if (!this.currentData?.breakdown_data) return false;

        this.currentData.breakdown_data.shots = 
            this.currentData.breakdown_data.shots.filter(
                shot => shot.id !== shotId
            );

        this.currentData.timestamp = new Date().toISOString();
        this.saveToStorage();
        return true;
    }

    /**
     * Reset all data
     */
    resetData() {
        this.currentData = this.getEmptyData();
        this.hasStage2Structure = false;
        this.selectedType = null;
        this.selectedId = null;
        this.selectedSceneId = null;
        this.saveToStorage();
    }

    /**
     * Import data from JSON
     */
    importData(jsonData) {
        try {
            this.currentData = deepClone(jsonData);
            this.detectDataStructure();
            this.saveToStorage();
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }

    /**
     * Export current data
     */
    exportData() {
        return deepClone(this.currentData);
    }

    /**
     * Get statistics about the data
     */
    getStatistics() {
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

        // Calculate total duration from shots
        if (this.currentData.breakdown_data.shots) {
            stats.totalDuration = this.currentData.breakdown_data.shots.reduce((total, shot) => {
                const duration = shot.other_info?.estimated_duration || 0;
                return total + duration;
            }, 0);
        }

        return stats;
    }
}

// Create and export singleton instance
export const dataManager = new DataManager();