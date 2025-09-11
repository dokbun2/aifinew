/**
 * Content Display UI 모듈
 * 컨텐츠 표시 관련 UI 함수들
 */
(function(window) {
    'use strict';
    
    // 네임스페이스 생성
    window.ContentDisplay = window.ContentDisplay || {};
    
    /**
     * 헤더 정보 업데이트
     */
    window.ContentDisplay.updateHeaderInfo = function(data) {
        const projectInfo = document.getElementById('project-info');
        if (projectInfo && data?.project_info) {
            const info = data.project_info;
            let infoText = '';
            
            if (info.name) infoText += info.name;
            if (info.director) infoText += ` | 감독: ${info.director}`;
            if (info.genre) infoText += ` | 장르: ${info.genre}`;
            
            projectInfo.textContent = infoText || '프로젝트 정보';
        }
    };
    
    /**
     * 컨텐츠 영역 초기화
     */
    window.ContentDisplay.clearContent = function() {
        const contentArea = document.getElementById('content-area');
        const contentTitle = document.getElementById('content-title');
        const contentSubtitle = document.getElementById('content-subtitle');
        
        if (contentTitle) contentTitle.textContent = '프로젝트 선택';
        if (contentSubtitle) contentSubtitle.textContent = '좌측에서 시퀀스, 씬, 또는 샷을 선택하세요';
        
        if (contentArea) {
            contentArea.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🎬</div>
                    <div>시퀀스, 씬, 또는 샷을 선택하여 상세 정보를 확인하세요</div>
                </div>
            `;
        }
    };
    
    /**
     * 시퀀스 컨텐츠 표시
     */
    window.ContentDisplay.showSequenceContent = function(sequenceId, data) {
        const sequence = data?.breakdown_data?.sequences?.find(s => s.id === sequenceId);
        if (!sequence) return;
        
        const contentTitle = document.getElementById('content-title');
        const contentSubtitle = document.getElementById('content-subtitle');
        const contentArea = document.getElementById('content-area');
        
        if (contentTitle) contentTitle.textContent = sequence.name || `Sequence ${sequenceId}`;
        if (contentSubtitle) contentSubtitle.textContent = `시퀀스 ID: ${sequenceId}`;
        
        if (contentArea) {
            let html = '<div class="sequence-info">';
            
            // 시퀀스 정보 테이블
            html += '<table class="info-table">'; 
            html += `<tr><th>시퀀스 ID</th><td>${sequenceId}</td></tr>`;
            html += `<tr><th>시퀀스 명</th><td>${sequence.name || '-'}</td></tr>`;
            html += `<tr><th>설명</th><td>${sequence.description || '-'}</td></tr>`;
            
            // 포함된 씬 수
            const scenes = sequence.scenes || [];
            html += `<tr><th>포함된 씬</th><td>${scenes.length}개</td></tr>`;
            
            // 총 샷 수 계산
            let totalShots = 0;
            scenes.forEach(scene => {
                const shots = data.breakdown_data.shots?.filter(s => s.scene_id === scene.id) || [];
                totalShots += shots.length;
            });
            html += `<tr><th>총 샷 수</th><td>${totalShots}개</td></tr>`;
            
            html += '</table>';
            
            // 씬 리스트
            if (scenes.length > 0) {
                html += '<h3 style="margin-top: 30px; color: white;">포함된 씬</h3>';
                html += '<div class="scenes-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px; margin-top: 15px;">';
                
                scenes.forEach(scene => {
                    const shots = data.breakdown_data.shots?.filter(s => s.scene_id === scene.id) || [];
                    html += `
                        <div class="scene-card" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 15px; cursor: pointer;" 
                             onclick="window.showSceneContent('${scene.id}')">
                            <h4 style="margin: 0 0 10px 0; color: white;">${scene.name || 'Scene ' + scene.id}</h4>
                            <p style="margin: 5px 0; color: rgba(255,255,255,0.6); font-size: 13px;">${scene.description || '설명 없음'}</p>
                            <p style="margin: 5px 0; color: rgba(255,255,255,0.5); font-size: 12px;">샷 수: ${shots.length}개</p>
                        </div>
                    `;
                });
                
                html += '</div>';
            }
            
            html += '</div>';
            contentArea.innerHTML = html;
        }
    };
    
    /**
     * 씬 컨텐츠 표시
     */
    window.ContentDisplay.showSceneContent = function(sceneId, data) {
        const sequence = data?.breakdown_data?.sequences?.find(seq => 
            seq.scenes?.some(scene => scene.id === sceneId)
        );
        const scene = sequence?.scenes?.find(s => s.id === sceneId);
        
        if (!scene) return;
        
        const contentTitle = document.getElementById('content-title');
        const contentSubtitle = document.getElementById('content-subtitle');
        const contentArea = document.getElementById('content-area');
        
        if (contentTitle) contentTitle.textContent = scene.name || `Scene ${sceneId}`;
        if (contentSubtitle) contentSubtitle.textContent = `씬 ID: ${sceneId} | 시퀀스: ${sequence.name || sequence.id}`;
        
        if (contentArea) {
            let html = '<div class="scene-info">';
            
            // 씬 정보 테이블
            html += '<table class="info-table">';
            html += `<tr><th>씬 ID</th><td>${sceneId}</td></tr>`;
            html += `<tr><th>씬 명</th><td>${scene.name || '-'}</td></tr>`;
            html += `<tr><th>설명</th><td>${scene.description || '-'}</td></tr>`;
            html += `<tr><th>소속 시퀀스</th><td>${sequence.name || sequence.id}</td></tr>`;
            
            // 포함된 샷 수
            const shots = data.breakdown_data.shots?.filter(s => s.scene_id === sceneId) || [];
            html += `<tr><th>포함된 샷</th><td>${shots.length}개</td></tr>`;
            
            html += '</table>';
            
            // 샷 리스트
            if (shots.length > 0) {
                html += '<h3 style="margin-top: 30px; color: white;">포함된 샷</h3>';
                html += '<div class="shots-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; margin-top: 15px;">';
                
                shots.forEach(shot => {
                    html += `
                        <div class="shot-card" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 15px; cursor: pointer;" 
                             onclick="window.showShotContent('${shot.id}')">
                            <h4 style="margin: 0 0 10px 0; color: white;">${shot.name || 'Shot ' + shot.id}</h4>
                            <p style="margin: 5px 0; color: rgba(255,255,255,0.6); font-size: 13px;">${shot.description || '설명 없음'}</p>
                            <p style="margin: 5px 0; color: rgba(255,255,255,0.5); font-size: 12px;">프레임: ${shot.frames || '-'}</p>
                        </div>
                    `;
                });
                
                html += '</div>';
            }
            
            // 이미지/비디오 갤러리
            window.ContentDisplay.createSceneImageGallery?.(sceneId, data);
            window.ContentDisplay.createSceneVideoGallery?.(sceneId, data);
            
            html += '</div>';
            contentArea.innerHTML = html;
        }
    };
    
    /**
     * 탭 생성 헬퍼 함수
     */
    window.ContentDisplay.createTabs = function(tabs, activeTab = 0) {
        let html = '<div class="content-tabs">';
        
        tabs.forEach((tab, index) => {
            html += `
                <button class="tab-button ${index === activeTab ? 'active' : ''}" 
                        onclick="window.ContentDisplay.switchTab(${index})">
                    ${tab.title}
                </button>
            `;
        });
        
        html += '</div>';
        html += '<div class="tab-contents">';
        
        tabs.forEach((tab, index) => {
            html += `
                <div class="tab-content ${index === activeTab ? 'active' : ''}" 
                     id="tab-content-${index}">
                    ${tab.content}
                </div>
            `;
        });
        
        html += '</div>';
        
        return html;
    };
    
    /**
     * 탭 전환 함수
     */
    window.ContentDisplay.switchTab = function(tabIndex) {
        // 모든 탭 버튼과 컨텐츠 비활성화
        document.querySelectorAll('.tab-button').forEach((btn, index) => {
            if (index === tabIndex) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        document.querySelectorAll('.tab-content').forEach((content, index) => {
            if (index === tabIndex) {
                content.classList.add('active');
                content.style.display = 'block';
            } else {
                content.classList.remove('active');
                content.style.display = 'none';
            }
        });
    };
    
    /**
     * 빈 상태 표시
     */
    window.ContentDisplay.showEmptyState = function(message, icon = '📁') {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">${icon}</div>
                <div>${message}</div>
            </div>
        `;
    };
    
    // 기존 전역 함수와의 호환성 유지
    if (!window.updateHeaderInfo) {
        window.updateHeaderInfo = window.ContentDisplay.updateHeaderInfo;
    }
    if (!window.showSequenceContent) {
        window.showSequenceContent = function(sequenceId) {
            window.ContentDisplay.showSequenceContent(sequenceId, window.currentData);
        };
    }
    if (!window.showSceneContent) {
        window.showSceneContent = function(sceneId) {
            window.ContentDisplay.showSceneContent(sceneId, window.currentData);
        };
    }
    
})(window);