/**
 * LocalStorage 관리 모듈
 * 데이터 저장, 로드, 캐시 관리
 */
(function(window) {
    'use strict';
    
    // 네임스페이스 생성
    window.DataStorage = window.DataStorage || {};
    
    /**
     * 데이터를 localStorage에 저장
     */
    window.DataStorage.saveDataToLocalStorage = function(currentData) {
        try {
            if (!currentData) {
                return false;
            }
            
            const jsonFileName = window.AppUtils ? 
                window.AppUtils.getProjectFileName(currentData) : 
                (currentData.project_info?.name || 'Film_Production_Manager.json');
            
            // Universal/Nanobana 데이터 저장 확인 (디버깅용)
            const universalData = currentData.breakdown_data?.shots?.map(shot => ({
                shotId: shot.id,
                universal: shot.image_design?.ai_generated_images?.universal,
                nanobana: shot.image_design?.ai_generated_images?.nanobana
            })).filter(item => item.universal?.some(img => img?.url) || item.nanobana?.some(img => img?.url));
            
            if (universalData && universalData.length > 0) {
                console.log('💾 Universal/Nanobana 데이터 저장 중:', universalData);
            }
            
            const dataString = JSON.stringify(currentData);
            
            // localStorage 용량 체크 및 처리
            try {
                localStorage.setItem(`breakdownData_${jsonFileName}`, dataString);
                localStorage.setItem(`lastSaved_${jsonFileName}`, new Date().toISOString());
                return true;
            } catch (quotaError) {
                if (quotaError.name === 'QuotaExceededError') {
                    const showMessage = window.AppUtils?.showMessage || window.showMessage || alert;
                    showMessage('저장 공간이 부족합니다. 이미지 데이터를 정리하거나 JSON으로 백업 후 초기화하세요.', 'error');
                    
                    // 용량 정보 표시
                    const currentSize = new Blob([dataString]).size;
                    const mbSize = (currentSize / (1024 * 1024)).toFixed(2);
                    console.error(`📦 데이터 크기: ${mbSize}MB`);
                    
                    // 이미지 데이터 정리 제안
                    const imageCount = currentData.breakdown_data?.shots?.reduce((total, shot) => {
                        let count = 0;
                        if (shot.image_design?.ai_generated_images) {
                            Object.values(shot.image_design.ai_generated_images).forEach(aiImages => {
                                if (Array.isArray(aiImages)) {
                                    count += aiImages.filter(img => img?.url).length;
                                }
                            });
                        }
                        return total + count;
                    }, 0) || 0;
                    
                    console.log(`🖼️ 총 이미지 URL 수: ${imageCount}개`);
                    return false;
                }
                throw quotaError;
            }
        } catch (error) {
            console.error('데이터 저장 실패:', error);
            const showMessage = window.AppUtils?.showMessage || window.showMessage || alert;
            showMessage('데이터 저장 중 오류가 발생했습니다.', 'error');
            return false;
        }
    };
    
    /**
     * localStorage에서 데이터 로드
     */
    window.DataStorage.loadDataFromLocalStorage = function() {
        try {
            // 먼저 기본 파일명으로 시도
            let jsonFileName = 'Film_Production_Manager.json';
            let savedData = localStorage.getItem(`breakdownData_${jsonFileName}`);
            
            // 데이터가 없으면 다른 저장된 파일들 확인
            if (!savedData) {
                const keys = Object.keys(localStorage);
                const breakdownKeys = keys.filter(key => key.startsWith('breakdownData_'));
                
                if (breakdownKeys.length > 0) {
                    // 가장 최근 수정된 파일 찾기
                    let latestKey = null;
                    let latestTime = null;
                    
                    breakdownKeys.forEach(key => {
                        const fileName = key.replace('breakdownData_', '');
                        const lastSaved = localStorage.getItem(`lastSaved_${fileName}`);
                        
                        if (lastSaved) {
                            const savedTime = new Date(lastSaved);
                            if (!latestTime || savedTime > latestTime) {
                                latestTime = savedTime;
                                latestKey = key;
                            }
                        }
                    });
                    
                    if (latestKey) {
                        savedData = localStorage.getItem(latestKey);
                        jsonFileName = latestKey.replace('breakdownData_', '');
                    }
                }
            }
            
            if (!savedData) {
                console.log('📂 저장된 데이터가 없습니다.');
                return null;
            }
            
            const parsedData = JSON.parse(savedData);
            
            // Universal 이미지 데이터 확인 및 배열 구조 보장
            console.log('🔍 로드된 데이터에서 Universal 이미지 확인 및 정규화:');
            parsedData.breakdown_data?.shots?.forEach(shot => {
                // image_design 구조 초기화
                if (!shot.image_design) {
                    shot.image_design = { 
                        aspect_ratio: "16:9", 
                        selected_plan: "plan_a"
                    };
                }
                
                // ai_generated_images가 없을 때만 초기화
                if (!shot.image_design.ai_generated_images) {
                    shot.image_design.ai_generated_images = {};
                }
                
                // 각 AI 도구별 배열 구조 보장
                const aiTools = window.AppConfig?.ALL_IMAGE_AI_TOOLS?.map(tool => tool.id) || 
                    ['universal', 'nanobana', 'midjourney', 'ideogram', 'leonardo', 'imagefx'];
                    
                aiTools.forEach(aiId => {
                    if (!shot.image_design.ai_generated_images[aiId]) {
                        shot.image_design.ai_generated_images[aiId] = [];
                    } else if (!Array.isArray(shot.image_design.ai_generated_images[aiId])) {
                        // 객체를 배열로 변환
                        const oldData = shot.image_design.ai_generated_images[aiId];
                        const newArray = [];
                        for (let i = 0; i < 3; i++) {
                            const key = String(i);
                            newArray.push(oldData[key] || { url: '', description: '' });
                        }
                        shot.image_design.ai_generated_images[aiId] = newArray;
                    }
                    
                    // 배열 크기 및 요소 검증
                    while (shot.image_design.ai_generated_images[aiId].length < 3) {
                        shot.image_design.ai_generated_images[aiId].push({ url: '', description: '' });
                    }
                });
                
                // Universal 데이터 확인
                if (shot.image_design?.ai_generated_images?.universal) {
                    const universalData = shot.image_design.ai_generated_images.universal;
                    const urlCount = universalData.filter(img => img && img.url).length;
                    if (urlCount > 0) {
                        console.log(`✅ 샷 ${shot.id} Universal 데이터 로드: ${urlCount}개 URL`);
                    }
                }
            });
            
            // Stage 6, 7 데이터 복원
            const savedStage6 = localStorage.getItem(`stage6ImagePrompts_${jsonFileName}`);
            if (savedStage6) {
                try {
                    const stage6Data = JSON.parse(savedStage6);
                    if (window.stage6PromptData) {
                        window.stage6PromptData = stage6Data;
                    }
                    console.log('✅ Stage 6 이미지 프롬프트 데이터 복원');
                } catch (e) {
                    console.error('Stage 6 데이터 파싱 실패:', e);
                }
            }
            
            const savedStage7 = localStorage.getItem(`stage7VideoPrompts_${jsonFileName}`);
            if (savedStage7) {
                try {
                    const stage7Data = JSON.parse(savedStage7);
                    if (window.stage7PromptData) {
                        window.stage7PromptData = stage7Data;
                    }
                    console.log('✅ Stage 7 비디오 프롬프트 데이터 복원');
                } catch (e) {
                    console.error('Stage 7 데이터 파싱 실패:', e);
                }
            }
            
            console.log('✅ 데이터 로드 완료:', jsonFileName);
            return parsedData;
            
        } catch (error) {
            console.error('데이터 로드 실패:', error);
            const showMessage = window.AppUtils?.showMessage || window.showMessage || alert;
            showMessage('데이터 로드 중 오류가 발생했습니다.', 'error');
            return null;
        }
    };
    
    /**
     * 이미지 캐시를 localStorage에 저장
     */
    window.DataStorage.saveImageCacheToLocalStorage = function(imageUrlCache, currentData) {
        try {
            const jsonFileName = window.AppUtils ? 
                window.AppUtils.getProjectFileName(currentData) : 
                'Film_Production_Manager.json';
            const cacheKey = `imageUrlCache_${jsonFileName}`;
            localStorage.setItem(cacheKey, JSON.stringify(imageUrlCache));
            console.log('✅ 이미지 캐시 저장 완료:', Object.keys(imageUrlCache).length, '개 항목');
            return true;
        } catch (e) {
            console.error('❌ 이미지 캐시 저장 실패:', e);
            return false;
        }
    };
    
    /**
     * 이미지 캐시를 localStorage에서 로드
     */
    window.DataStorage.loadImageCacheFromLocalStorage = function(currentData) {
        try {
            const jsonFileName = window.AppUtils ? 
                window.AppUtils.getProjectFileName(currentData) : 
                'Film_Production_Manager.json';
            const cacheKey = `imageUrlCache_${jsonFileName}`;
            const savedCache = localStorage.getItem(cacheKey);
            
            if (savedCache) {
                const cache = JSON.parse(savedCache);
                console.log('✅ 이미지 캐시 로드 완료:', Object.keys(cache).length, '개 항목');
                return cache;
            }
            
            return {};
        } catch (e) {
            console.error('❌ 이미지 캐시 로드 실패:', e);
            return {};
        }
    };
    
    /**
     * Stage 데이터 저장
     */
    window.DataStorage.saveStageData = function(stageNumber, data, currentData) {
        try {
            const jsonFileName = window.AppUtils ? 
                window.AppUtils.getProjectFileName(currentData) : 
                'Film_Production_Manager.json';
            
            const stageKey = `stage${stageNumber}`;
            
            if (stageNumber === 6) {
                localStorage.setItem(`stage6ImagePrompts_${jsonFileName}`, JSON.stringify(data));
            } else if (stageNumber === 7) {
                localStorage.setItem(`stage7VideoPrompts_${jsonFileName}`, JSON.stringify(data));
            } else {
                localStorage.setItem(`${stageKey}Data_${jsonFileName}`, JSON.stringify(data));
            }
            
            console.log(`✅ Stage ${stageNumber} 데이터 저장 완료`);
            return true;
        } catch (e) {
            console.error(`❌ Stage ${stageNumber} 데이터 저장 실패:`, e);
            return false;
        }
    };
    
    // 기존 전역 함수와의 호환성 유지
    if (!window.saveDataToLocalStorage) {
        window.saveDataToLocalStorage = function() {
            return window.DataStorage.saveDataToLocalStorage(window.currentData);
        };
    }
    
    if (!window.loadDataFromLocalStorage) {
        window.loadDataFromLocalStorage = window.DataStorage.loadDataFromLocalStorage;
    }
    
})(window);