/* Prompt Manager Component */

import { copyToClipboard, showMessage, escapeHtml } from '../utils/common.js';

class PromptManager {
    constructor() {
        this.videoAITools = ['luma', 'kling', 'veo2', 'runway'];
        this.imageAITools = ['midjourney', 'ideogram', 'leonardo', 'imagefx', 'openart'];
        this.currentPrompts = {};
    }

    /**
     * Generate prompt for video AI tool
     */
    generateVideoPrompt(shotData, aiTool) {
        if (!shotData) return '';

        let prompt = '';
        
        // Basic shot information
        if (shotData.description) {
            prompt += shotData.description;
        }

        // Camera framing details
        if (shotData.camera_framing) {
            const cf = shotData.camera_framing;
            const framingDetails = [];
            
            if (cf.framing) framingDetails.push(cf.framing);
            if (cf.angle) framingDetails.push(`${cf.angle} angle`);
            if (cf.view_direction) framingDetails.push(`${cf.view_direction} view`);
            if (cf.composition) framingDetails.push(`${cf.composition} composition`);
            
            if (framingDetails.length > 0) {
                prompt += `. Camera: ${framingDetails.join(', ')}`;
            }
        }

        // Action details
        if (shotData.content?.action) {
            prompt += `. Action: ${shotData.content.action}`;
        }

        // AI-specific modifications
        prompt = this.applyAISpecificModifications(prompt, aiTool);

        return prompt.trim();
    }

    /**
     * Generate prompt for image AI tool
     */
    generateImagePrompt(imageData, aiTool, plan) {
        if (!imageData || !plan) return '';

        let prompt = '';

        // Base description from plan
        if (plan.base_prompt) {
            prompt += plan.base_prompt;
        }

        // Style and mood
        if (plan.style) {
            prompt += `, ${plan.style} style`;
        }

        if (plan.mood) {
            prompt += `, ${plan.mood} mood`;
        }

        // Technical details
        if (plan.technical_details) {
            prompt += `. ${plan.technical_details}`;
        }

        // AI-specific modifications
        prompt = this.applyAISpecificModifications(prompt, aiTool);

        return prompt.trim();
    }

    /**
     * Apply AI-specific prompt modifications
     */
    applyAISpecificModifications(prompt, aiTool) {
        switch (aiTool) {
            case 'midjourney':
                // Midjourney specific parameters
                prompt += ' --ar 16:9 --v 6';
                break;
                
            case 'runway':
                // Runway Gen-3 specific
                prompt = `cinematic, ${prompt}, high quality, 4k`;
                break;
                
            case 'luma':
                // Luma Dream Machine specific
                prompt = `${prompt}, smooth motion, cinematic lighting`;
                break;
                
            case 'kling':
                // Kling specific
                prompt = `professional film, ${prompt}, detailed`;
                break;
                
            case 'leonardo':
                // Leonardo.AI specific
                prompt = `${prompt}, ultra detailed, photorealistic`;
                break;
                
            case 'ideogram':
                // Ideogram specific
                prompt = `${prompt}, high resolution, professional photography`;
                break;
        }

        return prompt;
    }

    /**
     * Create prompt display HTML
     */
    createPromptDisplay(prompt, aiTool, promptType = 'video') {
        const toolColors = {
            luma: '#FF8C00',
            kling: '#1E90FF',
            veo2: '#9370DB',
            runway: '#3CB371',
            midjourney: '#0099FF',
            ideogram: '#FF6600',
            leonardo: '#9933CC',
            imagefx: '#00CC66',
            openart: '#FF6B6B'
        };

        const color = toolColors[aiTool] || '#666';
        const promptId = `prompt_${aiTool}_${Date.now()}`;

        return `
            <div class="prompt-container ai-${aiTool}">
                <div class="prompt-header">
                    <span class="prompt-title" style="color: ${color}">
                        ${aiTool.toUpperCase()} ${promptType === 'video' ? '영상' : '이미지'} 프롬프트
                    </span>
                    <button class="copy-btn" onclick="copyPrompt('${promptId}')">
                        복사
                    </button>
                </div>
                <div class="prompt-text" id="${promptId}">
                    ${escapeHtml(prompt)}
                </div>
            </div>
        `;
    }

    /**
     * Create AI tool tabs
     */
    createAITabs(tools, activeTab, contentContainerId, promptType = 'video') {
        let tabsHTML = '<div class="ai-tabs">';
        
        tools.forEach(tool => {
            const isActive = tool === activeTab;
            tabsHTML += `
                <button class="ai-tab ${tool} ${isActive ? 'active' : ''}" 
                        onclick="switchAITab('${tool}', '${contentContainerId}', '${promptType}')">
                    ${tool.toUpperCase()}
                </button>
            `;
        });
        
        tabsHTML += '</div>';
        return tabsHTML;
    }

    /**
     * Generate all prompts for a shot
     */
    generateAllPromptsForShot(shotData) {
        const prompts = {
            video: {},
            audio: {},
            narration: null
        };

        // Generate video prompts
        this.videoAITools.forEach(tool => {
            prompts.video[tool] = this.generateVideoPrompt(shotData, tool);
        });

        // Generate audio prompts
        if (shotData.audio_prompts) {
            prompts.audio = shotData.audio_prompts;
        }

        // Generate narration prompt
        if (shotData.content?.narration) {
            prompts.narration = shotData.content.narration;
        }

        return prompts;
    }

    /**
     * Create music OST prompt display
     */
    createMusicPromptDisplay(musicData, ostType) {
        if (!musicData) return '';

        const { style_prompt, lyrics_structure_prompt } = musicData;
        
        return `
            <div class="ost-prompt-item">
                <h5 class="prompt-title">${ostType}</h5>
                ${style_prompt ? `
                    <div class="prompt-section">
                        <span class="prompt-text-label">스타일 프롬프트:</span>
                        <div class="prompt-text">${escapeHtml(style_prompt)}</div>
                        <button class="copy-btn btn-small" onclick="copyToClipboard('${escapeHtml(style_prompt)}')">
                            복사
                        </button>
                    </div>
                ` : ''}
                ${lyrics_structure_prompt ? `
                    <div class="prompt-section">
                        <span class="prompt-text-label">구조/가사 프롬프트:</span>
                        <div class="prompt-text">${escapeHtml(lyrics_structure_prompt)}</div>
                        <button class="copy-btn btn-small" onclick="copyToClipboard('${escapeHtml(lyrics_structure_prompt)}')">
                            복사
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Generate audio prompt with settings
     */
    generateAudioPrompt(audioData, lineIndex = 0) {
        if (!audioData) return '';

        let prompt = '';
        
        if (audioData.prompts && audioData.prompts[lineIndex]) {
            prompt = audioData.prompts[lineIndex].prompt || '';
        }

        // Add settings if available
        if (audioData.settings) {
            const settings = [];
            if (audioData.settings.voice_gender) {
                settings.push(`${audioData.settings.voice_gender} voice`);
            }
            if (audioData.settings.voice_age) {
                settings.push(`${audioData.settings.voice_age} age`);
            }
            if (audioData.settings.tone) {
                settings.push(`${audioData.settings.tone} tone`);
            }
            if (audioData.settings.speed) {
                settings.push(`${audioData.settings.speed} speed`);
            }
            
            if (settings.length > 0) {
                prompt += ` [Settings: ${settings.join(', ')}]`;
            }
        }

        return prompt;
    }
}

// Create singleton instance
export const promptManager = new PromptManager();

// Global functions for HTML onclick handlers
window.copyPrompt = async function(promptId) {
    const promptEl = document.getElementById(promptId);
    if (promptEl) {
        const success = await copyToClipboard(promptEl.textContent);
        if (success) {
            showMessage('프롬프트가 클립보드에 복사되었습니다.', 'success');
        }
    }
};

window.switchAITab = function(aiTool, containerId, promptType) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Update active tab
    container.parentElement.querySelectorAll('.ai-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    container.parentElement.querySelector(`.ai-tab.${aiTool}`).classList.add('active');

    // Update content based on stored data or regenerate
    if (window.updateAITabContent) {
        window.updateAITabContent(aiTool, containerId, promptType);
    }
};