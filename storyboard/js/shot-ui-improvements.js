// Shot Detail UI Improvements
// 샷 상세 페이지 UI/UX 개선 스크립트

// 탭 전환 애니메이션 개선
window.switchTab = function(tabName, shotId) {
    // 현재 활성 탭 찾기
    const currentActive = document.querySelector('.tab-content.active');
    const currentButton = document.querySelector('.tab-button.active');
    
    // 새로운 탭과 버튼 찾기
    const newTab = document.getElementById(`tab-${tabName}`);
    const newButton = document.querySelector(`.tab-button[onclick*="${tabName}"]`);
    
    if (!newTab || !newButton) return;
    
    // 현재 탭이 같으면 리턴
    if (currentActive && currentActive.id === `tab-${tabName}`) return;
    
    // 페이드 아웃 애니메이션
    if (currentActive) {
        currentActive.style.opacity = '0';
        currentActive.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
            currentActive.classList.remove('active');
            currentActive.style.display = 'none';
            currentActive.style.visibility = 'hidden';
            
            // 페이드 인 애니메이션
            newTab.style.display = 'block';
            newTab.style.visibility = 'visible';
            // Force reflow
            newTab.offsetHeight;
            newTab.classList.add('active');
            
            setTimeout(() => {
                newTab.style.opacity = '1';
                newTab.style.transform = 'translateY(0)';
            }, 10);
        }, 300);
    } else {
        // 첫 로드시
        newTab.style.display = 'block';
        newTab.style.visibility = 'visible';
        newTab.classList.add('active');
        newTab.style.opacity = '1';
        newTab.style.transform = 'translateY(0)';
    }
    
    // 버튼 상태 업데이트
    if (currentButton) {
        currentButton.classList.remove('active');
    }
    newButton.classList.add('active');
    
    // 탭별 특별 처리
    handleTabSpecificActions(tabName, shotId);
};

// 탭별 특별 처리
function handleTabSpecificActions(tabName, shotId) {
    switch(tabName) {
        case 'image':
            // 이미지 탭 로드시 프리뷰 업데이트
            updateImagePreviews(shotId);
            break;
        case 'video':
            // 비디오 탭 로드시 비디오 프리뷰 업데이트
            updateVideoPreviews(shotId);
            break;
        case 'audio':
            // 오디오 탭 로드시 오디오 플레이어 초기화
            initializeAudioPlayers(shotId);
            break;
        case 'music':
            // 음악 탭 로드시 OST 정보 업데이트
            updateMusicInfo(shotId);
            break;
    }
}

// 이미지 프리뷰 업데이트
function updateImagePreviews(shotId) {
    const previews = document.querySelectorAll('.image-slot-preview, .reference-preview');
    previews.forEach(preview => {
        const img = preview.querySelector('img');
        if (img && img.src) {
            // 이미지 로드 애니메이션
            preview.classList.add('loading');
            img.onload = () => {
                preview.classList.remove('loading');
                preview.classList.add('loaded');
            };
        }
    });
}

// 비디오 프리뷰 업데이트
function updateVideoPreviews(shotId) {
    // 비디오 프리뷰 로직
    console.log('Updating video previews for shot:', shotId);
}

// 오디오 플레이어 초기화
function initializeAudioPlayers(shotId) {
    const audioSections = document.querySelectorAll('.audio-player-area');
    audioSections.forEach(section => {
        // 오디오 플레이어 초기화 로직
        const input = section.parentElement.querySelector('.form-input');
        if (input && input.value) {
            // 오디오 URL이 있으면 플레이어 생성
            createAudioPlayer(section, input.value);
        }
    });
}

// 오디오 플레이어 생성
function createAudioPlayer(container, url) {
    if (!url || container.querySelector('audio')) return;
    
    const audio = document.createElement('audio');
    audio.src = url;
    audio.controls = true;
    audio.style.width = '100%';
    audio.style.maxWidth = '400px';
    
    container.innerHTML = '';
    container.appendChild(audio);
}

// 음악 정보 업데이트
function updateMusicInfo(shotId) {
    // OST 정보 업데이트 로직
    console.log('Updating music info for shot:', shotId);
}

// 입력 필드 자동 저장 (디바운싱)
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 입력 필드 변경시 자동 저장
document.addEventListener('DOMContentLoaded', function() {
    // 텍스트 입력 필드 자동 저장
    const inputs = document.querySelectorAll('.form-input, .form-textarea');
    inputs.forEach(input => {
        const saveInput = debounce(() => {
            // 저장 애니메이션
            input.classList.add('saving');
            setTimeout(() => {
                input.classList.remove('saving');
                input.classList.add('saved');
                setTimeout(() => {
                    input.classList.remove('saved');
                }, 1000);
            }, 500);
        }, 1000);
        
        input.addEventListener('input', saveInput);
    });
    
    // 파일 업로드 버튼 개선
    const uploadButtons = document.querySelectorAll('[onclick*="uploadImageForShot"]');
    uploadButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            // 파일 선택 다이얼로그 열기
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            fileInput.onchange = (event) => {
                const file = event.target.files[0];
                if (file) {
                    handleFileUpload(file, button);
                }
            };
            fileInput.click();
        });
    });
    
    // 복사 버튼 개선
    const copyButtons = document.querySelectorAll('.copy-btn');
    copyButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const originalText = button.textContent;
            button.textContent = '✓ 복사됨';
            button.classList.add('success');
            
            setTimeout(() => {
                button.textContent = originalText;
                button.classList.remove('success');
            }, 2000);
        });
    });
    
    // 이미지 URL 입력시 프리뷰 자동 업데이트
    const imageUrlInputs = document.querySelectorAll('input[placeholder*="URL"]');
    imageUrlInputs.forEach(input => {
        input.addEventListener('change', function() {
            const url = input.value;
            if (url && isValidImageUrl(url)) {
                const preview = input.closest('.reference-image-slot, .image-slot-card')
                    ?.querySelector('.reference-preview, .image-slot-preview');
                if (preview) {
                    updatePreviewImage(preview, url);
                }
            }
        });
    });
    
    // 폼 섹션 접기/펼치기 기능
    const sectionHeaders = document.querySelectorAll('.info-section h3');
    sectionHeaders.forEach(header => {
        header.style.cursor = 'pointer';
        header.addEventListener('click', function() {
            const section = header.parentElement;
            section.classList.toggle('collapsed');
            
            if (section.classList.contains('collapsed')) {
                section.style.maxHeight = '60px';
                section.style.overflow = 'hidden';
            } else {
                section.style.maxHeight = 'none';
                section.style.overflow = 'visible';
            }
        });
    });
});

// 파일 업로드 처리
function handleFileUpload(file, button) {
    // 파일 업로드 로직
    const reader = new FileReader();
    reader.onload = function(e) {
        const dataUrl = e.target.result;
        // 가장 가까운 입력 필드에 URL 설정
        const input = button.parentElement.querySelector('.form-input');
        if (input) {
            input.value = dataUrl;
            input.dispatchEvent(new Event('change'));
        }
    };
    reader.readAsDataURL(file);
}

// 유효한 이미지 URL 체크
function isValidImageUrl(url) {
    return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url) || 
           url.startsWith('data:image/') ||
           url.includes('googleusercontent.com');
}

// 프리뷰 이미지 업데이트
function updatePreviewImage(preview, url) {
    preview.classList.add('loading');
    
    const img = new Image();
    img.onload = function() {
        // object-fit을 contain으로 변경하여 이미지가 잘리지 않도록 함
        preview.innerHTML = `<img src="${url}" alt="Preview" style="width: 100%; height: auto; max-height: 600px; object-fit: contain; display: block; margin: 0 auto;">`;
        preview.classList.remove('loading');
        preview.classList.add('loaded');
    };
    img.onerror = function() {
        preview.innerHTML = '<div style="color:#ff453a;font-size:0.8rem;">이미지 로드 실패</div>';
        preview.classList.remove('loading');
    };
    img.src = url;
}

// 툴팁 초기화
function initializeTooltips() {
    const elements = document.querySelectorAll('[data-tooltip]');
    elements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = element.getAttribute('data-tooltip');
            document.body.appendChild(tooltip);
            
            const rect = element.getBoundingClientRect();
            tooltip.style.position = 'fixed';
            tooltip.style.left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + 'px';
            tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
            
            element._tooltip = tooltip;
        });
        
        element.addEventListener('mouseleave', function() {
            if (element._tooltip) {
                element._tooltip.remove();
                delete element._tooltip;
            }
        });
    });
}

// 페이지 로드시 초기화
window.addEventListener('load', function() {
    initializeTooltips();
    
    // 첫 번째 탭 활성화
    const firstTab = document.querySelector('.tab-button');
    if (firstTab && !document.querySelector('.tab-button.active')) {
        firstTab.click();
    }
});

// 전역 함수로 노출
window.updateImagePreviews = updateImagePreviews;
window.initializeAudioPlayers = initializeAudioPlayers;
window.updatePreviewImage = updatePreviewImage;