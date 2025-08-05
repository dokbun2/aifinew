// promptManager.js - 프롬프트 관리 모듈

import { state, getCurrentConcept, VARIATION_TYPES_MAP } from './dataManager.js';
import { copyToClipboard, showToast } from './utils.js';

/**
 * CSV 데이터 복사
 */
export function copyCSV() {
    const concept = getCurrentConcept();
    if (!concept) {
        showToast('선택된 컨셉아트가 없습니다.');
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
        showToast('복사할 CSV 데이터가 없습니다.');
        return;
    }
    
    copyToClipboard(csvData.join('\n'));
}

/**
 * 기본 프롬프트 복사
 * @param {string} aiTool - AI 도구 이름
 * @param {string} type - 프롬프트 타입
 */
export function copyPrompt(aiTool, type) {
    const concept = getCurrentConcept();
    if (!concept) {
        showToast('선택된 컨셉아트가 없습니다.');
        return;
    }
    
    if (type === 'base' && concept.base_prompts && concept.base_prompts[aiTool]) {
        copyToClipboard(concept.base_prompts[aiTool]);
    } else {
        showToast('복사할 프롬프트가 없습니다.');
    }
}

/**
 * 변형 프롬프트 복사
 * @param {string} aiTool - AI 도구 이름
 * @param {string} typeKey - 변형 타입 키
 * @param {number} index - 변형 인덱스 (선택사항)
 */
export function copyVariantPrompt(aiTool, typeKey, index = null) {
    const concept = getCurrentConcept();
    if (!concept) {
        showToast('선택된 컨셉아트가 없습니다.');
        return;
    }
    
    if (!concept.character_variations || !concept.character_variations[aiTool]) {
        showToast('복사할 변형 프롬프트가 없습니다.');
        return;
    }
    
    let promptKey;
    if (typeKey.includes('_permutation')) {
        // Permutation 프롬프트
        promptKey = typeKey;
    } else if (index !== null) {
        // 일반 변형 프롬프트
        const baseKey = VARIATION_TYPES_MAP[typeKey]?.schema_key_base;
        if (!baseKey) {
            showToast('올바르지 않은 변형 타입입니다.');
            return;
        }
        promptKey = `${baseKey}_${index}`;
    } else {
        showToast('변형 인덱스가 필요합니다.');
        return;
    }
    
    const prompt = concept.character_variations[aiTool][promptKey];
    if (prompt) {
        copyToClipboard(prompt);
    } else {
        showToast('복사할 프롬프트가 없습니다.');
    }
}

/**
 * 전체 프롬프트 데이터 내보내기
 * @param {Object} concept - 컨셉 데이터
 * @returns {Object} 프롬프트 데이터
 */
export function exportPromptsData(concept) {
    const prompts = {
        base_prompts: {},
        variations: {}
    };
    
    // 기본 프롬프트
    if (concept.base_prompts) {
        prompts.base_prompts = { ...concept.base_prompts };
    }
    
    // 변형 프롬프트 (캐릭터인 경우만)
    if (concept.character_variations) {
        prompts.variations = { ...concept.character_variations };
    }
    
    return prompts;
}

/**
 * 프롬프트 통계 계산
 * @param {Object} conceptArtData - 전체 컨셉아트 데이터
 * @returns {Object} 통계 정보
 */
export function calculatePromptStatistics(conceptArtData) {
    const stats = {
        totalConcepts: 0,
        totalBasePrompts: 0,
        totalVariations: 0,
        byAITool: {},
        byCategory: {
            characters: 0,
            locations: 0,
            props: 0
        }
    };
    
    // AI 도구별 초기화
    ['midjourney', 'leonardo', 'ideogram', 'imagefx', 'openart'].forEach(tool => {
        stats.byAITool[tool] = {
            basePrompts: 0,
            variations: 0
        };
    });
    
    // 통계 계산
    for (const [category, concepts] of Object.entries(conceptArtData)) {
        stats.byCategory[category] = Object.keys(concepts).length;
        stats.totalConcepts += Object.keys(concepts).length;
        
        for (const concept of Object.values(concepts)) {
            // 기본 프롬프트 계산
            if (concept.base_prompts) {
                for (const aiTool of Object.keys(concept.base_prompts)) {
                    if (concept.base_prompts[aiTool]) {
                        stats.totalBasePrompts++;
                        if (stats.byAITool[aiTool]) {
                            stats.byAITool[aiTool].basePrompts++;
                        }
                    }
                }
            }
            
            // 변형 프롬프트 계산 (캐릭터만)
            if (category === 'characters' && concept.character_variations) {
                for (const [aiTool, variations] of Object.entries(concept.character_variations)) {
                    const variationCount = Object.keys(variations).filter(key => 
                        !key.includes('_permutation')
                    ).length;
                    stats.totalVariations += variationCount;
                    if (stats.byAITool[aiTool]) {
                        stats.byAITool[aiTool].variations += variationCount;
                    }
                }
            }
        }
    }
    
    return stats;
}

/**
 * 프롬프트 검색
 * @param {Object} conceptArtData - 전체 컨셉아트 데이터
 * @param {string} searchTerm - 검색어
 * @returns {Array} 검색 결과
 */
export function searchPrompts(conceptArtData, searchTerm) {
    const results = [];
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    for (const [category, concepts] of Object.entries(conceptArtData)) {
        for (const [id, concept] of Object.entries(concepts)) {
            const matches = [];
            
            // 이름에서 검색
            if (concept.name_kr?.toLowerCase().includes(lowerSearchTerm) ||
                concept.name_en?.toLowerCase().includes(lowerSearchTerm)) {
                matches.push('name');
            }
            
            // 설명에서 검색
            if (concept.description?.toLowerCase().includes(lowerSearchTerm)) {
                matches.push('description');
            }
            
            // 기본 프롬프트에서 검색
            if (concept.base_prompts) {
                for (const [aiTool, prompt] of Object.entries(concept.base_prompts)) {
                    if (prompt?.toLowerCase().includes(lowerSearchTerm)) {
                        matches.push(`base_prompt_${aiTool}`);
                    }
                }
            }
            
            // 변형 프롬프트에서 검색 (캐릭터만)
            if (concept.character_variations) {
                for (const [aiTool, variations] of Object.entries(concept.character_variations)) {
                    for (const [key, prompt] of Object.entries(variations)) {
                        if (prompt?.toLowerCase().includes(lowerSearchTerm)) {
                            matches.push(`variation_${aiTool}_${key}`);
                        }
                    }
                }
            }
            
            if (matches.length > 0) {
                results.push({
                    category,
                    id,
                    concept,
                    matches
                });
            }
        }
    }
    
    return results;
}