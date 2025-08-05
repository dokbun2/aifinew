/* Audio Player Component */

import { showMessage, escapeHtml } from '../utils/common.js';

class AudioPlayer {
    constructor() {
        this.currentAudio = {};
        this.audioElements = {};
    }

    /**
     * Create audio player section
     */
    createAudioSection(audioData, sectionTitle, audioType) {
        const sectionId = `audio-section-${audioType}`;
        
        return `
            <div class="audio-section" id="${sectionId}">
                <h4>${sectionTitle}</h4>
                ${this.createAudioPlayer(audioData, audioType)}
                ${this.createAudioContentDisplay(audioData, audioType)}
                ${this.createAudioUrlInput(audioType)}
            </div>
        `;
    }

    /**
     * Create audio player element
     */
    createAudioPlayer(audioData, audioType) {
        const audioUrl = this.getAudioUrl(audioData, audioType);
        const playerId = `audio-player-${audioType}`;
        
        if (audioUrl) {
            return `
                <div class="audio-player-area" id="${playerId}">
                    <audio controls style="width: 100%;">
                        <source src="${audioUrl}" type="audio/mpeg">
                        <source src="${audioUrl}" type="audio/wav">
                        브라우저가 오디오 재생을 지원하지 않습니다.
                    </audio>
                    <div class="audio-controls">
                        <button class="btn btn-small btn-secondary" onclick="reloadAudio('${audioType}')">
                            🔄 다시 로드
                        </button>
                        <a href="${audioUrl}" download class="btn btn-small btn-secondary">
                            ⬇ 다운로드
                        </a>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="audio-player-area empty" id="${playerId}">
                    <p style="color: #999; margin: 0;">오디오 파일이 없습니다</p>
                </div>
            `;
        }
    }

    /**
     * Create audio content display
     */
    createAudioContentDisplay(audioData, audioType) {
        let content = '';
        
        switch (audioType) {
            case 'dialogue':
                content = this.formatDialogueContent(audioData);
                break;
            case 'narration':
                content = audioData?.text || audioData || '내레이션 없음';
                break;
            case 'sound_effects':
                content = audioData || '음향 효과 없음';
                break;
            case 'music':
                content = this.formatMusicContent(audioData);
                break;
            default:
                content = '내용 없음';
        }
        
        return `
            <div class="audio-content-display">
                ${escapeHtml(content)}
            </div>
        `;
    }

    /**
     * Format dialogue content for display
     */
    formatDialogueContent(dialogueData) {
        if (!dialogueData || typeof dialogueData !== 'object') {
            return '대사 없음';
        }

        let content = '';
        
        Object.entries(dialogueData).forEach(([character, charData]) => {
            if (charData.lines && Array.isArray(charData.lines)) {
                charData.lines.forEach(line => {
                    content += `[${character}] ${line.text}\n`;
                });
            }
        });
        
        return content || '대사 없음';
    }

    /**
     * Format music content for display
     */
    formatMusicContent(musicData) {
        if (!musicData) return '음악 정보 없음';
        
        if (typeof musicData === 'string') {
            return musicData;
        }
        
        let content = '';
        
        if (musicData.style_prompt) {
            content += `스타일: ${musicData.style_prompt}\n`;
        }
        
        if (musicData.lyrics_structure_prompt) {
            content += `구조: ${musicData.lyrics_structure_prompt}`;
        }
        
        return content || '음악 정보 없음';
    }

    /**
     * Create audio URL input section
     */
    createAudioUrlInput(audioType) {
        return `
            <div class="audio-url-input">
                <input type="text" 
                       id="audio-url-${audioType}" 
                       class="form-input" 
                       placeholder="오디오 파일 URL 입력">
                <button class="btn btn-primary btn-small" 
                        onclick="updateAudioUrl('${audioType}')">
                    업데이트
                </button>
            </div>
        `;
    }

    /**
     * Get audio URL from data
     */
    getAudioUrl(audioData, audioType) {
        if (!audioData) return null;
        
        // Direct URL
        if (typeof audioData === 'string') {
            return audioData;
        }
        
        // From audio_urls object
        if (audioData.audio_urls) {
            return audioData.audio_urls[audioType];
        }
        
        // From URL property
        if (audioData.url) {
            return audioData.url;
        }
        
        return null;
    }

    /**
     * Update audio URL
     */
    updateAudioUrl(audioType) {
        const urlInput = document.getElementById(`audio-url-${audioType}`);
        if (!urlInput) return;
        
        const url = urlInput.value.trim();
        if (!url) {
            showMessage('오디오 URL을 입력해주세요.', 'warning');
            return;
        }
        
        // Save URL and update player
        this.currentAudio[audioType] = url;
        
        // Update player
        const playerContainer = document.getElementById(`audio-player-${audioType}`);
        if (playerContainer) {
            playerContainer.innerHTML = `
                <audio controls style="width: 100%;">
                    <source src="${url}" type="audio/mpeg">
                    <source src="${url}" type="audio/wav">
                    브라우저가 오디오 재생을 지원하지 않습니다.
                </audio>
                <div class="audio-controls">
                    <button class="btn btn-small btn-secondary" onclick="reloadAudio('${audioType}')">
                        🔄 다시 로드
                    </button>
                    <a href="${url}" download class="btn btn-small btn-secondary">
                        ⬇ 다운로드
                    </a>
                </div>
            `;
        }
        
        // Clear input
        urlInput.value = '';
        showMessage('오디오 URL이 업데이트되었습니다.', 'success');
        
        // Save to shot data if callback exists
        if (window.saveAudioUrl) {
            window.saveAudioUrl(audioType, url);
        }
    }

    /**
     * Reload audio player
     */
    reloadAudio(audioType) {
        const playerContainer = document.getElementById(`audio-player-${audioType}`);
        if (!playerContainer) return;
        
        const audio = playerContainer.querySelector('audio');
        if (audio) {
            const currentTime = audio.currentTime;
            audio.load();
            audio.currentTime = currentTime;
            showMessage('오디오를 다시 로드했습니다.', 'info');
        }
    }

    /**
     * Create music OST section
     */
    createMusicOSTSection(musicData) {
        if (!musicData) {
            return `
                <div class="music-ost-section">
                    <h4>🎵 음악 (OST)</h4>
                    <p style="color: #999;">프로젝트 음악 정보가 없습니다.</p>
                </div>
            `;
        }

        let html = `
            <div class="music-ost-section">
                <h4>🎵 음악 (OST)</h4>
                <div class="ost-prompt-grid">
        `;

        // Main OST
        if (musicData.main_ost) {
            html += this.createOSTItem('메인 OST', musicData.main_ost, 
                                     musicData.project_music_urls?.main_ost);
        }

        // Sub OSTs
        ['sub_ost_1', 'sub_ost_2', 'sub_ost_3'].forEach(ostKey => {
            if (musicData[ostKey]) {
                const title = ostKey.replace('sub_ost_', '서브 OST ');
                html += this.createOSTItem(title, musicData[ostKey], 
                                         musicData.project_music_urls?.[ostKey]);
            }
        });

        html += `
                </div>
            </div>
        `;

        return html;
    }

    /**
     * Create OST item display
     */
    createOSTItem(title, ostData, audioUrl) {
        return `
            <div class="ost-prompt-item">
                <div class="prompt-title">${title}</div>
                ${ostData.style_prompt ? `
                    <div class="prompt-text">${escapeHtml(ostData.style_prompt)}</div>
                ` : ''}
                ${ostData.lyrics_structure_prompt ? `
                    <div class="prompt-text" style="margin-top: 10px;">
                        ${escapeHtml(ostData.lyrics_structure_prompt)}
                    </div>
                ` : ''}
                ${audioUrl ? `
                    <div style="margin-top: 10px;">
                        <audio controls style="width: 100%;">
                            <source src="${audioUrl}" type="audio/mpeg">
                        </audio>
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Stop all audio playback
     */
    stopAll() {
        document.querySelectorAll('audio').forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
        });
    }

    /**
     * Play specific audio
     */
    play(audioType) {
        const playerContainer = document.getElementById(`audio-player-${audioType}`);
        if (!playerContainer) return;
        
        const audio = playerContainer.querySelector('audio');
        if (audio) {
            // Stop all other audio
            this.stopAll();
            // Play this audio
            audio.play().catch(err => {
                console.error('Audio playback error:', err);
                showMessage('오디오 재생에 실패했습니다.', 'error');
            });
        }
    }
}

// Create singleton instance
export const audioPlayer = new AudioPlayer();

// Global functions for HTML onclick handlers
window.updateAudioUrl = function(audioType) {
    audioPlayer.updateAudioUrl(audioType);
};

window.reloadAudio = function(audioType) {
    audioPlayer.reloadAudio(audioType);
};

window.playAudio = function(audioType) {
    audioPlayer.play(audioType);
};

window.stopAllAudio = function() {
    audioPlayer.stopAll();
};