// Concept Art Gallery JavaScript
(function() {
    'use strict';

    // 상태 관리
    const galleryState = {
        conceptArtData: {
            characters: {},
            locations: {},
            props: {}
        },
        imagesByCategory: {
            characters: [],
            locations: [],
            props: []
        },
        totalCounts: {
            characters: 0,
            locations: 0,
            props: 0
        }
    };

    // AI 도구 정보
    const AI_TOOLS = {
        midjourney: { name: 'Midjourney', color: '#5865F2' },
        dalle: { name: 'DALL-E', color: '#10A37F' },
        stable_diffusion: { name: 'Stable Diffusion', color: '#FF6B6B' },
        leonardo: { name: 'Leonardo.ai', color: '#9333EA' },
        bing: { name: 'Bing Creator', color: '#0078D4' },
        ideogram: { name: 'Ideogram', color: '#FF4785' },
        playground: { name: 'Playground AI', color: '#F59E0B' }
    };

    // 드롭박스 URL 변환 함수
    function convertDropboxUrl(url) {
        if (!url) return url;
        
        // 드롭박스 URL인지 확인
        if (url.includes('dropbox.com')) {
            // dl=0을 raw=1로 변경
            if (url.includes('dl=0')) {
                return url.replace('dl=0', 'raw=1');
            }
            // dl 파라미터가 없으면 raw=1 추가
            else if (!url.includes('dl=') && !url.includes('raw=')) {
                const separator = url.includes('?') ? '&' : '?';
                return url + separator + 'raw=1';
            }
        }
        
        return url;
    }

    // 유틸리티 함수들
    const utils = {
        extractGoogleDriveFileId: function(url) {
            if (!url || typeof url !== 'string') return null;
            const patterns = [
                /\/file\/d\/([a-zA-Z0-9-_]+)/,
                /id=([a-zA-Z0-9-_]+)/,
                /\/d\/([a-zA-Z0-9-_]+)/
            ];
            
            for (const pattern of patterns) {
                const match = url.match(pattern);
                if (match && match[1]) {
                    return match[1];
                }
            }
            return null;
        },

        showToast: function(message, duration = 3000) {
            const toast = document.getElementById('toast-message');
            if (toast) {
                toast.textContent = message;
                toast.classList.add('show');
                setTimeout(() => {
                    toast.classList.remove('show');
                }, duration);
            }
        },

        smoothScroll: function(target) {
            const element = document.querySelector(target);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    };

    // 데이터 로드 함수
    function loadConceptArtData() {
        try {
            const storedData = localStorage.getItem('conceptArtManagerData_v1.2');
            if (storedData) {
                const parsedData = JSON.parse(storedData);
                // 직접 저장된 데이터 구조 확인
                if (parsedData.conceptArtData) {
                    galleryState.conceptArtData = parsedData.conceptArtData;
                    return true;
                }
                // JSON export 형식 확인
                else if (parsedData.concept_art_collection) {
                    galleryState.conceptArtData = parsedData.concept_art_collection;
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error('데이터 로드 실패:', error);
            return false;
        }
    }

    // 이미지 수집 함수
    function collectAllImages() {
        const categories = ['characters', 'locations', 'props'];
        
        console.log('컨셉아트 데이터:', galleryState.conceptArtData);
        
        categories.forEach(category => {
            const categoryData = galleryState.conceptArtData[category] || {};
            const images = [];
            
            console.log(`${category} 카테고리 데이터:`, categoryData);
            
            Object.entries(categoryData).forEach(([conceptId, concept]) => {
                // 메인 이미지 (새로운 구조)
                if (concept.main_image_url) {
                    images.push({
                        url: concept.main_image_url,
                        conceptName: concept.name_kr || concept.name || conceptId,
                        conceptId: conceptId,
                        type: '메인 이미지',
                        aiTool: 'main',
                        description: concept.description || ''
                    });
                }
                
                // 추가 이미지 (새로운 구조 - image_1, image_2, etc.)
                if (concept.additional_images) {
                    // 새로운 구조 확인 (image_1, image_2, etc.)
                    for (let i = 1; i <= 4; i++) {
                        const imageKey = `image_${i}`;
                        const imageData = concept.additional_images[imageKey];
                        if (imageData && imageData.url) {
                            images.push({
                                url: imageData.url,
                                conceptName: concept.name_kr || concept.name || conceptId,
                                conceptId: conceptId,
                                type: `추가 이미지 ${i}`,
                                aiTool: 'additional',
                                description: imageData.description || concept.description || '',
                                imageType: imageData.type || 'reference'
                            });
                        }
                    }
                    
                    // 구버전 호환성 (배열 구조)
                    Object.entries(concept.additional_images).forEach(([aiTool, additionalImages]) => {
                        if (Array.isArray(additionalImages)) {
                            additionalImages.forEach((imageData, index) => {
                                if (imageData.url) {
                                    images.push({
                                        url: imageData.url,
                                        conceptName: concept.name_kr || concept.name || conceptId,
                                        conceptId: conceptId,
                                        type: `추가 이미지 ${index + 1}`,
                                        aiTool: aiTool,
                                        description: imageData.description || concept.description || '',
                                        imageType: imageData.imageType || ''
                                    });
                                }
                            });
                        }
                    });
                }
                
                // 기존 generated_images 구조도 지원 (하위 호환성)
                if (concept.generated_images?.base_prompts) {
                    Object.entries(concept.generated_images.base_prompts).forEach(([aiTool, imageUrl]) => {
                        if (imageUrl) {
                            images.push({
                                url: imageUrl,
                                conceptName: concept.name_kr || concept.name || conceptId,
                                conceptId: conceptId,
                                type: '기본 프롬프트',
                                aiTool: aiTool,
                                description: concept.description || ''
                            });
                        }
                    });
                }
                
                // 변형 프롬프트 이미지 (캐릭터만)
                if (category === 'characters' && concept.generated_images?.variations) {
                    Object.entries(concept.generated_images.variations).forEach(([aiTool, variations]) => {
                        Object.entries(variations).forEach(([variationKey, imageUrl]) => {
                            if (imageUrl) {
                                images.push({
                                    url: imageUrl,
                                    conceptName: concept.name_kr || concept.name || conceptId,
                                    conceptId: conceptId,
                                    type: getVariationTypeName(variationKey),
                                    aiTool: aiTool,
                                    description: concept.description || ''
                                });
                            }
                        });
                    });
                }
            });
            
            galleryState.imagesByCategory[category] = images;
            galleryState.totalCounts[category] = images.length;
        });
    }

    // 변형 타입 이름 가져오기
    function getVariationTypeName(variationKey) {
        const typeMap = {
            'age_variation': '나이 변형',
            'emotion_': '감정 표현',
            'costume_': '의상 변형',
            'action_': '액션 포즈',
            'angle_': '각도 변형'
        };
        
        for (const [key, name] of Object.entries(typeMap)) {
            if (variationKey.includes(key)) {
                const index = variationKey.split('_').pop();
                return `${name} ${index}`;
            }
        }
        
        return '변형';
    }

    // 이미지 카드 생성
    function createImageCard(imageData) {
        const card = document.createElement('div');
        card.className = 'gallery-item';
        
        let displayUrl = imageData.url;
        
        // 드롭박스 URL 처리
        if (imageData.url.includes('dropbox.com')) {
            displayUrl = convertDropboxUrl(imageData.url);
        }
        // 구글 드라이브 URL 처리
        else if (imageData.url.includes('drive.google.com')) {
            const fileId = utils.extractGoogleDriveFileId(imageData.url);
            if (fileId) {
                displayUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`;
            }
        }
        
        const aiToolInfo = AI_TOOLS[imageData.aiTool] || { name: imageData.aiTool, color: '#666' };
        
        card.innerHTML = `
            <img class="gallery-item-image" 
                 src="${displayUrl}" 
                 alt="${imageData.conceptName}" 
                 onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y0ZjRmNCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBOb3QgRm91bmQ8L3RleHQ+PC9zdmc+'">
            <div class="gallery-item-info">
                <h3 class="gallery-item-title">${imageData.conceptName}</h3>
                <p class="gallery-item-subtitle">${imageData.type}</p>
                <div class="gallery-item-tags">
                    <span class="gallery-item-tag" style="background-color: ${aiToolInfo.color}20; color: ${aiToolInfo.color}">
                        ${aiToolInfo.name}
                    </span>
                    ${imageData.imageType ? `<span class="gallery-item-tag">${imageData.imageType}</span>` : ''}
                </div>
            </div>
        `;
        
        card.onclick = () => openImageModal(displayUrl);
        
        return card;
    }

    // 갤러리 렌더링
    function renderGallery() {
        const categories = ['characters', 'locations', 'props'];
        const categoryNames = {
            characters: 'character',
            locations: 'location',
            props: 'prop'
        };
        
        categories.forEach(category => {
            const grid = document.getElementById(`${categoryNames[category]}-grid`);
            const count = document.getElementById(`${categoryNames[category]}-count`);
            const sectionCount = document.getElementById(`${categoryNames[category]}-section-count`);
            
            if (grid) {
                grid.innerHTML = '';
                
                const images = galleryState.imagesByCategory[category];
                if (images.length === 0) {
                    grid.innerHTML = '<div class="no-images-message">이 카테고리에는 아직 이미지가 없습니다.</div>';
                } else {
                    images.forEach(imageData => {
                        grid.appendChild(createImageCard(imageData));
                    });
                }
            }
            
            if (count) {
                count.textContent = galleryState.totalCounts[category];
            }
            
            if (sectionCount) {
                sectionCount.textContent = `총 ${galleryState.totalCounts[category]}개`;
            }
        });
    }

    // 이미지 모달 열기
    function openImageModal(imageUrl) {
        const modal = document.getElementById('imageModal');
        const modalImg = document.getElementById('modalImage');
        
        if (modal && modalImg) {
            modal.style.display = 'flex';
            modalImg.src = imageUrl;
        }
    }

    // 이미지 모달 닫기
    function closeImageModal(event) {
        const modal = document.getElementById('imageModal');
        if (event.target === modal || event.target.className === 'image-modal-close') {
            modal.style.display = 'none';
        }
    }

    // 맨 위로 스크롤
    function scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Back to Top 버튼 표시/숨김
    function handleBackToTopVisibility() {
        const backToTopBtn = document.getElementById('back-to-top');
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    }

    // 부드러운 스크롤 네비게이션
    function setupSmoothScrolling() {
        const navLinks = document.querySelectorAll('.gallery-nav-item');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = link.getAttribute('href');
                utils.smoothScroll(target);
            });
        });
    }

    // 디버깅용 - localStorage 데이터 확인
    function debugLocalStorage() {
        console.log('=== localStorage 디버깅 ===');
        const keys = Object.keys(localStorage);
        console.log('모든 localStorage 키:', keys);
        
        // conceptArtManagerData로 시작하는 모든 키 확인
        const conceptArtKeys = keys.filter(key => key.includes('conceptArt'));
        console.log('컨셉아트 관련 키:', conceptArtKeys);
        
        conceptArtKeys.forEach(key => {
            try {
                const data = JSON.parse(localStorage.getItem(key));
                console.log(`${key} 데이터 구조:`, Object.keys(data));
                if (data.conceptArtData) {
                    console.log('conceptArtData 구조:', data.conceptArtData);
                }
            } catch (e) {
                console.error(`${key} 파싱 실패:`, e);
            }
        });
    }

    // 초기화
    function initialize() {
        // 디버깅
        debugLocalStorage();
        
        // 데이터 로드
        const loadSuccess = loadConceptArtData();
        
        const loadingIndicator = document.getElementById('loading-indicator');
        const galleryContent = document.getElementById('gallery-content');
        
        if (loadSuccess) {
            // 이미지 수집
            collectAllImages();
            
            // 전체 이미지 수 확인
            const totalImages = galleryState.totalCounts.characters + 
                              galleryState.totalCounts.locations + 
                              galleryState.totalCounts.props;
            
            console.log('총 이미지 수:', totalImages);
            console.log('카테고리별 이미지 수:', galleryState.totalCounts);
            
            if (totalImages === 0) {
                if (loadingIndicator) {
                    loadingIndicator.innerHTML = '<p>컨셉아트는 있지만 아직 생성된 이미지가 없습니다.<br>컨셉아트 페이지에서 이미지를 추가해주세요.</p>';
                }
                return;
            }
            
            // 갤러리 렌더링
            renderGallery();
            
            // UI 표시
            if (loadingIndicator) loadingIndicator.style.display = 'none';
            if (galleryContent) galleryContent.style.display = 'block';
            
            utils.showToast('갤러리를 성공적으로 불러왔습니다.');
        } else {
            if (loadingIndicator) {
                loadingIndicator.innerHTML = '<p>컨셉아트 데이터가 없습니다.<br>먼저 컨셉아트 페이지에서 컨셉아트를 추가해주세요.</p><p style="margin-top: 20px;"><a href="index.html" class="header-btn">컨셉아트 페이지로 이동</a></p>';
            }
        }
        
        // 이벤트 리스너 설정
        setupSmoothScrolling();
        window.addEventListener('scroll', handleBackToTopVisibility);
        
        // 전역 함수 등록
        window.openImageModal = openImageModal;
        window.closeImageModal = closeImageModal;
        window.scrollToTop = scrollToTop;
    }

    // DOM 로드 후 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
})();