// concept-art-bundle.js - 번들된 버전 (ES6 모듈 없이)

// ===== utils.js 내용 =====
const utils = {
    showToast: function(message) {
        const toast = document.getElementById('toast-message');
        toast.innerText = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    },

    copyToClipboard: function(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                this.showToast('클립보드에 복사되었습니다.');
            }).catch(err => {
                console.error('클립보드 복사 실패:', err);
                this.fallbackCopyToClipboard(text);
            });
        } else {
            this.fallbackCopyToClipboard(text);
        }
    },

    fallbackCopyToClipboard: function(text) {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            this.showToast('클립보드에 복사되었습니다.');
        } catch (err) {
            console.error('클립보드 복사 실패:', err);
            this.showToast('복사 실패: 텍스트를 수동으로 복사하세요.');
        }
        document.body.removeChild(textArea);
    },

    isValidUrl: function(string) {
        try {
            const url = new URL(string);
            return url.protocol === 'http:' || url.protocol === 'https:' || 
                   url.protocol === 'data:' || string.includes('drive.google.com');
        } catch (_) {
            return false;
        }
    },

    extractGoogleDriveFileId: function(url) {
        const patterns = [
            /\/file\/d\/([a-zA-Z0-9_-]+)/,
            /id=([a-zA-Z0-9_-]+)/,
            /\/d\/([a-zA-Z0-9_-]+)/
        ];
        
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) return match[1];
        }
        return null;
    }
};

// ===== dataManager.js 내용 =====
const STORAGE_KEY = 'conceptArtManagerData_v1.2';

const VARIATION_TYPES_MAP = {
    'age': { name_kr: '연령 변형', name_en: 'Age Variation', schema_key_base: 'age' },
    'expression': { name_kr: '표정 변형', name_en: 'Expression Variation', schema_key_base: 'expression' },
    'costume': { name_kr: '의상 변형', name_en: 'Costume Variation', schema_key_base: 'costume' },
    'action': { name_kr: '액션 변형', name_en: 'Action Variation', schema_key_base: 'action' }
};

const AI_TOOLS = {
    'midjourney': { name: 'Midjourney', color: '#5865F2' },
    'leonardo': { name: 'Leonardo', color: '#7C3AED' },
    'ideogram': { name: 'Ideogram', color: '#10B981' },
    'imagefx': { name: 'ImageFX', color: '#F59E0B' },
    'openart': { name: 'OpenArt', color: '#EC4899' }
};

const state = {
    projectInfo: { project_id: "N/A", total_concept_arts: 0 },
    dataVersion: "N/A",
    dataTimestamp: "N/A",
    conceptArtData: { characters: {}, locations: {}, props: {} },
    currentConceptId: null,
    currentConceptType: null,
    currentPromptsAITab: null,
    currentVariantsAITab: null,
    currentVariantTypeTab: {}
};

const dataManager = {
    saveToLocalStorage: function() {
        const dataToSave = {
            projectInfo: state.projectInfo,
            dataVersion: state.dataVersion,
            dataTimestamp: state.dataTimestamp,
            conceptArtData: state.conceptArtData
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    },

    loadFromLocalStorage: function() {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                state.projectInfo = parsed.projectInfo || { project_id: "N/A", total_concept_arts: 0 };
                state.dataVersion = parsed.dataVersion || "N/A";
                state.dataTimestamp = parsed.dataTimestamp || "N/A";
                state.conceptArtData = parsed.conceptArtData || { characters: {}, locations: {}, props: {} };
                return true;
            } catch (error) {
                console.error('localStorage 데이터 파싱 오류:', error);
                return false;
            }
        }
        return false;
    },

    exportToJSON: function() {
        const totalConcepts = this.countTotalConcepts();
        const exportData = {
            metadata: {
                version: "1.2",
                timestamp: new Date().toISOString(),
                format: "concept_art_collection"
            },
            project_info: {
                ...state.projectInfo,
                total_concept_arts: totalConcepts
            },
            concept_art_collection: state.conceptArtData
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `concept_art_data_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        utils.showToast('JSON 파일이 다운로드되었습니다.');
    },

    importFromJSON: function(file) {
        const self = this;
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const data = JSON.parse(e.target.result);
                    self.processLoadedJSON(data);
                    resolve();
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = reject;
            reader.readAsText(file);
        });
    },

    convertStage4ToV12: function(stage4Data) {
        const converted = {
            characters: {},
            locations: {},
            props: {}
        };
        
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
                
                if (item.prompts) {
                    for (const [aiTool, promptData] of Object.entries(item.prompts)) {
                        if (promptData.prompt_english) {
                            convertedItem.base_prompts[aiTool] = promptData.prompt_english;
                        }
                    }
                }
                
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
    },

    processLoadedJSON: function(data) {
        if (data.concept_art_collection) {
            if (data.stage === 4 || data.version === "1.2") {
                state.conceptArtData = this.convertStage4ToV12(data.concept_art_collection);
            } else {
                state.conceptArtData = data.concept_art_collection;
            }
            
            state.projectInfo = data.project_info || { project_id: "N/A", total_concept_arts: 0 };
            state.dataVersion = data.version || data.metadata?.version || "N/A";
            state.dataTimestamp = data.timestamp || data.metadata?.timestamp || "N/A";
            this.saveToLocalStorage();
        } else {
            throw new Error('유효하지 않은 JSON 형식입니다.');
        }
    },

    handleStage4TempData: function() {
        const tempJson = localStorage.getItem('stage4TempJson');
        const tempFileName = localStorage.getItem('stage4TempFileName');
        
        if (tempJson && tempFileName) {
            try {
                console.log(`📁 Stage 4 임시 JSON 파일 로드: ${tempFileName}`);
                
                const data = JSON.parse(tempJson);
                this.processLoadedJSON(data);
                utils.showToast(`${tempFileName} 파일을 성공적으로 로드했습니다.`);
                
                localStorage.removeItem('stage4TempJson');
                localStorage.removeItem('stage4TempFileName');
                
                return true;
            } catch (error) {
                console.error('Stage 4 임시 JSON 로드 오류:', error);
                utils.showToast('임시 저장된 JSON 파일을 로드할 수 없습니다.');
                localStorage.removeItem('stage4TempJson');
                localStorage.removeItem('stage4TempFileName');
                return false;
            }
        }
        return false;
    },

    countTotalConcepts: function() {
        let count = 0;
        for (const category of Object.values(state.conceptArtData)) {
            count += Object.keys(category).length;
        }
        return count;
    },

    getCurrentConcept: function() {
        if (!state.currentConceptId || !state.currentConceptType) {
            return null;
        }
        return state.conceptArtData[state.currentConceptType][state.currentConceptId];
    },

    selectConcept: function(type, id) {
        state.currentConceptType = type;
        state.currentConceptId = id;
        
        state.currentPromptsAITab = null;
        state.currentVariantsAITab = null;
        state.currentVariantTypeTab = {};
    }
};

// ===== uiRenderer.js 내용 =====
const uiRenderer = {
    updateProjectInfo: function() {
        const infoDisplay = document.getElementById('project-info-display');
        if (infoDisplay) {
            const totalConcepts = dataManager.countTotalConcepts();
            infoDisplay.innerHTML = `
                <span>프로젝트 ID: ${state.projectInfo.project_id || '데이터 없음'}</span>
                <span>총 컨셉아트: ${totalConcepts || '데이터 없음'}</span>
                <span>데이터 버전: ${state.dataVersion || '데이터 없음'}</span>
                <span>마지막 업데이트: ${state.dataTimestamp || '데이터 없음'}</span>
            `;
        }
    },

    renderSidebar: function() {
        this.renderConceptList('characters', 'character-list');
        this.renderConceptList('locations', 'location-list');
        this.renderConceptList('props', 'prop-list');
    },

    renderConceptList: function(type, elementId) {
        const listElement = document.getElementById(elementId);
        if (!listElement) return;
        
        listElement.innerHTML = '';
        const concepts = state.conceptArtData[type] || {};
        
        for (const [id, concept] of Object.entries(concepts)) {
            const li = document.createElement('li');
            li.className = 'concept-item';
            if (state.currentConceptId === id && state.currentConceptType === type) {
                li.classList.add('active');
            }
            
            const name = concept.name_kr || concept.name || id;
            li.innerHTML = `<span class="concept-name">${name}</span>`;
            li.onclick = () => {
                dataManager.selectConcept(type, id);
                this.displayConceptDetail();
                document.querySelectorAll('.concept-item').forEach(item => item.classList.remove('active'));
                li.classList.add('active');
            };
            
            listElement.appendChild(li);
        }
    },

    displayConceptDetail: function() {
        const concept = dataManager.getCurrentConcept();
        const conceptTitle = document.getElementById('concept-title');
        
        if (!concept) {
            conceptTitle.textContent = '컨셉아트를 선택하세요';
            this.clearAllTabs();
            return;
        }
        
        const name = concept.name_kr || concept.name || state.currentConceptId;
        conceptTitle.textContent = name;
        
        this.displayCSVData(concept);
        this.displayBasePrompts(concept);
        this.displayVariants(concept);
        imageManager.updateImageGallery(concept);
        
        const firstTab = document.querySelector('.tab-button.active');
        if (firstTab) {
            firstTab.click();
        }
    },

    clearAllTabs: function() {
        document.getElementById('csv-data-table').innerHTML = 
            '<thead><tr><th>ID</th><th>값</th></tr></thead><tbody><tr><td colspan="2">컨셉아트를 선택하면 CSV 데이터가 표시됩니다.</td></tr></tbody>';
        document.getElementById('base-prompt-ai-content-area').innerHTML = '';
        document.getElementById('variant-prompt-ai-content-area').innerHTML = '';
        document.getElementById('image-gallery-content').innerHTML = 
            '<div class="no-image-message">컨셉아트를 선택하고 이미지를 추가하면 갤러리가 표시됩니다.</div>';
    },

    displayCSVData: function(concept) {
        const table = document.getElementById('csv-data-table');
        const tbody = table.querySelector('tbody') || table;
        tbody.innerHTML = '';
        
        const csvFields = [
            { key: 'name_kr', label: '이름 (한글)' },
            { key: 'name_en', label: '이름 (영문)' },
            { key: 'description', label: '설명' },
            { key: 'features', label: '특징' }
        ];
        
        let hasData = false;
        csvFields.forEach(field => {
            if (concept[field.key]) {
                hasData = true;
                const row = tbody.insertRow();
                row.insertCell(0).textContent = field.label;
                row.insertCell(1).textContent = concept[field.key];
            }
        });
        
        if (!hasData) {
            const row = tbody.insertRow();
            const cell = row.insertCell(0);
            cell.colSpan = 2;
            cell.textContent = 'CSV 데이터가 없습니다.';
        }
    },

    displayBasePrompts: function(concept) {
        const contentArea = document.getElementById('base-prompt-ai-content-area');
        contentArea.innerHTML = '';
        
        if (!concept.base_prompts || Object.keys(concept.base_prompts).length === 0) {
            contentArea.innerHTML = '<div class="no-prompt-message">기본 프롬프트가 없습니다.</div>';
            return;
        }
        
        for (const [aiTool, prompt] of Object.entries(concept.base_prompts)) {
            if (AI_TOOLS[aiTool] && prompt) {
                const promptDiv = document.createElement('div');
                promptDiv.className = 'tab-content';
                promptDiv.id = `base-${aiTool}-content`;
                promptDiv.style.display = 'none';
                
                promptDiv.innerHTML = `
                    <div class="prompt-container">
                        <div class="prompt-text">${prompt}</div>
                        <button class="btn btn-primary" onclick="promptManager.copyPrompt('${aiTool}', 'base')">프롬프트 복사</button>
                    </div>
                    <div class="image-container" id="image-base-${aiTool}">
                        <div class="no-image-message">이미지를 추가하려면 버튼을 클릭하세요</div>
                    </div>
                    <div class="image-actions">
                        <button class="btn btn-secondary" onclick="imageManager.addImage('${aiTool}', 'base')">이미지 URL 추가</button>
                        <button class="btn btn-secondary" onclick="imageManager.uploadImageFile('${aiTool}', 'base')">이미지 파일 업로드</button>
                    </div>
                `;
                
                contentArea.appendChild(promptDiv);
            }
        }
        
        this.buildAITabs();
        const firstAITool = Object.keys(concept.base_prompts).find(tool => AI_TOOLS[tool] && concept.base_prompts[tool]);
        if (firstAITool) {
            this.showAITab(firstAITool, 'base');
        }
    },

    displayVariants: function(concept) {
        const variantsTab = document.getElementById('variants-tab');
        const placeholder = document.getElementById('variants-placeholder');
        const mainContent = document.getElementById('variants-main-content');
        const contentArea = document.getElementById('variant-prompt-ai-content-area');
        
        if (state.currentConceptType !== 'characters' || !concept.character_variations) {
            placeholder.style.display = 'block';
            mainContent.style.display = 'none';
            return;
        }
        
        placeholder.style.display = 'none';
        mainContent.style.display = 'block';
        contentArea.innerHTML = '';
        
        for (const [aiTool, variations] of Object.entries(concept.character_variations)) {
            if (AI_TOOLS[aiTool]) {
                const aiDiv = document.createElement('div');
                aiDiv.className = 'tab-content';
                aiDiv.id = `variant-${aiTool}-content`;
                aiDiv.style.display = 'none';
                
                const typeTabs = document.createElement('div');
                typeTabs.className = 'variant-type-tabs';
                
                const typeContents = document.createElement('div');
                typeContents.className = 'variant-type-contents';
                
                for (const [typeKey, typeInfo] of Object.entries(VARIATION_TYPES_MAP)) {
                    const typeVariations = this.getVariationsByType(variations, typeInfo.schema_key_base);
                    if (typeVariations.length > 0) {
                        const tabBtn = document.createElement('button');
                        tabBtn.className = 'variant-type-tab';
                        tabBtn.textContent = typeInfo.name_kr;
                        tabBtn.onclick = () => this.showVariantTypeTab(aiTool, typeKey);
                        typeTabs.appendChild(tabBtn);
                        
                        const typeContent = document.createElement('div');
                        typeContent.className = 'variant-type-content';
                        typeContent.id = `variant-${aiTool}-${typeKey}`;
                        typeContent.style.display = 'none';
                        
                        typeVariations.forEach((variation, index) => {
                            const variantDiv = document.createElement('div');
                            variantDiv.className = 'variant-item';
                            variantDiv.innerHTML = `
                                <h4>${typeInfo.name_kr} ${index + 1}</h4>
                                <div class="prompt-container">
                                    <div class="prompt-text">${variation.prompt}</div>
                                    <button class="btn btn-primary" onclick="promptManager.copyVariantPrompt('${aiTool}', '${typeKey}', ${index})">프롬프트 복사</button>
                                </div>
                                <div class="image-container" id="image-${typeKey}_${index}-${aiTool}">
                                    <div class="no-image-message">이미지를 추가하려면 버튼을 클릭하세요</div>
                                </div>
                                <div class="image-actions">
                                    <button class="btn btn-secondary" onclick="imageManager.addImage('${aiTool}', '${typeKey}', ${index})">이미지 URL 추가</button>
                                    <button class="btn btn-secondary" onclick="imageManager.uploadImageFile('${aiTool}', '${typeKey}', ${index})">이미지 파일 업로드</button>
                                </div>
                            `;
                            typeContent.appendChild(variantDiv);
                        });
                        
                        const permutationKey = `${typeInfo.schema_key_base}_permutation`;
                        if (variations[permutationKey]) {
                            const permDiv = document.createElement('div');
                            permDiv.className = 'variant-item permutation';
                            permDiv.innerHTML = `
                                <h4>${typeInfo.name_kr} - Permutation 프롬프트</h4>
                                <div class="prompt-container">
                                    <div class="prompt-text">${variations[permutationKey]}</div>
                                    <button class="btn btn-primary" onclick="promptManager.copyVariantPrompt('${aiTool}', '${permutationKey}')">프롬프트 복사</button>
                                </div>
                            `;
                            typeContent.appendChild(permDiv);
                        }
                        
                        typeContents.appendChild(typeContent);
                    }
                }
                
                aiDiv.appendChild(typeTabs);
                aiDiv.appendChild(typeContents);
                contentArea.appendChild(aiDiv);
            }
        }
        
        this.buildAITabs();
        const firstAITool = Object.keys(concept.character_variations).find(tool => AI_TOOLS[tool]);
        if (firstAITool) {
            this.showAITab(firstAITool, 'variant');
            const firstType = Object.keys(VARIATION_TYPES_MAP).find(typeKey => {
                const typeVariations = this.getVariationsByType(concept.character_variations[firstAITool], VARIATION_TYPES_MAP[typeKey].schema_key_base);
                return typeVariations.length > 0;
            });
            if (firstType) {
                this.showVariantTypeTab(firstAITool, firstType);
            }
        }
    },

    getVariationsByType: function(variations, baseKey) {
        const result = [];
        for (const [key, value] of Object.entries(variations)) {
            if (key.startsWith(baseKey + '_') && !key.includes('_permutation')) {
                const index = parseInt(key.split('_').pop());
                if (!isNaN(index)) {
                    result[index] = { key, prompt: value };
                }
            }
        }
        return result.filter(Boolean);
    },

    buildAITabs: function() {
        const baseTabsContainer = document.getElementById('base-prompt-ai-tabs');
        const variantTabsContainer = document.getElementById('variant-prompt-ai-tabs');
        
        if (baseTabsContainer) {
            baseTabsContainer.innerHTML = '';
            for (const [key, tool] of Object.entries(AI_TOOLS)) {
                const btn = document.createElement('button');
                btn.className = 'ai-tab-button';
                btn.textContent = tool.name;
                btn.style.borderColor = tool.color;
                btn.onclick = () => this.showAITab(key, 'base');
                baseTabsContainer.appendChild(btn);
            }
        }
        
        if (variantTabsContainer) {
            variantTabsContainer.innerHTML = '';
            for (const [key, tool] of Object.entries(AI_TOOLS)) {
                const btn = document.createElement('button');
                btn.className = 'ai-tab-button';
                btn.textContent = tool.name;
                btn.style.borderColor = tool.color;
                btn.onclick = () => this.showAITab(key, 'variant');
                variantTabsContainer.appendChild(btn);
            }
        }
    },

    showAITab: function(aiTool, type) {
        if (type === 'base') {
            state.currentPromptsAITab = aiTool;
            document.querySelectorAll('#base-prompt-ai-content-area .tab-content').forEach(tab => {
                tab.style.display = 'none';
            });
            document.querySelectorAll('#base-prompt-ai-tabs .ai-tab-button').forEach(btn => {
                btn.classList.remove('active');
            });
        } else if (type === 'variant') {
            state.currentVariantsAITab = aiTool;
            document.querySelectorAll('#variant-prompt-ai-content-area .tab-content').forEach(tab => {
                tab.style.display = 'none';
            });
            document.querySelectorAll('#variant-prompt-ai-tabs .ai-tab-button').forEach(btn => {
                btn.classList.remove('active');
            });
        }
        
        const contentId = `${type}-${aiTool}-content`;
        const content = document.getElementById(contentId);
        if (content) {
            content.style.display = 'block';
        }
        
        const tabsContainer = type === 'base' ? 'base-prompt-ai-tabs' : 'variant-prompt-ai-tabs';
        const activeBtn = document.querySelector(`#${tabsContainer} .ai-tab-button:nth-child(${Object.keys(AI_TOOLS).indexOf(aiTool) + 1})`);
        if (activeBtn) {
            activeBtn.classList.add('active');
            activeBtn.style.backgroundColor = AI_TOOLS[aiTool].color + '20';
        }
    },

    showVariantTypeTab: function(aiTool, typeKey) {
        state.currentVariantTypeTab[aiTool] = typeKey;
        
        const container = document.getElementById(`variant-${aiTool}-content`);
        if (!container) return;
        
        container.querySelectorAll('.variant-type-content').forEach(content => {
            content.style.display = 'none';
        });
        
        container.querySelectorAll('.variant-type-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        const targetContent = document.getElementById(`variant-${aiTool}-${typeKey}`);
        if (targetContent) {
            targetContent.style.display = 'block';
        }
        
        const typeIndex = Object.keys(VARIATION_TYPES_MAP).indexOf(typeKey);
        const activeTab = container.querySelectorAll('.variant-type-tab')[typeIndex];
        if (activeTab) {
            activeTab.classList.add('active');
        }
    },

    openTab: function(event, tabName) {
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });
        
        document.getElementById(tabName).classList.add('active');
        event.currentTarget.classList.add('active');
    }
};

// ===== promptManager.js 내용 =====
const promptManager = {
    copyCSV: function() {
        const concept = dataManager.getCurrentConcept();
        if (!concept) {
            utils.showToast('선택된 컨셉아트가 없습니다.');
            return;
        }
        
        const csvFields = ['name_en', 'name_kr', 'description', 'features'];
        const csvData = [];
        
        csvFields.forEach(field => {
            if (concept[field]) {
                csvData.push(`${field},${concept[field]}`);
            }
        });
        
        if (csvData.length === 0) {
            utils.showToast('복사할 CSV 데이터가 없습니다.');
            return;
        }
        
        utils.copyToClipboard(csvData.join('\n'));
    },

    copyPrompt: function(aiTool, type) {
        const concept = dataManager.getCurrentConcept();
        if (!concept) {
            utils.showToast('선택된 컨셉아트가 없습니다.');
            return;
        }
        
        if (type === 'base' && concept.base_prompts && concept.base_prompts[aiTool]) {
            utils.copyToClipboard(concept.base_prompts[aiTool]);
        } else {
            utils.showToast('복사할 프롬프트가 없습니다.');
        }
    },

    copyVariantPrompt: function(aiTool, typeKey, index = null) {
        const concept = dataManager.getCurrentConcept();
        if (!concept) {
            utils.showToast('선택된 컨셉아트가 없습니다.');
            return;
        }
        
        if (!concept.character_variations || !concept.character_variations[aiTool]) {
            utils.showToast('복사할 변형 프롬프트가 없습니다.');
            return;
        }
        
        let promptKey;
        if (typeKey.includes('_permutation')) {
            promptKey = typeKey;
        } else if (index !== null) {
            const baseKey = VARIATION_TYPES_MAP[typeKey]?.schema_key_base;
            if (!baseKey) {
                utils.showToast('올바르지 않은 변형 타입입니다.');
                return;
            }
            promptKey = `${baseKey}_${index}`;
        } else {
            utils.showToast('변형 인덱스가 필요합니다.');
            return;
        }
        
        const prompt = concept.character_variations[aiTool][promptKey];
        if (prompt) {
            utils.copyToClipboard(prompt);
        } else {
            utils.showToast('복사할 프롬프트가 없습니다.');
        }
    }
};

// ===== imageManager.js 내용 =====
const imageManager = {
    // 드롭박스 URL을 raw 형식으로 변환하는 함수
    convertDropboxUrl: function(url) {
        if (!url) return url;
        
        // 드롭박스 URL인지 확인
        if (url.includes('dropbox.com')) {
            // dl=0을 raw=1로 변경
            if (url.includes('dl=0')) {
                return url.replace('dl=0', 'raw=1');
            }
            // dl 파라미터가 없으면 raw=1 추가
            else if (!url.includes('dl=') && !url.includes('raw=')) {
                const separator = url.includes('?') ? '&' : '?';
                return url + separator + 'raw=1';
            }
        }
        
        return url;
    },
    
    addImage: function(aiTool, type, index = null) {
        const concept = dataManager.getCurrentConcept();
        if (!concept) {
            utils.showToast('선택된 컨셉아트가 없습니다.');
            return;
        }
        
        const newUrl = prompt('이미지 URL을 입력하세요 (구글 드라이브 링크 가능):');
        if (!newUrl || newUrl.trim() === '') return;
        
        // 드롭박스 URL 자동 변환
        const processedUrl = this.convertDropboxUrl(newUrl.trim());
        
        if (!concept.generated_images) concept.generated_images = { base_prompts: {}, variations: {} };
        if (type === 'base' && !concept.generated_images.base_prompts) concept.generated_images.base_prompts = {};
        if (type !== 'base' && !concept.generated_images.variations) concept.generated_images.variations = {};
        if (type !== 'base' && !concept.generated_images.variations[aiTool]) concept.generated_images.variations[aiTool] = {};
        
        this.setImageUrl(aiTool, type, index, processedUrl, concept);
    },

    uploadImageFile: function(aiTool, type, index = null) {
        const concept = dataManager.getCurrentConcept();
        if (!concept) {
            utils.showToast('선택된 컨셉아트가 없습니다.');
            return;
        }
        
        if (!concept.generated_images) concept.generated_images = { base_prompts: {}, variations: {} };
        if (type === 'base' && !concept.generated_images.base_prompts) concept.generated_images.base_prompts = {};
        if (type !== 'base' && !concept.generated_images.variations) concept.generated_images.variations = {};
        if (type !== 'base' && !concept.generated_images.variations[aiTool]) concept.generated_images.variations[aiTool] = {};
        
        this.selectLocalImageFile(aiTool, type, index, concept);
    },

    setImageUrl: function(aiTool, type, index, imageUrl, concept) {
        if (type === 'base') {
            concept.generated_images.base_prompts[aiTool] = imageUrl;
            this.displayImage(aiTool, 'base', imageUrl);
        } else {
            const variationKey = `${VARIATION_TYPES_MAP[type].schema_key_base}_${index}`;
            concept.generated_images.variations[aiTool][variationKey] = imageUrl;
            this.displayImage(aiTool, `${type}_${index}`, imageUrl);
        }
        dataManager.saveToLocalStorage();
        this.updateImageGallery(concept);
        utils.showToast('이미지가 업데이트되었습니다.');
    },

    selectLocalImageFile: function(aiTool, type, index, concept) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.style.display = 'none';
        
        const self = this;
        input.onchange = function(e) {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = function(event) {
                const dataUrl = event.target.result;
                self.setImageUrl(aiTool, type, index, dataUrl, concept);
            };
            reader.readAsDataURL(file);
            
            document.body.removeChild(input);
        };
        
        document.body.appendChild(input);
        input.click();
    },

    displayImage: function(aiTool, type, imageUrl) {
        const containerId = `image-${type}-${aiTool}`;
        const container = document.getElementById(containerId);
        
        if (!container) return;
        
        container.innerHTML = '';
        
        if (!imageUrl) {
            container.innerHTML = '<div class="no-image-message">이미지를 추가하려면 버튼을 클릭하세요</div>';
            return;
        }
        
        let displayUrl = imageUrl;
        if (imageUrl.includes('drive.google.com')) {
            const fileId = utils.extractGoogleDriveFileId(imageUrl);
            if (fileId) {
                displayUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`;
            }
        }
        
        const img = document.createElement('img');
        img.src = displayUrl;
        img.alt = `${type} - ${aiTool}`;
        img.style.cursor = 'pointer';
        img.onclick = () => this.openImageModal(displayUrl);
        
        img.onerror = function() {
            if (imageUrl.includes('drive.google.com')) {
                container.innerHTML = `
                    <div class="no-image-message">
                        구글 드라이브 이미지를 로드할 수 없습니다.<br>
                        <a href="${imageUrl}" target="_blank" rel="noopener noreferrer">새 탭에서 열기</a>
                    </div>
                `;
            } else if (imageUrl.startsWith('data:image')) {
                this.src = imageUrl;
            } else {
                container.innerHTML = '<div class="no-image-message">이미지를 로드할 수 없습니다.</div>';
            }
        };
        
        container.appendChild(img);
    },

    updateImageGallery: function(concept) {
        const galleryContent = document.getElementById('image-gallery-content');
        if (!galleryContent) return;
        
        galleryContent.innerHTML = '';
        
        if (!concept?.generated_images) {
            galleryContent.innerHTML = '<div class="no-image-message">컨셉아트를 선택하고 이미지를 추가하면 갤러리가 표시됩니다.</div>';
            return;
        }
        
        const images = [];
        
        if (concept.generated_images.base_prompts) {
            for (const [aiTool, imageUrl] of Object.entries(concept.generated_images.base_prompts)) {
                if (imageUrl) {
                    images.push({
                        url: imageUrl,
                        aiTool: aiTool,
                        type: '기본 프롬프트',
                        title: `${aiTool.toUpperCase()} - 기본`
                    });
                }
            }
        }
        
        if (concept.generated_images.variations) {
            for (const [aiTool, variations] of Object.entries(concept.generated_images.variations)) {
                for (const [variationKey, imageUrl] of Object.entries(variations)) {
                    if (imageUrl) {
                        const typeInfo = this.getVariationTypeInfo(variationKey);
                        images.push({
                            url: imageUrl,
                            aiTool: aiTool,
                            type: typeInfo.type,
                            title: `${aiTool.toUpperCase()} - ${typeInfo.label}`
                        });
                    }
                }
            }
        }
        
        if (images.length === 0) {
            galleryContent.innerHTML = '<div class="no-image-message">아직 추가된 이미지가 없습니다.</div>';
            return;
        }
        
        images.forEach(imageData => {
            const card = this.createImageCard(imageData);
            galleryContent.appendChild(card);
        });
    },

    getVariationTypeInfo: function(variationKey) {
        for (const [typeKey, typeInfo] of Object.entries(VARIATION_TYPES_MAP)) {
            if (variationKey.startsWith(typeInfo.schema_key_base)) {
                const index = variationKey.split('_').pop();
                if (!isNaN(index)) {
                    return {
                        type: typeInfo.name_kr,
                        label: `${typeInfo.name_kr} ${index}`
                    };
                }
            }
        }
        return { type: '변형', label: variationKey };
    },

    createImageCard: function(imageData) {
        const card = document.createElement('div');
        card.className = 'image-card';
        
        let displayUrl = imageData.url;
        if (imageData.url.includes('drive.google.com')) {
            const fileId = utils.extractGoogleDriveFileId(imageData.url);
            if (fileId) {
                displayUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`;
            }
        }
        
        card.innerHTML = `
            <img src="${displayUrl}" alt="${imageData.title}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y0ZjRmNCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBOb3QgRm91bmQ8L3RleHQ+PC9zdmc+'">
            <div class="image-card-info">
                <h4>${imageData.title}</h4>
                <p>${imageData.type}</p>
            </div>
        `;
        
        card.onclick = () => this.openImageModal(displayUrl);
        
        return card;
    },

    openImageModal: function(imageUrl) {
        const modal = document.getElementById('imageModal');
        const modalImg = document.getElementById('modalImage');
        
        if (modal && modalImg) {
            modal.style.display = 'flex';
            modalImg.src = imageUrl;
        }
    },

    closeImageModal: function(event) {
        const modal = document.getElementById('imageModal');
        if (event.target === modal || event.target.className === 'image-modal-close') {
            modal.style.display = 'none';
        }
    },

    loadAndDisplayImages: function(concept) {
        if (!concept?.generated_images) return;
        
        if (concept.generated_images.base_prompts) {
            for (const [aiTool, imageUrl] of Object.entries(concept.generated_images.base_prompts)) {
                if (imageUrl) {
                    this.displayImage(aiTool, 'base', imageUrl);
                }
            }
        }
        
        if (concept.generated_images.variations) {
            for (const [aiTool, variations] of Object.entries(concept.generated_images.variations)) {
                for (const [variationKey, imageUrl] of Object.entries(variations)) {
                    if (imageUrl) {
                        for (const [typeKey, typeInfo] of Object.entries(VARIATION_TYPES_MAP)) {
                            if (variationKey.startsWith(typeInfo.schema_key_base)) {
                                const index = variationKey.split('_').pop();
                                if (!isNaN(index)) {
                                    this.displayImage(aiTool, `${typeKey}_${index}`, imageUrl);
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }
        
        this.updateImageGallery(concept);
    }
};

// ===== 초기화 및 이벤트 처리 =====
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
                dataManager.saveToLocalStorage();
                uiRenderer.updateProjectInfo();
                uiRenderer.renderSidebar();
                utils.showToast('로컬 JSON 파일을 성공적으로 로드했습니다.');
            }
        }
    } catch (error) {
        console.log('로컬 JSON 파일을 찾을 수 없습니다. localStorage 데이터를 확인합니다.');
        if (dataManager.loadFromLocalStorage()) {
            uiRenderer.updateProjectInfo();
            uiRenderer.renderSidebar();
            utils.showToast('저장된 데이터를 로드했습니다.');
        }
    }
}

function initialize() {
    // 이벤트 리스너 설정 - 헤더 버튼과 기존 버튼 모두 지원
    const exportBtns = ['export-json-btn', 'header-import-json-btn'];
    const importBtns = ['import-json-btn', 'header-export-json-btn'];
    const resetBtns = ['reset-data-btn', 'header-clear-btn'];
    
    // Export 버튼들
    exportBtns.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', () => dataManager.exportToJSON());
        }
    });
    
    // Import 버튼들
    importBtns.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', () => {
                document.getElementById('import-json-input').click();
            });
        }
    });
    
    // Import 파일 선택
    document.getElementById('import-json-input').addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        dataManager.importFromJSON(file)
            .then(() => {
                uiRenderer.updateProjectInfo();
                uiRenderer.renderSidebar();
                utils.showToast('JSON 파일을 성공적으로 가져왔습니다.');
            })
            .catch(error => {
                console.error('JSON 가져오기 오류:', error);
                utils.showToast('JSON 파일을 가져올 수 없습니다: ' + error.message);
            });
        
        event.target.value = '';
    });
    
    // Reset 버튼들
    resetBtns.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', function() {
                if (confirm('모든 데이터가 삭제됩니다. 계속하시겠습니까?')) {
                    localStorage.removeItem(STORAGE_KEY);
                    utils.showToast('모든 데이터가 초기화되었습니다.');
                    setTimeout(() => location.reload(), 1000);
                }
            });
        }
    });
    
    // 전체 시나리오 다운로드 버튼 (새로운 기능)
    const downloadBtn = document.getElementById('header-reset-btn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            utils.showToast('전체 시나리오 다운로드 기능은 준비 중입니다.');
        });
    }
    
    // AI 탭 빌드
    uiRenderer.buildAITabs();
    
    // URL 파라미터 체크 및 자동 JSON 처리
    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.get('loadStage4Json') === 'true') {
        console.log('🔄 Stage 4 임시 저장된 JSON 파일 자동 로드 실행...');
        setTimeout(() => {
            if (dataManager.handleStage4TempData()) {
                uiRenderer.updateProjectInfo();
                uiRenderer.renderSidebar();
            }
        }, 1000);
    } else {
        const tempJson = localStorage.getItem('stage4TempJson');
        const tempFileName = localStorage.getItem('stage4TempFileName');
        
        if (tempJson && tempFileName) {
            console.log('🔄 localStorage에서 Stage 4 데이터 발견, 자동 로드 실행...');
            setTimeout(() => {
                if (dataManager.handleStage4TempData()) {
                    uiRenderer.updateProjectInfo();
                    uiRenderer.renderSidebar();
                }
            }, 1000);
        } else {
            loadLocalJsonFile();
        }
    }
}

// 전역 함수들 window 객체에 노출
window.openTab = uiRenderer.openTab.bind(uiRenderer);
window.copyCSV = promptManager.copyCSV.bind(promptManager);
window.copyPrompt = promptManager.copyPrompt.bind(promptManager);
window.copyVariantPrompt = promptManager.copyVariantPrompt.bind(promptManager);
window.addImage = imageManager.addImage.bind(imageManager);
window.uploadImageFile = imageManager.uploadImageFile.bind(imageManager);
window.closeImageModal = imageManager.closeImageModal.bind(imageManager);
window.showAITab = uiRenderer.showAITab.bind(uiRenderer);
window.showVariantTypeTab = uiRenderer.showVariantTypeTab.bind(uiRenderer);
window.selectConcept = function(type, id) {
    dataManager.selectConcept(type, id);
    uiRenderer.displayConceptDetail();
    const concept = state.conceptArtData[type][id];
    if (concept) {
        imageManager.loadAndDisplayImages(concept);
    }
};

// DOM 로드 완료 시 초기화
document.addEventListener('DOMContentLoaded', initialize);