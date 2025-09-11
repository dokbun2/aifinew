/**
 * 앱 설정 및 상수 모듈
 */
(function(window) {
    'use strict';
    
    // 네임스페이스 생성
    window.AppConfig = window.AppConfig || {};
    
    // AI 도구 목록
    window.AppConfig.IMAGE_AI_TOOLS = ['midjourney', 'ideogram', 'leonardo', 'imagefx', 'openart'];
    
    // 모든 이미지 AI 도구 (Universal, Nanobana 포함)
    window.AppConfig.ALL_IMAGE_AI_TOOLS = [
        { id: 'universal', name: 'Universal' },
        { id: 'nanobana', name: 'Nanobana' },
        { id: 'midjourney', name: 'Midjourney' },
        { id: 'ideogram', name: 'Ideogram' },
        { id: 'leonardo', name: 'Leonardo' },
        { id: 'imagefx', name: 'ImageFX' },
        { id: 'luma', name: 'Luma' },
        { id: 'kling', name: 'Kling' },
        { id: 'veo2', name: 'Veo2' },
        { id: 'runway', name: 'Runway' },
        { id: 'minimax', name: 'MiniMax' },
        { id: 'cogvideo', name: 'CogVideo' },
        { id: 'pika', name: 'Pika' },
        { id: 'haiper', name: 'Haiper' },
        { id: 'pixverse', name: 'PixVerse' },
        { id: 'morph', name: 'Morph' },
        { id: 'hotshot', name: 'HotShot' },
        { id: 'hunyuan', name: 'Hunyuan' },
        { id: 'pika2', name: 'Pika2.0' },
        { id: 'haiper2', name: 'Haiper2.0' },
        { id: 'lightricks', name: 'Lightricks' },
        { id: 'genmo', name: 'Genmo' }
    ];
    
    // 기본 프로젝트 파일명
    window.AppConfig.DEFAULT_PROJECT_FILENAME = 'Film_Production_Manager.json';
    
    // localStorage 키 패턴
    window.AppConfig.STORAGE_KEYS = {
        BREAKDOWN_DATA: 'breakdownData_',
        IMAGE_CACHE: 'imageUrlCache_',
        STAGE6_PROMPTS: 'stage6ImagePrompts_',
        STAGE7_PROMPTS: 'stage7VideoPrompts_',
        STAGE_TEMP: 'stageTempJson_',
        STAGE_FILENAME: 'stageTempFileName_'
    };
    
    // 메시지 타입
    window.AppConfig.MESSAGE_TYPES = {
        SUCCESS: 'success',
        ERROR: 'error',
        WARNING: 'warning',
        INFO: 'info'
    };
    
    // 탭 타입
    window.AppConfig.TAB_TYPES = {
        INFO: 'info',
        IMAGE: 'image',
        VIDEO: 'video',
        AUDIO: 'audio',
        STAGE5: 'stage5',
        STAGE6: 'stage6',
        STAGE7: 'stage7'
    };
    
    // 기본 설정값
    window.AppConfig.DEFAULT_CONFIG = {
        MESSAGE_TIMEOUT: 5000,
        MAX_IMAGE_SLOTS: 3,
        MAX_MAIN_IMAGES: 2,
        MAX_REFERENCE_IMAGES: 3,
        DEFAULT_ASPECT_RATIO: '16:9',
        DEFAULT_PLAN: 'plan_a'
    };
    
    // 기존 전역 변수와의 호환성
    if (!window.IMAGE_AI_TOOLS) {
        window.IMAGE_AI_TOOLS = window.AppConfig.IMAGE_AI_TOOLS;
    }
    
})(window);