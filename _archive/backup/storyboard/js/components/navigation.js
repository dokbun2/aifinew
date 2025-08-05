/* Navigation Component */

import { dataManager } from '../utils/dataManager.js';
import { escapeHtml, debounce } from '../utils/common.js';

class NavigationComponent {
    constructor() {
        this.container = document.getElementById('navigation-content');
        this.searchInput = document.getElementById('search-input');
        this.expandAllBtn = document.getElementById('expand-all-btn');
        this.collapseAllBtn = document.getElementById('collapse-all-btn');
        this.activeItem = null;
        
        this.initializeEventListeners();
    }

    /**
     * Initialize event listeners
     */
    initializeEventListeners() {
        // Search functionality
        if (this.searchInput) {
            this.searchInput.addEventListener('input', debounce((e) => {
                this.filterNavigation(e.target.value);
            }, 300));
        }

        // Expand/Collapse all buttons
        if (this.expandAllBtn) {
            this.expandAllBtn.addEventListener('click', () => this.expandAll());
        }
        
        if (this.collapseAllBtn) {
            this.collapseAllBtn.addEventListener('click', () => this.collapseAll());
        }
    }

    /**
     * Update navigation display
     */
    update() {
        if (!this.container) return;

        const data = dataManager.currentData;
        
        if (!data || !data.breakdown_data) {
            this.showEmptyState();
            return;
        }

        // Update project info
        this.updateProjectInfo(data);

        // Build navigation tree
        const navHTML = this.buildNavigationTree(data.breakdown_data);
        this.container.innerHTML = navHTML;
        
        // Restore active state if any
        if (dataManager.selectedId) {
            this.setActiveItem(dataManager.selectedType, dataManager.selectedId);
        }
    }

    /**
     * Update project info in navigation header
     */
    updateProjectInfo(data) {
        const titleEl = document.getElementById('nav-project-title');
        const descEl = document.getElementById('nav-project-description');
        
        if (titleEl) {
            titleEl.textContent = data.film_metadata?.title_working || '제목 없음';
        }
        
        if (descEl) {
            const genre = data.film_metadata?.confirmed_genre || '장르 미정';
            const stats = dataManager.getStatistics();
            descEl.textContent = `${genre} | ${stats.sequences}개 시퀀스, ${stats.scenes}개 씬, ${stats.shots}개 샷`;
        }
    }

    /**
     * Build navigation tree HTML
     */
    buildNavigationTree(breakdownData) {
        if (!breakdownData.sequences || breakdownData.sequences.length === 0) {
            return this.getEmptyStateHTML();
        }

        let html = '';
        
        breakdownData.sequences.forEach((sequence, seqIndex) => {
            const scenes = dataManager.getScenesForSequence(sequence.id);
            const hasScenes = scenes.length > 0;
            
            html += `
                <div class="sequence-item" data-sequence-id="${sequence.id}">
                    <div class="sequence-header ${dataManager.selectedType === 'sequence' && dataManager.selectedId === sequence.id ? 'active' : ''}" 
                         onclick="toggleSequence('${sequence.id}', event)">
                        <span class="toggle-icon ${hasScenes ? 'expanded' : ''}">▶</span>
                        <span class="sequence-name">${escapeHtml(sequence.title || '제목 없음')}</span>
                        <span class="status-indicator" data-tooltip="${scenes.length}개 씬">
                            ${scenes.length}
                        </span>
                    </div>
                    ${hasScenes ? this.buildScenesHTML(scenes, sequence.id) : ''}
                </div>
            `;
        });
        
        return html;
    }

    /**
     * Build scenes HTML for a sequence
     */
    buildScenesHTML(scenes, sequenceId) {
        let html = '<div class="scenes-container">';
        
        scenes.forEach((scene, sceneIndex) => {
            const shots = dataManager.getShotsForScene(scene.id);
            const hasShots = shots.length > 0;
            
            html += `
                <div class="scene-item" data-scene-id="${scene.id}">
                    <div class="scene-header ${dataManager.selectedType === 'scene' && dataManager.selectedId === scene.id ? 'active' : ''}"
                         onclick="toggleScene('${scene.id}', event)">
                        <span class="toggle-icon ${hasShots ? 'expanded' : ''}">▶</span>
                        <span class="scene-name">${escapeHtml(scene.title || '제목 없음')}</span>
                        <span class="status-indicator" data-tooltip="${shots.length}개 샷">
                            ${shots.length}
                        </span>
                    </div>
                    ${hasShots ? this.buildShotsHTML(shots, scene.id) : ''}
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    }

    /**
     * Build shots HTML for a scene
     */
    buildShotsHTML(shots, sceneId) {
        let html = '<div class="shots-container">';
        
        shots.forEach((shot, shotIndex) => {
            const duration = shot.other_info?.estimated_duration || 0;
            const isActive = dataManager.selectedType === 'shot' && dataManager.selectedId === shot.id;
            
            html += `
                <div class="shot-item ${isActive ? 'active' : ''}" 
                     data-shot-id="${shot.id}"
                     onclick="selectShot('${shot.id}')">
                    <span class="shot-name">${escapeHtml(shot.title || '제목 없음')}</span>
                    <div class="shot-actions">
                        ${duration > 0 ? `<span class="shot-duration">${duration}초</span>` : ''}
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    }

    /**
     * Show empty state
     */
    showEmptyState() {
        this.container.innerHTML = this.getEmptyStateHTML();
    }

    /**
     * Get empty state HTML
     */
    getEmptyStateHTML() {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">📁</div>
                <h3>데이터가 없습니다</h3>
                <p>JSON 가져오기를 사용해 데이터를 로드해주세요</p>
            </div>
        `;
    }

    /**
     * Set active navigation item
     */
    setActiveItem(type, id) {
        // Remove previous active states
        document.querySelectorAll('.sequence-header.active, .scene-header.active, .shot-item.active')
            .forEach(el => el.classList.remove('active'));
        
        // Add active state to current item
        if (type === 'sequence') {
            const el = document.querySelector(`[data-sequence-id="${id}"] .sequence-header`);
            if (el) el.classList.add('active');
        } else if (type === 'scene') {
            const el = document.querySelector(`[data-scene-id="${id}"] .scene-header`);
            if (el) el.classList.add('active');
        } else if (type === 'shot') {
            const el = document.querySelector(`[data-shot-id="${id}"]`);
            if (el) el.classList.add('active');
        }
    }

    /**
     * Expand all navigation items
     */
    expandAll() {
        document.querySelectorAll('.scenes-container, .shots-container').forEach(container => {
            container.classList.remove('collapsed');
        });
        document.querySelectorAll('.toggle-icon').forEach(icon => {
            icon.classList.add('expanded');
        });
    }

    /**
     * Collapse all navigation items
     */
    collapseAll() {
        document.querySelectorAll('.scenes-container, .shots-container').forEach(container => {
            container.classList.add('collapsed');
        });
        document.querySelectorAll('.toggle-icon').forEach(icon => {
            icon.classList.remove('expanded');
        });
    }

    /**
     * Filter navigation based on search query
     */
    filterNavigation(query) {
        const lowerQuery = query.toLowerCase().trim();
        
        if (!lowerQuery) {
            // Show all items if query is empty
            document.querySelectorAll('.sequence-item, .scene-item, .shot-item').forEach(item => {
                item.style.display = '';
            });
            return;
        }

        // Hide all items initially
        document.querySelectorAll('.sequence-item').forEach(item => {
            item.style.display = 'none';
        });

        // Show matching items and their parents
        document.querySelectorAll('.sequence-item, .scene-item, .shot-item').forEach(item => {
            const text = item.textContent.toLowerCase();
            if (text.includes(lowerQuery)) {
                // Show the item and all parent containers
                let current = item;
                while (current) {
                    current.style.display = '';
                    if (current.classList.contains('sequence-item')) break;
                    current = current.closest('.sequence-item, .scene-item');
                }
                
                // Expand parent containers
                const sequence = item.closest('.sequence-item');
                if (sequence) {
                    const scenesContainer = sequence.querySelector('.scenes-container');
                    if (scenesContainer) scenesContainer.classList.remove('collapsed');
                }
                
                const scene = item.closest('.scene-item');
                if (scene) {
                    const shotsContainer = scene.querySelector('.shots-container');
                    if (shotsContainer) shotsContainer.classList.remove('collapsed');
                }
            }
        });
    }
}

// Create singleton instance
export const navigation = new NavigationComponent();

// Export functions for global access
export function toggleSequence(sequenceId, event) {
    event.stopPropagation();
    const sequenceEl = document.querySelector(`[data-sequence-id="${sequenceId}"]`);
    if (!sequenceEl) return;
    
    const scenesContainer = sequenceEl.querySelector('.scenes-container');
    const toggleIcon = sequenceEl.querySelector('.toggle-icon');
    
    if (scenesContainer) {
        scenesContainer.classList.toggle('collapsed');
        toggleIcon.classList.toggle('expanded');
    }
    
    // Select the sequence
    window.selectSequence(sequenceId);
}

export function toggleScene(sceneId, event) {
    event.stopPropagation();
    const sceneEl = document.querySelector(`[data-scene-id="${sceneId}"]`);
    if (!sceneEl) return;
    
    const shotsContainer = sceneEl.querySelector('.shots-container');
    const toggleIcon = sceneEl.querySelector('.toggle-icon');
    
    if (shotsContainer) {
        shotsContainer.classList.toggle('collapsed');
        toggleIcon.classList.toggle('expanded');
    }
    
    // Select the scene
    window.selectScene(sceneId);
}

export function selectShot(shotId) {
    dataManager.selectedType = 'shot';
    dataManager.selectedId = shotId;
    navigation.setActiveItem('shot', shotId);
    
    // Call global showShotContent function
    if (window.showShotContent) {
        window.showShotContent(shotId);
    }
}