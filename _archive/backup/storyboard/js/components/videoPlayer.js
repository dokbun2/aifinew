/* Video Player Component */

import { showMessage } from '../utils/common.js';

class VideoPlayer {
    constructor() {
        this.currentVideoData = null;
        this.playerContainer = null;
    }

    /**
     * Extract Google Drive file ID from URL
     */
    extractGoogleDriveId(url) {
        if (!url) return null;
        
        const patterns = [
            /\/file\/d\/([a-zA-Z0-9-_]+)/,
            /id=([a-zA-Z0-9-_]+)/,
            /\/folders\/([a-zA-Z0-9-_]+)/
        ];
        
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) return match[1];
        }
        
        return null;
    }

    /**
     * Create video player for Google Drive
     */
    createGoogleDrivePlayer(url, containerId) {
        const fileId = this.extractGoogleDriveId(url);
        if (!fileId) {
            showMessage('유효한 Google Drive URL이 아닙니다.', 'error');
            return null;
        }

        const container = document.getElementById(containerId);
        if (!container) return null;

        // Clear container
        container.innerHTML = '';

        // Create wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'video-wrapper';
        wrapper.style.cssText = `
            position: relative;
            width: 100%;
            height: 100%;
            background: #000;
        `;

        // Create loading indicator
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'simple-loading';
        loadingDiv.textContent = '동영상을 불러오는 중...';
        loadingDiv.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #fff;
            font-size: 1rem;
            z-index: 1;
        `;

        // Create iframe
        const iframe = document.createElement('iframe');
        iframe.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border: none;
            border-radius: 8px;
        `;
        
        // Google Drive embed URL
        iframe.src = `https://drive.google.com/file/d/${fileId}/preview`;
        iframe.setAttribute('allowfullscreen', 'true');
        iframe.setAttribute('allow', 'autoplay; encrypted-media; fullscreen');
        
        // Remove loading indicator after load
        iframe.onload = () => {
            setTimeout(() => {
                if (loadingDiv.parentNode) {
                    loadingDiv.remove();
                }
            }, 1000);
        };

        wrapper.appendChild(loadingDiv);
        wrapper.appendChild(iframe);
        container.appendChild(wrapper);

        // Store video data
        this.currentVideoData = {
            url: url,
            fileId: fileId,
            container: containerId
        };

        return wrapper;
    }

    /**
     * Create video player for direct video URL
     */
    createDirectVideoPlayer(url, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return null;

        // Clear container
        container.innerHTML = '';

        // Create video element
        const video = document.createElement('video');
        video.controls = true;
        video.style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: contain;
            background: #000;
            border-radius: 8px;
        `;
        
        video.src = url;
        video.setAttribute('controlsList', 'nodownload');
        
        // Error handling
        video.onerror = () => {
            showMessage('비디오를 로드할 수 없습니다.', 'error');
            container.innerHTML = `
                <div class="video-error">
                    <p>비디오를 재생할 수 없습니다.</p>
                    <a href="${url}" target="_blank" class="btn btn-primary">
                        새 창에서 열기
                    </a>
                </div>
            `;
        };

        container.appendChild(video);

        // Store video data
        this.currentVideoData = {
            url: url,
            container: containerId,
            element: video
        };

        return video;
    }

    /**
     * Create video player based on URL type
     */
    createVideoPlayer(url, containerId) {
        if (!url || !containerId) return null;

        // Check if it's a Google Drive URL
        if (url.includes('drive.google.com') || url.includes('docs.google.com')) {
            return this.createGoogleDrivePlayer(url, containerId);
        } else {
            return this.createDirectVideoPlayer(url, containerId);
        }
    }

    /**
     * Create video preview section
     */
    createVideoPreviewSection(videoUrl, aiTool) {
        const previewId = `video-preview-${aiTool}`;
        
        return `
            <div class="video-preview-section">
                <div class="video-url-input">
                    <input type="text" 
                           id="video-url-${aiTool}" 
                           class="form-input video-preview-url" 
                           placeholder="동영상 URL 입력 (Google Drive 지원)"
                           value="${videoUrl || ''}">
                    <button class="btn btn-primary" 
                            onclick="loadVideoPreview('${aiTool}')">
                        미리보기
                    </button>
                </div>
                <div id="${previewId}" class="video-preview-container" 
                     style="${videoUrl ? '' : 'display: none;'}">
                    <!-- Video will be loaded here -->
                </div>
                ${videoUrl ? `
                    <div class="video-options">
                        <a href="${videoUrl}" target="_blank" class="open-link">
                            ⬈ 새 창에서 열기
                        </a>
                        ${this.extractGoogleDriveId(videoUrl) ? `
                            <a href="https://drive.google.com/uc?export=download&id=${this.extractGoogleDriveId(videoUrl)}" 
                               target="_blank" class="open-link" download>
                                ⬇ 다운로드
                            </a>
                        ` : ''}
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Load video preview
     */
    loadVideoPreview(aiTool) {
        const urlInput = document.getElementById(`video-url-${aiTool}`);
        const previewContainer = document.getElementById(`video-preview-${aiTool}`);
        
        if (!urlInput || !previewContainer) return;
        
        const url = urlInput.value.trim();
        if (!url) {
            showMessage('동영상 URL을 입력해주세요.', 'warning');
            return;
        }
        
        // Show container
        previewContainer.style.display = 'block';
        
        // Create player
        this.createVideoPlayer(url, `video-preview-${aiTool}`);
        
        // Show success message
        showMessage('동영상을 불러왔습니다.', 'success');
        
        // Save URL if needed
        if (window.saveVideoUrl) {
            window.saveVideoUrl(aiTool, url);
        }
    }

    /**
     * Reload current video
     */
    reloadVideo() {
        if (!this.currentVideoData) return;
        
        const { url, container } = this.currentVideoData;
        showMessage('동영상을 다시 불러오는 중...', 'info');
        this.createVideoPlayer(url, container);
    }

    /**
     * Clear video player
     */
    clearPlayer(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = '';
            container.style.display = 'none';
        }
        
        if (this.currentVideoData && this.currentVideoData.container === containerId) {
            this.currentVideoData = null;
        }
    }
}

// Create singleton instance
export const videoPlayer = new VideoPlayer();

// Global functions for HTML onclick handlers
window.loadVideoPreview = function(aiTool) {
    videoPlayer.loadVideoPreview(aiTool);
};

window.reloadVideo = function() {
    videoPlayer.reloadVideo();
};

// Legacy support for existing simple_video_player.js functionality
window.createSimpleVideoPlayer = function(fileId, originalUrl, previewContainer, videoUrlDisplay) {
    // Create container ID if not exists
    const containerId = 'video-player-container';
    
    // Ensure container exists
    let container = document.getElementById(containerId);
    if (!container) {
        container = document.createElement('div');
        container.id = containerId;
        previewContainer.appendChild(container);
    }
    
    // Use videoPlayer to create player
    videoPlayer.createGoogleDrivePlayer(originalUrl, containerId);
    
    // Update URL display if provided
    if (videoUrlDisplay) {
        updateVideoUI(originalUrl, fileId, videoUrlDisplay, previewContainer);
    }
};

window.updateVideoUI = function(originalUrl, fileId, videoUrlDisplay, previewContainer) {
    const directStreamUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    
    if (videoUrlDisplay) {
        videoUrlDisplay.innerHTML = `
            원본 URL: ${originalUrl}<br>
            <div class="video-options">
                <a href="https://drive.google.com/file/d/${fileId}/view" target="_blank" rel="noopener noreferrer" class="open-link">
                    ⬈ 새 창에서 열기
                </a>
                <a href="${directStreamUrl}" target="_blank" rel="noopener noreferrer" class="open-link" download>
                    ⬇ 다운로드
                </a>
                <button onclick="reloadVideo()" class="toggle-btn">
                    🔄 다시 로드
                </button>
            </div>
        `;
    }
    
    // Show preview container
    if (previewContainer) {
        previewContainer.style.display = 'block';
        previewContainer.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }
    
    // Save to localStorage
    localStorage.setItem('googleDriveVideoUrl', originalUrl);
    localStorage.setItem('googleDriveVideoFileId', fileId);
};