// 간단하고 안전한 Google Drive 동영상 플레이어

function createSimpleVideoPlayer(fileId, originalUrl, previewContainer, videoUrlDisplay) {
    const videoWrapper = document.querySelector('.video-wrapper');
    
    // 기존 컨텐츠 정리
    videoWrapper.innerHTML = '';
    
    // 공식 Google Drive 임베드 방식 사용
    const iframe = document.createElement('iframe');
    iframe.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border: none;
        border-radius: 10px;
    `;
    
    // Google Drive 공식 임베드 URL (가장 안전한 방식)
    const embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
    iframe.src = embedUrl;
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.setAttribute('allow', 'autoplay; encrypted-media; fullscreen');
    
    // 로딩 표시기
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'simple-loading';
    loadingDiv.innerHTML = '동영상을 불러오는 중...';
    loadingDiv.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: #666;
        font-size: 1rem;
    `;
    
    videoWrapper.appendChild(loadingDiv);
    videoWrapper.appendChild(iframe);
    
    // 3초 후 로딩 표시기 제거
    setTimeout(() => {
        if (loadingDiv.parentNode) {
            loadingDiv.remove();
        }
    }, 3000);
    
    // UI 업데이트
    updateVideoUI(originalUrl, fileId, videoUrlDisplay, previewContainer);
    
    showNotification('동영상을 불러왔습니다. 재생되지 않으면 "새 창에서 열기"를 이용하세요.', 'info');
}

function updateVideoUI(originalUrl, fileId, videoUrlDisplay, previewContainer) {
    const directStreamUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    
    videoUrlDisplay.innerHTML = `
        원본 URL: ${originalUrl}<br>
        <div class="video-options">
            <a href="https://drive.google.com/file/d/${fileId}/view" target="_blank" rel="noopener noreferrer" class="open-link">
                ⬈ 새 창에서 열기
            </a>
            <a href="${directStreamUrl}" target="_blank" rel="noopener noreferrer" class="open-link" download>
                ⬇ 다운로드
            </a>
            <button onclick="reloadVideo('${fileId}', '${originalUrl}')" class="toggle-btn">
                🔄 다시 로드
            </button>
        </div>
    `;
    
    // 미리보기 컨테이너 표시
    previewContainer.style.display = 'block';
    
    // 스크롤하여 미리보기로 이동
    previewContainer.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
    });
    
    // localStorage에 저장
    localStorage.setItem('googleDriveVideoUrl', originalUrl);
    localStorage.setItem('googleDriveVideoFileId', fileId);
}

// 동영상 다시 로드
window.reloadVideo = function(fileId, originalUrl) {
    const previewContainer = document.getElementById('video-preview-container');
    const videoUrlDisplay = document.getElementById('video-url-display');
    
    showNotification('동영상을 다시 불러오는 중...', 'info');
    createSimpleVideoPlayer(fileId, originalUrl, previewContainer, videoUrlDisplay);
};