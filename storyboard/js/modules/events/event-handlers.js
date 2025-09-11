/**
 * Event Handlers 모듈
 * 이벤트 핸들러 및 리스너 관리
 */
(function(window) {
    'use strict';
    
    // 네임스페이스 생성
    window.EventHandlers = window.EventHandlers || {};
    
    /**
     * 파일 업로드 핸들러 설정
     */
    window.EventHandlers.setupFileUpload = function() {
        const fileInput = document.getElementById('file-input');
        if (!fileInput) return;
        
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                // Import/Export 모듈 사용
                if (window.DataImportExport?.importJSON) {
                    window.DataImportExport.importJSON(file, function(jsonData) {
                        console.log('📁 JSON 파일 로드 시작:', file.name);
                        console.log('📊 로드된 데이터:', jsonData);
                        
                        // Stage 감지 및 처리
                        if (window.StageConverter?.detectAndProcessStage) {
                            jsonData = window.StageConverter.detectAndProcessStage(jsonData);
                            console.log('🔄 Stage 처리 완료:', jsonData);
                        }
                        
                        // 데이터 저장
                        window.currentData = jsonData;
                        console.log('💾 currentData 설정 완료');
                        
                        // localStorage에 저장
                        // app.js의 saveDataToLocalStorage 우선 사용 (전역 currentData 사용)
                        if (window.saveDataToLocalStorage) {
                            window.saveDataToLocalStorage();
                        } else if (window.DataStorage?.saveDataToLocalStorage) {
                            // 모듈의 함수 사용 시 데이터 전달
                            window.DataStorage.saveDataToLocalStorage(jsonData);
                        }
                        
                        // UI 업데이트
                        console.log('🖼️ UI 업데이트 시작');
                        
                        // 메인 app.js의 updateSidebar 함수 호출
                        if (window.updateSidebar) {
                            console.log('✅ updateSidebar 호출');
                            window.updateSidebar();
                        } else if (window.NavigationUI?.updateNavigation) {
                            console.log('✅ NavigationUI.updateNavigation 호출');
                            window.NavigationUI.updateNavigation(jsonData);
                        } else {
                            console.warn('⚠️ 사이드바 업데이트 함수를 찾을 수 없습니다');
                        }
                        
                        // 헤더 정보 업데이트
                        if (window.ContentDisplay?.updateHeaderInfo) {
                            console.log('✅ ContentDisplay.updateHeaderInfo 호출');
                            window.ContentDisplay.updateHeaderInfo(jsonData);
                        }
                        
                        // 컨텐츠 영역 초기화
                        if (window.ContentDisplay?.clearContent) {
                            console.log('✅ ContentDisplay.clearContent 호출');
                            window.ContentDisplay.clearContent();
                        }
                        
                        // 첫 번째 샷 표시 (있을 경우)
                        if (jsonData?.breakdown_data?.shots?.length > 0) {
                            const firstShot = jsonData.breakdown_data.shots[0];
                            console.log('📌 첫 번째 샷 표시:', firstShot.id);
                            if (window.showShotContent) {
                                window.showShotContent(firstShot.id);
                            } else {
                                console.warn('⚠️ showShotContent 함수를 찾을 수 없습니다');
                            }
                        } else {
                            console.log('ℹ️ 표시할 샷이 없습니다');
                        }
                        
                        // 성공 메시지
                        const showMessage = window.AppUtils?.showMessage || window.showMessage;
                        showMessage?.('데이터가 성공적으로 로드되었습니다', 'success');
                    });
                }
                
                // 파일 입력 초기화
                fileInput.value = '';
            }
        });
    };
    
    /**
     * 키보드 단축키 설정
     */
    window.EventHandlers.setupKeyboardShortcuts = function() {
        document.addEventListener('keydown', function(e) {
            // Ctrl/Cmd + S: 저장
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                if (window.DataStorage?.saveDataToLocalStorage && window.currentData) {
                    window.DataStorage.saveDataToLocalStorage(window.currentData);
                    const showMessage = window.AppUtils?.showMessage || window.showMessage;
                    showMessage?.('데이터가 저장되었습니다', 'success');
                }
            }
            
            // Ctrl/Cmd + O: 열기
            if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
                e.preventDefault();
                document.getElementById('file-input')?.click();
            }
            
            // Ctrl/Cmd + E: 내보내기
            if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
                e.preventDefault();
                if (window.DataImportExport?.exportJSON && window.currentData) {
                    window.DataImportExport.exportJSON(window.currentData);
                }
            }
            
            // Ctrl/Cmd + F: 검색
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                const searchInput = document.getElementById('search-input');
                if (searchInput) {
                    searchInput.focus();
                    searchInput.select();
                }
            }
        });
    };
    
    /**
     * 자동 저장 설정
     */
    window.EventHandlers.setupAutoSave = function(intervalMinutes = 5) {
        // 기존 인터벌 제거
        if (window.autoSaveInterval) {
            clearInterval(window.autoSaveInterval);
        }
        
        // 새 인터벌 설정
        window.autoSaveInterval = setInterval(() => {
            if (window.currentData && window.hasUnsavedChanges) {
                if (window.DataStorage?.saveDataToLocalStorage) {
                    window.DataStorage.saveDataToLocalStorage(window.currentData);
                    console.log('💾 자동 저장 완료');
                    window.hasUnsavedChanges = false;
                }
            }
        }, intervalMinutes * 60 * 1000);
        
        console.log(`✅ 자동 저장 설정: ${intervalMinutes}분마다`);
    };
    
    /**
     * 변경 감지 설정
     */
    window.EventHandlers.trackChanges = function() {
        // input 이벤트 감지
        document.addEventListener('input', function(e) {
            if (e.target.matches('input[type="text"], input[type="url"], textarea')) {
                window.hasUnsavedChanges = true;
            }
        });
        
        // change 이벤트 감지
        document.addEventListener('change', function(e) {
            if (e.target.matches('input, select, textarea')) {
                window.hasUnsavedChanges = true;
            }
        });
    };
    
    /**
     * 페이지 떠나기 경고
     */
    window.EventHandlers.setupBeforeUnload = function() {
        window.addEventListener('beforeunload', function(e) {
            if (window.hasUnsavedChanges) {
                const message = '저장되지 않은 변경사항이 있습니다. 페이지를 떠나시겠습니까?';
                e.preventDefault();
                e.returnValue = message;
                return message;
            }
        });
    };
    
    /**
     * 리사이즈 이벤트 처리
     */
    window.EventHandlers.setupResizeHandler = function() {
        let resizeTimeout;
        
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                // 레이아웃 재조정
                const navSection = document.querySelector('.nav-section');
                if (navSection) {
                    const windowHeight = window.innerHeight;
                    navSection.style.height = `${windowHeight - 180}px`;
                }
            }, 250);
        });
    };
    
    /**
     * 모든 이벤트 핸들러 초기화
     */
    window.EventHandlers.initializeAll = function() {
        // DOM이 로드된 후 실행
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                window.EventHandlers.setupFileUpload();
                window.EventHandlers.setupKeyboardShortcuts();
                window.EventHandlers.setupAutoSave(5);
                window.EventHandlers.trackChanges();
                window.EventHandlers.setupBeforeUnload();
                window.EventHandlers.setupResizeHandler();
                
                // 검색 기능 초기화
                if (window.NavigationUI?.setupSearch) {
                    window.NavigationUI.setupSearch();
                }
            });
        } else {
            // 이미 로드된 경우
            window.EventHandlers.setupFileUpload();
            window.EventHandlers.setupKeyboardShortcuts();
            window.EventHandlers.setupAutoSave(5);
            window.EventHandlers.trackChanges();
            window.EventHandlers.setupBeforeUnload();
            window.EventHandlers.setupResizeHandler();
            
            if (window.NavigationUI?.setupSearch) {
                window.NavigationUI.setupSearch();
            }
        }
    };
    
    // 자동 초기화
    window.EventHandlers.initializeAll();
    
})(window);