/**
 * Navigation UI 모듈
 * 사이드바 네비게이션 관련 UI 함수들
 */
(function(window) {
    'use strict';
    
    // 네임스페이스 생성
    window.NavigationUI = window.NavigationUI || {};
    
    /**
     * 네비게이션 트리 업데이트
     */
    window.NavigationUI.updateNavigation = function(data) {
        const navContent = document.getElementById('navigation-content');
        if (!navContent) return;
        
        if (!data || !data.breakdown_data) {
            navContent.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📁</div>
                    <div>데이터가 없습니다</div>
                    <div style="font-size: 12px; margin-top: 10px;">JSON 파일을 가져오세요</div>
                </div>
            `;
            return;
        }
        
        let html = '';
        const sequences = data.breakdown_data.sequences || [];
        
        sequences.forEach(sequence => {
            const sequenceId = sequence.id;
            const isExpanded = window.expandedSequences?.has(sequenceId);
            
            html += `
                <div class="sequence-item">
                    <div class="sequence-header ${isExpanded ? 'expanded' : ''}" 
                         onclick="window.toggleSequence('${sequenceId}')">
                        <span class="toggle-icon">▶</span>
                        <span>${sequence.name || 'Sequence ' + sequenceId}</span>
                    </div>
                    <div class="scenes-container ${!isExpanded ? 'collapsed' : ''}" id="scenes-${sequenceId}">
            `;
            
            const scenes = sequence.scenes || [];
            scenes.forEach(scene => {
                const sceneId = scene.id;
                const isSceneExpanded = window.expandedScenes?.has(sceneId);
                
                html += `
                    <div class="scene-item">
                        <div class="scene-header ${isSceneExpanded ? 'expanded' : ''}" 
                             onclick="window.toggleScene('${sceneId}')">
                            <span class="toggle-icon">▶</span>
                            <span>${scene.name || 'Scene ' + sceneId}</span>
                        </div>
                        <div class="shots-container ${!isSceneExpanded ? 'collapsed' : ''}" id="shots-${sceneId}">
                `;
                
                const shots = data.breakdown_data.shots?.filter(shot => shot.scene_id === sceneId) || [];
                shots.forEach(shot => {
                    const shotId = shot.id;
                    const isActive = window.currentShotId === shotId;
                    
                    html += `
                        <div class="shot-item ${isActive ? 'active' : ''}" 
                             onclick="window.showShotContent('${shotId}')">
                            ${shot.name || 'Shot ' + shotId}
                        </div>
                    `;
                });
                
                html += `
                        </div>
                    </div>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
        });
        
        navContent.innerHTML = html;
    };
    
    /**
     * 시퀀스 토글
     */
    window.NavigationUI.toggleSequence = function(sequenceId) {
        if (!window.expandedSequences) {
            window.expandedSequences = new Set();
        }
        
        if (window.expandedSequences.has(sequenceId)) {
            window.expandedSequences.delete(sequenceId);
        } else {
            window.expandedSequences.add(sequenceId);
        }
        
        const scenesContainer = document.getElementById(`scenes-${sequenceId}`);
        const header = scenesContainer?.previousElementSibling;
        
        if (scenesContainer) {
            scenesContainer.classList.toggle('collapsed');
        }
        if (header) {
            header.classList.toggle('expanded');
        }
    };
    
    /**
     * 씬 토글
     */
    window.NavigationUI.toggleScene = function(sceneId) {
        if (!window.expandedScenes) {
            window.expandedScenes = new Set();
        }
        
        if (window.expandedScenes.has(sceneId)) {
            window.expandedScenes.delete(sceneId);
        } else {
            window.expandedScenes.add(sceneId);
        }
        
        const shotsContainer = document.getElementById(`shots-${sceneId}`);
        const header = shotsContainer?.previousElementSibling;
        
        if (shotsContainer) {
            shotsContainer.classList.toggle('collapsed');
        }
        if (header) {
            header.classList.toggle('expanded');
        }
    };
    
    /**
     * 전체 펼치기
     */
    window.NavigationUI.expandAll = function() {
        const sequenceHeaders = document.querySelectorAll('.sequence-header');
        const sceneHeaders = document.querySelectorAll('.scene-header');
        
        sequenceHeaders.forEach(header => {
            header.classList.add('expanded');
            const container = header.nextElementSibling;
            if (container) {
                container.classList.remove('collapsed');
            }
        });
        
        sceneHeaders.forEach(header => {
            header.classList.add('expanded');
            const container = header.nextElementSibling;
            if (container) {
                container.classList.remove('collapsed');
            }
        });
        
        // 상태 저장
        if (window.currentData) {
            window.expandedSequences = new Set();
            window.expandedScenes = new Set();
            
            window.currentData.breakdown_data?.sequences?.forEach(seq => {
                window.expandedSequences.add(seq.id);
                seq.scenes?.forEach(scene => {
                    window.expandedScenes.add(scene.id);
                });
            });
        }
    };
    
    /**
     * 전체 접기
     */
    window.NavigationUI.collapseAll = function() {
        const sequenceHeaders = document.querySelectorAll('.sequence-header');
        const sceneHeaders = document.querySelectorAll('.scene-header');
        
        sequenceHeaders.forEach(header => {
            header.classList.remove('expanded');
            const container = header.nextElementSibling;
            if (container) {
                container.classList.add('collapsed');
            }
        });
        
        sceneHeaders.forEach(header => {
            header.classList.remove('expanded');
            const container = header.nextElementSibling;
            if (container) {
                container.classList.add('collapsed');
            }
        });
        
        // 상태 초기화
        window.expandedSequences = new Set();
        window.expandedScenes = new Set();
    };
    
    /**
     * 검색 기능
     */
    window.NavigationUI.setupSearch = function() {
        const searchInput = document.getElementById('search-input');
        if (!searchInput) return;
        
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            
            if (!searchTerm) {
                // 검색어가 없으면 모든 항목 표시
                document.querySelectorAll('.sequence-item, .scene-item, .shot-item').forEach(item => {
                    item.style.display = '';
                });
                return;
            }
            
            // 모든 항목 숨기기
            document.querySelectorAll('.sequence-item').forEach(item => {
                item.style.display = 'none';
            });
            
            // 매칭되는 항목 표시
            document.querySelectorAll('.sequence-header, .scene-header, .shot-item').forEach(item => {
                const text = item.textContent.toLowerCase();
                if (text.includes(searchTerm)) {
                    // 해당 항목과 상위 컨테이너 표시
                    let parent = item.closest('.sequence-item');
                    if (parent) parent.style.display = '';
                    
                    parent = item.closest('.scene-item');
                    if (parent) parent.style.display = '';
                    
                    if (item.classList.contains('shot-item')) {
                        item.style.display = '';
                    }
                    
                    // 자동으로 펼치기
                    if (item.classList.contains('sequence-header') || item.classList.contains('scene-header')) {
                        item.classList.add('expanded');
                        const container = item.nextElementSibling;
                        if (container) {
                            container.classList.remove('collapsed');
                        }
                    }
                }
            });
        });
    };
    
    // 기존 전역 함수와의 호환성 유지
    if (!window.updateNavigation) {
        window.updateNavigation = window.NavigationUI.updateNavigation;
    }
    if (!window.toggleSequence) {
        window.toggleSequence = window.NavigationUI.toggleSequence;
    }
    if (!window.toggleScene) {
        window.toggleScene = window.NavigationUI.toggleScene;
    }
    if (!window.expandAll) {
        window.expandAll = window.NavigationUI.expandAll;
    }
    if (!window.collapseAll) {
        window.collapseAll = window.NavigationUI.collapseAll;
    }
    
})(window);