// uiRenderer.js - UI 렌더링 모듈

import { state, AI_TOOLS, VARIATION_TYPES_MAP, getCurrentConcept } from './dataManager.js';
import { showToast } from './utils.js';

/**
 * 프로젝트 정보 표시 업데이트
 */
export function updateProjectInfo() {
    const displayElement = document.getElementById('project-info-display');
    if (displayElement) {
        const totalConcepts = Object.values(state.conceptArtData)
            .reduce((sum, category) => sum + Object.keys(category).length, 0);
        
        displayElement.innerHTML = `
            <span>프로젝트 ID: ${state.projectInfo.project_id}</span>
            <span>총 컨셉아트: ${totalConcepts}개</span>
            <span>데이터 버전: ${state.dataVersion}</span>
            <span>마지막 업데이트: ${state.dataTimestamp}</span>
        `;
    }
}

/**
 * 사이드바 렌더링
 */
export function renderSidebar() {
    renderConceptList('characters', 'character-list');
    renderConceptList('locations', 'location-list');
    renderConceptList('props', 'prop-list');
}

/**
 * 컨셉 리스트 렌더링
 * @param {string} type - 컨셉 타입
 * @param {string} listId - 리스트 요소 ID
 */
function renderConceptList(type, listId) {
    const listElement = document.getElementById(listId);
    listElement.innerHTML = '';
    
    for (const [id, concept] of Object.entries(state.conceptArtData[type])) {
        const li = document.createElement('li');
        li.className = 'concept-item';
        li.textContent = concept.name_kr || concept.name_en || id;
        li.onclick = () => selectConceptItem(type, id);
        
        if (state.currentConceptType === type && state.currentConceptId === id) {
            li.classList.add('active');
        }
        
        listElement.appendChild(li);
    }
}

/**
 * 컨셉 아이템 선택 처리
 * @param {string} type - 컨셉 타입
 * @param {string} id - 컨셉 ID
 */
function selectConceptItem(type, id) {
    // 모든 active 클래스 제거
    document.querySelectorAll('.concept-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // 선택된 아이템에 active 클래스 추가
    event.target.classList.add('active');
    
    // 데이터 매니저에서 선택 처리
    state.currentConceptType = type;
    state.currentConceptId = id;
    
    // 상세 정보 표시
    displayConceptDetail();
}

/**
 * 컨셉 상세 정보 표시
 */
export function displayConceptDetail() {
    const concept = getCurrentConcept();
    if (!concept) {
        document.getElementById('concept-title').textContent = '컨셉아트를 선택하세요';
        return;
    }
    
    // 제목 업데이트
    document.getElementById('concept-title').textContent = 
        concept.name_kr || concept.name_en || state.currentConceptId;
    
    // CSV 데이터 표시
    displayCSVData(concept);
    
    // 기본 프롬프트 표시
    displayBasePrompts(concept);
    
    // 변형 프롬프트 표시 (캐릭터인 경우만)
    if (state.currentConceptType === 'characters') {
        displayVariantPrompts(concept);
    } else {
        hideVariantPrompts();
    }
    
    // 이미지 갤러리 업데이트는 imageManager에서 처리
}

/**
 * CSV 데이터 표시
 * @param {Object} concept - 컨셉 데이터
 */
function displayCSVData(concept) {
    const table = document.getElementById('csv-data-table');
    const tbody = table.querySelector('tbody');
    tbody.innerHTML = '';
    
    const csvFields = ['name_en', 'name_kr', 'description', 'features'];
    
    csvFields.forEach(field => {
        if (concept[field]) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${field}</td>
                <td>${concept[field]}</td>
            `;
            tbody.appendChild(tr);
        }
    });
}

/**
 * 기본 프롬프트 표시
 * @param {Object} concept - 컨셉 데이터
 */
function displayBasePrompts(concept) {
    const contentArea = document.getElementById('base-prompt-ai-content-area');
    contentArea.innerHTML = '';
    
    if (!concept.base_prompts) {
        contentArea.innerHTML = '<p class="no-image-message">기본 프롬프트가 없습니다.</p>';
        return;
    }
    
    AI_TOOLS.forEach(aiTool => {
        const aiContent = createAITabContent(aiTool, concept.base_prompts[aiTool], 'base');
        contentArea.appendChild(aiContent);
    });
    
    // 첫 번째 AI 탭 활성화
    const firstTab = AI_TOOLS[0];
    if (firstTab) {
        showAITab(firstTab, 'base-prompts');
    }
}

/**
 * AI 탭 콘텐츠 생성
 * @param {string} aiTool - AI 도구 이름
 * @param {string} prompt - 프롬프트 텍스트
 * @param {string} type - 프롬프트 타입
 * @returns {HTMLElement} AI 탭 콘텐츠 요소
 */
function createAITabContent(aiTool, prompt, type) {
    const div = document.createElement('div');
    div.id = `${type}-${aiTool}-content`;
    div.className = 'ai-tab-content';
    
    if (prompt) {
        div.innerHTML = `
            <div class="prompt-container">
                <h4>${aiTool.toUpperCase()} 프롬프트</h4>
                <div class="prompt-box">${prompt}</div>
                <div class="prompt-actions">
                    <button class="btn btn-sm btn-primary" onclick="window.copyPrompt('${aiTool}', '${type}')">
                        프롬프트 복사
                    </button>
                </div>
            </div>
            <div class="image-preview-container">
                <h4>생성된 이미지</h4>
                <div id="image-${type}-${aiTool}" class="image-display-area">
                    <div class="no-image-message">이미지를 추가하려면 버튼을 클릭하세요</div>
                </div>
                <div class="prompt-actions">
                    <button class="btn btn-sm btn-secondary" onclick="window.addImage('${aiTool}', '${type}')">
                        이미지 URL 추가
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="window.uploadImageFile('${aiTool}', '${type}')">
                        이미지 파일 업로드
                    </button>
                </div>
            </div>
        `;
    } else {
        div.innerHTML = '<p class="no-image-message">이 AI 도구의 프롬프트가 없습니다.</p>';
    }
    
    return div;
}

/**
 * AI 탭 표시
 * @param {string} aiTool - AI 도구 이름
 * @param {string} tabGroup - 탭 그룹 이름
 */
export function showAITab(aiTool, tabGroup) {
    const prefix = tabGroup === 'base-prompts' ? 'base' : 'variant';
    
    // 모든 AI 탭 콘텐츠 숨기기
    document.querySelectorAll(`#${prefix}-prompt-ai-content-area .ai-tab-content`).forEach(content => {
        content.classList.remove('active');
    });
    
    // 모든 탭 버튼 비활성화
    document.querySelectorAll(`#${prefix}-prompt-ai-tabs .tab-button`).forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 선택된 탭 활성화
    const selectedContent = document.getElementById(`${prefix}-${aiTool}-content`);
    const selectedButton = document.querySelector(`#${prefix}-prompt-ai-tabs .tab-button[data-ai="${aiTool}"]`);
    
    if (selectedContent) selectedContent.classList.add('active');
    if (selectedButton) selectedButton.classList.add('active');
    
    // 상태 업데이트
    if (prefix === 'base') {
        state.currentPromptsAITab = aiTool;
    } else {
        state.currentVariantsAITab = aiTool;
    }
}

/**
 * 변형 프롬프트 표시
 * @param {Object} concept - 컨셉 데이터
 */
function displayVariantPrompts(concept) {
    const placeholder = document.getElementById('variants-placeholder');
    const mainContent = document.getElementById('variants-main-content');
    
    if (state.currentConceptType !== 'characters') {
        placeholder.style.display = 'block';
        mainContent.style.display = 'none';
        return;
    }
    
    placeholder.style.display = 'none';
    mainContent.style.display = 'block';
    
    const contentArea = document.getElementById('variant-prompt-ai-content-area');
    contentArea.innerHTML = '';
    
    if (!concept.character_variations) {
        contentArea.innerHTML = '<p class="no-image-message">캐릭터 변형 프롬프트가 없습니다.</p>';
        return;
    }
    
    // AI 도구별 변형 콘텐츠 생성
    AI_TOOLS.forEach(aiTool => {
        if (concept.character_variations[aiTool]) {
            const aiVariantContent = createVariantAIContent(aiTool, concept.character_variations[aiTool]);
            contentArea.appendChild(aiVariantContent);
        }
    });
    
    // 첫 번째 AI 탭 활성화
    const firstTab = AI_TOOLS.find(tool => concept.character_variations[tool]);
    if (firstTab) {
        showAITab(firstTab, 'variant-prompts');
    }
}

/**
 * 변형 AI 콘텐츠 생성
 * @param {string} aiTool - AI 도구 이름
 * @param {Object} variations - 변형 데이터
 * @returns {HTMLElement} 변형 콘텐츠 요소
 */
function createVariantAIContent(aiTool, variations) {
    const div = document.createElement('div');
    div.id = `variant-${aiTool}-content`;
    div.className = 'ai-tab-content variant-ai-content';
    
    // 변형 타입별 탭 생성
    const variantTabs = document.createElement('div');
    variantTabs.className = 'nested-tabs';
    
    Object.entries(VARIATION_TYPES_MAP).forEach(([typeKey, typeInfo]) => {
        const tabBtn = document.createElement('button');
        tabBtn.className = 'nested-tab-button';
        tabBtn.textContent = typeInfo.name_kr;
        tabBtn.onclick = () => showVariantTypeTab(aiTool, typeKey);
        
        if (state.currentVariantTypeTab[aiTool] === typeKey) {
            tabBtn.classList.add('active');
        }
        
        variantTabs.appendChild(tabBtn);
    });
    
    div.appendChild(variantTabs);
    
    // 변형 타입별 콘텐츠 생성
    const variantContents = document.createElement('div');
    
    Object.entries(VARIATION_TYPES_MAP).forEach(([typeKey, typeInfo]) => {
        const typeContent = createVariantTypeContent(aiTool, typeKey, variations);
        variantContents.appendChild(typeContent);
    });
    
    div.appendChild(variantContents);
    
    return div;
}

/**
 * 변형 타입 탭 표시
 * @param {string} aiTool - AI 도구 이름
 * @param {string} typeKey - 변형 타입 키
 */
export function showVariantTypeTab(aiTool, typeKey) {
    // 탭 버튼 업데이트
    const container = document.getElementById(`variant-${aiTool}-content`);
    if (container) {
        container.querySelectorAll('.nested-tab-button').forEach((btn, index) => {
            btn.classList.toggle('active', Object.keys(VARIATION_TYPES_MAP)[index] === typeKey);
        });
        
        // 콘텐츠 업데이트
        container.querySelectorAll('.nested-tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        const selectedContent = document.getElementById(`variant-${aiTool}-${typeKey}-content`);
        if (selectedContent) {
            selectedContent.classList.add('active');
        }
    }
    
    // 상태 업데이트
    state.currentVariantTypeTab[aiTool] = typeKey;
}

/**
 * 변형 타입 콘텐츠 생성
 * @param {string} aiTool - AI 도구 이름
 * @param {string} typeKey - 변형 타입 키
 * @param {Object} variations - 변형 데이터
 * @returns {HTMLElement} 변형 타입 콘텐츠 요소
 */
function createVariantTypeContent(aiTool, typeKey, variations) {
    const div = document.createElement('div');
    div.id = `variant-${aiTool}-${typeKey}-content`;
    div.className = 'nested-tab-content';
    
    if (state.currentVariantTypeTab[aiTool] === typeKey) {
        div.classList.add('active');
    }
    
    // Midjourney의 경우 permutation 접미사 고려
    const baseKey = VARIATION_TYPES_MAP[typeKey].schema_key_base;
    const permutationKey = `${baseKey}_permutation`;
    
    // 변형 항목들 렌더링
    for (let i = 1; i <= (typeKey === 'expressions_5' ? 5 : 4); i++) {
        const variantKey = `${baseKey}_${i}`;
        const prompt = variations[variantKey];
        const permutationPrompt = aiTool === 'midjourney' ? variations[permutationKey] : null;
        
        if (prompt) {
            const variantItem = createVariantItem(aiTool, typeKey, i, prompt, permutationPrompt);
            div.appendChild(variantItem);
        }
    }
    
    return div;
}

/**
 * 변형 아이템 생성
 * @param {string} aiTool - AI 도구 이름
 * @param {string} typeKey - 변형 타입 키
 * @param {number} index - 변형 인덱스
 * @param {string} prompt - 프롬프트 텍스트
 * @param {string} permutationPrompt - Midjourney permutation 프롬프트
 * @returns {HTMLElement} 변형 아이템 요소
 */
function createVariantItem(aiTool, typeKey, index, prompt, permutationPrompt) {
    const div = document.createElement('div');
    div.className = 'variant-item';
    
    const title = typeKey === 'face_views_4' ? `얼굴 ${index}면` :
                  typeKey === 'expressions_5' ? `표정 ${index}` :
                  `전신 ${index}면`;
    
    let html = `<h4>${title}</h4>`;
    
    // 기본 프롬프트
    html += `
        <div class="variant-prompt-pair">
            <div class="label">프롬프트:</div>
            <div class="prompt-box">${prompt}</div>
            <div class="prompt-actions">
                <button class="btn btn-sm btn-primary" onclick="window.copyVariantPrompt('${aiTool}', '${typeKey}', ${index})">
                    프롬프트 복사
                </button>
            </div>
        </div>
    `;
    
    // Midjourney permutation 프롬프트
    if (permutationPrompt) {
        html += `
            <div class="variant-prompt-pair">
                <div class="label">Permutation 프롬프트:</div>
                <div class="prompt-box">${permutationPrompt}</div>
                <div class="prompt-actions">
                    <button class="btn btn-sm btn-primary" onclick="window.copyVariantPrompt('${aiTool}', '${typeKey}_permutation')">
                        Permutation 복사
                    </button>
                </div>
            </div>
        `;
    }
    
    // 이미지 표시 영역
    html += `
        <div class="image-preview-container">
            <h4>생성된 이미지</h4>
            <div id="image-${typeKey}_${index}-${aiTool}" class="image-display-area">
                <div class="no-image-message">이미지를 추가하려면 버튼을 클릭하세요</div>
            </div>
            <div class="prompt-actions">
                <button class="btn btn-sm btn-secondary" onclick="window.addImage('${aiTool}', '${typeKey}', ${index})">
                    이미지 URL 추가
                </button>
                <button class="btn btn-sm btn-secondary" onclick="window.uploadImageFile('${aiTool}', '${typeKey}', ${index})">
                    이미지 파일 업로드
                </button>
            </div>
        </div>
    `;
    
    div.innerHTML = html;
    return div;
}

/**
 * 변형 프롬프트 숨기기
 */
function hideVariantPrompts() {
    const placeholder = document.getElementById('variants-placeholder');
    const mainContent = document.getElementById('variants-main-content');
    
    if (placeholder) placeholder.style.display = 'block';
    if (mainContent) mainContent.style.display = 'none';
}

/**
 * AI 탭 빌드
 */
export function buildAITabs() {
    // 기본 프롬프트 AI 탭
    const baseTabsContainer = document.getElementById('base-prompt-ai-tabs');
    baseTabsContainer.innerHTML = '';
    
    AI_TOOLS.forEach(aiTool => {
        const tabBtn = document.createElement('button');
        tabBtn.className = 'tab-button nested-tab-button';
        tabBtn.textContent = aiTool.toUpperCase();
        tabBtn.setAttribute('data-ai', aiTool);
        tabBtn.onclick = () => showAITab(aiTool, 'base-prompts');
        baseTabsContainer.appendChild(tabBtn);
    });
    
    // 변형 프롬프트 AI 탭
    const variantTabsContainer = document.getElementById('variant-prompt-ai-tabs');
    variantTabsContainer.innerHTML = '';
    
    AI_TOOLS.forEach(aiTool => {
        const tabBtn = document.createElement('button');
        tabBtn.className = 'tab-button nested-tab-button';
        tabBtn.textContent = aiTool.toUpperCase();
        tabBtn.setAttribute('data-ai', aiTool);
        tabBtn.onclick = () => showAITab(aiTool, 'variant-prompts');
        variantTabsContainer.appendChild(tabBtn);
    });
}

/**
 * 탭 열기
 * @param {string} tabName - 탭 이름
 */
export function openTab(event, tabName) {
    // 모든 탭 콘텐츠 숨기기
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // 모든 탭 버튼 비활성화
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    
    // 선택된 탭 활성화
    document.getElementById(tabName).classList.add('active');
    event.currentTarget.classList.add('active');
}