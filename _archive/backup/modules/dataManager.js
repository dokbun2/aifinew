// dataManager.js - 데이터 관리 모듈

import { showToast, getCurrentTimestamp } from './utils.js';

// 전역 상태 관리
export const state = {
    projectInfo: { project_id: "N/A", total_concept_arts: 0 },
    dataVersion: "N/A",
    dataTimestamp: "N/A",
    conceptArtData: { characters: {}, locations: {}, props: {} },
    currentConceptId: null,
    currentConceptType: null,
    currentPromptsAITab: null,
    currentVariantsAITab: null,
    currentVariantTypeTab: { 
        midjourney: 'face_views_4', 
        leonardo: 'face_views_4', 
        ideogram: 'face_views_4', 
        imagefx: 'face_views_4' 
    }
};

// 상수 정의
export const AI_TOOLS = ['midjourney', 'leonardo', 'ideogram', 'imagefx', 'openart'];
export const VARIATION_TYPES_MAP = {
    'face_views_4': { name_kr: "얼굴 4면", schema_key_base: 'face_views_4' },
    'expressions_5': { name_kr: "주요 표정 5종", schema_key_base: 'expressions_5' },
    'body_views_4': { name_kr: "전신 4면", schema_key_base: 'body_views_4' }
};

const STORAGE_KEY = 'conceptArtManagerData_v1.2';

/**
 * localStorage에서 데이터 로드
 */
export function loadFromLocalStorage() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
        try {
            const parsedData = JSON.parse(data);
            if (parsedData.conceptArtData) {
                state.conceptArtData = parsedData.conceptArtData;
                state.projectInfo = parsedData.projectInfo || { project_id: "N/A", total_concept_arts: 0 };
                state.dataVersion = parsedData.dataVersion || "N/A";
                state.dataTimestamp = parsedData.dataTimestamp || "N/A";
                return true;
            }
        } catch (e) {
            console.error('Failed to parse localStorage data:', e);
        }
    }
    return false;
}

/**
 * localStorage에 데이터 저장
 */
export function saveToLocalStorage() {
    const dataToSave = {
        conceptArtData: state.conceptArtData,
        projectInfo: state.projectInfo,
        dataVersion: state.dataVersion,
        dataTimestamp: state.dataTimestamp
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
}

/**
 * JSON 파일로 데이터 내보내기
 */
export function exportToJSON() {
    const exportData = {
        project_info: state.projectInfo,
        concept_art_collection: state.conceptArtData,
        metadata: {
            version: "1.2",
            timestamp: getCurrentTimestamp(),
            totalConcepts: countTotalConcepts()
        }
    };
    
    const jsonStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `concept_art_data_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('JSON 파일이 다운로드되었습니다.');
}

/**
 * JSON 파일에서 데이터 가져오기
 * @param {File} file - 가져올 파일
 * @returns {Promise} 처리 결과
 */
export function importFromJSON(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                processLoadedJSON(data);
                resolve();
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = reject;
        reader.readAsText(file);
    });
}

/**
 * Stage 4 데이터를 v1.2 형식으로 변환
 * @param {Object} stage4Data - Stage 4 형식의 데이터
 * @returns {Object} v1.2 형식의 데이터
 */
function convertStage4ToV12(stage4Data) {
    const converted = {
        characters: {},
        locations: {},
        props: {}
    };
    
    // 각 카테고리별로 데이터 변환
    for (const [category, items] of Object.entries(stage4Data)) {
        for (const [id, item] of Object.entries(items)) {
            const convertedItem = {
                name_kr: item.name || id,
                name_en: item.name || id,
                description: item.csv_data?.['201'] || '',
                features: item.csv_data?.['206'] || item.csv_data?.['211'] || '',
                base_prompts: {},
                generated_images: { base_prompts: {}, variations: {} }
            };
            
            // 프롬프트 변환
            if (item.prompts) {
                for (const [aiTool, promptData] of Object.entries(item.prompts)) {
                    if (promptData.prompt_english) {
                        convertedItem.base_prompts[aiTool] = promptData.prompt_english;
                    }
                }
            }
            
            // 캐릭터 변형 변환 (variations 필드 확인)
            if (category === 'characters' && item.variations) {
                convertedItem.character_variations = {};
                for (const [aiTool, variations] of Object.entries(item.variations)) {
                    convertedItem.character_variations[aiTool] = variations;
                }
            }
            
            converted[category][id] = convertedItem;
        }
    }
    
    return converted;
}

/**
 * 로드된 JSON 데이터 처리
 * @param {Object} data - JSON 데이터
 */
export function processLoadedJSON(data) {
    if (data.concept_art_collection) {
        // Stage 4 형식인지 확인
        if (data.stage === 4 || data.version === "1.2") {
            // Stage 4 형식을 v1.2 형식으로 변환
            state.conceptArtData = convertStage4ToV12(data.concept_art_collection);
        } else {
            // 이미 v1.2 형식인 경우
            state.conceptArtData = data.concept_art_collection;
        }
        
        state.projectInfo = data.project_info || { project_id: "N/A", total_concept_arts: 0 };
        state.dataVersion = data.version || data.metadata?.version || "N/A";
        state.dataTimestamp = data.timestamp || data.metadata?.timestamp || "N/A";
        saveToLocalStorage();
    } else {
        throw new Error('유효하지 않은 JSON 형식입니다.');
    }
}

/**
 * Stage 4 임시 데이터 처리
 */
export function handleStage4TempData() {
    const tempJson = localStorage.getItem('stage4TempJson');
    const tempFileName = localStorage.getItem('stage4TempFileName');
    
    if (tempJson && tempFileName) {
        try {
            console.log(`📁 Stage 4 임시 JSON 파일 로드: ${tempFileName}`);
            
            const data = JSON.parse(tempJson);
            processLoadedJSON(data);
            showToast(`${tempFileName} 파일을 성공적으로 로드했습니다.`);
            
            // 임시 데이터 정리
            localStorage.removeItem('stage4TempJson');
            localStorage.removeItem('stage4TempFileName');
            
            return true;
        } catch (error) {
            console.error('Stage 4 임시 JSON 로드 오류:', error);
            showToast('임시 저장된 JSON 파일을 로드할 수 없습니다.');
            localStorage.removeItem('stage4TempJson');
            localStorage.removeItem('stage4TempFileName');
            return false;
        }
    }
    return false;
}

/**
 * 전체 컨셉아트 개수 계산
 * @returns {number} 총 개수
 */
function countTotalConcepts() {
    let count = 0;
    for (const category of Object.values(state.conceptArtData)) {
        count += Object.keys(category).length;
    }
    return count;
}

/**
 * 현재 선택된 컨셉아트 가져오기
 * @returns {Object|null} 현재 컨셉아트 또는 null
 */
export function getCurrentConcept() {
    if (!state.currentConceptId || !state.currentConceptType) {
        return null;
    }
    return state.conceptArtData[state.currentConceptType][state.currentConceptId];
}

/**
 * 컨셉아트 선택
 * @param {string} type - 컨셉아트 타입 (characters, locations, props)
 * @param {string} id - 컨셉아트 ID
 */
export function selectConcept(type, id) {
    state.currentConceptType = type;
    state.currentConceptId = id;
    
    // 탭 초기화
    state.currentPromptsAITab = null;
    state.currentVariantsAITab = null;
}