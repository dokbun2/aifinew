// DOM에서 현재 샷 데이터를 수집하는 함수
window.collectCurrentDataFromDOM = function() {
    if (!currentData) {
        console.warn('currentData가 없습니다.');
        return null;
    }
    
    // currentData 복사본 생성
    const updatedData = JSON.parse(JSON.stringify(currentData));
    
    // 현재 활성화된 샷이 있는지 확인
    const contentTitle = document.getElementById('content-title');
    if (contentTitle && contentTitle.textContent.startsWith('샷:')) {
        // 현재 표시된 샷의 ID 추출
        const contentSubtitle = document.getElementById('content-subtitle');
        if (contentSubtitle) {
            const shotIdText = contentSubtitle.textContent;
            const shotId = shotIdText.replace('ID: ', '').trim();
            
            // 샷 데이터 찾기
            const shotIndex = updatedData.breakdown_data.shots.findIndex(s => s.id === shotId);
            if (shotIndex !== -1) {
                const shot = updatedData.breakdown_data.shots[shotIndex];
                
                // 메모 데이터 수집
                const memoTextarea = document.querySelector('.form-textarea');
                if (memoTextarea) {
                    if (!shot.memo) shot.memo = {};
                    shot.memo.content = memoTextarea.value;
                    shot.memo.updated_at = new Date().toISOString();
                }
                
                // 로컬 스토리지에서 이미지 데이터 수집
                const jsonFileName = localStorage.getItem('currentProjectFile') || 'storyboard_data.json';
                
                // 샷 메모 데이터
                const memoKey = `shotMemo_${jsonFileName}_${shotId}`;
                const savedMemo = localStorage.getItem(memoKey);
                if (savedMemo) {
                    if (!shot.memo) shot.memo = {};
                    shot.memo.content = savedMemo;
                }
                
                // AI 생성 이미지 데이터
                const imagesKey = `shotImages_${jsonFileName}_${shotId}`;
                const savedImages = localStorage.getItem(imagesKey);
                if (savedImages) {
                    try {
                        const imagesData = JSON.parse(savedImages);
                        if (!shot.image_design) shot.image_design = {};
                        if (!shot.image_design.ai_generated_images) {
                            shot.image_design.ai_generated_images = {};
                        }
                        // 저장된 이미지 데이터 병합
                        Object.assign(shot.image_design.ai_generated_images, imagesData);
                    } catch (e) {
                        console.error('이미지 데이터 파싱 오류:', e);
                    }
                }
                
                // 편집된 프롬프트 데이터
                const editedPromptsKey = `editedPrompts_${jsonFileName}`;
                const savedEditedPrompts = localStorage.getItem(editedPromptsKey);
                if (savedEditedPrompts) {
                    try {
                        const editedPrompts = JSON.parse(savedEditedPrompts);
                        if (!shot.edited_prompts) shot.edited_prompts = {};
                        Object.assign(shot.edited_prompts, editedPrompts);
                    } catch (e) {
                        console.error('편집된 프롬프트 데이터 파싱 오류:', e);
                    }
                }
                
                // 오디오 데이터
                const audioKey = `audioUrls_${jsonFileName}_${shotId}`;
                const savedAudio = localStorage.getItem(audioKey);
                if (savedAudio) {
                    try {
                        const audioData = JSON.parse(savedAudio);
                        if (!shot.content) shot.content = {};
                        if (!shot.content.audio_urls) shot.content.audio_urls = {};
                        Object.assign(shot.content.audio_urls, audioData);
                    } catch (e) {
                        console.error('오디오 데이터 파싱 오류:', e);
                    }
                }
                
                // 영상 프롬프트 데이터 수집 (Stage 7 데이터 포함)
                if (window.stage7VideoPrompts && window.stage7VideoPrompts[shotId]) {
                    if (!shot.video_prompts) shot.video_prompts = {};
                    Object.assign(shot.video_prompts, window.stage7VideoPrompts[shotId]);
                }
                
                // 영상 URL 데이터 수집
                const videoKey = `videoUrls_${jsonFileName}_${shotId}`;
                const savedVideo = localStorage.getItem(videoKey);
                if (savedVideo) {
                    try {
                        const videoData = JSON.parse(savedVideo);
                        if (!shot.video_urls) shot.video_urls = {};
                        Object.assign(shot.video_urls, videoData);
                    } catch (e) {
                        console.error('영상 데이터 파싱 오류:', e);
                    }
                }
                
                // 업데이트된 샷 데이터를 배열에 다시 저장
                updatedData.breakdown_data.shots[shotIndex] = shot;
            }
        }
    }
    
    // 모든 샷의 localStorage 데이터 수집 (현재 표시되지 않은 샷들도 포함)
    if (updatedData.breakdown_data && updatedData.breakdown_data.shots) {
        const jsonFileName = localStorage.getItem('currentProjectFile') || 'storyboard_data.json';
        
        updatedData.breakdown_data.shots.forEach((shot, index) => {
            // 샷 메모
            const memoKey = `shotMemo_${jsonFileName}_${shot.id}`;
            const savedMemo = localStorage.getItem(memoKey);
            if (savedMemo) {
                if (!shot.memo) shot.memo = {};
                shot.memo.content = savedMemo;
            }
            
            // AI 생성 이미지
            const imagesKey = `shotImages_${jsonFileName}_${shot.id}`;
            const savedImages = localStorage.getItem(imagesKey);
            if (savedImages) {
                try {
                    const imagesData = JSON.parse(savedImages);
                    if (!shot.image_design) shot.image_design = {};
                    if (!shot.image_design.ai_generated_images) {
                        shot.image_design.ai_generated_images = {};
                    }
                    Object.assign(shot.image_design.ai_generated_images, imagesData);
                } catch (e) {
                    console.error(`샷 ${shot.id} 이미지 데이터 파싱 오류:`, e);
                }
            }
            
            // 영상 프롬프트 데이터 수집 (Stage 7 데이터 포함)
            if (window.stage7VideoPrompts && window.stage7VideoPrompts[shot.id]) {
                if (!shot.video_prompts) shot.video_prompts = {};
                Object.assign(shot.video_prompts, window.stage7VideoPrompts[shot.id]);
            }
            
            // 영상 URL 데이터 수집
            const videoKey = `videoUrls_${jsonFileName}_${shot.id}`;
            const savedVideo = localStorage.getItem(videoKey);
            if (savedVideo) {
                try {
                    const videoData = JSON.parse(savedVideo);
                    if (!shot.video_urls) shot.video_urls = {};
                    Object.assign(shot.video_urls, videoData);
                } catch (e) {
                    console.error(`샷 ${shot.id} 영상 데이터 파싱 오류:`, e);
                }
            }
            
            // 오디오 URL
            const audioKey = `audioUrls_${jsonFileName}_${shot.id}`;
            const savedAudio = localStorage.getItem(audioKey);
            if (savedAudio) {
                try {
                    const audioData = JSON.parse(savedAudio);
                    if (!shot.content) shot.content = {};
                    if (!shot.content.audio_urls) shot.content.audio_urls = {};
                    Object.assign(shot.content.audio_urls, audioData);
                } catch (e) {
                    console.error(`샷 ${shot.id} 오디오 데이터 파싱 오류:`, e);
                }
            }
            
            // 샷 데이터 수집 완료
        });
    }
    
    return updatedData;
};

// 스토리보드 전역 함수들
window.exportJSON = function() {
    if (!currentData) {
        showMessage('내보낼 데이터가 없습니다', 'error');
        return;
    }
    
    try {
        // DOM과 localStorage에서 최신 데이터 수집
        console.log('📥 JSON Export 시작 - 최신 데이터 수집 중...');
        const dataToExport = window.collectCurrentDataFromDOM() || currentData;
        // 상세한 미디어 데이터 확인
        const videoShotsCount = dataToExport?.breakdown_data?.shots?.filter(s => s.video_urls && Object.keys(s.video_urls).length > 0).length || 0;
        const audioShotsCount = dataToExport?.breakdown_data?.shots?.filter(s => s.content?.audio_urls && Object.keys(s.content.audio_urls).length > 0).length || 0;
        const musicUrlsCount = dataToExport?.film_metadata?.project_music_urls ? Object.keys(dataToExport.film_metadata.project_music_urls).filter(key => dataToExport.film_metadata.project_music_urls[key]).length : 0;
        
        console.log('✅ 수집된 데이터:', {
            shots: dataToExport?.breakdown_data?.shots?.length || 0,
            hasImageData: dataToExport?.breakdown_data?.shots?.some(s => s.image_design?.ai_generated_images),
            hasMemoData: dataToExport?.breakdown_data?.shots?.some(s => s.memo?.content),
            hasVideoData: videoShotsCount > 0,
            videoShotsCount: videoShotsCount,
            hasAudioData: audioShotsCount > 0,
            audioShotsCount: audioShotsCount,
            hasMusicData: musicUrlsCount > 0,
            musicUrlsCount: musicUrlsCount
        });
        
        const dataStr = JSON.stringify(dataToExport, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const exportFileDefaultName = dataToExport.project_info?.name || 'storyboard_data.json';
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', url);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.style.display = 'none';
        document.body.appendChild(linkElement);
        
        // 다운로드 완료 감지를 위한 이벤트 리스너
        linkElement.addEventListener('click', function() {
            // 약간의 지연 후 메시지 표시 (브라우저가 다운로드를 시작할 시간을 줌)
            setTimeout(() => {
                // 포함된 미디어 데이터 정보를 포함한 메시지
                const mediaInfo = [];
                if (videoShotsCount > 0) mediaInfo.push(`영상 ${videoShotsCount}개`);
                if (audioShotsCount > 0) mediaInfo.push(`오디오 ${audioShotsCount}개`);
                if (musicUrlsCount > 0) mediaInfo.push(`음악 ${musicUrlsCount}개`);
                
                const mediaText = mediaInfo.length > 0 ? ` (${mediaInfo.join(', ')} 포함)` : '';
                showMessage(`JSON 파일이 다운로드되었습니다${mediaText}`, 'success');
                
                // Clean up
                URL.revokeObjectURL(url);
                document.body.removeChild(linkElement);
            }, 100);
        });
        
        linkElement.click();
    } catch (error) {
        console.error('Export error:', error);
        showMessage('내보내기 중 오류가 발생했습니다', 'error');
    }
};

window.clearAllData = function() {
    localStorage.clear();
    currentData = null;
    selectedType = null;
    selectedId = null;
    selectedSceneId = null;
    
    // UI 초기화
    document.getElementById('navigation-content').innerHTML = `
        <div class="empty-state" id="nav-empty">
            <div class="empty-state-icon">📁</div>
            <div>데이터가 없습니다</div>
            <div style="font-size: 0.9rem; margin-top: 10px;">JSON 가져오기를 사용해 데이터를 로드해주세요</div>
        </div>
    `;
    
    document.getElementById('content-area').innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon">🎬</div>
            <div>시퀀스, 씬, 또는 샷을 선택하여 상세 정보를 확인하세요</div>
        </div>
    `;
    
    showMessage('모든 데이터가 초기화되었습니다', 'success');
};

window.resetToDefaults = function() {
    // 기본 샘플 데이터 로드
    fetch('../sample-storyboard.json')
        .then(response => response.json())
        .then(data => {
            // app.js의 전역 변수와 함수 사용
            if (window.currentData !== undefined) {
                window.currentData = data;
            }
            localStorage.setItem('storyboardData', JSON.stringify(data));
            if (typeof window.updateNavigation === 'function') {
                window.updateNavigation();
            }
            window.showMessage('샘플 데이터가 로드되었습니다', 'success');
        })
        .catch(error => {
            console.error('Error loading default data:', error);
            // 샘플 데이터가 없는 경우 기본 구조 생성
            const defaultData = {
                project_info: {
                    name: "Sample Project",
                    description: "샘플 프로젝트입니다"
                },
                breakdown_data: {
                    sequences: [],
                    scenes: [],
                    shots: []
                }
            };
            if (window.currentData !== undefined) {
                window.currentData = defaultData;
            }
            localStorage.setItem('storyboardData', JSON.stringify(defaultData));
            if (typeof window.updateNavigation === 'function') {
                window.updateNavigation();
            }
            window.showMessage('기본 구조가 생성되었습니다', 'success');
        });
};

window.expandAll = function() {
    // 모든 시퀀스 헤더 클릭하여 씬 로드
    document.querySelectorAll('.sequence-header').forEach(header => {
        const sequenceId = header.getAttribute('data-sequence-id');
        if (sequenceId) {
            const container = document.getElementById(`scenes-${sequenceId}`);
            if (container && container.classList.contains('collapsed')) {
                // 클릭 이벤트 트리거하여 씬 로드
                header.click();
            }
        }
    });
    
    // 약간의 지연 후 모든 씬 헤더 클릭하여 샷 로드
    setTimeout(() => {
        document.querySelectorAll('.scene-header').forEach(header => {
            const sceneId = header.getAttribute('data-scene-id');
            if (sceneId) {
                const container = document.getElementById(`shots-${sceneId}`);
                if (container && container.classList.contains('collapsed')) {
                    // 클릭 이벤트 트리거하여 샷 로드
                    header.click();
                }
            }
        });
    }, 100);
};

window.collapseAll = function() {
    document.querySelectorAll('.sequence-header').forEach(header => {
        header.classList.remove('expanded');
        const container = header.nextElementSibling;
        if (container && container.classList.contains('scenes-container')) {
            container.classList.add('collapsed');
        }
    });
    
    document.querySelectorAll('.scene-header').forEach(header => {
        header.classList.remove('expanded');
        const container = header.nextElementSibling;
        if (container && container.classList.contains('shots-container')) {
            container.classList.add('collapsed');
        }
    });
};

// Message display function
window.showMessage = function(message, type) {
    const messageContainer = document.getElementById('message-container');
    if (!messageContainer) {
        const container = document.createElement('div');
        container.id = 'message-container';
        container.className = 'message-container';
        document.body.appendChild(container);
    }
    
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}-message`;
    messageElement.innerHTML = `
        ${message}
        <button class="close-button" onclick="this.parentElement.remove()">×</button>
    `;
    
    document.getElementById('message-container').appendChild(messageElement);
    
    if (type !== 'error') {
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.remove();
            }
        }, 2000);  // 5초에서 2초로 단축
    }
};

// Export global functions for use in HTML
if (typeof window !== 'undefined') {
    window.storyboardFunctions = {
        exportJSON: window.exportJSON,
        clearAllData: window.clearAllData,
        resetToDefaults: window.resetToDefaults,
        expandAll: window.expandAll,
        collapseAll: window.collapseAll,
        showMessage: window.showMessage,
        collectCurrentDataFromDOM: window.collectCurrentDataFromDOM
    };
}