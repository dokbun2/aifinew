// imageManager.js - 이미지 관리 모듈

import { state, getCurrentConcept, saveToLocalStorage, VARIATION_TYPES_MAP } from './dataManager.js';
import { showToast, isValidUrl, extractGoogleDriveFileId } from './utils.js';

/**
 * 이미지 추가
 * @param {string} aiTool - AI 도구 이름
 * @param {string} type - 이미지 타입
 * @param {number} index - 변형 인덱스 (선택사항)
 */
export function addImage(aiTool, type, index = null) {
    const concept = getCurrentConcept();
    if (!concept) {
        showToast('선택된 컨셉아트가 없습니다.');
        return;
    }
    
    const newUrl = prompt('이미지 URL을 입력하세요 (구글 드라이브 링크 가능):');
    if (!newUrl || newUrl.trim() === '') return;
    
    // 이미지 구조 초기화
    if (!concept.generated_images) concept.generated_images = { base_prompts: {}, variations: {} };
    if (type === 'base' && !concept.generated_images.base_prompts) concept.generated_images.base_prompts = {};
    if (type !== 'base' && !concept.generated_images.variations) concept.generated_images.variations = {};
    if (type !== 'base' && !concept.generated_images.variations[aiTool]) concept.generated_images.variations[aiTool] = {};
    
    setImageUrl(aiTool, type, index, newUrl.trim(), concept);
}

/**
 * 이미지 파일 업로드
 * @param {string} aiTool - AI 도구 이름
 * @param {string} type - 이미지 타입
 * @param {number} index - 변형 인덱스 (선택사항)
 */
export function uploadImageFile(aiTool, type, index = null) {
    const concept = getCurrentConcept();
    if (!concept) {
        showToast('선택된 컨셉아트가 없습니다.');
        return;
    }
    
    // 이미지 구조 초기화
    if (!concept.generated_images) concept.generated_images = { base_prompts: {}, variations: {} };
    if (type === 'base' && !concept.generated_images.base_prompts) concept.generated_images.base_prompts = {};
    if (type !== 'base' && !concept.generated_images.variations) concept.generated_images.variations = {};
    if (type !== 'base' && !concept.generated_images.variations[aiTool]) concept.generated_images.variations[aiTool] = {};
    
    selectLocalImageFile(aiTool, type, index, concept);
}

/**
 * 이미지 URL 설정
 * @param {string} aiTool - AI 도구 이름
 * @param {string} type - 이미지 타입
 * @param {number} index - 변형 인덱스
 * @param {string} imageUrl - 이미지 URL
 * @param {Object} concept - 컨셉 데이터
 */
function setImageUrl(aiTool, type, index, imageUrl, concept) {
    if (type === 'base') {
        concept.generated_images.base_prompts[aiTool] = imageUrl;
        displayImage(aiTool, 'base', imageUrl);
    } else {
        const variationKey = `${VARIATION_TYPES_MAP[type].schema_key_base}_${index}`;
        concept.generated_images.variations[aiTool][variationKey] = imageUrl;
        displayImage(aiTool, `${type}_${index}`, imageUrl);
    }
    saveToLocalStorage();
    updateImageGallery(concept);
    showToast('이미지가 업데이트되었습니다.');
}

/**
 * 로컬 이미지 파일 선택
 * @param {string} aiTool - AI 도구 이름
 * @param {string} type - 이미지 타입
 * @param {number} index - 변형 인덱스
 * @param {Object} concept - 컨셉 데이터
 */
function selectLocalImageFile(aiTool, type, index, concept) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        // 이미지 파일을 Data URL로 변환
        const reader = new FileReader();
        reader.onload = function(event) {
            const dataUrl = event.target.result;
            setImageUrl(aiTool, type, index, dataUrl, concept);
        };
        reader.readAsDataURL(file);
        
        // input 요소 정리
        document.body.removeChild(input);
    };
    
    document.body.appendChild(input);
    input.click();
}

/**
 * 이미지 표시
 * @param {string} aiTool - AI 도구 이름
 * @param {string} type - 이미지 타입
 * @param {string} imageUrl - 이미지 URL
 */
export function displayImage(aiTool, type, imageUrl) {
    const containerId = `image-${type}-${aiTool}`;
    const container = document.getElementById(containerId);
    
    if (!container) return;
    
    container.innerHTML = '';
    
    if (!imageUrl) {
        container.innerHTML = '<div class="no-image-message">이미지를 추가하려면 버튼을 클릭하세요</div>';
        return;
    }
    
    // Google Drive URL 처리
    let displayUrl = imageUrl;
    if (imageUrl.includes('drive.google.com')) {
        const fileId = extractGoogleDriveFileId(imageUrl);
        if (fileId) {
            displayUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`;
        }
    }
    
    const img = document.createElement('img');
    img.src = displayUrl;
    img.alt = `${type} - ${aiTool}`;
    img.style.cursor = 'pointer';
    img.onclick = () => openImageModal(displayUrl);
    
    img.onerror = function() {
        if (imageUrl.includes('drive.google.com')) {
            container.innerHTML = `
                <div class="no-image-message">
                    구글 드라이브 이미지를 로드할 수 없습니다.<br>
                    <a href="${imageUrl}" target="_blank" rel="noopener noreferrer">새 탭에서 열기</a>
                </div>
            `;
        } else if (imageUrl.startsWith('data:image')) {
            // Data URL의 경우 원본을 그대로 사용
            this.src = imageUrl;
        } else {
            container.innerHTML = '<div class="no-image-message">이미지를 로드할 수 없습니다.</div>';
        }
    };
    
    container.appendChild(img);
}

/**
 * 이미지 갤러리 업데이트
 * @param {Object} concept - 컨셉 데이터
 */
export function updateImageGallery(concept) {
    const galleryContent = document.getElementById('image-gallery-content');
    if (!galleryContent) return;
    
    galleryContent.innerHTML = '';
    
    if (!concept?.generated_images) {
        galleryContent.innerHTML = '<div class="no-image-message">컨셉아트를 선택하고 이미지를 추가하면 갤러리가 표시됩니다.</div>';
        return;
    }
    
    const images = [];
    
    // 기본 프롬프트 이미지 수집
    if (concept.generated_images.base_prompts) {
        for (const [aiTool, imageUrl] of Object.entries(concept.generated_images.base_prompts)) {
            if (imageUrl) {
                images.push({
                    url: imageUrl,
                    aiTool: aiTool,
                    type: '기본 프롬프트',
                    title: `${aiTool.toUpperCase()} - 기본`
                });
            }
        }
    }
    
    // 변형 프롬프트 이미지 수집
    if (concept.generated_images.variations) {
        for (const [aiTool, variations] of Object.entries(concept.generated_images.variations)) {
            for (const [variationKey, imageUrl] of Object.entries(variations)) {
                if (imageUrl) {
                    const typeInfo = getVariationTypeInfo(variationKey);
                    images.push({
                        url: imageUrl,
                        aiTool: aiTool,
                        type: typeInfo.type,
                        title: `${aiTool.toUpperCase()} - ${typeInfo.label}`
                    });
                }
            }
        }
    }
    
    // 이미지 카드 생성
    if (images.length === 0) {
        galleryContent.innerHTML = '<div class="no-image-message">아직 추가된 이미지가 없습니다.</div>';
        return;
    }
    
    images.forEach(imageData => {
        const card = createImageCard(imageData);
        galleryContent.appendChild(card);
    });
}

/**
 * 변형 타입 정보 가져오기
 * @param {string} variationKey - 변형 키
 * @returns {Object} 타입 정보
 */
function getVariationTypeInfo(variationKey) {
    for (const [typeKey, typeInfo] of Object.entries(VARIATION_TYPES_MAP)) {
        if (variationKey.startsWith(typeInfo.schema_key_base)) {
            const index = variationKey.split('_').pop();
            if (!isNaN(index)) {
                return {
                    type: typeInfo.name_kr,
                    label: `${typeInfo.name_kr} ${index}`
                };
            }
        }
    }
    return { type: '변형', label: variationKey };
}

/**
 * 이미지 카드 생성
 * @param {Object} imageData - 이미지 데이터
 * @returns {HTMLElement} 이미지 카드 요소
 */
function createImageCard(imageData) {
    const card = document.createElement('div');
    card.className = 'image-card';
    
    let displayUrl = imageData.url;
    if (imageData.url.includes('drive.google.com')) {
        const fileId = extractGoogleDriveFileId(imageData.url);
        if (fileId) {
            displayUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`;
        }
    }
    
    card.innerHTML = `
        <img src="${displayUrl}" alt="${imageData.title}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y0ZjRmNCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBOb3QgRm91bmQ8L3RleHQ+PC9zdmc+'">
        <div class="image-card-info">
            <h4>${imageData.title}</h4>
            <p>${imageData.type}</p>
        </div>
    `;
    
    card.onclick = () => openImageModal(displayUrl);
    
    return card;
}

/**
 * 이미지 모달 열기
 * @param {string} imageUrl - 이미지 URL
 */
export function openImageModal(imageUrl) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    
    if (modal && modalImg) {
        modal.style.display = 'flex';
        modalImg.src = imageUrl;
    }
}

/**
 * 이미지 모달 닫기
 * @param {Event} event - 클릭 이벤트
 */
export function closeImageModal(event) {
    const modal = document.getElementById('imageModal');
    if (event.target === modal || event.target.className === 'image-modal-close') {
        modal.style.display = 'none';
    }
}

/**
 * 저장된 이미지 로드 및 표시
 * @param {Object} concept - 컨셉 데이터
 */
export function loadAndDisplayImages(concept) {
    if (!concept?.generated_images) return;
    
    // 기본 프롬프트 이미지
    if (concept.generated_images.base_prompts) {
        for (const [aiTool, imageUrl] of Object.entries(concept.generated_images.base_prompts)) {
            if (imageUrl) {
                displayImage(aiTool, 'base', imageUrl);
            }
        }
    }
    
    // 변형 프롬프트 이미지
    if (concept.generated_images.variations) {
        for (const [aiTool, variations] of Object.entries(concept.generated_images.variations)) {
            for (const [variationKey, imageUrl] of Object.entries(variations)) {
                if (imageUrl) {
                    // variationKey에서 타입과 인덱스 추출
                    for (const [typeKey, typeInfo] of Object.entries(VARIATION_TYPES_MAP)) {
                        if (variationKey.startsWith(typeInfo.schema_key_base)) {
                            const index = variationKey.split('_').pop();
                            if (!isNaN(index)) {
                                displayImage(aiTool, `${typeKey}_${index}`, imageUrl);
                                break;
                            }
                        }
                    }
                }
            }
        }
    }
    
    // 갤러리 업데이트
    updateImageGallery(concept);
}