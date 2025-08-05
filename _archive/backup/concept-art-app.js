// concept-art-app.js - 메인 엔트리 포인트

import { 
    state, 
    loadFromLocalStorage, 
    saveToLocalStorage,
    exportToJSON as exportData,
    importFromJSON as importData,
    handleStage4TempData,
    selectConcept
} from './modules/dataManager.js';

import {
    updateProjectInfo,
    renderSidebar,
    displayConceptDetail,
    buildAITabs,
    openTab as openTabUI,
    showAITab,
    showVariantTypeTab
} from './modules/uiRenderer.js';

import {
    addImage,
    uploadImageFile,
    closeImageModal,
    loadAndDisplayImages,
    updateImageGallery
} from './modules/imageManager.js';

import {
    copyCSV,
    copyPrompt,
    copyVariantPrompt
} from './modules/promptManager.js';

import { showToast } from './modules/utils.js';

// 전역 함수들을 window 객체에 노출 (HTML onclick 핸들러용)
window.openTab = openTabUI;
window.copyCSV = copyCSV;
window.copyPrompt = copyPrompt;
window.copyVariantPrompt = copyVariantPrompt;
window.addImage = addImage;
window.uploadImageFile = uploadImageFile;
window.closeImageModal = closeImageModal;
window.showAITab = showAITab;
window.showVariantTypeTab = showVariantTypeTab;

// JSON 파일 로드 시도
async function loadLocalJsonFile() {
    try {
        const response = await fetch('./concept_art_data.json');
        if (response.ok) {
            const data = await response.json();
            if (data.concept_art_collection) {
                state.conceptArtData = data.concept_art_collection;
                state.projectInfo = data.project_info || { project_id: "N/A", total_concept_arts: 0 };
                state.dataVersion = data.metadata?.version || "N/A";
                state.dataTimestamp = data.metadata?.timestamp || "N/A";
                saveToLocalStorage();
                updateProjectInfo();
                renderSidebar();
                showToast('로컬 JSON 파일을 성공적으로 로드했습니다.');
            }
        }
    } catch (error) {
        console.log('로컬 JSON 파일을 찾을 수 없습니다. localStorage 데이터를 확인합니다.');
        // localStorage에서 데이터 로드 시도
        if (loadFromLocalStorage()) {
            updateProjectInfo();
            renderSidebar();
            showToast('저장된 데이터를 로드했습니다.');
        }
    }
}

// 초기화 함수
function initialize() {
    // 이벤트 리스너 설정
    document.getElementById('export-json-btn').addEventListener('click', exportToJSON);
    document.getElementById('import-json-btn').addEventListener('click', () => {
        document.getElementById('import-json-input').click();
    });
    document.getElementById('import-json-input').addEventListener('change', importFromJSON);
    
    document.getElementById('reset-data-btn').addEventListener('click', function() {
        if (confirm('모든 데이터가 삭제됩니다. 계속하시겠습니까?')) {
            localStorage.removeItem('conceptArtManagerData_v1.2');
            showToast('모든 데이터가 초기화되었습니다.');
            setTimeout(() => location.reload(), 1000);
        }
    });
    
    // AI 탭 빌드
    buildAITabs();
    
    // URL 파라미터 체크 및 자동 JSON 처리
    const urlParams = new URLSearchParams(window.location.search);
    
    // Stage 4에서 임시 저장된 JSON 파일 자동 로드
    if (urlParams.get('loadStage4Json') === 'true') {
        console.log('🔄 Stage 4 임시 저장된 JSON 파일 자동 로드 실행...');
        setTimeout(() => {
            if (handleStage4TempData()) {
                updateProjectInfo();
                renderSidebar();
            }
        }, 1000);
    } else {
        // localStorage에서 Stage 4 데이터 확인
        const tempJson = localStorage.getItem('stage4TempJson');
        const tempFileName = localStorage.getItem('stage4TempFileName');
        
        if (tempJson && tempFileName) {
            console.log('🔄 localStorage에서 Stage 4 데이터 발견, 자동 로드 실행...');
            setTimeout(() => {
                if (handleStage4TempData()) {
                    updateProjectInfo();
                    renderSidebar();
                }
            }, 1000);
        } else {
            loadLocalJsonFile(); // Attempt to load default JSON first
        }
    }
    
    // 컨셉 선택 시 이미지 로드
    const originalSelectConcept = selectConcept;
    window.selectConcept = function(type, id) {
        originalSelectConcept(type, id);
        displayConceptDetail();
        const concept = state.conceptArtData[type][id];
        if (concept) {
            loadAndDisplayImages(concept);
        }
    };
}

// JSON 내보내기
function exportToJSON() {
    exportData();
}

// JSON 가져오기
function importFromJSON(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    importData(file)
        .then(() => {
            updateProjectInfo();
            renderSidebar();
            showToast('JSON 파일을 성공적으로 가져왔습니다.');
        })
        .catch(error => {
            console.error('JSON 가져오기 오류:', error);
            showToast('JSON 파일을 가져올 수 없습니다: ' + error.message);
        });
    
    // 입력 초기화
    event.target.value = '';
}

// DOM 로드 완료 시 초기화
document.addEventListener('DOMContentLoaded', initialize);