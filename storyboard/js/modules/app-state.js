/**
 * 앱 상태 관리 모듈
 * 전역 상태를 중앙에서 관리하여 추적성과 유지보수성 향상
 * IIFE 패턴으로 전역 네임스페이스 오염 방지
 */
(function(window) {
    'use strict';

    // 프라이빗 상태 저장소
    const _state = {
        // 현재 데이터와 선택 상태
        currentData: null,
        selectedType: null,
        selectedId: null,
        selectedSceneId: null,

        // 구조 플래그
        hasStage2Structure: false,

        // 편집 데이터
        editedPrompts: {},

        // 캐시
        imageUrlCache: {}
    };

    // 상태 변경 리스너
    const _listeners = new Set();

    // 디버그 모드 (기존 설정 유지)
    const DEBUG_MODE = false;
    const debugLog = DEBUG_MODE ? console.log : () => {};

    /**
     * AppState - 중앙 상태 관리 객체
     */
    window.AppState = {
        /**
         * 상태 가져오기
         * @param {string} key - 상태 키
         * @returns {*} 상태 값
         */
        get(key) {
            if (key) {
                return _state[key];
            }
            // 키가 없으면 전체 상태 복사본 반환 (불변성 보장)
            return { ..._state };
        },

        /**
         * 상태 설정
         * @param {string} key - 상태 키
         * @param {*} value - 설정할 값
         */
        set(key, value) {
            const oldValue = _state[key];
            _state[key] = value;

            debugLog(`AppState.set: ${key} =`, value);

            // 변경 알림
            this._notifyListeners(key, value, oldValue);
        },

        /**
         * 여러 상태를 한번에 업데이트
         * @param {Object} updates - 업데이트할 키-값 쌍
         */
        update(updates) {
            const changes = [];

            Object.entries(updates).forEach(([key, value]) => {
                const oldValue = _state[key];
                _state[key] = value;
                changes.push({ key, value, oldValue });
            });

            debugLog('AppState.update:', updates);

            // 모든 변경사항 알림
            changes.forEach(({ key, value, oldValue }) => {
                this._notifyListeners(key, value, oldValue);
            });
        },

        /**
         * 상태 초기화
         * @param {string} key - 초기화할 키 (없으면 전체 초기화)
         */
        reset(key) {
            if (key) {
                const defaultValue = this._getDefaultValue(key);
                this.set(key, defaultValue);
            } else {
                // 전체 초기화
                this.update({
                    currentData: null,
                    selectedType: null,
                    selectedId: null,
                    selectedSceneId: null,
                    hasStage2Structure: false,
                    editedPrompts: {},
                    imageUrlCache: {}
                });
            }

            debugLog(`AppState.reset: ${key || 'all'}`);
        },

        /**
         * 편집된 프롬프트 가져오기
         * @param {string} shotId - 샷 ID
         * @param {string} aiName - AI 도구 이름
         * @param {string} imageId - 이미지 ID
         * @returns {string|undefined} 편집된 프롬프트
         */
        getEditedPrompt(shotId, aiName, imageId) {
            const editKey = `${shotId}_${aiName}_${imageId}`;
            return _state.editedPrompts[editKey];
        },

        /**
         * 편집된 프롬프트 설정
         * @param {string} shotId - 샷 ID
         * @param {string} aiName - AI 도구 이름
         * @param {string} imageId - 이미지 ID
         * @param {string} prompt - 프롬프트 텍스트
         */
        setEditedPrompt(shotId, aiName, imageId, prompt) {
            const editKey = `${shotId}_${aiName}_${imageId}`;
            const newPrompts = { ..._state.editedPrompts };
            newPrompts[editKey] = prompt;
            this.set('editedPrompts', newPrompts);
        },

        /**
         * 이미지 URL 캐시 가져오기
         * @param {string} key - 캐시 키
         * @returns {string|undefined} 캐시된 URL
         */
        getCachedImageUrl(key) {
            return _state.imageUrlCache[key];
        },

        /**
         * 이미지 URL 캐시 설정
         * @param {string} key - 캐시 키
         * @param {string} url - URL
         */
        setCachedImageUrl(key, url) {
            const newCache = { ..._state.imageUrlCache };
            newCache[key] = url;
            this.set('imageUrlCache', newCache);
        },

        /**
         * 상태 변경 리스너 등록
         * @param {Function} listener - 리스너 함수
         * @returns {Function} 리스너 제거 함수
         */
        subscribe(listener) {
            _listeners.add(listener);

            // 구독 해제 함수 반환
            return () => {
                _listeners.delete(listener);
            };
        },

        /**
         * 프로젝트 데이터 존재 여부 확인
         * @returns {boolean}
         */
        hasProjectData() {
            return _state.currentData !== null &&
                   _state.currentData.project_info !== undefined;
        },

        /**
         * 선택된 항목이 있는지 확인
         * @returns {boolean}
         */
        hasSelection() {
            return _state.selectedType !== null &&
                   _state.selectedId !== null;
        },

        // Private 메서드들
        _notifyListeners(key, value, oldValue) {
            _listeners.forEach(listener => {
                try {
                    listener(key, value, oldValue);
                } catch (error) {
                    console.error('AppState listener error:', error);
                }
            });
        },

        _getDefaultValue(key) {
            const defaults = {
                currentData: null,
                selectedType: null,
                selectedId: null,
                selectedSceneId: null,
                hasStage2Structure: false,
                editedPrompts: {},
                imageUrlCache: {}
            };
            return defaults[key];
        }
    };

    // 디버깅용 전역 노출 (개발 환경에서만)
    if (DEBUG_MODE) {
        window._AppStateDebug = {
            getState: () => ({ ..._state }),
            getListeners: () => [..._listeners],
            reset: () => AppState.reset()
        };
    }

})(window);