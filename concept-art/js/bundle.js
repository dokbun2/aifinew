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

// 한글 -> 영어 매핑 테이블
const CSV_FIELD_MAPPING = {
    // STYLE 관련
    '3D 시네마틱 SF 호러 캐릭터 아트': '3D cinematic SF horror character art',
    '3D 시네마틱 SF 캐릭터 아트': '3D cinematic SF character art',
    '3D 사이버펑크 캐릭터 아트': '3D cyberpunk character art',
    '3D 디스토피아 캐릭터 아트': '3D dystopian character art',
    '3D 포스트아포칼립스 캐릭터 아트': '3D post-apocalyptic character art',
    '3D 근미래 캐릭터 아트': '3D near-future character art',
    '3D 호러 SF 크리쳐 디자인 초상': '3D horror sci-fi creature design portrait',
    '시네마틱 포스트아포칼립스 도시 풍경': 'cinematic post-apocalyptic cityscape',
    '3D 포토리얼 렌더': '3D photorealistic render',
    
    // MEDIUM 관련
    '3D 렌더': '3D render',
    '3D 모델': '3D model',
    '디지털 아트': 'digital art',
    '컨셉 아트': 'concept art',
    '일러스트레이션': 'illustration',
    
    // CHARACTER 관련
    '한국인 남성 32세 특수요원': 'Korean male 32 years old special agent',
    '한국인 여성 28세 해커': 'Korean female 28 years old hacker',
    '외국인 남성 45세 용병': 'Foreign male 45 years old mercenary',
    '한국인 남성 35세 과학자': 'Korean male 35 years old scientist',
    'AI 감염된 인간-기계 하이브리드 포식자': 'AI-infected human-machine hybrid apex predator',
    
    // LOCATION 관련
    '폐허가 된 서울 도심': 'ruined Seoul downtown',
    '사이버펑크 부산 거리': 'cyberpunk Busan streets',
    '버려진 연구 시설': 'abandoned research facility',
    '지하 벙커': 'underground bunker',
    '정전된 도심 대로 긴급 경보음': 'blackout city avenue emergency sirens',
    
    // CAMERA 관련
    '미디엄 샷': 'medium shot',
    '미디엄 샷 약간 로우 앵글': 'medium shot slightly low angle',
    '미디엄 클로즈업 로우 앵글': 'medium close-up low angle',
    '와이드샷 로우 앵글': 'wide shot low angle',
    '클로즈업': 'close-up',
    '풀샷': 'full shot',
    '와이드 샷': 'wide shot',
    '로우 앵글': 'low angle',
    '하이 앵글': 'high angle',
    '더치 앵글': 'dutch angle',
    '오버 더 숄더': 'over the shoulder',
    
    // GAZE 관련
    '정면 응시 경계 태세': 'front gaze alert stance',
    '측면 응시': 'side gaze',
    '카메라 응시': 'looking at camera',
    '먼 곳 응시': 'looking into distance',
    
    // CHARACTER_SHEET 관련
    '캐릭터 시트': 'character sheet',
    '전신 턴어라운드': 'full body turnaround',
    '표정 변화': 'expression variations',
    
    // BODY_TYPE 관련
    '180cm 탄탄한 체형 전술 장비': '180cm athletic build tactical gear',
    '운동선수 체형': 'athletic build',
    '근육질 체형': 'muscular build',
    '날씬한 체형': 'slim build',
    
    // HAIR 관련
    '검은색 짧은 헤어컷': 'black short haircut',
    '갈색 긴 머리': 'brown long hair',
    '금발 웨이브': 'blonde wavy hair',
    '은발': 'silver hair',
    
    // FACE_SHAPE 관련
    '각진 얼굴 뚜렷한 턱선': 'angular face distinct jawline',
    '둥근 얼굴': 'round face',
    '갸름한 얼굴': 'oval face',
    'V라인 얼굴': 'v-shaped face',
    
    // FACIAL_FEATURES 관련
    '집중된 눈빛 얇은 수염 빨의 작은 흉터': 'focused eyes thin beard small scar on cheek',
    '날카로운 눈빛': 'sharp eyes',
    '부드러운 표정': 'soft expression',
    '카리스마 있는 표정': 'charismatic expression',
    
    // QUALITY 관련
    '매우 디테일하고 전문적인 8K': 'highly detailed, professional, 8K',
    '고품질': 'high quality',
    '초고해상도': 'ultra high resolution',
    
    // LIGHTING 관련
    '극적인 조명': 'dramatic lighting',
    '시네마틱 조명': 'cinematic lighting',
    '무드 있는 조명': 'moody lighting',
    '림라이트': 'rim lighting',
    '키 라이트': 'key lighting',
    
    // STYLE TYPE (필드명)
    '스타일': 'STYLE',
    '매체': 'MEDIUM',
    '캐릭터': 'CHARACTER',
    '카메라': 'CAMERA',
    '품질': 'QUALITY',
    '조명': 'LIGHTING',
    '파라미터': 'PARAMETERS',
    '시선': 'GAZE',
    '체형': 'BODY_TYPE',
    '헤어': 'HAIR',
    '얼굴형': 'FACE_SHAPE',
    '얼굴 특징': 'FACIAL_FEATURES'
};

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
            conceptArtData: state.conceptArtData,
            currentConceptType: state.currentConceptType,
            currentConceptId: state.currentConceptId
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    },

    migrateAdditionalImages: function() {
        // 모든 카테고리를 순회하며 추가 이미지를 3개로 제한
        ['characters', 'locations', 'props'].forEach(type => {
            const concepts = state.conceptArtData[type];
            if (concepts) {
                Object.keys(concepts).forEach(conceptId => {
                    const concept = concepts[conceptId];
                    if (concept.additional_images) {
                        // image_4, image_5 등 4번째 이상의 이미지 제거
                        const validKeys = ['image_1', 'image_2', 'image_3'];
                        const currentKeys = Object.keys(concept.additional_images);
                        
                        currentKeys.forEach(key => {
                            if (!validKeys.includes(key)) {
                                console.log(`마이그레이션: ${conceptId}의 ${key} 이미지 제거`);
                                delete concept.additional_images[key];
                            }
                        });
                    }
                });
            }
        });
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
                
                // 추가 이미지 데이터 마이그레이션 (4개 이상인 경우 3개로 제한)
                this.migrateAdditionalImages();
                
                // 선택된 컨셉 정보도 복원
                if (parsed.currentConceptType && parsed.currentConceptId) {
                    state.currentConceptType = parsed.currentConceptType;
                    state.currentConceptId = parsed.currentConceptId;
                }
                
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
        
        // 수정된 프롬프트 가져오기
        const editedPrompts = JSON.parse(localStorage.getItem('editedConceptPrompts') || '{}');
        
        // 데이터 복사 (원본 수정 방지)
        const exportDataCopy = JSON.parse(JSON.stringify(state.conceptArtData));
        
        // 수정된 프롬프트 병합
        if (Object.keys(editedPrompts).length > 0) {
            Object.entries(editedPrompts).forEach(([key, editedData]) => {
                const [conceptId, aiTool, ...promptParts] = key.split('_');
                const promptType = promptParts.join('_');
                
                // 해당 컨셉 찾기
                let concept = null;
                for (const [type, concepts] of Object.entries(exportDataCopy)) {
                    if (concepts[conceptId]) {
                        concept = concepts[conceptId];
                        break;
                    }
                }
                
                if (concept) {
                    if (promptType === 'base') {
                        // 기본 프롬프트 수정
                        if (!concept.base_prompts) concept.base_prompts = {};
                        concept.base_prompts[aiTool] = editedData.prompt;
                    } else {
                        // 변형 프롬프트 수정
                        if (!concept.character_variations) concept.character_variations = {};
                        if (!concept.character_variations[aiTool]) concept.character_variations[aiTool] = {};
                        concept.character_variations[aiTool][promptType] = editedData.prompt;
                    }
                }
            });
        }
        
        // 모든 컨셉의 이미지 구조 확인 및 보존
        // main_image_url과 additional_images 구조가 있으면 그대로 유지
        for (const [category, concepts] of Object.entries(exportDataCopy)) {
            for (const [conceptId, concept] of Object.entries(concepts)) {
                // main_image_url과 additional_images가 있으면 그대로 유지
                // generated_images 구조도 함께 유지 (하위 호환성)
                if (!concept.main_image_url && concept.generated_images?.base_prompts) {
                    // 기존 generated_images에서 첫 번째 이미지를 main_image_url로 설정
                    const firstImage = Object.values(concept.generated_images.base_prompts)[0];
                    if (firstImage) {
                        concept.main_image_url = firstImage;
                    }
                }
                
                // additional_images를 3개로 제한 (image_1, image_2, image_3만 유지)
                if (concept.additional_images) {
                    const validKeys = ['image_1', 'image_2', 'image_3'];
                    const currentKeys = Object.keys(concept.additional_images);
                    currentKeys.forEach(key => {
                        if (!validKeys.includes(key)) {
                            delete concept.additional_images[key];
                        }
                    });
                }
            }
        }
        
        const exportData = {
            metadata: {
                version: "1.3",  // 버전 업데이트
                timestamp: new Date().toISOString(),
                format: "concept_art_collection",
                includes_new_image_structure: true  // 새로운 이미지 구조 포함 표시
            },
            project_info: {
                ...state.projectInfo,
                total_concept_arts: totalConcepts
            },
            concept_art_collection: exportDataCopy
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
                
                // csv_data 보존 - 중요!
                if (item.csv_data) {
                    // csv_data_en이 있으면 영어 원본으로 사용
                    if (item.csv_data_en) {
                        convertedItem.csv_data_en = item.csv_data_en;
                        convertedItem.csv_data = item.csv_data;
                    } else {
                        // 하위 호환성: csv_data만 있는 경우 처리
                        convertedItem.csv_data = item.csv_data;
                        // 영어 원본 데이터가 따로 없으면 csv_data를 영어로 간주
                        convertedItem.csv_data_en = item.csv_data;
                    }
                }
                
                if (item.prompts) {
                    // 원본 prompts 객체 보존 (universal_translated 포함)
                    convertedItem.prompts = item.prompts;
                    
                    // 유연한 프롬프트 처리: JSON 구조에 따라 자동 대응
                    const aiTools = ['midjourney', 'leonardo', 'ideogram', 'imagefx', 'openart'];
                    
                    // Stage 4 JSON 구조 처리 (각 AI 도구별로 prompt_english와 prompt_translated 포함)
                    let hasProcessedPrompts = false;
                    
                    for (const aiTool of aiTools) {
                        if (item.prompts[aiTool]) {
                            const promptData = item.prompts[aiTool];
                            
                            // prompt_english를 base_prompts로 사용
                            if (promptData.prompt_english) {
                                convertedItem.base_prompts[aiTool] = promptData.prompt_english;
                                hasProcessedPrompts = true;
                            } else if (typeof promptData === 'string') {
                                convertedItem.base_prompts[aiTool] = promptData;
                                hasProcessedPrompts = true;
                            }
                            
                            // prompt_translated를 universal로 사용 (첫 번째 도구의 번역만 사용)
                            if (promptData.prompt_translated && !convertedItem.prompts.universal) {
                                // 수정: universal에는 영어 원본을 저장해야 함
                                convertedItem.prompts.universal = promptData.prompt_english || '';
                                convertedItem.prompts.universal_translated = promptData.prompt_translated;
                            }
                        }
                    }
                    
                    // 다른 형식 처리 (기존 코드)
                    if (!hasProcessedPrompts) {
                        // 1. 먼저 개별 AI 도구 프롬프트 확인
                        const hasIndividualPrompts = aiTools.some(tool => item.prompts[tool]);
                        
                        if (hasIndividualPrompts) {
                            // 개별 프롬프트가 있으면 각각 처리
                            for (const [aiTool, promptData] of Object.entries(item.prompts)) {
                                // universal과 universal_translated는 base_prompts에서는 건너뜀
                                if (aiTool === 'universal' || aiTool === 'universal_translated') continue;
                                
                                if (typeof promptData === 'string') {
                                    convertedItem.base_prompts[aiTool] = promptData;
                                } else if (promptData?.prompt_english) {
                                    convertedItem.base_prompts[aiTool] = promptData.prompt_english;
                                }
                            }
                            
                            // universal이 있고 특정 도구의 프롬프트가 없으면 universal 사용
                            if (item.prompts.universal) {
                                aiTools.forEach(tool => {
                                    if (!convertedItem.base_prompts[tool]) {
                                        convertedItem.base_prompts[tool] = item.prompts.universal;
                                    }
                                });
                            }
                        } else if (item.prompts.universal) {
                            // universal만 있으면 모든 도구에 복사
                            const universalPrompt = item.prompts.universal;
                            aiTools.forEach(tool => {
                                convertedItem.base_prompts[tool] = universalPrompt;
                            });
                        } else {
                            // 기존 구조 지원 (prompt_english 등)
                            for (const [aiTool, promptData] of Object.entries(item.prompts)) {
                                if (typeof promptData === 'string') {
                                    convertedItem.base_prompts[aiTool] = promptData;
                                } else if (promptData?.prompt_english) {
                                    convertedItem.base_prompts[aiTool] = promptData.prompt_english;
                                }
                            }
                        }
                    }
                }
                
                // 이미지 URL 처리 - main_image_url과 additional_images 구조 추가
                if (item.image_url) {
                    convertedItem.main_image_url = item.image_url;
                } else if (item.generated_images?.base_prompts) {
                    // generated_images에서 첫 번째 이미지를 main_image_url로 설정
                    const firstImage = Object.values(item.generated_images.base_prompts)[0];
                    if (firstImage) {
                        convertedItem.main_image_url = firstImage;
                    }
                }
                
                // additional_images 처리
                if (item.additional_images) {
                    convertedItem.additional_images = item.additional_images;
                } else if (item.reference_images) {
                    // reference_images를 additional_images로 변환
                    convertedItem.additional_images = {};
                    let imageIndex = 1;
                    for (const [key, imageData] of Object.entries(item.reference_images)) {
                        if (imageIndex <= 3) { // 최대 3개까지만
                            convertedItem.additional_images[`image_${imageIndex}`] = {
                                url: imageData.url || imageData,
                                description: imageData.description || '',
                                type: 'reference'
                            };
                            imageIndex++;
                        }
                    }
                }
                
                // generated_images 구조도 함께 유지 (하위 호환성)
                if (item.generated_images) {
                    convertedItem.generated_images = item.generated_images;
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
        console.log('Processing loaded JSON:', data);
        
        // Stage 4 데이터 확인 (stage 필드로 판단)
        if (data.stage === 4 || data.stage === "4") {
            console.log('Stage 4 데이터 감지됨, 변환 시작...');
            
            // 프로젝트 타입 확인 (CF, FILM 등)
            const projectType = data.project_info?.project_type || 
                               (data.project_info?.project_id?.includes('FILM') ? 'film' : 'cf');
            console.log(`프로젝트 타입: ${projectType}`);
            
            if (data.concept_art_collection) {
                state.conceptArtData = this.convertStage4ToV12(data.concept_art_collection);
                console.log('Stage 4 데이터 변환 완료:', state.conceptArtData);
            } else {
                throw new Error('Stage 4 JSON에 concept_art_collection이 없습니다.');
            }
            
            state.projectInfo = data.project_info || { project_id: "N/A", total_concept_arts: 0 };
            state.projectInfo.project_type = projectType; // 프로젝트 타입 저장
            state.dataVersion = data.version || data.metadata?.version || "N/A";
            state.dataTimestamp = data.timestamp || data.metadata?.timestamp || "N/A";
            this.saveToLocalStorage();
            console.log(`Stage 4 데이터 저장 완료 (${projectType} 프로젝트)`);
            
        } else if (data.concept_art_collection) {
            // 일반 컨셉아트 데이터
            console.log('일반 컨셉아트 데이터 로드');
            
            // 버전에 따른 변환 처리
            if (data.version === "3.0") {
                console.log('Version 3.0 데이터 감지됨, 변환 시작...');
                state.conceptArtData = this.convertStage4ToV12(data.concept_art_collection);
                console.log('Version 3.0 데이터 변환 완료');
            } else {
                // v1.3 이상 버전의 데이터는 그대로 사용
                state.conceptArtData = data.concept_art_collection;
                
                // 이미지 구조 확인 및 호환성 처리
                console.log('이미지 구조 확인 중...');
                for (const [category, concepts] of Object.entries(state.conceptArtData)) {
                    for (const [conceptId, concept] of Object.entries(concepts)) {
                        // main_image_url과 additional_images가 있는지 확인
                        if (concept.main_image_url || concept.additional_images) {
                            console.log(`${conceptId}: 새로운 이미지 구조 감지됨 (v1.3+)`);
                        }
                        // generated_images만 있는 경우 main_image_url로 변환
                        else if (concept.generated_images?.base_prompts) {
                            const firstImage = Object.values(concept.generated_images.base_prompts)[0];
                            if (firstImage) {
                                concept.main_image_url = firstImage;
                                console.log(`${conceptId}: generated_images를 main_image_url로 변환`);
                            }
                        }
                    }
                }
            }
            
            state.projectInfo = data.project_info || { project_id: "N/A", total_concept_arts: 0 };
            state.dataVersion = data.version || data.metadata?.version || "N/A";
            state.dataTimestamp = data.timestamp || data.metadata?.timestamp || "N/A";
            this.saveToLocalStorage();
            console.log('컨셉아트 데이터 저장 완료');
            
        } else {
            console.error('유효하지 않은 JSON 구조:', data);
            throw new Error('유효하지 않은 JSON 형식입니다. concept_art_collection이 없습니다.');
        }
    },

    handleStage4TempData: function() {
        const tempJson = localStorage.getItem('stage4TempJson');
        const tempFileName = localStorage.getItem('stage4TempFileName');
        
        console.log('handleStage4TempData 호출됨', {
            hasTempJson: !!tempJson,
            hasTempFileName: !!tempFileName,
            tempJsonLength: tempJson ? tempJson.length : 0
        });
        
        if (tempJson && tempFileName) {
            try {
                console.log(`📁 Stage 4 임시 JSON 파일 로드 시작: ${tempFileName}`);
                
                const data = JSON.parse(tempJson);
                console.log('Stage 4 JSON 파싱 성공:', data);
                
                // 데이터 처리
                this.processLoadedJSON(data);
                
                // UI 업데이트
                if (typeof uiRenderer !== 'undefined') {
                    uiRenderer.updateProjectInfo();
                    uiRenderer.renderSidebar();
                    console.log('UI 업데이트 완료');
                }
                
                utils.showToast(`${tempFileName} 파일을 성공적으로 로드했습니다.`);
                
                // 임시 데이터 삭제
                localStorage.removeItem('stage4TempJson');
                localStorage.removeItem('stage4TempFileName');
                console.log('Stage 4 임시 데이터 삭제 완료');
                
                return true;
            } catch (error) {
                console.error('Stage 4 임시 JSON 로드 오류:', error);
                utils.showToast('임시 저장된 JSON 파일을 로드할 수 없습니다.');
                
                // 오류 발생 시에도 임시 데이터 삭제
                localStorage.removeItem('stage4TempJson');
                localStorage.removeItem('stage4TempFileName');
                return false;
            }
        } else {
            console.log('Stage 4 임시 데이터가 없습니다.');
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
        console.log(`selectConcept 호출: ${type}/${id}`);
        
        state.currentConceptType = type;
        state.currentConceptId = id;
        
        state.currentPromptsAITab = null;
        state.currentVariantsAITab = null;
        state.currentVariantTypeTab = {};
        
        // 컨셉 상세 정보 표시
        uiRenderer.displayConceptDetail();
        
        // 선택된 컨셉의 이미지 갤러리 업데이트
        const concept = state.conceptArtData[type][id];
        if (concept) {
            console.log('선택된 컨셉:', concept);
            
            // 이미지 로드 및 갤러리 업데이트
            imageManager.loadAndDisplayImages(concept);
            imageManager.updateImageGallery(concept);
        }
    }
};

// ===== uiRenderer.js 내용 =====
const uiRenderer = {
    updateProjectInfo: function() {
        const infoDisplay = document.getElementById('project-info-display');
        if (infoDisplay) {
            const totalConcepts = dataManager.countTotalConcepts();
            const projectType = state.projectInfo.project_type ? 
                `(${state.projectInfo.project_type.toUpperCase()})` : '';
            infoDisplay.innerHTML = `
                <span>프로젝트 ID: ${state.projectInfo.project_id || '데이터 없음'} ${projectType}</span>
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
        imageManager.updateImageGallery(concept);
        
        // 첫 번째 AI 도구 탭 자동 선택
        if (concept.base_prompts && Object.keys(concept.base_prompts).length > 0) {
            const firstAITool = Object.keys(concept.base_prompts)[0];
            this.showAITab(firstAITool, 'base');
        }
        
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
    
    translateToKorean: function(englishPrompt, conceptId) {
        // localStorage에서 수정된 번역 프롬프트 확인
        const editedTranslations = JSON.parse(localStorage.getItem('editedKoreanTranslations') || '{}');
        const translationKey = `${conceptId}_universal_translated`;
        
        if (editedTranslations[translationKey]) {
            return editedTranslations[translationKey];
        }
        
        // 현재 컨셉 아이템에서 universal_translated 값을 찾아 반환
        const concept = dataManager.getCurrentConcept();
        if (concept && concept.prompts && concept.prompts.universal_translated) {
            return concept.prompts.universal_translated;
        }
        
        // 기존 하드코딩된 번역들 (폴백용)
        // KAI 캐릭터에 대한 번역
        if (conceptId === 'KAI') {
            return "K-퓨처리즘과 사이버펑크 누아르 스타일의 포토리얼리스틱 인물 사진, 비주얼은 '블레이드 러너 2049'와 '사이버펑크 2077' 아트워크에서 영감을 받음. 마른 체형에 저항적인 태도를 지닌 20대 한국인 남성 래퍼, 분노와 공허함이 담긴 날카로운 눈매, 짧은 검은색 헤어. 그는 낡고 기능적인 테크웨어와 해진 스트리트 후드티를 입고 있으며, 한쪽 귀에는 낡은 무선 이어버드를 끼고 있음. 배경은 2324년, 하이테크 문명이 붕괴되고 한국 전통 유산의 폐허가 남은 시대. 그의 내면의 분노를 드러내는 미디엄 샷, 정면 뷰, Canon EOS R5 카메라와 85mm f/1.4 렌즈, CineStill 800T 필름으로 촬영. 고도로 상세하고, 전문적이며, 8K 품질.";
        }
        
        // NURI 캐릭터에 대한 번역
        if (conceptId === 'NURI') {
            return "K-퓨처리즘과 사이버펑크 누아르 스타일의 포토리얼리스틱 인물 사진, 비주얼은 '블레이드 러너 2049'와 '사이버펑크 2077' 아트워크에서 영감을 받음. 신비롭고 반투명한 존재감을 발산하는 20대 한국인 여성 영매. 수수께끼 같고 깊은 눈과 길고 부드러운 은발을 가졌으며, 한복의 실루엣과 단청 문양을 현대적으로 재해석한 의상을 착용, 발광하는 반투명한 소재로 만들어진 옷과 옥 비녀를 착용. 세상을 관조하는 듯한 차분한 태도. 미디엄 샷, 정면 뷰, Sony A7R IV와 85mm f/1.4 렌즈, Kodak Portra 400 필름으로 촬영. 고도로 상세하고, 전문적이며, 8K 품질.";
        }
        
        // 무너진 궁궐의 폐허에 대한 번역
        if (conceptId === '무너진 궁궐의 폐허') {
            return "'블레이드 러너 2049'의 K-퓨처리즘과 사이버펑크 누아르 스타일의 포토리얼리스틱 풍경. 전통 기와와 단청이 부서지고 방치된 폐허 궁궐 정원의 와이드 샷. 차가운 콘크리트 잔해 더미 위로 황금빛 이끼가 자라며, 잿빛 하늘과 대비되는 신비로운 분위기를 조성. 황혼 시간대, 맑은 날의 약하고 부드러운 자연광. Nikon D850과 16-35mm f/2.8 렌즈, Kodak Ektar 100 필름으로 촬영. 고도로 상세하고, 전문적이며, 8K 품질.";
        }
        
        // 종로 3가 지하철역 폐허에 대한 번역
        if (conceptId === '종로 3가 지하철역 폐허') {
            return "'블레이드 러너 2049'의 K-퓨처리즘과 사이버펑크 누아르 스타일의 포토리얼리스틱 실내 공간. 어둡고 물이 고이고 낡은 지하철 터널의 와이드 샷, 깨진 타일과 녹슨 철골 구조물. 자연광이 없는 밤, 유일한 광원은 캐릭터의 손에서 나오는 생체발광으로 으스스한 빛을 장면에 비춤. Sony A7 III와 35mm f/1.4 렌즈, CineStill 800T 필름으로 촬영. 고도로 상세하고, 전문적이며, 8K 품질.";
        }
        
        // 무너진 숭례문에 대한 번역
        if (conceptId === '무너진 숭례문') {
            return "'블레이드 러너 2049'의 K-퓨처리즘과 사이버펑크 누아르 스타일의 포토리얼리스틱 풍경 장면. 무너진 성곽 꼭대기에서 하이테크 폐허 도시를 내려다보는 와이드 공중 샷. 잿빛 도시 위로 새벽이 밝아오는 장엄한 광경, 주인공들의 몸에서 방출되는 거대한 황금빛 오라. 맑은 날씨, 점차 밝아지는 새벽빛. Canon EOS 5D Mark IV와 24mm f/2.8 렌즈, Fujichrome Velvia 50 필름으로 촬영. 고도로 상세하고, 전문적이며, 8K 품질.";
        }
        
        // 감시 드론에 대한 번역
        if (conceptId === '감시 드론') {
            return "'블레이드 러너 2049'의 K-퓨처리즘 사이버펑크 누아르 스타일의 포토리얼리스틱 클로즈업 샷. 붉은 감시 센서를 가진 곤충형 비행 머신, 매끄러운 무광 검정 합금 재질. 날카롭고 위협적인 디자인, 작동 시 중앙 센서가 붉은 빛을 발함. 이 미래적 장치는 붕괴된 하이테크 문명의 잔해 속에서 작동. Leica SL2와 90mm f/2.8 매크로 렌즈, Kodak Ektachrome E100 필름으로 최대한의 디테일을 포착. 고도로 상세하고, 전문적이며, 8K 품질.";
        }
        
        // 기본 번역 (다른 컨셉아트의 경우) - 이제는 영어 원본을 그대로 반환
        return englishPrompt;
    },

    displayCSVData: function(concept) {
        const csvTab = document.getElementById('csv-tab');
        if (!csvTab) return;
        
        // CSV 탭 내용을 재구성 (블록 스타일 제목과 복사 버튼 제거)
        csvTab.innerHTML = `
            <table class="csv-table" id="csv-data-table">
                <thead><tr><th>ID</th><th>원본</th><th>번역본</th></tr></thead>
                <tbody></tbody>
            </table>
        `;
        
        const tbody = csvTab.querySelector('tbody');
        if (!tbody) return;
        
        let hasData = false;
        
        // Stage 4 JSON 형식: prompts.universal에서 영어 데이터 파싱
        let englishData = {};
        let koreanData = {};
        
        // prompts.universal에서 영어 데이터 파싱
        if (concept.prompts && concept.prompts.universal) {
            const englishPrompt = concept.prompts.universal;
            const items = englishPrompt.split(';');
            items.forEach(item => {
                const parts = item.trim().split(':');
                if (parts.length >= 2) {
                    const key = parts[0].trim();
                    const value = parts.slice(1).join(':').trim();
                    englishData[key] = value;
                }
            });
        }
        
        // csv_data가 있으면 한글 데이터로 사용 (Stage 4 JSON 형식)
        if (concept.csv_data && typeof concept.csv_data === 'object') {
            koreanData = concept.csv_data;
        }
        
        // 데이터 표시 - csv_data의 키를 기준으로 표시
        const dataToDisplay = concept.csv_data || {};
        
        if (Object.keys(dataToDisplay).length > 0) {
            // dataToDisplay의 모든 필드를 순회하며 표시 (빈 값도 포함)
            for (const [fieldName, koreanValue] of Object.entries(dataToDisplay)) {
                if (koreanValue !== undefined && koreanValue !== null) {
                    hasData = true;
                    const row = tbody.insertRow();
                    
                    // ID 컬럼
                    row.insertCell(0).textContent = fieldName;
                    
                    // 원본 (영문) 컬럼 - englishData에서 매칭되는 값 찾기
                    const originalCell = row.insertCell(1);
                    let englishValue = englishData[fieldName] || '';
                    
                    // 영어 데이터가 없으면 CSV_FIELD_MAPPING으로 변환 시도
                    if (!englishValue && koreanValue) {
                        englishValue = CSV_FIELD_MAPPING[koreanValue] || '';
                        
                        // 직접 매핑이 없는 경우 동적 변환 시도
                        if (!englishValue && typeof koreanValue === 'string') {
                            // 복합 문구를 단어별로 변환 시도
                            const words = koreanValue.split(' ');
                            const translatedWords = words.map(word => {
                                // 개별 단어 매핑 확인
                                if (CSV_FIELD_MAPPING[word]) {
                                    return CSV_FIELD_MAPPING[word];
                                }
                                // 숫자와 단위는 그대로 유지
                                if (/^\d+/.test(word)) {
                                    return word.replace('세', ' years old').replace('cm', 'cm');
                                }
                                return word;
                            });
                            
                            // 특정 패턴 처리
                            let translated = translatedWords.join(' ');
                            
                            // 일반적인 한글 패턴을 영어로 변환
                            translated = translated
                                .replace(/미디엄\s+샷\s+약간\s+로우\s+앵글/g, 'medium shot slightly low angle')
                                .replace(/약간/g, 'slightly')
                                .replace(/로우\s+앵글/g, 'low angle')
                                .replace(/하이\s+앵글/g, 'high angle')
                                .replace(/정면/g, 'front')
                                .replace(/측면/g, 'side')
                                .replace(/응시/g, 'gaze')
                                .replace(/경계\s+태세/g, 'alert stance')
                                .replace(/전술\s+장비/g, 'tactical gear')
                                .replace(/탄탄한\s+체형/g, 'athletic build')
                                .replace(/짧은/g, 'short')
                                .replace(/검은색/g, 'black')
                                .replace(/헤어컷/g, 'haircut')
                                .replace(/각진\s+얼굴/g, 'angular face')
                                .replace(/뚜렷한\s+턱선/g, 'distinct jawline')
                                .replace(/집중된\s+눈빛/g, 'focused eyes')
                                .replace(/얇은\s+수염/g, 'thin beard')
                                .replace(/옅은\s+수염/g, 'light stubble')
                                .replace(/작은\s+흉터/g, 'small scar')
                                .replace(/뺨의/g, 'on cheek')
                                .replace(/빨의/g, 'on cheek');
                            
                            englishValue = translated !== koreanValue ? translated : '';
                        }
                    }
                    
                    originalCell.textContent = englishValue;
                    originalCell.style.color = '#aaa';
                    
                    // 번역본 (한글) 컬럼 - 한글 값 그대로 표시
                    const translationCell = row.insertCell(2);
                    translationCell.textContent = koreanValue || '';
                    translationCell.style.color = '#fff';
                }
            }
        } 
        // 구버전 호환성을 위한 폴백 (csv_data가 없는 경우)
        else {
            // 기존 하드코딩된 매핑 (구버전 데이터용)
            const legacyMapping = {
                'STYLE': concept.style || '',
                'MEDIUM': concept.subcategory || '',
                'CHARACTER': concept.description || '',
                'CAMERA': concept.shotType || '',
                'QUALITY': 'highly detailed, professional, 8K',
                'PARAMETERS': '--ar 16:9'
            };
            
            for (const [id, value] of Object.entries(legacyMapping)) {
                if (value && value !== '') {
                    hasData = true;
                    const row = tbody.insertRow();
                    row.insertCell(0).textContent = id;
                    row.insertCell(1).textContent = value;
                }
            }
        }
        
        if (!hasData) {
            const row = tbody.insertRow();
            const cell = row.insertCell(0);
            cell.colSpan = 3;
            cell.textContent = 'CSV 데이터가 없습니다.';
        }
    },

    displayBasePrompts: function(concept) {
        const contentArea = document.getElementById('base-prompt-content');
        if (!contentArea) {
            console.error('base-prompt-content 요소를 찾을 수 없습니다.');
            return;
        }
        
        contentArea.innerHTML = '';
        
        console.log('displayBasePrompts - concept:', concept);
        console.log('displayBasePrompts - concept.prompts:', concept.prompts);
        
        // universal 프롬프트 사용 (영어와 한글)
        let englishPrompt = '';
        let koreanPrompt = '';
        
        // prompts 객체에서 universal과 universal_translated 확인
        if (concept.prompts) {
            englishPrompt = concept.prompts.universal || '';
            koreanPrompt = concept.prompts.universal_translated || '';
            
            console.log('영어 프롬프트:', englishPrompt);
            console.log('한글 프롬프트:', koreanPrompt);
        }
        
        // 영어 프롬프트가 없어도 기본 UI는 표시
        const editedPrompts = JSON.parse(localStorage.getItem('editedConceptPrompts') || '{}');
        const promptKey = `${state.currentConceptId}_universal`;
        const displayEnglish = editedPrompts[promptKey]?.prompt || englishPrompt || '프롬프트가 없습니다.';
        const isEdited = editedPrompts[promptKey] ? true : false;
        
        const englishContainer = document.createElement('div');
        englishContainer.className = 'prompt-section';
        englishContainer.innerHTML = `
            <h4 style="margin-bottom: 1rem; display: inline-block;">영어 원본 프롬프트</h4>
            ${isEdited ? '<span style="background: #4ade80; color: #000; padding: 2px 8px; border-radius: 4px; font-size: 0.8em; margin-left: 10px;">수정됨</span>' : ''}
            <div class="prompt-container">
                <div class="prompt-text" style="white-space: pre-wrap; word-break: break-word;">${displayEnglish}</div>
                <button class="btn btn-primary prompt-copy-btn" data-action="copy-prompt" data-lang="english" onclick="promptManager.copyUniversalPrompt('english')">프롬프트 복사</button>
                <button class="btn btn-secondary prompt-edit-btn" data-action="edit-prompt" data-lang="english" onclick="promptManager.editUniversalPrompt('english')" style="margin-left: 8px;">프롬프트 수정</button>
                ${englishPrompt ? `<button class="btn btn-ai-edit ai-edit-btn" data-action="ai-edit-prompt" data-lang="english" onclick="promptManager.aiEditUniversalPrompt('english')" style="margin-left: 8px; background-color: #8b5cf6; color: white;">AI 수정</button>` : ''}
            </div>
        `;
        contentArea.appendChild(englishContainer);
        
        // 한글 프롬프트도 기본 UI는 표시
        const editedTranslations = JSON.parse(localStorage.getItem('editedKoreanTranslations') || '{}');
        const translationKey = `${state.currentConceptId}_universal_translated`;
        const displayKorean = editedTranslations[translationKey] || koreanPrompt || '번역된 프롬프트가 없습니다.';
        const isTranslationEdited = editedTranslations[translationKey] ? true : false;
        
        const koreanContainer = document.createElement('div');
        koreanContainer.className = 'prompt-section';
        koreanContainer.style.marginTop = '2rem';
        koreanContainer.innerHTML = `
            <h4 style="margin-bottom: 1rem; display: inline-block;">번역본 프롬프트</h4>
            ${isTranslationEdited ? '<span style="background: #4ade80; color: #000; padding: 2px 8px; border-radius: 4px; font-size: 0.8em; margin-left: 10px;">수정됨</span>' : ''}
            <div class="prompt-container">
                <div class="prompt-text" id="korean-translation-universal" style="white-space: pre-wrap; word-break: break-word;">${displayKorean}</div>
                <button class="btn btn-primary prompt-copy-btn" data-action="copy-prompt" data-lang="korean" onclick="promptManager.copyUniversalPrompt('korean')">번역본 복사</button>
                ${koreanPrompt ? `<button class="btn btn-secondary prompt-edit-btn" data-action="edit-prompt" data-lang="korean" onclick="promptManager.editUniversalPrompt('korean')" style="margin-left: 8px;">번역 수정</button>` : ''}
            </div>
        `;
        contentArea.appendChild(koreanContainer);
        
        // 이미지 표시 섹션 (번역본 프롬프트 아래로 이동)
        const imageSection = document.createElement('div');
        imageSection.className = 'image-display-section';
        imageSection.style.marginTop = '2rem';
        // 메인 이미지 URL 처리
        let displayImageUrl = '';
        const originalImageUrl = concept.main_image_url || '';
        
        if (originalImageUrl) {
            // 드롭박스 URL인 경우 변환
            if (originalImageUrl.includes('dropbox.com')) {
                displayImageUrl = imageManager.convertDropboxUrl(originalImageUrl);
            } else {
                displayImageUrl = originalImageUrl;
            }
        }
        
        imageSection.innerHTML = `
            <div class="image-container" id="main-image-container">
                ${displayImageUrl ? 
                    `<img src="${displayImageUrl}" alt="${concept.name || 'Image'}" 
                          onclick="ConceptArtManager.openImageModal('${displayImageUrl}')" 
                          onerror="this.onerror=null; this.src='${originalImageUrl}'; this.style.border='1px solid red';" />` : 
                    '<div class="no-image-message">이미지를 추가하려면 아래 URL을 입력하세요</div>'}
            </div>
        `;
        contentArea.appendChild(imageSection);
        
        // 이미지 URL 입력 섹션 (번역본 프롬프트 아래로 이동)
        const imageUrlSection = document.createElement('div');
        imageUrlSection.className = 'image-url-section';
        imageUrlSection.style.display = 'block'; // 항상 표시되도록 명시적으로 설정
        imageUrlSection.innerHTML = `
            <div class="image-url-input-group">
                <input type="url" 
                       class="image-url-input" 
                       id="main-image-url-input" 
                       placeholder="이미지 URL을 입력하세요 (예: https://example.com/image.jpg)" 
                       value="${originalImageUrl}">
                <button class="btn-apply-url" onclick="ConceptArtManager.applyMainImageUrl()">적용</button>
            </div>
        `;
        contentArea.appendChild(imageUrlSection);
        
        // 추가 이미지 섹션
        const additionalImagesSection = document.createElement('div');
        additionalImagesSection.className = 'additional-images-section';
        additionalImagesSection.innerHTML = `
            <h4 style="margin-bottom: 20px; color: rgba(255,255,255,0.9); font-size: 16px; font-weight: 600;">참조 이미지</h4>
            <div class="additional-images-grid" id="additional-images-grid">
                ${[1, 2, 3].map(i => `
                    <div class="additional-image-slot">
                        <div class="additional-image-preview">
                            ${concept.additional_images && concept.additional_images[`image_${i}`]?.url ? 
                                `<img src="${concept.additional_images[`image_${i}`].url}" 
                                      alt="추가 이미지 ${i}" 
                                      onclick="ConceptArtManager.openImageModal('${concept.additional_images[`image_${i}`].url}')" />` : 
                                '<div class="no-image-placeholder">이미지 없음</div>'}
                        </div>
                        <div class="form-group">
                            <label class="form-label">이미지 URL</label>
                            <input type="url" 
                                   class="form-input additional-image-url" 
                                   data-index="${i}" 
                                   placeholder="URL 입력" 
                                   value="${concept.additional_images?.[`image_${i}`]?.url || ''}">
                        </div>
                        <div class="form-group">
                            <label class="form-label">설명</label>
                            <textarea class="form-textarea additional-image-desc" 
                                      data-index="${i}" 
                                      placeholder="이미지 설명 입력">${concept.additional_images?.[`image_${i}`]?.description || ''}</textarea>
                        </div>
                        <button class="btn-apply-additional" onclick="ConceptArtManager.applyAdditionalImage(${i})" style="width: 100%; padding: 8px; background: var(--apple-blue); border: none; border-radius: 6px; color: white; font-size: 12px; font-weight: 500; cursor: pointer; margin-top: 8px;">적용</button>
                    </div>
                `).join('')}
            </div>
        `;
        contentArea.appendChild(additionalImagesSection);
        
        // 추가 이미지 URL 입력 이벤트 리스너
        contentArea.querySelectorAll('.additional-image-url').forEach(input => {
            input.addEventListener('change', (e) => {
                const index = e.target.dataset.index;
                const url = e.target.value;
                ConceptArtManager.updateAdditionalImage(index, 'url', url);
            });
        });
        
        // 추가 이미지 설명 입력 이벤트 리스너
        contentArea.querySelectorAll('.additional-image-desc').forEach(textarea => {
            textarea.addEventListener('change', (e) => {
                const index = e.target.dataset.index;
                const desc = e.target.value;
                ConceptArtManager.updateAdditionalImage(index, 'description', desc);
            });
        });
    },

    createAdditionalImageSlots: function(concept, aiTool) {
        const conceptId = state.currentConceptId; // 현재 선택된 컨셉 ID 사용
        console.log('createAdditionalImageSlots 호출:', { conceptId, aiTool });
        console.log('현재 컨셉의 추가이미지 데이터:', concept.additional_images);
        
        let slotsHtml = '';
        const additionalImages = concept.additional_images || {};
        const aiAdditionalImages = additionalImages[aiTool] || [];
        
        console.log(`${aiTool}의 추가이미지 배열:`, aiAdditionalImages);
        
        // 3개의 슬롯 생성
        for (let i = 0; i < 3; i++) {
            const imageData = aiAdditionalImages[i] || { url: '', base64: '', description: '', type: 'reference' };
            const uniqueId = `${conceptId}-${aiTool}-additional-${i}`;
            
            // 이미지 소스 결정 (URL 우선, 스토리보드와 동일한 방식)
            let imageSrc = '';
            let modalSrc = '';
            
            if (imageData.url) {
                imageSrc = imageData.url;
                modalSrc = imageData.url;
                
                // Google Drive URL 처리
                if (imageData.url.includes('drive.google.com')) {
                    const fileId = utils.extractGoogleDriveFileId(imageData.url);
                    if (fileId) {
                        imageSrc = `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`;
                        modalSrc = imageSrc;
                    }
                }
            } else if (imageData.base64) {
                // URL이 없으면 base64 사용 (파일 업로드의 경우)
                imageSrc = imageData.base64;
                modalSrc = imageData.base64;
            }
            
            slotsHtml += `
                <div class="additional-image-slot">
                    <div class="additional-image-preview" id="additional-preview-${uniqueId}">
                        ${imageSrc ? 
                            `<img src="${imageSrc}" alt="추가 이미지 ${i+1}" style="cursor: pointer;" onclick="imageManager.openImageModal('${modalSrc}')" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'no-image-placeholder\\'>로드 실패</div>';">` : 
                            `<div class="no-image-placeholder">추가 이미지 ${i+1}</div>`
                        }
                    </div>
                    <div class="form-group">
                        <label class="form-label">URL:</label>
                        <input type="text" class="form-input" 
                               value="${imageData.url || ''}" 
                               placeholder="이미지 URL 입력" 
                               onchange="imageManager.updateAdditionalImage('${conceptId}', '${aiTool}', ${i}, 'url', this.value)">
                    </div>
                    <div class="form-group">
                        <label class="form-label">설명:</label>
                        <textarea class="form-textarea" rows="2"
                                  placeholder="이미지 설명 입력"
                                  onchange="imageManager.updateAdditionalImage('${conceptId}', '${aiTool}', ${i}, 'description', this.value)">${imageData.description || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">유형:</label>
                        <select class="form-select" 
                                onchange="imageManager.updateAdditionalImage('${conceptId}', '${aiTool}', ${i}, 'type', this.value)">
                            <option value="reference" ${imageData.type === 'reference' ? 'selected' : ''}>참조</option>
                            <option value="style" ${imageData.type === 'style' ? 'selected' : ''}>스타일</option>
                            <option value="mood" ${imageData.type === 'mood' ? 'selected' : ''}>분위기</option>
                            <option value="detail" ${imageData.type === 'detail' ? 'selected' : ''}>디테일</option>
                        </select>
                    </div>
                </div>
            `;
        }
        
        return slotsHtml;
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
                            // 수정된 프롬프트 확인
                            const editedPrompts = JSON.parse(localStorage.getItem('editedConceptPrompts') || '{}');
                            const promptKey = `${state.currentConceptId}_${aiTool}_${variation.key}`;
                            const displayPrompt = editedPrompts[promptKey]?.prompt || variation.prompt;
                            const isEdited = editedPrompts[promptKey] ? true : false;
                            
                            variantDiv.innerHTML = `
                                <h4 style="display: inline-block;">${typeInfo.name_kr} ${index + 1}</h4>
                                ${isEdited ? '<span style="background: #4ade80; color: #000; padding: 2px 8px; border-radius: 4px; font-size: 0.8em; margin-left: 10px;">수정됨</span>' : ''}
                                <div class="prompt-container">
                                    <div class="prompt-text">${displayPrompt}</div>
                                    <button class="btn btn-primary prompt-copy-btn" data-action="copy-variant" data-tool="${aiTool}" data-type="${typeKey}" data-index="${index}" onclick="promptManager.copyVariantPrompt('${aiTool}', '${typeKey}', ${index})">프롬프트 복사</button>
                                    <button class="btn btn-secondary" onclick="promptManager.editPrompt('${aiTool}', '${typeKey}', ${index})" style="margin-left: 8px;">프롬프트 수정</button>
                                    <button class="btn btn-ai-edit" onclick="promptManager.aiEditPrompt('${aiTool}', '${typeKey}', ${index})" style="margin-left: 8px; background-color: #8b5cf6; color: white;">AI 수정</button>
                                </div>
                                <div class="image-container" id="image-${typeKey}_${index}-${aiTool}">
                                    <div class="no-image-message">이미지를 추가하려면 버튼을 클릭하세요</div>
                                </div>
                                <div class="image-url-section">
                                    <div class="image-url-input-group">
                                        <input type="text" 
                                               class="image-url-input" 
                                               id="image-url-input-${typeKey}_${index}-${aiTool}"
                                               placeholder="이미지 URL을 입력하세요"
                                               onkeypress="if(event.key==='Enter') imageManager.applyImageUrl('${aiTool}', '${typeKey}', ${index})"
                                               oninput="imageManager.previewImageUrl(this.value, '${typeKey}', '${aiTool}', ${index})">
                                        <button class="btn-apply-url" onclick="imageManager.applyImageUrl('${aiTool}', '${typeKey}', ${index})">적용</button>
                                    </div>
                                </div>
                            `;
                            typeContent.appendChild(variantDiv);
                        });
                        
                        const permutationKey = `${typeInfo.schema_key_base}_permutation`;
                        if (variations[permutationKey]) {
                            const permDiv = document.createElement('div');
                            permDiv.className = 'variant-item permutation';
                            // 수정된 프롬프트 확인
                            const editedPromptsP = JSON.parse(localStorage.getItem('editedConceptPrompts') || '{}');
                            const promptKeyP = `${state.currentConceptId}_${aiTool}_${permutationKey}`;
                            const displayPromptP = editedPromptsP[promptKeyP]?.prompt || variations[permutationKey];
                            const isEditedP = editedPromptsP[promptKeyP] ? true : false;
                            
                            permDiv.innerHTML = `
                                <h4 style="display: inline-block;">${typeInfo.name_kr} - Permutation 프롬프트</h4>
                                ${isEditedP ? '<span style="background: #4ade80; color: #000; padding: 2px 8px; border-radius: 4px; font-size: 0.8em; margin-left: 10px;">수정됨</span>' : ''}
                                <div class="prompt-container">
                                    <div class="prompt-text">${displayPromptP}</div>
                                    <button class="btn btn-primary prompt-copy-btn" data-action="copy-variant" data-tool="${aiTool}" data-type="${permutationKey}" onclick="promptManager.copyVariantPrompt('${aiTool}', '${permutationKey}')">프롬프트 복사</button>
                                    <button class="btn btn-secondary" onclick="promptManager.editPrompt('${aiTool}', '${permutationKey}')" style="margin-left: 8px;">프롬프트 수정</button>
                                    <button class="btn btn-ai-edit" onclick="promptManager.aiEditPrompt('${aiTool}', '${permutationKey}')" style="margin-left: 8px; background-color: #8b5cf6; color: white;">AI 수정</button>
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
        // AI 탭 시스템 제거됨 - 더 이상 사용하지 않음
    },

    // AI 탭 표시 함수
    showUnifiedAITab: function(aiTool) {
        // 상태 업데이트
        state.currentPromptsAITab = aiTool;
        
        // 기본 프롬프트 콘텐츠 업데이트
        document.querySelectorAll('#base-prompt-ai-content-area .tab-content').forEach(tab => {
            tab.style.display = 'none';
        });
        const baseContent = document.getElementById(`base-${aiTool}-content`);
        if (baseContent) {
            baseContent.style.display = 'block';
        }
        
        // AI 탭 버튼 상태 업데이트
        const aiToolIndex = Object.keys(AI_TOOLS).indexOf(aiTool) + 1;
        
        // 기본 프롬프트 탭 버튼 업데이트
        document.querySelectorAll('#base-prompt-ai-tabs .ai-tab-button').forEach((btn, index) => {
            btn.classList.remove('active');
            btn.style.backgroundColor = '';
            if (index + 1 === aiToolIndex) {
                btn.classList.add('active');
                btn.style.backgroundColor = AI_TOOLS[aiTool].color + '20';
            }
        });
    },
    
    // 기존 showAITab 함수를 위한 호환성 래퍼
    showAITab: function(aiTool, type) {
        this.showUnifiedAITab(aiTool);
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

    copyUniversalPrompt: function(language) {
        const concept = dataManager.getCurrentConcept();
        if (!concept) {
            utils.showToast('선택된 컨셉아트가 없습니다.');
            return;
        }
        
        let promptToCopy = '';
        
        if (language === 'english') {
            // 수정된 프롬프트 확인
            const editedPrompts = JSON.parse(localStorage.getItem('editedConceptPrompts') || '{}');
            const promptKey = `${state.currentConceptId}_universal`;
            promptToCopy = editedPrompts[promptKey]?.prompt || concept.prompts?.universal || '';
        } else if (language === 'korean') {
            // 수정된 한국어 번역 확인
            const editedTranslations = JSON.parse(localStorage.getItem('editedKoreanTranslations') || '{}');
            const translationKey = `${state.currentConceptId}_universal_translated`;
            promptToCopy = editedTranslations[translationKey] || concept.prompts?.universal_translated || '';
        }
        
        if (promptToCopy) {
            utils.copyToClipboard(promptToCopy);
        } else {
            utils.showToast('복사할 프롬프트가 없습니다.');
        }
    },
    
    editUniversalPrompt: function(language) {
        const concept = dataManager.getCurrentConcept();
        if (!concept) {
            utils.showToast('선택된 컨셉아트가 없습니다.');
            return;
        }
        
        if (language === 'english') {
            // 영어 프롬프트 수정
            const originalPrompt = concept.prompts?.universal || '';
            const editedPrompts = JSON.parse(localStorage.getItem('editedConceptPrompts') || '{}');
            const promptKey = `${state.currentConceptId}_universal`;
            const currentPrompt = editedPrompts[promptKey]?.prompt || originalPrompt;
            
            // 수정 모달 생성
            const modalHtml = `
                <div id="prompt-edit-modal" class="modal-overlay" onclick="promptManager.closeEditModal(event)">
                    <div class="modal-content" onclick="event.stopPropagation()">
                        <div class="modal-header">
                            <h3>영어 프롬프트 수정</h3>
                            <button class="modal-close-btn" onclick="promptManager.closeEditModal()">×</button>
                        </div>
                        <div class="modal-body">
                            <div class="form-group">
                                <label>프롬프트:</label>
                                <textarea id="edit-prompt-text" class="prompt-textarea" rows="6">${currentPrompt}</textarea>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-secondary" onclick="promptManager.closeEditModal()">취소</button>
                            <button class="btn btn-primary" onclick="promptManager.saveUniversalPrompt('english')">저장</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHtml);
            this.addPromptEditModalStyles();
            
        } else if (language === 'korean') {
            // 한국어 번역 수정
            promptManager.editKoreanTranslation('universal');
        }
    },
    
    saveUniversalPrompt: function(language) {
        const editedText = document.getElementById('edit-prompt-text').value;
        
        if (language === 'english') {
            const editedPrompts = JSON.parse(localStorage.getItem('editedConceptPrompts') || '{}');
            const promptKey = `${state.currentConceptId}_universal`;
            
            editedPrompts[promptKey] = {
                conceptId: state.currentConceptId,
                prompt: editedText,
                editedAt: new Date().toISOString()
            };
            
            localStorage.setItem('editedConceptPrompts', JSON.stringify(editedPrompts));
        }
        
        this.closeEditModal();
        uiRenderer.displayConceptDetail();
        utils.showToast('프롬프트가 수정되었습니다.');
    },
    
    copyPrompt: function(aiTool, type) {
        const concept = dataManager.getCurrentConcept();
        if (!concept) {
            utils.showToast('선택된 컨셉아트가 없습니다.');
            return;
        }
        
        if (type === 'base' && concept.base_prompts && concept.base_prompts[aiTool]) {
            // 수정된 프롬프트 확인
            const editedPrompts = JSON.parse(localStorage.getItem('editedConceptPrompts') || '{}');
            const promptKey = `${concept.id}_${aiTool}_base`;
            const promptToCopy = editedPrompts[promptKey]?.prompt || concept.base_prompts[aiTool];
            
            utils.copyToClipboard(promptToCopy);
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
            // 수정된 프롬프트 확인
            const editedPrompts = JSON.parse(localStorage.getItem('editedConceptPrompts') || '{}');
            const editKey = `${state.currentConceptId}_${aiTool}_${promptKey}`;
            const promptToCopy = editedPrompts[editKey]?.prompt || prompt;
            
            utils.copyToClipboard(promptToCopy);
        } else {
            utils.showToast('복사할 프롬프트가 없습니다.');
        }
    },

    editPrompt: function(aiTool, type, index = null) {
        const concept = dataManager.getCurrentConcept();
        if (!concept) {
            utils.showToast('선택된 컨셉아트가 없습니다.');
            return;
        }
        
        let originalPrompt = '';
        let promptKey = '';
        
        if (type === 'base') {
            originalPrompt = concept.base_prompts?.[aiTool] || '';
            promptKey = `${state.currentConceptId}_${aiTool}_base`;
        } else if (type.includes('_permutation')) {
            originalPrompt = concept.character_variations?.[aiTool]?.[type] || '';
            promptKey = `${state.currentConceptId}_${aiTool}_${type}`;
        } else if (index !== null) {
            const baseKey = VARIATION_TYPES_MAP[type]?.schema_key_base;
            if (!baseKey) {
                utils.showToast('올바르지 않은 변형 타입입니다.');
                return;
            }
            const variationKey = `${baseKey}_${index}`;
            originalPrompt = concept.character_variations?.[aiTool]?.[variationKey] || '';
            promptKey = `${state.currentConceptId}_${aiTool}_${variationKey}`;
        }
        
        if (!originalPrompt) {
            utils.showToast('수정할 프롬프트가 없습니다.');
            return;
        }
        
        // 수정된 프롬프트 가져오기
        const editedPrompts = JSON.parse(localStorage.getItem('editedConceptPrompts') || '{}');
        const editedPrompt = editedPrompts[promptKey]?.prompt || originalPrompt;
        
        // 수정 모달 생성
        const modalHtml = `
            <div id="prompt-edit-modal" class="modal-overlay" onclick="promptManager.closeEditModal(event)">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h3>프롬프트 수정 - ${AI_TOOLS[aiTool].name}</h3>
                        <button class="modal-close-btn" onclick="promptManager.closeEditModal()">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label style="display: flex; justify-content: space-between; align-items: center;">
                                <span>프롬프트:</span>
                                <button class="prompt-refresh-btn" onclick="promptManager.resetPromptField()" title="프롬프트 초기화">
                                    ↻ 초기화
                                </button>
                            </label>
                            <textarea id="edit-prompt-text" class="prompt-textarea" rows="6">${editedPrompt}</textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="promptManager.closeEditModal()">취소</button>
                        <button class="btn btn-primary" onclick="promptManager.saveEditedPrompt('${promptKey}', '${aiTool}', '${type}', ${index})">저장</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // 모달 스타일 추가 (없으면)
        this.addPromptEditModalStyles();
    },
    
    saveEditedPrompt: function(promptKey, aiTool, type, index) {
        const editedText = document.getElementById('edit-prompt-text').value;
        const concept = dataManager.getCurrentConcept();
        
        // localStorage에서 수정된 프롬프트 가져오기
        const editedPrompts = JSON.parse(localStorage.getItem('editedConceptPrompts') || '{}');
        
        // 수정된 프롬프트 저장
        editedPrompts[promptKey] = {
            conceptId: state.currentConceptId,
            aiTool,
            type,
            index,
            prompt: editedText,
            editedAt: new Date().toISOString()
        };
        
        localStorage.setItem('editedConceptPrompts', JSON.stringify(editedPrompts));
        
        // 모달 닫기
        this.closeEditModal();
        
        // UI 업데이트
        uiRenderer.displayConceptDetail();
        
        utils.showToast('프롬프트가 수정되었습니다.');
    },
    
    closeEditModal: function(event) {
        if (event && event.target !== event.currentTarget) return;
        const modal = document.getElementById('prompt-edit-modal');
        if (modal) {
            modal.remove();
        }
    },
    
    resetPromptField: function() {
        const textArea = document.getElementById('edit-prompt-text');
        if (textArea) {
            textArea.value = '';
            utils.showToast('프롬프트가 초기화되었습니다.');
        }
    },
    
    addPromptEditModalStyles: function() {
        if (!document.getElementById('prompt-edit-modal-styles')) {
            const style = document.createElement('style');
            style.id = 'prompt-edit-modal-styles';
            style.textContent = `
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                }
                
                .modal-content {
                    background: var(--bg-secondary, #2a2a2a);
                    border-radius: 8px;
                    max-width: 600px;
                    width: 90%;
                    max-height: 80vh;
                    overflow-y: auto;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
                }
                
                .modal-header {
                    padding: 20px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .modal-header h3 {
                    margin: 0;
                    color: var(--text-primary, #fff);
                }
                
                .modal-close-btn {
                    background: none;
                    border: none;
                    color: var(--text-secondary, #999);
                    font-size: 24px;
                    cursor: pointer;
                    padding: 0;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .modal-close-btn:hover {
                    color: var(--text-primary, #fff);
                }
                
                .modal-body {
                    padding: 20px;
                }
                
                .form-group {
                    margin-bottom: 20px;
                }
                
                .form-group label {
                    display: block;
                    margin-bottom: 8px;
                    color: var(--text-primary, #fff);
                    font-weight: 500;
                }
                
                .prompt-textarea {
                    width: 100%;
                    background: var(--bg-tertiary, #1a1a1a);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: var(--text-primary, #fff);
                    padding: 10px;
                    border-radius: 4px;
                    font-size: 14px;
                    resize: vertical;
                    font-family: 'Consolas', 'Monaco', monospace;
                }
                
                .prompt-textarea:focus {
                    outline: none;
                    border-color: var(--accent-purple, #a855f7);
                }
                
                .prompt-refresh-btn {
                    background: none;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    color: rgba(255, 255, 255, 0.6);
                    padding: 4px 8px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
                
                .prompt-refresh-btn:hover {
                    border-color: rgba(255, 255, 255, 0.4);
                    color: rgba(255, 255, 255, 0.9);
                    background: rgba(255, 255, 255, 0.05);
                }
                
                .prompt-refresh-btn:active {
                    transform: scale(0.95);
                }
                
                .modal-footer {
                    padding: 20px;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                }
            `;
            document.head.appendChild(style);
        }
    },
    
    editKoreanTranslation: function(aiTool) {
        const concept = dataManager.getCurrentConcept();
        if (!concept) {
            utils.showToast('선택된 컨셉아트가 없습니다.');
            return;
        }
        
        // 현재 번역 프롬프트 가져오기
        const currentTranslation = uiRenderer.translateToKorean('', state.currentConceptId);
        
        // 모달 HTML 생성 (프롬프트 수정 모달과 동일한 스타일 적용)
        const modalHtml = `
            <div id="translation-edit-modal" class="modal-overlay" onclick="promptManager.closeTranslationEditModal(event)">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h3>번역 프롬프트 수정 (${concept.name || state.currentConceptId})</h3>
                        <button class="modal-close-btn" onclick="promptManager.closeTranslationEditModal()">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label style="display: flex; justify-content: space-between; align-items: center;">
                                <span>번역 프롬프트:</span>
                                <button class="prompt-refresh-btn" onclick="promptManager.resetKoreanTranslation()" title="원본으로 되돌리기">
                                    ↻ 원본으로 되돌리기
                                </button>
                            </label>
                            <textarea id="edit-korean-translation-text" class="prompt-textarea" rows="6" placeholder="한국어 번역 프롬프트를 입력하세요">${currentTranslation}</textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="promptManager.closeTranslationEditModal()">취소</button>
                        <button class="btn btn-primary" onclick="promptManager.saveKoreanTranslation('${aiTool}')">저장</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // 모달 스타일 추가 (같은 스타일 사용)
        this.addPromptEditModalStyles();
    },
    
    closeTranslationEditModal: function(event) {
        if (event && event.target !== event.currentTarget) return;
        const modal = document.getElementById('translation-edit-modal');
        if (modal) {
            modal.remove();
        }
    },
    
    saveKoreanTranslation: function(aiTool) {
        const editedText = document.getElementById('edit-korean-translation-text').value;
        const translationKey = `${state.currentConceptId}_universal_translated`;
        
        // localStorage에서 수정된 번역 가져오기
        const editedTranslations = JSON.parse(localStorage.getItem('editedKoreanTranslations') || '{}');
        
        // 수정된 번역 저장
        editedTranslations[translationKey] = editedText;
        localStorage.setItem('editedKoreanTranslations', JSON.stringify(editedTranslations));
        
        // UI 업데이트
        const translationElement = document.getElementById(`korean-translation-${aiTool}`);
        if (translationElement) {
            translationElement.textContent = editedText;
        }
        
        // 모달 닫기
        this.closeTranslationEditModal();
        
        utils.showToast('번역 프롬프트가 수정되었습니다.');
    },
    
    resetKoreanTranslation: function() {
        const translationKey = `${state.currentConceptId}_universal_translated`;
        
        // localStorage에서 수정된 번역 삭제
        const editedTranslations = JSON.parse(localStorage.getItem('editedKoreanTranslations') || '{}');
        delete editedTranslations[translationKey];
        localStorage.setItem('editedKoreanTranslations', JSON.stringify(editedTranslations));
        
        // 원본 번역 가져오기
        const concept = dataManager.getCurrentConcept();
        let originalTranslation = '';
        
        if (concept && concept.prompts && concept.prompts.universal_translated) {
            originalTranslation = concept.prompts.universal_translated;
        } else {
            // 하드코딩된 번역 확인 (폴백)
            originalTranslation = uiRenderer.translateToKorean('', state.currentConceptId);
        }
        
        // 텍스트 에리어 업데이트
        const textArea = document.getElementById('edit-korean-translation-text');
        if (textArea) {
            textArea.value = originalTranslation;
        }
        
        utils.showToast('원본 번역으로 되돌렸습니다.');
    },
    
    aiEditUniversalPrompt: function(language) {
        const concept = dataManager.getCurrentConcept();
        if (!concept) {
            utils.showToast('선택된 컨셉아트가 없습니다.');
            return;
        }
        
        let promptToTransfer = '';
        
        // 영어 원본 프롬프트 가져오기
        if (language === 'english' && concept.prompts && concept.prompts.universal) {
            promptToTransfer = concept.prompts.universal;
        }
        
        if (!promptToTransfer) {
            utils.showToast('전달할 프롬프트가 없습니다.');
            return;
        }
        
        try {
            // 프롬프트를 localStorage에 저장 (이미지프롬프트 전용 키 사용)
            localStorage.setItem('aiEditImagePrompt', promptToTransfer);
            
            // 이미지 프롬프트 생성기 페이지로 이동
            window.location.href = '../prompt-builder.html';
        } catch (error) {
            console.error('AI 수정 처리 중 오류:', error);
            utils.showToast('프롬프트 전달 중 오류가 발생했습니다.');
        }
    },
    
    aiEditPrompt: function(aiTool, type, index = null) {
        const concept = dataManager.getCurrentConcept();
        if (!concept) {
            utils.showToast('선택된 컨셉아트가 없습니다.');
            return;
        }
        
        let promptToTransfer = '';
        
        // 프롬프트 타입에 따라 적절한 프롬프트 가져오기
        if (type === 'base') {
            // 기본 프롬프트
            if (concept.base_prompts && concept.base_prompts[aiTool]) {
                // 수정된 프롬프트 확인
                const editedPrompts = JSON.parse(localStorage.getItem('editedConceptPrompts') || '{}');
                const promptKey = `${state.currentConceptId}_${aiTool}_base`;
                promptToTransfer = editedPrompts[promptKey]?.prompt || concept.base_prompts[aiTool];
            }
        } else if (concept.character_variations && concept.character_variations[aiTool]) {
            // 캐릭터 변형 프롬프트
            const variations = concept.character_variations[aiTool];
            const editedPrompts = JSON.parse(localStorage.getItem('editedConceptPrompts') || '{}');
            
            if (index !== null) {
                // 일반 변형 프롬프트
                const typeInfo = CHARACTER_TYPES[type];
                if (typeInfo && variations[type]) {
                    const variationPrompt = variations[type][index];
                    if (variationPrompt) {
                        const promptKey = `${state.currentConceptId}_${aiTool}_${variationPrompt.key}`;
                        promptToTransfer = editedPrompts[promptKey]?.prompt || variationPrompt.prompt;
                    }
                }
            } else {
                // 퍼뮤테이션 프롬프트
                if (variations[type]) {
                    const promptKey = `${state.currentConceptId}_${aiTool}_${type}`;
                    promptToTransfer = editedPrompts[promptKey]?.prompt || variations[type];
                }
            }
        }
        
        if (!promptToTransfer) {
            utils.showToast('전달할 프롬프트를 찾을 수 없습니다.');
            return;
        }
        
        // localStorage에 프롬프트 저장 (이미지프롬프트 전용 키 사용)
        localStorage.setItem('aiEditImagePrompt', promptToTransfer);
        
        // 이미지 프롬프트 생성기 페이지로 이동
        window.location.href = '../prompt-builder.html';
    }
};

// ===== imageManager.js 내용 =====
const imageManager = {
    updateAdditionalImage: async function(conceptId, aiTool, index, field, value) {
        console.log('updateAdditionalImage 호출:', { conceptId, aiTool, index, field, value });
        console.log('현재 state:', { currentConceptType: state.currentConceptType, currentConceptId: state.currentConceptId });
        
        // state.currentConceptType이 설정되지 않은 경우 대비
        if (!state.currentConceptType) {
            console.error('currentConceptType이 설정되지 않았습니다.');
            utils.showToast('컨셉 타입이 선택되지 않았습니다.');
            return;
        }
        
        const concept = state.conceptArtData[state.currentConceptType][conceptId];
        if (!concept) {
            console.error('컨셉아트를 찾을 수 없습니다:', conceptId);
            utils.showToast('컨셉아트를 찾을 수 없습니다.');
            return;
        }
        
        // additional_images 구조 초기화
        if (!concept.additional_images) concept.additional_images = {};
        if (!concept.additional_images[aiTool]) concept.additional_images[aiTool] = [];
        
        // 배열 크기 확인 및 초기화
        while (concept.additional_images[aiTool].length <= index) {
            concept.additional_images[aiTool].push({
                url: '',
                base64: '',
                description: '',
                type: 'reference'
            });
        }
        
        // URL 필드인 경우 처리
        if (field === 'url' && value) {
            value = this.convertDropboxUrl(value);
            
            // 스토리보드와 동일하게 URL을 직접 사용 (base64 변환 시도하지 않음)
            // CORS 제한으로 인해 외부 URL의 base64 변환은 불가능
            console.log('이미지 URL을 직접 사용합니다:', value);
        }
        
        // 값 업데이트
        concept.additional_images[aiTool][index][field] = value;
        console.log('업데이트된 추가이미지 데이터:', concept.additional_images[aiTool][index]);
        
        // 저장
        dataManager.saveToLocalStorage();
        
        // URL이 변경된 경우 미리보기 업데이트
        if (field === 'url') {
            this.updateImagePreview(conceptId, aiTool, index, concept.additional_images[aiTool][index]);
        }
        
        utils.showToast(`추가 이미지 ${field}이(가) 업데이트되었습니다.`);
    },

    // URL을 base64로 변환하는 함수
    convertUrlToBase64: async function(url) {
        try {
            // 이미 base64인 경우 그대로 반환
            if (url.startsWith('data:')) {
                return url;
            }
            
            // CORS 제한으로 인해 외부 URL은 직접 변환이 어려움
            // 사용자에게 로컬 파일 업로드를 권장
            console.log('외부 URL의 경우 CORS 제한으로 직접 변환이 어려울 수 있습니다.');
            return null;
        } catch (error) {
            console.error('URL to base64 변환 실패:', error);
            return null;
        }
    },

    // 이미지 미리보기 업데이트 함수
    updateImagePreview: function(conceptId, aiTool, index, imageData) {
        const uniqueId = `${conceptId}-${aiTool}-additional-${index}`;
        const preview = document.getElementById(`additional-preview-${uniqueId}`);
        
        if (!preview) {
            console.error('미리보기 요소를 찾을 수 없습니다:', `additional-preview-${uniqueId}`);
            return;
        }
        
        if (imageData.url) {
            // URL을 우선 사용 (스토리보드와 동일한 방식)
            let displayUrl = imageData.url;
            
            // Google Drive URL인 경우 썸네일로 변환
            if (imageData.url.includes('drive.google.com')) {
                const fileId = utils.extractGoogleDriveFileId(imageData.url);
                if (fileId) {
                    displayUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`;
                }
            }
            
            preview.innerHTML = `<img src="${displayUrl}" alt="추가 이미지 ${index+1}" style="cursor: pointer;" onclick="imageManager.openImageModal('${displayUrl}')" onerror="this.onerror=null; this.src='${imageData.url}'; this.onerror=function(){this.style.display='none';this.parentElement.innerHTML='<div class=\\'no-image-placeholder\\'>로드 실패</div>';}">`;
        } else if (imageData.base64) {
            // URL이 없으면 base64 사용 (파일 업로드의 경우)
            preview.innerHTML = `<img src="${imageData.base64}" alt="추가 이미지 ${index+1}" style="cursor: pointer;" onclick="imageManager.openImageModal('${imageData.base64}')">`;
        } else {
            preview.innerHTML = `<div class="no-image-placeholder">추가 이미지 ${index+1}</div>`;
        }
    },


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
    
    applyImageUrl: function(aiTool, type, index = null) {
        const inputId = index !== null ? 
            `image-url-input-${type}_${index}-${aiTool}` : 
            `image-url-input-${type}-${aiTool}`;
        
        const inputField = document.getElementById(inputId);
        if (!inputField) {
            console.error('Input field not found:', inputId);
            return;
        }
        
        const url = inputField.value.trim();
        if (!url) {
            utils.showToast('URL을 입력해주세요');
            return;
        }
        
        const concept = dataManager.getCurrentConcept();
        if (!concept) {
            utils.showToast('선택된 컨셉아트가 없습니다.');
            return;
        }
        
        // 드롭박스 URL 자동 변환
        const processedUrl = this.convertDropboxUrl(url);
        
        if (!utils.isValidUrl(processedUrl)) {
            utils.showToast('유효한 URL을 입력해주세요');
            return;
        }
        
        if (!concept.generated_images) concept.generated_images = { base_prompts: {}, variations: {} };
        if (type === 'base' && !concept.generated_images.base_prompts) concept.generated_images.base_prompts = {};
        if (type !== 'base' && !concept.generated_images.variations) concept.generated_images.variations = {};
        if (type !== 'base' && !concept.generated_images.variations[aiTool]) concept.generated_images.variations[aiTool] = {};
        
        this.setImageUrl(aiTool, type, index, processedUrl, concept);
        inputField.value = ''; // 입력 필드 초기화
        utils.showToast('이미지가 추가되었습니다');
    },
    
    previewImageUrl: function(url, type, aiTool, index = null) {
        // 실시간 미리보기는 옵션으로 구현 가능
        // 현재는 간단한 URL 검증만 수행
        if (url && url.length > 10) {
            const processedUrl = this.convertDropboxUrl(url.trim());
            // 미리보기 로직 추가 가능
        }
    },
    
    addImage: function(aiTool, type, index = null) {
        // 이 함수는 추가 이미지 슬롯용으로 유지 (기존 호환성)
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
        
        console.log('updateImageGallery 호출됨:', concept);
        galleryContent.innerHTML = '';
        
        // 이미지가 있는지 확인
        const hasMainImage = concept?.main_image_url;
        const hasAdditionalImages = concept?.additional_images && Object.keys(concept.additional_images).length > 0;
        const hasGeneratedImages = concept?.generated_images;
        
        console.log('이미지 상태:', {
            hasMainImage: hasMainImage,
            main_image_url: concept?.main_image_url,
            hasAdditionalImages: hasAdditionalImages,
            additional_images: concept?.additional_images,
            hasGeneratedImages: hasGeneratedImages
        });
        
        if (!hasMainImage && !hasAdditionalImages && !hasGeneratedImages) {
            galleryContent.innerHTML = '<div class="no-image-message">컨셉아트를 선택하고 이미지를 추가하면 갤러리가 표시됩니다.</div>';
            return;
        }
        
        const images = [];
        
        // 이미지 URL 처리 헬퍼 함수
        const processImageUrl = (url) => {
            if (!url) return null;
            
            console.log('Processing image URL:', url);
            
            // Google Drive URL 처리
            if (url.includes('drive.google.com')) {
                const match = url.match(/[-\w]{25,}/);
                if (match) {
                    const processedUrl = `https://drive.google.com/thumbnail?id=${match[0]}&sz=w400`;
                    console.log('Google Drive URL processed:', processedUrl);
                    return processedUrl;
                }
            }
            
            // Dropbox URL 처리
            if (url.includes('dropbox.com')) {
                let processedUrl = url;
                // dl=0을 raw=1로 변경
                if (url.includes('dl=0')) {
                    processedUrl = url.replace('dl=0', 'raw=1');
                }
                // dl 파라미터가 없으면 raw=1 추가
                else if (!url.includes('dl=') && !url.includes('raw=')) {
                    const separator = url.includes('?') ? '&' : '?';
                    processedUrl = url + separator + 'raw=1';
                }
                console.log('Dropbox URL processed:', processedUrl);
                return processedUrl;
            }
            
            // Midjourney CDN URL은 그대로 사용
            if (url.includes('cdn.midjourney.com')) {
                console.log('Midjourney CDN URL, using as-is:', url);
                return url;
            }
            
            // 일반 이미지 URL
            console.log('Regular URL, using as-is:', url);
            return url;
        };
        
        // 메인 이미지 추가
        if (concept.main_image_url) {
            console.log('메인 이미지 URL 발견:', concept.main_image_url);
            const processedUrl = processImageUrl(concept.main_image_url);
            if (processedUrl) {
                images.push({
                    url: processedUrl,
                    aiTool: 'main',
                    type: '메인 이미지',
                    title: '메인 이미지'
                });
                console.log('메인 이미지 추가됨:', processedUrl);
            }
        }
        
        // 추가 이미지들 (새로운 구조 - image_1, image_2, etc.)
        if (concept.additional_images && typeof concept.additional_images === 'object') {
            console.log('추가 이미지 발견:', concept.additional_images);
            // 기존 AI 도구 기반 구조와 새로운 image_1, image_2 구조 모두 지원
            const keys = Object.keys(concept.additional_images);
            
            // image_1, image_2 형식 확인
            for (let i = 1; i <= 4; i++) {
                const imageKey = `image_${i}`;
                const imageData = concept.additional_images[imageKey];
                if (imageData && imageData.url) {
                    console.log(`추가 이미지 ${i} URL:`, imageData.url);
                    const processedUrl = processImageUrl(imageData.url);
                    if (processedUrl) {
                        images.push({
                            url: processedUrl,
                            aiTool: 'additional',
                            type: '참조 이미지',
                            title: `참조 이미지 ${i}`,
                            description: imageData.description || '',
                            imageType: imageData.type || 'reference'
                        });
                        console.log(`추가 이미지 ${i} 추가됨:`, processedUrl);
                    }
                }
            }
            
            // AI 도구별 추가 이미지도 확인 (하위 호환성)
            for (const key of keys) {
                if (!key.startsWith('image_') && Array.isArray(concept.additional_images[key])) {
                    concept.additional_images[key].forEach((imgData, index) => {
                        if (imgData && imgData.url) {
                            const processedUrl = processImageUrl(imgData.url);
                            if (processedUrl) {
                                images.push({
                                    url: processedUrl,
                                    aiTool: key,
                                    type: '추가 이미지',
                                    title: `${key} - 추가 ${index + 1}`,
                                    description: imgData.description || ''
                                });
                            }
                        }
                    });
                }
            }
        } else {
            console.log('추가 이미지 없음 또는 유효하지 않은 형식');
        }
        
        // 기존 generated_images 구조도 지원 (하위 호환성)
        if (concept.generated_images?.base_prompts) {
            for (const [aiTool, imageUrl] of Object.entries(concept.generated_images.base_prompts)) {
                if (imageUrl) {
                    const processedUrl = processImageUrl(imageUrl);
                    if (processedUrl) {
                        images.push({
                            url: processedUrl,
                            aiTool: aiTool,
                            type: '기본 프롬프트',
                            title: `${aiTool.toUpperCase()} - 기본`
                        });
                    }
                }
            }
        }
        
        if (concept.generated_images?.variations) {
            for (const [aiTool, variations] of Object.entries(concept.generated_images.variations)) {
                for (const [variationKey, imageUrl] of Object.entries(variations)) {
                    if (imageUrl) {
                        const processedUrl = processImageUrl(imageUrl);
                        if (processedUrl) {
                            const typeInfo = this.getVariationTypeInfo(variationKey);
                            images.push({
                                url: processedUrl,
                                aiTool: aiTool,
                                type: typeInfo.type,
                                title: `${aiTool.toUpperCase()} - ${typeInfo.label}`
                            });
                        }
                    }
                }
            }
        }
        
        if (images.length === 0) {
            console.log('이미지 배열이 비어있음');
            galleryContent.innerHTML = '<div class="no-image-message">아직 추가된 이미지가 없습니다.</div>';
            return;
        }
        
        console.log(`총 ${images.length}개의 이미지를 갤러리에 표시합니다:`, images);
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
        card.className = 'gallery-item';
        
        // 이미지 URL은 이미 processImageUrl에서 처리됨
        const displayUrl = imageData.url;
        
        // 이미지 엘리먼트 생성
        const img = document.createElement('img');
        img.src = displayUrl;
        img.alt = imageData.title;
        img.loading = 'lazy'; // 지연 로딩 추가
        
        // 이미지 클릭 시 모달 열기
        img.addEventListener('click', () => {
            this.openImageModal(displayUrl);
        });
        
        // 이미지 로드 에러 처리
        img.addEventListener('error', function() {
            this.onerror = null; // 무한 루프 방지
            this.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22 viewBox=%220 0 200 200%22%3E%3Crect width=%22200%22 height=%22200%22 fill=%22%23333%22/%3E%3Ctext x=%22100%22 y=%22100%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22 fill=%22%23999%22 font-size=%2214%22%3E이미지 로드 실패%3C/text%3E%3C/svg%3E';
            this.style.cursor = 'default';
            this.removeEventListener('click', () => {});
        });
        
        card.appendChild(img);
        
        // 이미지 정보 표시
        const info = document.createElement('div');
        info.className = 'gallery-item-info';
        
        // 제목 표시
        const title = document.createElement('div');
        title.className = 'gallery-item-title';
        title.textContent = imageData.title;
        info.appendChild(title);
        
        // 설명이 있는 경우 제목 아래에 표시
        if (imageData.description && imageData.description.trim()) {
            const desc = document.createElement('div');
            desc.className = 'gallery-item-description';
            desc.textContent = imageData.description;
            info.appendChild(desc);
        }
        
        card.appendChild(info);
        
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
        
        // 추가 이미지도 로드
        if (concept.additional_images) {
            // 현재 활성화된 AI 탭 확인
            const activeAITab = state.currentPromptsAITab;
            if (activeAITab && concept.additional_images[activeAITab]) {
                // 추가 이미지 미리보기 업데이트는 createAdditionalImageSlots에서 처리됨
            }
        }
        
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

// ===== 탭 전환 함수 =====
window.openTab = function(event, tabName) {
    // 모든 탭 콘텐츠 숨기기
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => {
        tab.style.display = 'none';
        tab.classList.remove('active');
    });
    
    // 모든 탭 버튼의 active 클래스 제거
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.classList.remove('active');
    });
    
    // 선택된 탭 표시
    const selectedTab = document.getElementById(tabName);
    if (selectedTab) {
        selectedTab.style.display = 'block';
        selectedTab.classList.add('active');
    }
    
    // 클릭된 버튼에 active 클래스 추가
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }
    
    // 이미지 갤러리 탭이 선택되면 갤러리 업데이트
    if (tabName === 'image-gallery-tab') {
        const concept = dataManager.getCurrentConcept();
        if (concept) {
            imageManager.updateImageGallery(concept);
        }
    }
};

// ===== ConceptArtManager 글로벌 객체 =====
window.ConceptArtManager = {
    currentConcept: null,
    
    openImageModal: function(url) {
        if (url && typeof imageManager !== 'undefined' && imageManager.openImageModal) {
            imageManager.openImageModal(url);
        } else {
            console.error('imageManager.openImageModal을 사용할 수 없습니다.');
        }
    },
    
    applyAdditionalImage: function(index) {
        try {
            const urlInput = document.querySelector(`.additional-image-url[data-index="${index}"]`);
            const descInput = document.querySelector(`.additional-image-desc[data-index="${index}"]`);
            
            if (!urlInput || !descInput) {
                console.error('입력 필드를 찾을 수 없습니다.');
                return;
            }
            
            const url = urlInput.value.trim();
            const description = descInput.value.trim();
            
            // URL 검증
            if (url && !utils.isValidUrl(url)) {
                utils.showToast('올바른 URL 형식이 아닙니다.');
                return;
            }
            
            // 업데이트
            this.updateAdditionalImage(index, 'url', url);
            this.updateAdditionalImage(index, 'description', description);
            
            // 미리보기 업데이트
            const previewContainer = urlInput.closest('.additional-image-slot').querySelector('.additional-image-preview');
            if (previewContainer) {
                if (url) {
                    let displayUrl = url;
                    if (url.includes('dropbox.com')) {
                        displayUrl = imageManager.convertDropboxUrl(url);
                    }
                    previewContainer.innerHTML = `<img src="${displayUrl}" alt="추가 이미지 ${index}" onclick="ConceptArtManager.openImageModal('${displayUrl}')" />`;
                } else {
                    previewContainer.innerHTML = '<div class="no-image-placeholder">이미지 없음</div>';
                }
            }
            
            utils.showToast('참조 이미지가 적용되었습니다.');
        } catch (error) {
            console.error('참조 이미지 적용 중 오류:', error);
            utils.showToast('이미지 적용 중 오류가 발생했습니다.');
        }
    },
    
    applyMainImageUrl: function() {
        try {
            const input = document.getElementById('main-image-url-input');
            if (!input) {
                console.error('main-image-url-input 요소를 찾을 수 없습니다.');
                utils.showToast('입력 필드를 찾을 수 없습니다.');
                return;
            }
            
            const url = input.value.trim();
            const concept = dataManager.getCurrentConcept();
            if (!concept) {
                console.error('선택된 컨셉이 없습니다.');
                utils.showToast('선택된 컨셉아트가 없습니다.');
                return;
            }
            
            // URL 유효성 검사
            if (url && !utils.isValidUrl(url)) {
                utils.showToast('올바른 URL 형식이 아닙니다.');
                return;
            }
            
            // 현재 컨셉에 메인 이미지 URL 저장 (원본 URL 저장)
            concept.main_image_url = url;
            this.currentConcept = concept;
            
            // 이미지 컨테이너 업데이트 (ID로 정확히 찾기)
            const imageContainer = document.getElementById('main-image-container') || document.querySelector('.image-container');
            if (imageContainer) {
                if (url) {
                    // 드롭박스 URL 변환
                    let displayUrl = url;
                    if (url.includes('dropbox.com')) {
                        displayUrl = imageManager.convertDropboxUrl(url);
                        console.log('Dropbox URL 변환:', url, '->', displayUrl);
                    }
                    
                    // 이미지 HTML 생성
                    const imgHtml = `<img src="${displayUrl}" 
                                          alt="${concept.name_kr || concept.name || 'Image'}" 
                                          onclick="ConceptArtManager.openImageModal('${displayUrl}')" 
                                          onerror="this.onerror=null; this.src='${url}'; this.style.border='1px solid red';" 
                                          style="max-width: 100%; max-height: 500px; object-fit: contain; cursor: pointer;" />`;
                    imageContainer.innerHTML = imgHtml;
                } else {
                    imageContainer.innerHTML = '<div class="no-image-message">이미지를 추가하려면 아래 URL을 입력하세요</div>';
                }
            } else {
                console.error('이미지 컨테이너를 찾을 수 없습니다.');
            }
            
            // 로컬 스토리지에 저장
            dataManager.saveToLocalStorage();
            utils.showToast('이미지 URL이 적용되었습니다.');
            
            // 디버깅: 저장된 데이터 확인
            console.log('저장된 메인 이미지 URL:', concept.main_image_url);
        } catch (error) {
            console.error('메인 이미지 URL 적용 중 오류:', error);
            utils.showToast('이미지 적용 중 오류가 발생했습니다.');
        }
    },
    
    updateAdditionalImage: function(index, field, value) {
        try {
            const concept = dataManager.getCurrentConcept();
            if (!concept) {
                console.error('선택된 컨셉이 없습니다.');
                utils.showToast('선택된 컨셉아트가 없습니다.');
                return;
            }
            
            // 인덱스가 3을 초과하면 무시 (1, 2, 3만 허용)
            if (parseInt(index) > 3) {
                console.log('추가 이미지는 3개까지만 지원됩니다.');
                return;
            }
            
            // additional_images 객체 초기화
            if (!concept.additional_images) {
                concept.additional_images = {};
            }
            
            // 특정 이미지 슬롯 초기화
            const imageKey = `image_${index}`;
            if (!concept.additional_images[imageKey]) {
                concept.additional_images[imageKey] = {
                    url: '',
                    description: '',
                    type: 'reference'
                };
            }
            
            // URL 유효성 검사
            if (field === 'url' && value && !utils.isValidUrl(value)) {
                utils.showToast('올바른 URL 형식이 아닙니다.');
                return;
            }
            
            // 필드 업데이트
            concept.additional_images[imageKey][field] = value;
            
            // URL이 변경된 경우 이미지 미리보기 업데이트
            if (field === 'url') {
                const previewDiv = document.querySelector(`.additional-image-slot:nth-child(${index}) .additional-image-preview`);
                if (previewDiv) {
                    if (value) {
                        // 드롭박스 URL 변환
                        let displayUrl = value;
                        if (value.includes('dropbox.com')) {
                            displayUrl = imageManager.convertDropboxUrl(value);
                        }
                        previewDiv.innerHTML = `<img src="${displayUrl}" alt="추가 이미지 ${index}" onclick="ConceptArtManager.openImageModal('${displayUrl}')" onerror="this.onerror=null; this.src='${value}'; this.style.border='1px solid red';" />`;
                    } else {
                        previewDiv.innerHTML = '<div class="no-image-placeholder">이미지 없음</div>';
                    }
                }
            }
            
            this.currentConcept = concept;
            
            // 로컬 스토리지에 저장
            dataManager.saveToLocalStorage();
            utils.showToast(`추가 이미지 ${field === 'url' ? 'URL' : '설명'}이(가) 업데이트되었습니다.`);
        } catch (error) {
            console.error('추가 이미지 업데이트 중 오류:', error);
            utils.showToast('이미지 업데이트 중 오류가 발생했습니다.');
        }
    },
    
    saveData: function() {
        dataManager.saveToLocalStorage();
    },
    
    showToast: function(message) {
        utils.showToast(message);
    },
    
    copyToClipboard: function(text) {
        utils.copyToClipboard(text);
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
            
            // 저장된 선택 상태 복원
            if (state.currentConceptType && state.currentConceptId) {
                const concept = state.conceptArtData[state.currentConceptType]?.[state.currentConceptId];
                if (concept) {
                    uiRenderer.displayConceptDetail();
                    imageManager.loadAndDisplayImages(concept);
                }
            }
            
            utils.showToast('저장된 데이터를 로드했습니다.');
        }
    }
}

function initialize() {
    console.log('컨셉아트 매니저 초기화 시작...');
    
    // 복사 버튼 이벤트 리스너 추가 (더 나은 접근성과 선택자)
    document.addEventListener('click', function(e) {
        // 복사 버튼 클릭 처리
        if (e.target.classList.contains('prompt-copy-btn')) {
            e.preventDefault(); // 중복 실행 방지
            const action = e.target.dataset.action;
            const lang = e.target.dataset.lang;
            const tool = e.target.dataset.tool;
            const type = e.target.dataset.type;
            const index = e.target.dataset.index;
            
            if (action === 'copy-prompt') {
                promptManager.copyUniversalPrompt(lang);
            } else if (action === 'copy-variant') {
                promptManager.copyVariantPrompt(tool, type, index ? parseInt(index) : null);
            }
        }
        
        // 편집 버튼 클릭 처리
        if (e.target.classList.contains('prompt-edit-btn')) {
            e.preventDefault();
            const action = e.target.dataset.action;
            const lang = e.target.dataset.lang;
            
            if (action === 'edit-prompt') {
                promptManager.editUniversalPrompt(lang);
            }
        }
        
        // AI 편집 버튼 클릭 처리
        if (e.target.classList.contains('ai-edit-btn')) {
            e.preventDefault();
            const action = e.target.dataset.action;
            const lang = e.target.dataset.lang;
            
            if (action === 'ai-edit-prompt') {
                promptManager.aiEditUniversalPrompt(lang);
            }
        }
    });
    
    // 먼저 localStorage에서 데이터 로드 시도
    try {
        const hasData = dataManager.loadFromLocalStorage();
        if (hasData) {
            console.log('localStorage에서 데이터 로드 성공');
            uiRenderer.updateProjectInfo();
            uiRenderer.renderSidebar();
            
            // 이전에 선택했던 컨셉 복원
            if (state.currentConceptType && state.currentConceptId) {
                const concept = state.conceptArtData[state.currentConceptType][state.currentConceptId];
                if (concept) {
                    console.log('이전 선택 컨셉 복원:', state.currentConceptType, state.currentConceptId);
                    dataManager.selectConcept(state.currentConceptType, state.currentConceptId);
                }
            }
        } else {
            console.log('localStorage에 저장된 데이터가 없습니다.');
        }
    } catch (error) {
        console.error('데이터 로드 중 오류:', error);
        utils.showToast('데이터 로드 중 오류가 발생했습니다.');
    }
    
    // 이벤트 리스너 설정 - 헤더 버튼과 기존 버튼 모두 지원
    const exportBtns = ['export-json-btn', 'header-export-json-btn'];
    const importBtns = ['import-json-btn', 'header-import-json-btn'];
    const resetBtns = ['reset-data-btn', 'header-clear-btn'];
    
    // Export 버튼들
    exportBtns.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            console.log(`Export 버튼 등록: ${id}`);
            btn.addEventListener('click', () => dataManager.exportToJSON());
        }
    });
    
    // Import 버튼들
    importBtns.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            console.log(`Import 버튼 등록: ${id}`);
            btn.addEventListener('click', () => {
                const importInput = document.getElementById('import-json-input');
                if (importInput) {
                    importInput.click();
                } else {
                    console.error('import-json-input 요소를 찾을 수 없습니다.');
                    utils.showToast('파일 선택 요소를 찾을 수 없습니다.');
                }
            });
        }
    });
    
    // Import 파일 선택
    const importInput = document.getElementById('import-json-input');
    if (importInput) {
        importInput.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (!file) return;
            
            console.log('JSON 파일 가져오기 시작:', file.name);
            dataManager.importFromJSON(file)
                .then(() => {
                    // 페이지 새로고침 후 active 캐릭터 클릭
                    localStorage.setItem('shouldClickActiveCharacter', 'true');
                    utils.showToast('JSON 파일을 성공적으로 가져왔습니다. 페이지를 새로고침합니다...');
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                })
                .catch(error => {
                    console.error('JSON 가져오기 오류:', error);
                    utils.showToast('JSON 파일을 가져올 수 없습니다: ' + error.message);
                });
            
            event.target.value = '';
        });
    } else {
        console.error('import-json-input 요소를 찾을 수 없습니다.');
    }
    
    // Reset 버튼들
    resetBtns.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', function() {
                if (confirm('모든 데이터가 삭제됩니다. 계속하시겠습니까?')) {
                    localStorage.removeItem(STORAGE_KEY);
                    localStorage.removeItem('editedConceptPrompts');
                    utils.showToast('모든 데이터가 초기화되었습니다.');
                    setTimeout(() => location.reload(), 1000);
                }
            });
        }
    });
    
    // AI 탭 빌드
    uiRenderer.buildAITabs();
    
    // 페이지 로드 시 active 캐릭터 자동 클릭 체크
    if (localStorage.getItem('shouldClickActiveCharacter') === 'true') {
        localStorage.removeItem('shouldClickActiveCharacter');
        setTimeout(() => {
            // 먼저 캐릭터 리스트에서 active 항목을 찾습니다
            const activeCharacter = document.querySelector('#character-list .concept-item.active');
            if (activeCharacter) {
                console.log('Active 캐릭터 자동 클릭:', activeCharacter.textContent);
                activeCharacter.click();
            } else {
                // active가 없으면 첫 번째 캐릭터를 클릭
                const firstCharacter = document.querySelector('#character-list .concept-item');
                if (firstCharacter) {
                    console.log('첫 번째 캐릭터 자동 클릭:', firstCharacter.textContent);
                    firstCharacter.click();
                }
            }
        }, 500); // 타이밍을 500ms로 증가
    }
    
    // URL 파라미터 체크 및 자동 JSON 처리
    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.get('loadStage4Json') === 'true') {
        console.log('🔄 URL 파라미터로 Stage 4 JSON 로드 요청 감지');
        setTimeout(() => {
            console.log('Stage 4 데이터 로드 시작...');
            const success = dataManager.handleStage4TempData();
            if (success) {
                console.log('Stage 4 데이터 로드 성공, UI 업데이트는 handleStage4TempData에서 처리됨');
                
                // autoRefresh 파라미터가 있으면 새로고침
                if (urlParams.get('autoRefresh') === 'true') {
                    console.log('🔄 자동 새로고침 요청 감지');
                    localStorage.setItem('shouldClickActiveCharacter', 'true');
                    setTimeout(() => {
                        window.location.href = window.location.pathname;
                    }, 500);
                    return;
                }
                
                // 순차 보기 모드 확인
                if (urlParams.get('continueToStoryboard') === 'true') {
                    // 3초 후 스토리보드로 자동 이동
                    setTimeout(() => {
                        utils.showToast('스토리보드로 이동합니다...');
                        setTimeout(() => {
                            // 스토리보드 페이지에서 데이터를 다시 로드할 수 있도록 처리 완료 플래그 제거
                            localStorage.removeItem('stage2TempProcessed');
                            localStorage.removeItem('stage5TempProcessed');
                            localStorage.removeItem('stage6TempProcessed');
                            localStorage.removeItem('stage6TempFilesProcessed');
                            localStorage.removeItem('stage7TempProcessed');
                            localStorage.removeItem('stage8TempProcessed');
                            console.log('스토리보드 처리 완료 플래그 제거됨');
                            
                            document.body.classList.add('fade-out');
                            setTimeout(() => {
                                window.location.href = 'storyboard/index.html?loadTempJson=true&loadStage5JsonMultiple=true&loadStage6JsonMultiple=true&loadStage7JsonMultiple=true&loadStage8JsonMultiple=true';
                            }, 300);
                        }, 1000);
                    }, 3000);
                }
            } else {
                console.log('Stage 4 데이터 로드 실패');
            }
        }, 500); // 타이밍 단축
    } else {
        // URL 파라미터가 없을 때도 Stage 4 데이터 확인
        const tempJson = localStorage.getItem('stage4TempJson');
        const tempFileName = localStorage.getItem('stage4TempFileName');
        
        if (tempJson && tempFileName) {
            console.log('🔄 localStorage에서 Stage 4 데이터 발견, 자동 로드 실행...');
            setTimeout(() => {
                console.log('Stage 4 데이터 로드 시작 (localStorage에서 발견)...');
                const success = dataManager.handleStage4TempData();
                if (success) {
                    console.log('Stage 4 데이터 로드 성공');
                } else {
                    console.log('Stage 4 데이터 로드 실패');
                }
            }, 500); // 타이밍 단축
        } else {
            console.log('Stage 4 임시 데이터 없음, 로컬 JSON 파일 로드 시도...');
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
window.openImageModal = imageManager.openImageModal.bind(imageManager);
window.closeImageModal = imageManager.closeImageModal.bind(imageManager);
window.showAITab = uiRenderer.showAITab.bind(uiRenderer);
window.showVariantTypeTab = uiRenderer.showVariantTypeTab.bind(uiRenderer);
window.promptManager = promptManager;
window.imageManager = imageManager;
window.selectConcept = function(type, id) {
    console.log(`window.selectConcept 호출: ${type}/${id}`);
    dataManager.selectConcept(type, id);
    // selectConcept 내부에서 이미 처리하므로 중복 호출 제거
};

// DOM 로드 완료 시 초기화
document.addEventListener('DOMContentLoaded', initialize);