/**
 * 앱 유틸리티 모듈
 * IIFE 패턴으로 전역 네임스페이스 오염 방지
 */
(function(window) {
    'use strict';
    
    // 네임스페이스 생성
    window.AppUtils = window.AppUtils || {};
    
    // HTML 속성용 문자열 이스케이프 함수
    window.AppUtils.escapeHtmlAttribute = function(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r')
            .replace(/\t/g, '\\t');
    };
    
    // 메시지 표시
    window.AppUtils.showMessage = function(message, type) {
        try {
            const messageContainer = document.getElementById('message-container');
            if (!messageContainer) {
                return;
            }
            
            const messageElement = document.createElement('div');
            messageElement.className = `message ${type}-message`;
            messageElement.innerHTML = `
                ${message}
                <button class="close-button" onclick="this.parentElement.remove()">×</button>
            `;
            
            messageContainer.appendChild(messageElement);
            
            if (type !== 'error') {
                setTimeout(() => {
                    if (messageContainer.contains(messageElement)) {
                        messageContainer.removeChild(messageElement);
                    }
                }, 5000);
            }
        } catch (error) {
            alert(message);
        }
    };
    
    // 클립보드 복사 함수
    window.AppUtils.copyToClipboard = async function(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            try {
                const textArea = document.createElement('textarea');
                textArea.value = text;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                return true;
            } catch (fallbackError) {
                window.AppUtils.showMessage('클립보드 복사에 실패했습니다.', 'error');
                return false;
            }
        }
    };
    
    // 프로젝트 파일명 관리
    window.AppUtils.getProjectFileName = function(currentData) {
        try {
            if (currentData && currentData.project_info && currentData.project_info.name) {
                return currentData.project_info.name;
            }
            return 'Film_Production_Manager.json';
        } catch (error) {
            return 'Film_Production_Manager.json';
        }
    };
    
    window.AppUtils.getProjectName = function(currentData) {
        try {
            return window.AppUtils.getProjectFileName(currentData)
                .replace('_Manager.json', '')
                .replace('Film_Production_Manager.json', 'Film Production Manager');
        } catch (error) {
            return 'Film Production Manager';
        }
    };
    
    // 드롭박스 URL 변환
    window.AppUtils.convertDropboxUrl = function(url) {
        if (!url) return url;
        
        if (url.includes('dropbox.com')) {
            if (url.includes('dl=0')) {
                return url.replace('dl=0', 'raw=1');
            }
            else if (!url.includes('dl=') && !url.includes('raw=')) {
                const separator = url.includes('?') ? '&' : '?';
                return url + separator + 'raw=1';
            }
        }
        
        return url;
    };
    
    // 기존 전역 함수들과의 호환성을 위한 별칭 설정
    // (점진적 마이그레이션을 위해)
    if (!window.escapeHtmlAttribute) {
        window.escapeHtmlAttribute = window.AppUtils.escapeHtmlAttribute;
    }
    if (!window.showMessage) {
        window.showMessage = window.AppUtils.showMessage;
    }
    if (!window.copyToClipboard) {
        window.copyToClipboard = window.AppUtils.copyToClipboard;
    }
    if (!window.convertDropboxUrl) {
        window.convertDropboxUrl = window.AppUtils.convertDropboxUrl;
    }
    
})(window);