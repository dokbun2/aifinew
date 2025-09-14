/**
 * Prompt Editor 모듈
 * AI 프롬프트 편집 및 관리 기능
 * IIFE 패턴으로 전역 네임스페이스 오염 방지
 */
(function(window) {
    'use strict';

    // 네임스페이스 생성
    window.PromptEditor = window.PromptEditor || {};

    /**
     * HTML 엔티티 디코드 헬퍼
     */
    const decodeHtmlEntities = function(str) {
        if (!str) return '';
        return str
            .replace(/&quot;/g, '"')
            .replace(/&apos;/g, "'")
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&');
    };

    /**
     * 편집된 프롬프트 가져오기
     * AppState와 연동되어 있음
     */
    window.PromptEditor.getEditedPrompt = function(shotId, aiName, imageId) {
        if (window.AppState && window.AppState.getEditedPrompt) {
            return window.AppState.getEditedPrompt(shotId, aiName, imageId);
        }
        // 폴백: 기존 방식
        const editKey = `${shotId}_${aiName}_${imageId}`;
        return window.editedPrompts ? window.editedPrompts[editKey] : undefined;
    };

    /**
     * 이미지 프롬프트 편집 모달 열기
     */
    window.PromptEditor.editImagePrompt = function(shotId, aiName, imageId, originalPrompt, translatedPrompt, parameters) {
        try {
            const decodedOriginal = decodeHtmlEntities(originalPrompt);
            const decodedTranslated = decodeHtmlEntities(translatedPrompt);
            const decodedParameters = decodeHtmlEntities(parameters);

            // 수정 모달 HTML 생성
            const modalHtml = `
                <div id="prompt-edit-modal" class="modal-overlay" onclick="PromptEditor.closePromptEditModal(event)">
                    <div class="modal-content" onclick="event.stopPropagation()">
                        <div class="modal-header">
                            <h3>프롬프트 수정 - ${aiName} ${imageId}</h3>
                            <button class="modal-close-btn" onclick="PromptEditor.closePromptEditModal()">×</button>
                        </div>
                        <div class="modal-body">
                            <div class="form-group">
                                <label>원본 프롬프트:</label>
                                <textarea id="edit-original-prompt" class="prompt-textarea" rows="4">${decodedOriginal}</textarea>
                            </div>
                            ${decodedTranslated ? `
                            <div class="form-group">
                                <label>번역된 프롬프트:</label>
                                <textarea id="edit-translated-prompt" class="prompt-textarea" rows="4">${decodedTranslated}</textarea>
                            </div>
                            ` : ''}
                            ${decodedParameters ? `
                            <div class="form-group">
                                <label>파라미터:</label>
                                <input type="text" id="edit-parameters" class="prompt-input" value="${decodedParameters}">
                            </div>
                            ` : ''}
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-secondary" onclick="PromptEditor.closePromptEditModal()">취소</button>
                            <button class="btn btn-primary" onclick="PromptEditor.saveEditedPrompt('${shotId}', '${aiName}', '${imageId}')">저장</button>
                        </div>
                    </div>
                </div>
            `;

            // 모달을 body에 추가
            document.body.insertAdjacentHTML('beforeend', modalHtml);

            // 모달 스타일 추가 (없으면)
            window.PromptEditor.addPromptEditModalStyles();
        } catch (error) {
            console.error('프롬프트 수정 모달 생성 오류:', error);
            const showMessage = window.AppUtils?.showMessage || window.showMessage;
            if (showMessage) {
                showMessage('프롬프트 수정 모달을 열 수 없습니다.', 'error');
            }
        }
    };

    /**
     * 수정된 프롬프트 저장
     */
    window.PromptEditor.saveEditedPrompt = function(shotId, aiName, imageId) {
        try {
            const originalPromptElement = document.getElementById('edit-original-prompt');
            const translatedPromptElement = document.getElementById('edit-translated-prompt');
            const parametersElement = document.getElementById('edit-parameters');

            if (!originalPromptElement) {
                console.error('프롬프트 입력 필드를 찾을 수 없습니다.');
                return;
            }

            const editedPrompt = {
                original: originalPromptElement.value,
                translated: translatedPromptElement ? translatedPromptElement.value : null,
                parameters: parametersElement ? parametersElement.value : null
            };

            // AppState에 저장
            if (window.AppState && window.AppState.setEditedPrompt) {
                window.AppState.setEditedPrompt(shotId, aiName, imageId, editedPrompt);
            } else {
                // 폴백: 전역 변수에 저장
                const editKey = `${shotId}_${aiName}_${imageId}`;
                if (!window.editedPrompts) {
                    window.editedPrompts = {};
                }
                window.editedPrompts[editKey] = editedPrompt;
            }

            // 모달 닫기
            window.PromptEditor.closePromptEditModal();

            // 성공 메시지
            const showMessage = window.AppUtils?.showMessage || window.showMessage;
            if (showMessage) {
                showMessage('프롬프트가 수정되었습니다.', 'success');
            }

            // DOM 업데이트
            window.PromptEditor.updatePromptDisplay(shotId, aiName, imageId, editedPrompt);

        } catch (error) {
            console.error('프롬프트 저장 오류:', error);
            const showMessage = window.AppUtils?.showMessage || window.showMessage;
            if (showMessage) {
                showMessage('프롬프트 저장에 실패했습니다.', 'error');
            }
        }
    };

    /**
     * 프롬프트 편집 모달 닫기
     */
    window.PromptEditor.closePromptEditModal = function(event) {
        if (event && event.target !== event.currentTarget) {
            return;
        }
        const modal = document.getElementById('prompt-edit-modal');
        if (modal) {
            modal.remove();
        }
    };

    /**
     * 프롬프트 편집 모달 스타일 추가
     */
    window.PromptEditor.addPromptEditModalStyles = function() {
        if (document.getElementById('prompt-edit-modal-styles')) {
            return;
        }

        const styles = `
            <style id="prompt-edit-modal-styles">
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 10000;
                }

                .modal-content {
                    background: #1e1e1e;
                    border-radius: 8px;
                    max-width: 600px;
                    width: 90%;
                    max-height: 80vh;
                    overflow-y: auto;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
                }

                .modal-header {
                    padding: 20px;
                    border-bottom: 1px solid #333;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .modal-header h3 {
                    margin: 0;
                    color: #fff;
                }

                .modal-close-btn {
                    background: none;
                    border: none;
                    color: #999;
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
                    color: #fff;
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
                    color: #ccc;
                    font-weight: 500;
                }

                .prompt-textarea, .prompt-input {
                    width: 100%;
                    background: #2a2a2a;
                    border: 1px solid #444;
                    border-radius: 4px;
                    color: #fff;
                    padding: 10px;
                    font-family: 'Courier New', monospace;
                    font-size: 14px;
                    resize: vertical;
                }

                .prompt-textarea:focus, .prompt-input:focus {
                    outline: none;
                    border-color: #4a9eff;
                }

                .modal-footer {
                    padding: 20px;
                    border-top: 1px solid #333;
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                }

                .btn {
                    padding: 10px 20px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    transition: all 0.2s;
                }

                .btn-primary {
                    background: #4a9eff;
                    color: #fff;
                }

                .btn-primary:hover {
                    background: #3a8eef;
                }

                .btn-secondary {
                    background: #666;
                    color: #fff;
                }

                .btn-secondary:hover {
                    background: #777;
                }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', styles);
    };

    /**
     * 프롬프트 표시 업데이트
     */
    window.PromptEditor.updatePromptDisplay = function(shotId, aiName, imageId, editedPrompt) {
        // DOM에서 해당 프롬프트 표시 영역 찾아서 업데이트
        const promptElement = document.querySelector(`[data-prompt-id="${shotId}_${aiName}_${imageId}"]`);
        if (promptElement && editedPrompt) {
            promptElement.textContent = editedPrompt.original;
            promptElement.classList.add('edited');
        }
    };

    /**
     * AI를 사용한 프롬프트 개선
     */
    window.PromptEditor.aiEditImagePrompt = function(shotId, aiName, imageId, originalPrompt) {
        try {
            // AI 프롬프트 개선 로직
            console.log('AI 프롬프트 개선 요청:', {shotId, aiName, imageId});

            // 임시 구현 - 실제로는 AI API 호출
            const improvedPrompt = originalPrompt + '\n\n[AI Enhanced]';

            // 개선된 프롬프트로 편집 모달 열기
            window.PromptEditor.editImagePrompt(shotId, aiName, imageId, improvedPrompt, null, null);

        } catch (error) {
            console.error('AI 프롬프트 개선 오류:', error);
            const showMessage = window.AppUtils?.showMessage || window.showMessage;
            if (showMessage) {
                showMessage('AI 프롬프트 개선에 실패했습니다.', 'error');
            }
        }
    };

    /**
     * 프롬프트 버튼 이벤트 재바인딩
     */
    window.PromptEditor.rebindPromptButtons = function() {
        // 편집 버튼
        document.querySelectorAll('[data-action="edit-prompt"]').forEach(button => {
            button.onclick = function() {
                const data = this.dataset;
                window.PromptEditor.editImagePrompt(
                    data.shotId,
                    data.aiName,
                    data.imageId,
                    data.originalPrompt,
                    data.translatedPrompt,
                    data.parameters
                );
            };
        });

        // AI 개선 버튼
        document.querySelectorAll('[data-action="ai-edit-prompt"]').forEach(button => {
            button.onclick = function() {
                const data = this.dataset;
                window.PromptEditor.aiEditImagePrompt(
                    data.shotId,
                    data.aiName,
                    data.imageId,
                    data.originalPrompt
                );
            };
        });
    };

    // 기존 전역 함수와의 호환성 유지 (점진적 마이그레이션)
    if (!window.getEditedPrompt) {
        window.getEditedPrompt = window.PromptEditor.getEditedPrompt;
    }
    if (!window.editImagePrompt) {
        window.editImagePrompt = window.PromptEditor.editImagePrompt;
    }
    if (!window.saveEditedPrompt) {
        window.saveEditedPrompt = window.PromptEditor.saveEditedPrompt;
    }
    if (!window.closePromptEditModal) {
        window.closePromptEditModal = window.PromptEditor.closePromptEditModal;
    }
    if (!window.addPromptEditModalStyles) {
        window.addPromptEditModalStyles = window.PromptEditor.addPromptEditModalStyles;
    }
    if (!window.aiEditImagePrompt) {
        window.aiEditImagePrompt = window.PromptEditor.aiEditImagePrompt;
    }
    if (!window.rebindPromptButtons) {
        window.rebindPromptButtons = window.PromptEditor.rebindPromptButtons;
    }

})(window);