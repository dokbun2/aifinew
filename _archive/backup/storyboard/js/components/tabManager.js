/* Tab Manager Component */

import { dataManager } from '../utils/dataManager.js';
import { showMessage, escapeHtml } from '../utils/common.js';
import { promptManager } from './promptManager.js';
import { imageGallery } from './imageGallery.js';
import { videoPlayer } from './videoPlayer.js';
import { audioPlayer } from './audioPlayer.js';

class TabManager {
    constructor(container) {
        this.container = container;
        this.currentTab = 'info';
        this.currentShot = null;
        this.sequenceIndex = null;
        this.sceneIndex = null;
        this.shotIndex = null;
    }

    /**
     * Set current shot
     */
    setShot(sequenceIndex, sceneIndex, shotIndex) {
        this.sequenceIndex = sequenceIndex;
        this.sceneIndex = sceneIndex;
        this.shotIndex = shotIndex;
        
        // Get shot data
        const sequences = dataManager.currentData?.breakdown_data?.sequences;
        if (!sequences || !sequences[sequenceIndex]) return;
        
        const sequence = sequences[sequenceIndex];
        const scenes = dataManager.getScenesForSequence(sequence.id);
        if (!scenes[sceneIndex]) return;
        
        const scene = scenes[sceneIndex];
        const shots = dataManager.getShotsForScene(scene.id);
        if (!shots[shotIndex]) return;
        
        this.currentShot = shots[shotIndex];
    }

    /**
     * Switch to a different tab
     */
    switchTab(tabName) {
        this.currentTab = tabName;
        
        // Update tab buttons
        document.querySelectorAll('.tab-button').forEach(btn => {
            if (btn.dataset.tab === tabName) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        // Update content
        this.updateTabContent();
    }

    /**
     * Update tab content based on current tab
     */
    updateTabContent() {
        if (!this.container || !this.currentShot) return;
        
        let content = '';
        
        switch (this.currentTab) {
            case 'info':
                content = this.createInfoTab();
                break;
            case 'image':
                content = this.createImageTab();
                break;
            case 'video':
                content = this.createVideoTab();
                break;
            case 'audio':
                content = this.createAudioTab();
                break;
            case 'music':
                content = this.createMusicTab();
                break;
            default:
                content = '<p>탭을 선택하세요.</p>';
        }
        
        this.container.innerHTML = `
            <div class="tab-content active" id="${this.currentTab}-tab">
                ${content}
            </div>
        `;
        
        // Execute tab-specific initialization
        this.initializeTabFeatures();
    }

    /**
     * Create info tab content
     */
    createInfoTab() {
        const shot = this.currentShot;
        
        return `
            <div class="info-section">
                <h3>기본 정보</h3>
                <table class="info-table">
                    <tr>
                        <th>샷 ID</th>
                        <td>${escapeHtml(shot.id)}</td>
                    </tr>
                    <tr>
                        <th>제목</th>
                        <td>${escapeHtml(shot.title || '-')}</td>
                    </tr>
                    <tr>
                        <th>샷 타입</th>
                        <td>${escapeHtml(shot.shot_type || '-')}</td>
                    </tr>
                    <tr>
                        <th>설명</th>
                        <td>${escapeHtml(shot.description || '-')}</td>
                    </tr>
                    <tr>
                        <th>예상 시간</th>
                        <td>${shot.other_info?.estimated_duration || 0}초</td>
                    </tr>
                </table>
            </div>
            
            ${this.createCameraFramingSection(shot)}
            ${this.createContentSection(shot)}
            ${this.createVisualConsistencySection(shot)}
        `;
    }

    /**
     * Create camera framing section
     */
    createCameraFramingSection(shot) {
        if (!shot.camera_framing) return '';
        
        const cf = shot.camera_framing;
        
        return `
            <div class="info-section">
                <h4>카메라 프레이밍</h4>
                <table class="info-table">
                    <tr>
                        <th>프레이밍</th>
                        <td>${escapeHtml(cf.framing || '-')}</td>
                    </tr>
                    <tr>
                        <th>앵글</th>
                        <td>${escapeHtml(cf.angle || '-')}</td>
                    </tr>
                    <tr>
                        <th>시점</th>
                        <td>${escapeHtml(cf.view_direction || '-')}</td>
                    </tr>
                    <tr>
                        <th>구도</th>
                        <td>${escapeHtml(cf.composition || '-')}</td>
                    </tr>
                </table>
            </div>
        `;
    }

    /**
     * Create content section
     */
    createContentSection(shot) {
        if (!shot.content) return '';
        
        const content = shot.content;
        let html = '<div class="info-section"><h4>콘텐츠</h4>';
        
        // Action
        if (content.action) {
            html += `
                <div class="content-item">
                    <strong>액션:</strong>
                    <p>${escapeHtml(content.action)}</p>
                </div>
            `;
        }
        
        // Dialogue
        if (content.dialogue_by_character && Object.keys(content.dialogue_by_character).length > 0) {
            html += '<div class="content-item"><strong>대사:</strong>';
            Object.entries(content.dialogue_by_character).forEach(([character, charData]) => {
                if (charData.lines && charData.lines.length > 0) {
                    html += `<div class="dialogue-character"><strong>${escapeHtml(character)}:</strong>`;
                    charData.lines.forEach(line => {
                        html += `<p class="dialogue-line">${escapeHtml(line.text)}</p>`;
                    });
                    html += '</div>';
                }
            });
            html += '</div>';
        }
        
        // Narration
        if (content.narration) {
            html += `
                <div class="content-item">
                    <strong>내레이션:</strong>
                    <p>${escapeHtml(content.narration)}</p>
                </div>
            `;
        }
        
        // Sound Effects
        if (content.sound_effects) {
            html += `
                <div class="content-item">
                    <strong>음향 효과:</strong>
                    <p>${escapeHtml(content.sound_effects)}</p>
                </div>
            `;
        }
        
        html += '</div>';
        return html;
    }

    /**
     * Create visual consistency section
     */
    createVisualConsistencySection(shot) {
        if (!shot.visual_consistency_info) return '';
        
        const vci = shot.visual_consistency_info;
        let html = '<div class="info-section"><h4>시각적 일관성</h4><div class="visual-consistency-grid">';
        
        // Location
        if (vci.location_id) {
            html += `
                <div class="vc-item">
                    <strong>장소:</strong> ${escapeHtml(vci.location_id)}
                </div>
            `;
        }
        
        // Characters
        if (vci.character_ids && vci.character_ids.length > 0) {
            html += `
                <div class="vc-item">
                    <strong>캐릭터:</strong> ${vci.character_ids.map(id => escapeHtml(id)).join(', ')}
                </div>
            `;
        }
        
        // Props
        if (vci.prop_ids && vci.prop_ids.length > 0) {
            html += `
                <div class="vc-item">
                    <strong>소품:</strong> ${vci.prop_ids.map(id => escapeHtml(id)).join(', ')}
                </div>
            `;
        }
        
        html += '</div></div>';
        return html;
    }

    /**
     * Create image tab content
     */
    createImageTab() {
        const shot = this.currentShot;
        
        return `
            <div class="image-gallery-section">
                <h3>이미지 갤러리</h3>
                ${imageGallery.createShotImageGallery(shot)}
                
                <div class="image-management-section">
                    <h4>이미지 추가</h4>
                    <div class="image-ai-tools">
                        ${promptManager.imageAITools.map(tool => `
                            <div class="ai-image-section ${tool}">
                                <div class="ai-card-header">
                                    ${tool.toUpperCase()}
                                </div>
                                ${imageGallery.createImageUploadSection(shot.id, tool)}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Create video tab content
     */
    createVideoTab() {
        const shot = this.currentShot;
        
        return `
            <div class="video-section">
                <h3>영상 생성</h3>
                <div class="video-ai-grid">
                    ${promptManager.videoAITools.map(tool => this.createVideoAICard(shot, tool)).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Create video AI card
     */
    createVideoAICard(shot, aiTool) {
        const prompt = promptManager.generateVideoPrompt(shot, aiTool);
        const videoUrl = shot.video_urls?.[aiTool] || '';
        
        return `
            <div class="ai-video-card ${aiTool}">
                <div class="ai-card-header">
                    ${aiTool.toUpperCase()} AI
                </div>
                <div class="ai-card-content">
                    <div class="ai-prompt-area">
                        <h5>프롬프트</h5>
                        <div class="prompt-text" id="prompt-${aiTool}">
                            ${escapeHtml(prompt)}
                        </div>
                        <button class="copy-prompt-btn" onclick="copyPrompt('prompt-${aiTool}')">
                            프롬프트 복사
                        </button>
                    </div>
                    
                    ${videoPlayer.createVideoPreviewSection(videoUrl, aiTool)}
                </div>
            </div>
        `;
    }

    /**
     * Create audio tab content
     */
    createAudioTab() {
        const shot = this.currentShot;
        
        return `
            <div class="audio-tab-content">
                <h3>오디오</h3>
                
                ${shot.content?.dialogue_by_character ? 
                    audioPlayer.createAudioSection(
                        shot.content.dialogue_by_character,
                        '🎤 대사',
                        'dialogue'
                    ) : ''}
                
                ${shot.content?.narration ? 
                    audioPlayer.createAudioSection(
                        shot.content.narration,
                        '📖 내레이션',
                        'narration'
                    ) : ''}
                
                ${shot.content?.sound_effects ? 
                    audioPlayer.createAudioSection(
                        shot.content.sound_effects,
                        '🔊 음향 효과',
                        'sound_effects'
                    ) : ''}
            </div>
        `;
    }

    /**
     * Create music tab content
     */
    createMusicTab() {
        const shot = this.currentShot;
        const projectMusic = dataManager.currentData?.film_metadata?.project_music_prompts;
        
        return `
            <div class="music-tab-content">
                <h3>음악</h3>
                
                ${shot.music_memo ? `
                    <div class="info-section">
                        <h4>샷 음악 메모</h4>
                        <p>${escapeHtml(shot.music_memo)}</p>
                    </div>
                ` : ''}
                
                ${projectMusic ? 
                    audioPlayer.createMusicOSTSection(projectMusic) : 
                    '<p style="color: #999;">프로젝트 음악 정보가 없습니다.</p>'}
            </div>
        `;
    }

    /**
     * Initialize tab-specific features
     */
    initializeTabFeatures() {
        // Initialize based on current tab
        switch (this.currentTab) {
            case 'image':
                // Image gallery already initialized
                break;
            case 'video':
                // Video players initialized on demand
                break;
            case 'audio':
                // Audio players initialized in HTML
                break;
            case 'music':
                // Music players initialized in HTML
                break;
        }
    }
}

// Export factory function
export function createTabManager(container) {
    if (typeof container === 'string') {
        container = document.querySelector(container);
    }
    return new TabManager(container);
}