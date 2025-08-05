/* Image Gallery Component */

import { showMessage, escapeHtml } from '../utils/common.js';
import { dataManager } from '../utils/dataManager.js';

class ImageGallery {
    constructor() {
        this.currentImages = [];
        this.modalElement = null;
        this.initializeModal();
    }

    /**
     * Initialize image modal
     */
    initializeModal() {
        // Check if modal already exists
        this.modalElement = document.getElementById('imageDisplayModal');
        
        if (!this.modalElement) {
            // Create modal if it doesn't exist
            this.createModal();
        }
        
        // Add event listeners
        this.modalElement.addEventListener('click', (e) => {
            if (e.target === this.modalElement || e.target.classList.contains('image-modal-close')) {
                this.closeModal();
            }
        });
    }

    /**
     * Create modal element
     */
    createModal() {
        const modal = document.createElement('div');
        modal.id = 'imageDisplayModal';
        modal.className = 'image-modal';
        modal.innerHTML = `
            <span class="image-modal-close">&times;</span>
            <img class="image-modal-content" id="modalImageContent">
            <div class="modal-caption" id="modalCaption"></div>
        `;
        document.body.appendChild(modal);
        this.modalElement = modal;
    }

    /**
     * Create gallery HTML for shot images
     */
    createShotImageGallery(shotData) {
        if (!shotData) return '';

        const images = this.extractImagesFromShot(shotData);
        
        if (images.length === 0) {
            return `
                <div class="empty-gallery">
                    <div class="empty-gallery-icon">🖼️</div>
                    <p>이 샷에 등록된 이미지가 없습니다.</p>
                </div>
            `;
        }

        let html = '<div class="image-gallery">';
        
        images.forEach((image, index) => {
            html += this.createGalleryItem(image, index);
        });
        
        html += '</div>';
        
        // Store current images for modal navigation
        this.currentImages = images;
        
        return html;
    }

    /**
     * Extract images from shot data
     */
    extractImagesFromShot(shotData) {
        const images = [];
        
        // Extract from visual consistency info
        if (shotData.visual_consistency_info) {
            const vci = shotData.visual_consistency_info;
            
            // Character images
            if (vci.character_ids) {
                vci.character_ids.forEach(charId => {
                    const charData = this.getCharacterData(charId);
                    if (charData?.image_url) {
                        images.push({
                            url: charData.image_url,
                            title: charData.name || charId,
                            type: 'character',
                            id: charId
                        });
                    }
                });
            }
            
            // Location images
            if (vci.location_id) {
                const locData = this.getLocationData(vci.location_id);
                if (locData?.image_url) {
                    images.push({
                        url: locData.image_url,
                        title: locData.name || vci.location_id,
                        type: 'location',
                        id: vci.location_id
                    });
                }
            }
            
            // Prop images
            if (vci.prop_ids) {
                vci.prop_ids.forEach(propId => {
                    const propData = this.getPropData(propId);
                    if (propData?.image_url) {
                        images.push({
                            url: propData.image_url,
                            title: propData.name || propId,
                            type: 'prop',
                            id: propId
                        });
                    }
                });
            }
        }
        
        // Extract from generated images
        if (shotData.generated_images) {
            Object.entries(shotData.generated_images).forEach(([aiTool, toolImages]) => {
                if (Array.isArray(toolImages)) {
                    toolImages.forEach((img, idx) => {
                        if (img.url) {
                            images.push({
                                url: img.url,
                                title: `${aiTool.toUpperCase()} - Image ${idx + 1}`,
                                type: 'generated',
                                aiTool: aiTool,
                                description: img.description
                            });
                        }
                    });
                }
            });
        }
        
        return images;
    }

    /**
     * Get character data from concept art
     */
    getCharacterData(characterId) {
        const conceptArt = dataManager.currentData?.concept_art_prompt_data;
        if (!conceptArt?.characters) return null;
        
        return conceptArt.characters.find(char => char.id === characterId);
    }

    /**
     * Get location data from concept art
     */
    getLocationData(locationId) {
        const conceptArt = dataManager.currentData?.concept_art_prompt_data;
        if (!conceptArt?.locations) return null;
        
        return conceptArt.locations.find(loc => loc.id === locationId);
    }

    /**
     * Get prop data from concept art
     */
    getPropData(propId) {
        const conceptArt = dataManager.currentData?.concept_art_prompt_data;
        if (!conceptArt?.props) return null;
        
        return conceptArt.props.find(prop => prop.id === propId);
    }

    /**
     * Create single gallery item HTML
     */
    createGalleryItem(image, index) {
        const typeColors = {
            character: '#FF6B6B',
            location: '#4ECDC4',
            prop: '#45B7D1',
            generated: '#9B59B6'
        };
        
        const typeLabels = {
            character: '캐릭터',
            location: '장소',
            prop: '소품',
            generated: '생성 이미지'
        };
        
        const color = typeColors[image.type] || '#666';
        const label = typeLabels[image.type] || '기타';
        
        return `
            <div class="gallery-item" data-index="${index}">
                <img src="${escapeHtml(image.url)}" 
                     alt="${escapeHtml(image.title)}"
                     onclick="openImageModal(${index})"
                     onerror="this.src='data:image/svg+xml,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'200\\' height=\\'150\\'><rect fill=\\'%23f0f0f0\\' width=\\'200\\' height=\\'150\\'/><text x=\\'50%\\' y=\\'50%\\' text-anchor=\\'middle\\' dy=\\'.3em\\' fill=\\'%23999\\'>이미지 로드 실패</text></svg>'"
                >
                <div class="gallery-item-overlay">
                    <div class="gallery-item-info">
                        <span class="type-badge" style="background: ${color}">${label}</span>
                        <span class="image-title">${escapeHtml(image.title)}</span>
                    </div>
                    <div class="gallery-item-actions">
                        <button class="btn btn-small btn-primary" onclick="openImageModal(${index})">
                            크게 보기
                        </button>
                        ${image.aiTool ? `
                            <button class="btn btn-small btn-secondary" onclick="copyImagePrompt('${image.aiTool}')">
                                프롬프트 복사
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Open image in modal
     */
    openModal(index) {
        if (!this.modalElement || !this.currentImages[index]) return;
        
        const image = this.currentImages[index];
        const modalImg = this.modalElement.querySelector('.image-modal-content');
        const caption = this.modalElement.querySelector('.modal-caption');
        
        if (modalImg) {
            modalImg.src = image.url;
            modalImg.alt = image.title;
        }
        
        if (caption) {
            let captionText = image.title;
            if (image.description) {
                captionText += ` - ${image.description}`;
            }
            caption.textContent = captionText;
        }
        
        this.modalElement.style.display = 'flex';
        this.currentImageIndex = index;
        
        // Add keyboard navigation
        document.addEventListener('keydown', this.handleKeyNavigation);
    }

    /**
     * Close modal
     */
    closeModal() {
        if (this.modalElement) {
            this.modalElement.style.display = 'none';
            document.removeEventListener('keydown', this.handleKeyNavigation);
        }
    }

    /**
     * Handle keyboard navigation in modal
     */
    handleKeyNavigation = (e) => {
        if (!this.modalElement || this.modalElement.style.display === 'none') return;
        
        switch(e.key) {
            case 'Escape':
                this.closeModal();
                break;
            case 'ArrowLeft':
                this.navigateImage(-1);
                break;
            case 'ArrowRight':
                this.navigateImage(1);
                break;
        }
    }

    /**
     * Navigate to previous/next image
     */
    navigateImage(direction) {
        if (!this.currentImages.length) return;
        
        let newIndex = this.currentImageIndex + direction;
        
        // Wrap around
        if (newIndex < 0) {
            newIndex = this.currentImages.length - 1;
        } else if (newIndex >= this.currentImages.length) {
            newIndex = 0;
        }
        
        this.openModal(newIndex);
    }

    /**
     * Create image upload section
     */
    createImageUploadSection(shotId, aiTool) {
        return `
            <div class="image-upload-section">
                <h5>이미지 추가</h5>
                <div class="gallery-upload-area">
                    <input type="text" 
                           id="image-url-${aiTool}" 
                           class="form-input" 
                           placeholder="이미지 URL 입력">
                    <button class="btn btn-primary" 
                            onclick="addImageToShot('${shotId}', '${aiTool}')">
                        추가
                    </button>
                </div>
                <div class="upload-help">
                    Google Drive, Imgur 등의 직접 이미지 URL을 입력하세요.
                </div>
            </div>
        `;
    }

    /**
     * Add image to shot
     */
    addImageToShot(shotId, aiTool) {
        const urlInput = document.getElementById(`image-url-${aiTool}`);
        if (!urlInput) return;
        
        const url = urlInput.value.trim();
        if (!url) {
            showMessage('이미지 URL을 입력해주세요.', 'warning');
            return;
        }
        
        const shot = dataManager.findShotById(shotId);
        if (!shot) {
            showMessage('샷을 찾을 수 없습니다.', 'error');
            return;
        }
        
        // Initialize generated_images if not exists
        if (!shot.generated_images) {
            shot.generated_images = {};
        }
        
        if (!shot.generated_images[aiTool]) {
            shot.generated_images[aiTool] = [];
        }
        
        // Add new image
        shot.generated_images[aiTool].push({
            url: url,
            timestamp: new Date().toISOString(),
            description: ''
        });
        
        // Save and refresh
        dataManager.saveToStorage();
        urlInput.value = '';
        showMessage('이미지가 추가되었습니다.', 'success');
        
        // Refresh the gallery if callback exists
        if (window.refreshImageGallery) {
            window.refreshImageGallery(shotId);
        }
    }
}

// Create singleton instance
export const imageGallery = new ImageGallery();

// Global functions for HTML onclick handlers
window.openImageModal = function(index) {
    imageGallery.openModal(index);
};

window.closeImageModal = function(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    imageGallery.closeModal();
};

window.addImageToShot = function(shotId, aiTool) {
    imageGallery.addImageToShot(shotId, aiTool);
};